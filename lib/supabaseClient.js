import { createClient } from "@supabase/supabase-js";

// IMPORTANT — Node runtime needs service role key
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
