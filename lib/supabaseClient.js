// lib/supabaseClient.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(
  "https://tbyttsfztuudyqbrkonm.supabase.co", 
  // PUBLIC KEY ONLY — this is safe for front-end
  "YOUR_PUBLIC_ANON_KEY_HERE"
);
