// lib/supabaseClient.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Your Supabase project URL
const SUPABASE_URL = "https://tbyttsfztuudyqbrkonm.supabase.co";

// Your PUBLIC anonymous key (safe to expose)
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRieXR0c2Z6dHV1ZHlxYnJrb25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MzA1MzgsImV4cCI6MjA3OTAwNjUzOH0.7T0S4_kkoWosdbmjlwtfSYzBcyipcPg1Fm8kIMa43uo";

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
