// Import required dependencies
import React from 'react'; // Core React library
import ReactDOM from 'react-dom/client'; // React DOM for web rendering
import './output.css'; // Import the compiled Tailwind CSS styles
import App from './App'; // Import our main App component

// Think of this like plugging in and turning on our app
// These imports are like gathering all the tools we need before starting
// We're telling React: "Take our App and display it inside the 'root' element"
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  // StrictMode is like a safety checker that helps us write better code
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 