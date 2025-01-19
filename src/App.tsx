import { useState } from 'react';
import { tweetsFromPost } from './utils/anthropic';

type Tweet = {
  id: number;
  content: string;
};

function App() {
  const [message, setMessage] = useState('');
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

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

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Content Remix Tool
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your blog posts into engaging tweets using AI
          </p>
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
                    className="group p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-gray-900">{tweet.content}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span>{tweet.content.length}/280 characters</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(tweet.content, tweet.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200
                          ${copied === tweet.id 
                            ? 'bg-green-50 text-green-600' 
                            : 'text-gray-400 hover:bg-gray-50 hover:text-blue-500'}`}
                      >
                        {copied === tweet.id ? (
                          <>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 