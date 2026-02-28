import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    CLERK_SECRET_KEY: z.string(),
    CLERK_WEBHOOK_SECRET: z.string().optional(),
    POLAR_ACCESS_TOKEN: z.string(),
    POLAR_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
    POLAR_WEBHOOK_SECRET: z.string(),
    POLAR_PRODUCT_SMALL: z.string().optional(),
    POLAR_PRODUCT_MEDIUM: z.string().optional(),
    POLAR_PRODUCT_LARGE: z.string().optional(),
    POLAR_PRODUCT_YEARLY_SMALL: z.string().optional(),
    POLAR_PRODUCT_YEARLY_MEDIUM: z.string().optional(),
    POLAR_PRODUCT_YEARLY_LARGE: z.string().optional(),
    POLAR_CREDITS_5000: z.string().optional(),
    POLAR_CREDITS_20000: z.string().optional(),
    POLAR_CREDITS_45000: z.string().optional(),
    POLAR_PRODUCT_LIFETIME: z.string().optional(),
    GOOGLE_CLOUD_API_KEY: z.string(),
    AISTUDIOS_API_KEY: z.string(),
    GROQ_API_KEY: z.string().optional(),
    GROQ_MODEL: z.string().optional(),
    OPENAI_API_KEY: z.string(),
    RESEND_API_KEY: z.string(),
    AI_PROVIDER: z.enum(["aistudio", "groq"]).default("aistudio"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
    POLAR_ENV: process.env.POLAR_ENV,
    POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
    POLAR_PRODUCT_SMALL: process.env.POLAR_PRODUCT_SMALL,
    POLAR_PRODUCT_MEDIUM: process.env.POLAR_PRODUCT_MEDIUM,
    POLAR_PRODUCT_LARGE: process.env.POLAR_PRODUCT_LARGE,
    POLAR_PRODUCT_YEARLY_SMALL: process.env.POLAR_PRODUCT_YEARLY_SMALL,
    POLAR_PRODUCT_YEARLY_MEDIUM: process.env.POLAR_PRODUCT_YEARLY_MEDIUM,
    POLAR_PRODUCT_YEARLY_LARGE: process.env.POLAR_PRODUCT_YEARLY_LARGE,
    POLAR_CREDITS_5000: process.env.POLAR_CREDITS_5000,
    POLAR_CREDITS_20000: process.env.POLAR_CREDITS_20000,
    POLAR_CREDITS_45000: process.env.POLAR_CREDITS_45000,
    POLAR_PRODUCT_LIFETIME: process.env.POLAR_PRODUCT_LIFETIME,
    GOOGLE_CLOUD_API_KEY: process.env.GOOGLE_CLOUD_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AISTUDIOS_API_KEY: process.env.AISTUDIOS_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GROQ_MODEL: process.env.GROQ_MODEL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    AI_PROVIDER: process.env.AI_PROVIDER,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === "development",
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
