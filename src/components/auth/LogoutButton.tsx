import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      // Clear the access token cookie
      document.cookie = "sb-access-token=; path=/; max-age=0";
      window.location.href = "/login";
    } catch {
      // Silently handle logout errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleLogout} disabled={loading} data-testid="logout-button">
      {loading ? "Logging out..." : "Logout"}
    </Button>
  );
}
