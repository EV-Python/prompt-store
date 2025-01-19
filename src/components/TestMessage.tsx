import { useState } from 'react';
import { sendMessage } from '../utils/anthropic';

export function TestMessage() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await sendMessage(message);
      setResponse(result);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error occurred while getting response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Test Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={4}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
      
      {response && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Response:</h3>
          <div className="mt-2 p-4 bg-gray-50 rounded-md">
            <pre className="whitespace-pre-wrap">{response}</pre>
          </div>
        </div>
      )}
    </div>
  );
} 