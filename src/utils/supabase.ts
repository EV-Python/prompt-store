import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmncqgvjnrxspvdtdahu.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug environment variables (will only log in development)
if (import.meta.env.DEV) {
  console.log('Supabase URL:', supabaseUrl);
  console.log('API Key exists:', !!supabaseKey);
  console.log('API Key length:', supabaseKey?.length);
}

if (!supabaseKey) {
  throw new Error('Missing Supabase anon key - check your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type SavedTweet = {
  id: string;
  content: string;
  created_at: string;
};

// Test function to verify connection
export async function testConnection() {
  try {
    const { error } = await supabase
      .from('saved_tweets')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Connection test failed:', error);
      // Log more details about the current state
      console.log('Current client state:', {
        url: supabaseUrl,
        hasKey: !!supabaseKey,
        keyLength: supabaseKey?.length
      });
      return false;
    }
    
    console.log('Supabase connection successful!');
    return true;
  } catch (err) {
    console.error('Connection test error:', err);
    return false;
  }
} 