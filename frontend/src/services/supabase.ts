import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://saxscmsnjyctqqwxoqfa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNheHNjbXNuanljdHFxd3hvcWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjAzMzEsImV4cCI6MjEwMzY5NjMzMX0.RQwZggDY-99XmvK15NNxsgEWuqhfasjpb2dmAP5Olhs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) {
    throw error;
  }

  return data;
};
