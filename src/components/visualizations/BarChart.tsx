import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface BarData {
  name: string;
  value: number;
  fill: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: BarData;
  }>;
}

const defaultData: BarData[] = [
  {
    name: 'BTC',
    value: 65.3,
    fill: '#1f77b4'
  },
  {
    name: 'ETH',
    value: 58.7,
    fill: '#5fa8d8'
  },
  {
    name: 'ADA',
    value: 42.1,
    fill: '#93c1e4'
  },
  {
    name: 'XRP',
    value: 35.8,
    fill: '#93c1e4'
  },
  {
    name: 'LTC',
    value: 29.4,
    fill: '#93c1e4'
  }
];

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle1" fontWeight="bold">{data.name}</Typography>
        <Typography variant="body2">Value: {data.value}%</Typography>
      </Paper>
    );
  }
  return null;
};

interface BarChartProps {
  data?: BarData[];
  title?: string;
  subtitle?: string;
  yAxisLabel?: string;
}

const BarChart: React.FC<BarChartProps> = ({ 
  data = defaultData,
  title = 'Cryptocurrency Performance',
  subtitle = 'Percentage change over the last 30 days',
  yAxisLabel = 'Change (%)'
}) => {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        {title}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
        {subtitle}
      </Typography>
      
      <Box sx={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="value" name="Performance" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Performance Categories
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#1f77b4', borderRadius: 0.5, mr: 1 }} />
            <Typography variant="body2">Strong Performance ({'>'}60%)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#5fa8d8', borderRadius: 0.5, mr: 1 }} />
            <Typography variant="body2">Moderate Performance (40-60%)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#93c1e4', borderRadius: 0.5, mr: 1 }} />
            <Typography variant="body2">Low Performance ({'<'}40%)</Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default BarChart; 