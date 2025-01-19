import { TestMessage } from './components/TestMessage';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Content Remix Tool
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Transform your content with AI
          </p>
        </div>
        <div className="mt-10">
          <TestMessage />
        </div>
      </div>
    </div>
  );
}

export default App; 