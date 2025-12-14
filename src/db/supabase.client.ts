import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type TypedSupabaseClient = SupabaseClient<Database>;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase: TypedSupabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side client factory for use in API routes
export function createServerClient(
  supabaseUrl: string,
  supabaseKey: string,
  options?: { accessToken?: string }
): TypedSupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      headers: options?.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : undefined,
    },
  });
}
