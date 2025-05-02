import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import DashboardLayout from './components/layout/DashboardLayout';
import CorrelationHeatmap from './components/visualizations/CorrelationHeatmap';
import PortfolioBubbleChart from './components/visualizations/PortfolioBubbleChart';
import TreemapChart from './components/visualizations/TreemapChart';
import StockVolatility from './components/visualizations/StockVolatility';
import BarChart from './components/visualizations/BarChart';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DashboardLayout>
        <CorrelationHeatmap />
        <PortfolioBubbleChart />
        <TreemapChart />
        <StockVolatility />
        <BarChart />
      </DashboardLayout>
    </ThemeProvider>
  );
}

export default App;
