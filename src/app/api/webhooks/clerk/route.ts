import { Webhook } from 'svix'
import { headers } from 'next/headers'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '~/server/db'
import { env } from '~/env'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url, username } = evt.data
    const email = email_addresses[0]?.email_address || ''

    if (!email) {
      console.error('No email provided for user creation')
      return new Response('Email required', { status: 400 })
    }

    try {
      // Use upsert to either create new user or update existing one with same email
      await db.user.upsert({
        where: { email: email },
        update: {
          clerkId: id,
          name: `${first_name || ''} ${last_name || ''}`.trim() || username || 'User',
          emailVerified: email_addresses[0]?.verification?.status === 'verified',
          image: image_url,
        },
        create: {
          clerkId: id,
          email: email,
          name: `${first_name || ''} ${last_name || ''}`.trim() || username || 'User',
          emailVerified: email_addresses[0]?.verification?.status === 'verified',
          image: image_url,
        },
      })
      console.log(`User created/updated: ${id} (${email})`)
    } catch (error) {
      console.error('Error creating/updating user:', error)
      return new Response('Error creating/updating user', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, username } = evt.data

    try {
      // Update user in database
      await db.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses[0]?.email_address || '',
          name: `${first_name || ''} ${last_name || ''}`.trim() || username || 'User',
          emailVerified: email_addresses[0]?.verification?.status === 'verified',
          image: image_url,
        },
      })

      console.log(`User updated: ${id}`)
    } catch (error) {
      console.error('Error updating user:', error)
      // Don't fail if user doesn't exist
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      // Delete user from database
      await db.user.delete({
        where: { clerkId: id || '' },
      })

      console.log(`User deleted: ${id}`)
    } catch (error) {
      console.error('Error deleting user:', error)
      // Don't fail if user doesn't exist
    }
  }

  return new Response('', { status: 200 })
}
