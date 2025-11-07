
import { createRoot } from 'react-dom/client'
import App from './AppnoDTR.tsx'
import './index.css'

// Get the root element and create a root with it
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);

// Render the App component
root.render(<App />);
