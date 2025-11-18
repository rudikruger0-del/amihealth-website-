// lib/supabaseClient.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(
  "https://tbyttsfztuudyqbrkonm.supabase.co",
  "<YOUR-PUBLIC-ANON-KEY>"
);
