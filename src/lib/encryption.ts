import { env } from "~/env";

// Simple encryption/decryption using AES-256-GCM algorithm
// This provides client-side encryption for sensitive text data

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 128; // 128 bits authentication tag

// Get encryption key from environment or use a default (you should set a secure key in production)
function getEncryptionKey(): string {
  return process.env.ENCRYPTION_KEY || process.env.DATABASE_ENCRYPTION_KEY || 'default-key-change-in-production-32b';
}

// Convert key to CryptoKey
async function getCryptoKey(): Promise<CryptoKey> {
  const keyMaterial = new TextEncoder().encode(getEncryptionKey().padEnd(32, '0').slice(0, 32));
  return await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts text using AES-256-GCM
 * @param text - The plain text to encrypt
 * @returns Base64 encoded encrypted text with IV prepended
 */
export async function encryptText(text: string): Promise<string> {
  if (!text) return text;

  try {
    const key = await getCryptoKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encodedText = new TextEncoder().encode(text);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
        tagLength: TAG_LENGTH,
      },
      key,
      encodedText
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Convert to base64
    return Buffer.from(combined).toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    // Return original text if encryption fails (fallback)
    return text;
  }
}

/**
 * Decrypts text that was encrypted with encryptText
 * @param encryptedText - Base64 encoded encrypted text with IV prepended
 * @returns Decrypted plain text
 */
export async function decryptText(encryptedText: string): Promise<string> {
  if (!encryptedText) return encryptedText;

  try {
    const key = await getCryptoKey();
    const combined = Buffer.from(encryptedText, 'base64');

    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const encryptedData = combined.slice(IV_LENGTH);

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
        tagLength: TAG_LENGTH,
      },
      key,
      encryptedData
    );

    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    // Return original text if decryption fails (might be unencrypted legacy data)
    return encryptedText;
  }
}

/**
 * Checks if text appears to be encrypted
 * @param text - Text to check
 * @returns true if text looks encrypted (base64 format)
 */
export function isEncrypted(text: string): boolean {
  if (!text || text.length < 20) return false;

  // Check if it's valid base64
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;
  return base64Regex.test(text);
}

/**
 * Safely encrypt text only if it's not already encrypted
 * @param text - Text to encrypt
 * @returns Encrypted text or original if already encrypted
 */
export async function safeEncrypt(text: string): Promise<string> {
  if (isEncrypted(text)) {
    return text;
  }
  return await encryptText(text);
}

/**
 * Safely decrypt text only if it appears to be encrypted
 * @param text - Text to decrypt
 * @returns Decrypted text or original if not encrypted
 */
export async function safeDecrypt(text: string): Promise<string> {
  if (!isEncrypted(text)) {
    return text;
  }
  return await decryptText(text);
}
