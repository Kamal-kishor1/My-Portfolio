import React from 'react'; import ReactDOM from 'react-dom/client'; import { RouterProvider } from 'react-router-dom'; import { HelmetProvider } from 'react-helmet-async'; import { ThemeProvider } from './components/ThemeProvider'; import { router } from './src/router'; import './src/styles/globals.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><HelmetProvider><ThemeProvider><RouterProvider router={router}/></ThemeProvider></HelmetProvider></React.StrictMode>);

