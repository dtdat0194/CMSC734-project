import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Dashboard from './components/Dashboard';
import WelcomePage from './components/WelcomePage';
import reportWebVitals from './reportWebVitals';

const App: React.FC = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [slideOut, setSlideOut] = useState(false);

  const handleScrollToDashboard = () => {
    setSlideOut(true);
    setTimeout(() => {
      setShowWelcome(false);
      dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 900); // Match the CSS transition duration
  };

  return (
    <>
      {showWelcome && (
        <WelcomePage
          onScrollToDashboard={handleScrollToDashboard}
          className={slideOut ? 'welcome-slide-out' : ''}
        />
      )}
      <div ref={dashboardRef} />
      {!showWelcome && <Dashboard />}
    </>
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