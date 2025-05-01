
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

createRoot(document.getElementById('root')!).render(<App />);
