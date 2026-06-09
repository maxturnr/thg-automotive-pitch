import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gacldnadnyekeyrinxpp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhY2xkbmFkbnlla2V5cmlueHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5ODQzMDUsImV4cCI6MjA5NjU2MDMwNX0.ncw_s4DAECcl48KlPCJ52wpAb834dnOSsTNOqalVee8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
