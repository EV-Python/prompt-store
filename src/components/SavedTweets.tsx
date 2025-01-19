import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { supabase, SavedTweet, updateSavedTweet } from '../utils/supabase';

export type SavedTweetsRef = {
  refresh: () => Promise<void>;
};

type SavedTweetsProps = {
  onCollapse?: (collapsed: boolean) => void;
};

export const SavedTweets = forwardRef<SavedTweetsRef, SavedTweetsProps>((props, ref) => {
  const { onCollapse } = props;
  const [savedTweets, setSavedTweets] = useState<SavedTweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingTweetId, setEditingTweetId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
  };

  const openTwitterIntent = (text: string) => {
    const encodedText = encodeURIComponent(text);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
  };

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

  const startEditing = (tweet: SavedTweet) => {
    setEditingTweetId(tweet.id);
    setEditContent(tweet.content);
  };

  const cancelEditing = () => {
    setEditingTweetId(null);
    setEditContent('');
  };

  const updateTweet = async (id: string) => {
    try {
      await updateSavedTweet(id, editContent);
      setEditingTweetId(null);
      setEditContent('');
      await loadSavedTweets();
    } catch (error) {
      console.error('Error updating tweet:', error);
    }
  };

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
    <div 
      className={`fixed right-0 top-0 h-screen bg-white border-l border-gray-200 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-12' : 'w-80'
      }`}
    >
      <button
        onClick={toggleCollapse}
        className="absolute left-2 top-4 p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
        title={isCollapsed ? "Expand" : "Collapse"}
      >
        <svg 
          className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className={`h-full overflow-hidden transition-opacity duration-200 ${
        isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-full p-4'
      }`}>
        <div className="flex items-center mb-4 pl-10">
          <h2 className="text-xl font-bold text-gray-900">Saved Tweets</h2>
        </div>
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
                {editingTweetId === tweet.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => cancelEditing()}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => updateTweet(tweet.id)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-900 mb-2">{tweet.content}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openTwitterIntent(tweet.content)}
                          className="flex items-center gap-2 text-[#1DA1F2] hover:text-[#1DA1F2]/80"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                          <span>Tweet</span>
                        </button>
                        <button
                          onClick={() => startEditing(tweet)}
                          className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>
                      </div>
                      <button
                        onClick={() => deleteTweet(tweet.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

SavedTweets.displayName = 'SavedTweets'; 