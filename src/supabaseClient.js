import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://psqaajugxpugajcbjawu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcWFhanVneHB1Z2FqY2JqYXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTE4MzcsImV4cCI6MjA5Nzg4NzgzN30.uqlMvQo4IOHTMQgMD75C1Yuq3ysf2dsAW_rKjsRMtZo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);