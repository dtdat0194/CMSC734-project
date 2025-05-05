import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import './index.css';
import Dashboard from './components/Dashboard';
import WelcomePage from './components/WelcomePage';
import reportWebVitals from './reportWebVitals';

const App: React.FC = () => {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: { main: '#1f77b4' },
        },
      }),
    []
  );

  const [showWelcome, setShowWelcome] = useState(true);
  const [slideOut, setSlideOut] = useState(false);
  const dashboardRef = React.useRef<HTMLDivElement>(null);

  const handleScrollToDashboard = () => {
    setSlideOut(true);
    setTimeout(() => {
      setShowWelcome(false);
      dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 900); // Match the CSS transition duration
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {showWelcome && (
        <WelcomePage
          onScrollToDashboard={handleScrollToDashboard}
          className={slideOut ? 'welcome-slide-out' : ''}
        />
      )}
      <div ref={dashboardRef} />
      {!showWelcome && <Dashboard />}
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 