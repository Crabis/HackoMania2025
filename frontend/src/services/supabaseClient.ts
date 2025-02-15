// src/services/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// Your Supabase credentials
const supabaseUrl = "https://qagsbbilljqjmauhylgo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZ3NiYmlsbGpxam1hdWh5bGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1OTczNzAsImV4cCI6MjA1NTE3MzM3MH0.5R8oQ9Zh_w6R7cDDhAU9xKZlMOk2jU3cCgO72uu91qU";

// Create and export the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
