import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wbtnmnmthyulitrldfif.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndidG5tbm10aHl1bGl0cmxkZmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2ODQ2MjIsImV4cCI6MjA2MjI2MDYyMn0.Y-h_A4AMaczkx17jqdxSUhtwhKtf4khM7QfhCOWD_RA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
