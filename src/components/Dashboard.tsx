import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import StockVolatility from './StockVolatility';
import TreemapChart from './TreemapChart';
import PortfolioBubbleChart from './PortfolioBubbleChart';
import CorrelationHeatmap from './CorrelationHeatmap';
import stocks from '../stocks.json';

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 2,
      minHeight: '100vh',
      bgcolor: '#fafbfc'
    }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Crypto Market Analysis Dashboard
      </Typography>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gridTemplateRows: { xs: 'auto', md: '1fr 1fr' },
        gap: 2,
        mt: 1
      }}>
        {/* First row */}
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            maxHeight: '100vh',
            overflow: 'hidden',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <StockVolatility 
              stocks={stocks}
              dataPath="/candles"
            />
          </Box>
        </Paper>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            maxHeight: '100vh',
            overflow: 'hidden',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <TreemapChart />
          </Box>
        </Paper>
        {/* Second row */}
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            maxHeight: '100vh',
            overflow: 'hidden',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          <PortfolioBubbleChart />
        </Paper>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            maxHeight: '100vh',
            overflow: 'hidden',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          <CorrelationHeatmap />
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard; 