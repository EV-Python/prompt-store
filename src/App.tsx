import React, { useState } from 'react';

function App() {
  // State variables to store our input and output text
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // This function runs when the form is submitted
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      setOutputText('Remixed content will appear here...');
    } catch (error) {
      console.error('Error:', error);
      setOutputText('Something went wrong! Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Content Remix Tool
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Paste your content here
            </label>
            <textarea
              id="content"
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter the text you want to remix..."
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputText}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {isLoading ? 'Remixing...' : 'Remix Content'}
          </button>
        </form>

        {outputText && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Remixed Output:</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="whitespace-pre-wrap">{outputText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 