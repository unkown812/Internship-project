import { createClient } from '@supabase/supabase-js';
// import type { Database } from './database.types';
const supabaseUrl = "https://uuvuwptxjbwdjonfckyy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1dnV3cHR4amJ3ZGpvbmZja3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MDgzNDUsImV4cCI6MjA2Mjk4NDM0NX0.A_FMRjHhm9cWRuJHp9u8mvFS4JVEH_yKoshcvs10E54";
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase