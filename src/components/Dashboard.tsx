import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import StockVolatility from './StockVolatility';
import TreemapChart from './TreemapChart';
import PortfolioBubbleChart from './PortfolioBubbleChart';
import CorrelationHeatmap from './CorrelationHeatmap';
import BarChart from './BarChart';
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
        gridTemplateRows: { xs: 'auto auto auto', md: '1fr 1fr' },
        gap: 1,
        mt: 1,
        gridTemplateAreas: {
          xs: `
            'stock'
            'treemap'
            'bubble'
            'correlation'
            'bar'
          `,
          md: `
            'stock stock'
            'treemap bubble'
            'correlation bar'
          `
        },
      }}>
        {/* Top row: Stock Volatility spans 2 columns */}
        <Paper
          sx={{
            pt: 1,
            display: 'flex',
            flexDirection: 'column',
            height: { xs: 'auto', md: '100vh' },
            maxHeight: { xs: 'none', md: '100vh' },
            minWidth: 0,
            boxSizing: 'border-box',
            gridColumn: { md: '1 / span 2' },
            gridRow: { md: '1' },
            gridArea: { xs: 'stock', md: 'stock' },
          }}
        >
          <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <StockVolatility 
              stocks={stocks}
              dataPath="/candles"
              expanded
            />
          </Box>
        </Paper>
        {/* Bottom 2x2 grid */}
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: { xs: 'auto', md: '100vh' },
            maxHeight: { xs: 'none', md: '100vh' },
            minWidth: 0,
            boxSizing: 'border-box',
            gridArea: { xs: 'treemap', md: 'treemap' },
          }}
        >
          <TreemapChart />
        </Paper>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: { xs: 'auto', md: '100vh' },
            maxHeight: { xs: 'none', md: '100vh' },
            minWidth: 0,
            boxSizing: 'border-box',
            gridArea: { xs: 'bubble', md: 'bubble' },
          }}
        >
          <PortfolioBubbleChart />
        </Paper>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: { xs: 'auto', md: '100vh' },
            maxHeight: { xs: 'none', md: '100vh' },
            minWidth: 0,
            boxSizing: 'border-box',
            gridArea: { xs: 'correlation', md: 'correlation' },
          }}
        >
          <CorrelationHeatmap />
        </Paper>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: { xs: 'auto', md: '100vh' },
            maxHeight: { xs: 'none', md: '100vh' },
            minWidth: 0,
            boxSizing: 'border-box',
            gridArea: { xs: 'bar', md: 'bar' },
          }}
        >
          <BarChart />
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard; 