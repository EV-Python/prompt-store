import { useState, useEffect, useCallback, useRef } from 'react';
import { tweetsFromPost } from './utils/anthropic';
import { supabase, testConnection } from './utils/supabase';
import { SavedTweets, SavedTweetsRef } from './components/SavedTweets';
import { DebugRefresh } from './components/DebugRefresh';

type Tweet = {
  id: number;
  content: string;
};

export function App() {
  const savedTweetsRef = useRef<SavedTweetsRef>(null);
  const [message, setMessage] = useState('');
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [editingTweetId, setEditingTweetId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    testConnection().then(connected => {
      if (connected) {
        console.log('Ready to save tweets!');
      }
    });
  }, []);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (saveSuccess || saveError) {
      const timer = setTimeout(() => {
        setSaveSuccess(null);
        setSaveError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess, saveError]);

  const openTwitterIntent = (text: string) => {
    const encodedText = encodeURIComponent(text);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
  };

  const saveTweet = async (content: string) => {
    try {
      setSaveError(null);
      setSaveSuccess(null);
      const { error, data } = await supabase
        .from('saved_tweets')
        .insert([{ content }])
        .select();

      if (error) {
        console.error('Error details:', error);
        setSaveError(error.message || 'Failed to save tweet');
        return false;
      }

      console.log('Tweet saved successfully:', data);
      setSaveSuccess('Tweet saved successfully!');
      // Refresh the saved tweets list
      savedTweetsRef.current?.refresh();
      return true;
    } catch (err) {
      console.error('Error saving tweet:', err);
      setSaveError('An unexpected error occurred');
      return false;
    }
  };

  const startEditing = (tweet: Tweet) => {
    setEditingTweetId(tweet.id);
    setEditContent(tweet.content);
  };

  const cancelEditing = () => {
    setEditingTweetId(null);
    setEditContent('');
  };

  const updateGeneratedTweet = (id: number, newContent: string) => {
    setTweets(tweets.map(tweet => 
      tweet.id === id ? { ...tweet, content: newContent } : tweet
    ));
    setEditingTweetId(null);
    setEditContent('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await tweetsFromPost(message);
      const tweetLines = result.split('\n').filter(line => line.trim());
      const parsedTweets = tweetLines.map((content, id) => ({
        id,
        content: content.replace(/^\d+\.\s*/, '').trim()
      }));
      setTweets(parsedTweets);
    } catch (error) {
      console.error('Error:', error);
      setTweets([{ id: 0, content: 'Error occurred while getting response' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.on('vite:beforeUpdate', () => {
        console.log('[App] HMR update pending...');
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <DebugRefresh />
      <div className={`max-w-5xl mx-auto px-4 py-16 transition-all duration-300 ${
        isSidebarCollapsed ? 'pr-16' : 'pr-96'
      }`}>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Content Remix Tool
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your blog posts into engaging tweets using AI
          </p>
          {saveError && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg">
              {saveSuccess}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="message" className="text-base font-semibold text-gray-900">
                  Your Blog Post
                </label>
                <span className="text-sm text-gray-500">
                  {message.length} characters
                </span>
              </div>
              <div className="relative">
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full min-h-[200px] p-4 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Paste your blog post here..."
                  rows={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Tweets...
                </div>
              ) : (
                'Generate Tweets'
              )}
            </button>
          </form>

          {tweets.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Generated Tweets</h3>
              <div className="space-y-4">
                {tweets.map((tweet) => (
                  <div 
                    key={tweet.id}
                    className="group p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
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
                                onClick={cancelEditing}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => updateGeneratedTweet(tweet.id, editContent)}
                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-900 text-lg">{tweet.content}</p>
                            <div className="mt-3 flex items-center text-sm text-gray-500">
                              <span>{280 - tweet.content.length} characters remaining</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!editingTweetId && (
                          <>
                            <button
                              type="button"
                              onClick={() => saveTweet(tweet.content)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-green-600 hover:bg-green-50"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Save</span>
                            </button>
                            <button
                              onClick={() => startEditing(tweet)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-blue-500 hover:bg-blue-50"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Edit</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <SavedTweets 
        ref={savedTweetsRef} 
        onCollapse={(collapsed) => setIsSidebarCollapsed(collapsed)}
      />
    </div>
  );
} 