import { createClient } from '@supabase/supabase-js';

// Read from Vite env (VITE_*). If absent, fall back to provided credentials.
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://fjrysnhleratybutzvkt.supabase.co';
const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqcnlzbmhsZXJhdHlidXR6dmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTI5MjMsImV4cCI6MjA3NjEyODkyM30.TWSJdXjTRyW-G_Ky1GUN_IJE4zHyQnRlE6ziO7QVsGk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
