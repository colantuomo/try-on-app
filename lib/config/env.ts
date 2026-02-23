function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  databaseUrl: requireEnv('DATABASE_URL'),
  nextAuthUrl: requireEnv('NEXTAUTH_URL'),
  nextAuthSecret: requireEnv('NEXTAUTH_SECRET'),
  googleClientId: requireEnv('AUTH_GOOGLE_ID'),
  googleClientSecret: requireEnv('AUTH_GOOGLE_SECRET'),
  stripeSecretKey: requireEnv('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  imageProvider: process.env.IMAGE_PROVIDER ?? 'replicate',
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiImageModel: process.env.GEMINI_IMAGE_MODEL,
  replicateApiToken: process.env.REPLICATE_API_TOKEN,
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
} as const
