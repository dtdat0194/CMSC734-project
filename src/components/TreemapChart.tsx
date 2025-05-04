import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { 
  Treemap, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

interface AssetData {
  name: string;
  size: number;
  fill: string;
  children?: AssetData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AssetData;
  }>;
}

const defaultData: AssetData[] = [
  {
    name: 'Bitcoin',
    size: 800000000000,
    fill: '#1f77b4',
    children: [
      { name: 'BTC-EUR', size: 400000000000, fill: '#1f77b4' },
      { name: 'BTC-USD', size: 400000000000, fill: '#1f77b4' }
    ]
  },
  {
    name: 'Ethereum',
    size: 250000000000,
    fill: '#5fa8d8',
    children: [
      { name: 'ETH-EUR', size: 125000000000, fill: '#5fa8d8' },
      { name: 'ETH-USD', size: 125000000000, fill: '#5fa8d8' }
    ]
  },
  {
    name: 'Cardano',
    size: 15000000000,
    fill: '#93c1e4',
    children: [
      { name: 'ADA-EUR', size: 7500000000, fill: '#93c1e4' },
      { name: 'ADA-USD', size: 7500000000, fill: '#93c1e4' }
    ]
  },
  {
    name: 'Ripple',
    size: 25000000000,
    fill: '#93c1e4',
    children: [
      { name: 'XRP-EUR', size: 12500000000, fill: '#93c1e4' },
      { name: 'XRP-USD', size: 12500000000, fill: '#93c1e4' }
    ]
  },
  {
    name: 'Litecoin',
    size: 5000000000,
    fill: '#93c1e4',
    children: [
      { name: 'LTC-EUR', size: 2500000000, fill: '#93c1e4' },
      { name: 'LTC-USD', size: 2500000000, fill: '#93c1e4' }
    ]
  }
];

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle1" fontWeight="bold">{data.name}</Typography>
        <Typography variant="body2">Market Cap: ${(data.size / 1e9).toFixed(1)}B</Typography>
      </Paper>
    );
  }
  return null;
};

interface TreemapChartProps {
  data?: AssetData[];
}

const TreemapChart: React.FC<TreemapChartProps> = ({ data = defaultData }) => {
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', mt: 1 }}>
        Cryptocurrency Market Cap Distribution
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
        Size represents market cap, color indicates asset category
      </Typography>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={data}
            dataKey="size"
            stroke="#fff"
            fill="#8884d8"
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Market Cap Categories
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#1f77b4', borderRadius: 0.5, mr: 1 }} />
            <Typography variant="body2">Large Cap ({'>'}$100B)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#5fa8d8', borderRadius: 0.5, mr: 1 }} />
            <Typography variant="body2">Mid Cap ($10B-$100B)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#93c1e4', borderRadius: 0.5, mr: 1 }} />
            <Typography variant="body2">Small Cap ({'<'}$10B)</Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default TreemapChart; 