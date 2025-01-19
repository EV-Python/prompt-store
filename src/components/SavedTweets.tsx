import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { supabase, SavedTweet } from '../utils/supabase';

export type SavedTweetsRef = {
  refresh: () => Promise<void>;
};

export const SavedTweets = forwardRef<SavedTweetsRef>((props, ref) => {
  const [savedTweets, setSavedTweets] = useState<SavedTweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSavedTweets = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('saved_tweets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading saved tweets:', error);
      return;
    }

    setSavedTweets(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadSavedTweets();
  }, []);

  // Expose the refresh method via ref
  useImperativeHandle(ref, () => ({
    refresh: loadSavedTweets
  }));

  const deleteTweet = async (id: string) => {
    const { error } = await supabase
      .from('saved_tweets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tweet:', error);
      return;
    }

    await loadSavedTweets();
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Saved Tweets</h2>
      {isLoading ? (
        <div className="flex justify-center py-4">
          <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : savedTweets.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No saved tweets yet</p>
      ) : (
        <div className="space-y-4">
          {savedTweets.map((tweet) => (
            <div key={tweet.id} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-900 mb-2">{tweet.content}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(tweet.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => deleteTweet(tweet.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}); 