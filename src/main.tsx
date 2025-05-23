
import React from 'react' // Add this import
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './firebase/config' // Initialize Firebase

// Ensure the root element exists before rendering
const rootElement = document.getElementById("root");
if (!rootElement) {
  const rootDiv = document.createElement("div");
  rootDiv.id = "root";
  document.body.appendChild(rootDiv);
}

// Force re-render by creating a new root
const root = createRoot(document.getElementById('root')!);
root.render(<App />);

console.log("main.tsx: App rendering initiated");
