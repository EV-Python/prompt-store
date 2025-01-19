import { useEffect, useState } from 'react';

export const DebugRefresh = () => {
  const [counter, setCounter] = useState(0);
  
  // This effect will run on mount and when HMR occurs
  useEffect(() => {
    console.log('[DebugRefresh] Component mounted/updated:', {
      timestamp: new Date().toISOString(),
      counter
    });

    // Add this to check if we're in a development environment
    if (import.meta.hot) {
      console.log('[HMR] Hot module replacement is active');
      
      import.meta.hot.on('vite:beforeUpdate', (data: any) => {
        console.log('[HMR] About to update with:', data);
      });

      import.meta.hot.on('vite:afterUpdate', (data: any) => {
        console.log('[HMR] Update complete:', data);
      });
    }
  }, [counter]);

  return (
    <div className="p-4 border rounded">
      <h2>Debug Refresh Component</h2>
      <p>Counter: {counter}</p>
      <button 
        onClick={() => setCounter(c => c + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Increment
      </button>
      <p className="text-sm text-gray-500">
        Last render: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}; 