
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './firebase/config' // Initialize Firebase

createRoot(document.getElementById("root")!).render(<App />);
