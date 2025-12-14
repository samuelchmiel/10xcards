import { useEffect, type ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * AuthProvider listens for Supabase auth state changes and keeps
 * the sb-access-token cookie in sync with token refreshes.
 * This ensures server-side auth remains valid when tokens are rotated.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Listen for auth state changes (including token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        // Update cookie with new access token
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      } else if (event === "SIGNED_OUT") {
        // Clear cookie on sign out
        document.cookie = "sb-access-token=; path=/; max-age=0";
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
