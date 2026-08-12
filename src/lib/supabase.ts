import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjaaggkxvmutddtznmmc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYWFnZ2t4dm11dGRkdHpubW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MjU0MDYsImV4cCI6MjEwMjEwMTQwNn0.wctOdETBMjmOGJXYkFN6Cjt9AriKuBlz67q4fgHTNSs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
