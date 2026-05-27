// Next.js inlines `process.env.NEXT_PUBLIC_*` references at BUILD TIME, but
// only when the access is a LITERAL property — `process.env[dynamicKey]`
// stays a runtime lookup and ends up undefined in the browser bundle. Each
// getter below must reference the env name directly for inlining to work.

function missing(name: string): never {
  throw new Error(
    `Missing required environment variable: ${name}. ` +
      `Copy .env.local.example to .env.local and fill it in.`
  );
}

export const env = {
  supabaseUrl: () =>
    process.env.NEXT_PUBLIC_SUPABASE_URL || missing("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () =>
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    missing("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
} as const;
