import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnypmigzwfavwcwarmnk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueXBtaWd6d2Zhdndjd2FybW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMDU3MjcsImV4cCI6MjA5MjY4MTcyN30.uRC82cHVPLmDmUe-QKDyEPF8pfpnaMwSNXwfwO-qFBQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
