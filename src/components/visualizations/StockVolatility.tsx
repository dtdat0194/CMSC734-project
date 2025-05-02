import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockVolatilityProps {
  data?: StockData[];
}

const defaultData: StockData[] = [
  {
    date: '2024-01-01',
    open: 42000,
    high: 42500,
    low: 41800,
    close: 42300,
    volume: 1500000000
  },
  {
    date: '2024-01-02',
    open: 42300,
    high: 42800,
    low: 42100,
    close: 42600,
    volume: 1600000000
  },
  {
    date: '2024-01-03',
    open: 42600,
    high: 43000,
    low: 42400,
    close: 42900,
    volume: 1700000000
  },
  {
    date: '2024-01-04',
    open: 42900,
    high: 43200,
    low: 42700,
    close: 43100,
    volume: 1800000000
  },
  {
    date: '2024-01-05',
    open: 43100,
    high: 43500,
    low: 42900,
    close: 43400,
    volume: 1900000000
  }
];

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{
    payload: StockData;
  }>;
}> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle1" fontWeight="bold">{data.date}</Typography>
        <Typography variant="body2">Open: ${data.open.toLocaleString()}</Typography>
        <Typography variant="body2">High: ${data.high.toLocaleString()}</Typography>
        <Typography variant="body2">Low: ${data.low.toLocaleString()}</Typography>
        <Typography variant="body2">Close: ${data.close.toLocaleString()}</Typography>
        <Typography variant="body2">Volume: {data.volume.toLocaleString()}</Typography>
      </Paper>
    );
  }
  return null;
};

const StockVolatility: React.FC<StockVolatilityProps> = ({ data = defaultData }) => {
  const [filteredData, setFilteredData] = useState<StockData[]>(data);
  const [changeFilter, setChangeFilter] = useState<string>('both');

  useEffect(() => {
    const filtered = data.filter(item => {
      const date = new Date(item.date);
      return date >= new Date('2024-01-01') && date <= new Date('2024-01-05');
    });
    setFilteredData(filtered);
  }, [data]);

  useEffect(() => {
    if (changeFilter === 'up') {
      setFilteredData(prev => prev.filter(item => item.close > item.open));
    } else if (changeFilter === 'down') {
      setFilteredData(prev => prev.filter(item => item.close < item.open));
    } else {
      setFilteredData(data);
    }
  }, [changeFilter, data]);

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        Stock Price Volatility Analysis
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
        Daily price movements and volume analysis
      </Typography>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 2,
        mb: 2 
      }}>
        <FormControl component="fieldset">
          <Typography variant="subtitle2" gutterBottom>
            Price Movement Filter
          </Typography>
          <RadioGroup
            row
            value={changeFilter}
            onChange={(e) => setChangeFilter(e.target.value)}
          >
            <FormControlLabel value="both" control={<Radio />} label="All" />
            <FormControlLabel value="up" control={<Radio />} label="Up" />
            <FormControlLabel value="down" control={<Radio />} label="Down" />
          </RadioGroup>
        </FormControl>
      </Box>

      <Box sx={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="close"
              stroke="#8884d8"
              name="Close Price"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="volume"
              stroke="#82ca9d"
              name="Volume"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Key Metrics
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2 
          }}>
            <Typography variant="body2">
              Average Daily Volume: ${(filteredData.reduce((acc, curr) => acc + curr.volume, 0) / filteredData.length).toLocaleString()}
            </Typography>
            <Typography variant="body2">
              Price Range: ${Math.min(...filteredData.map(d => d.low)).toLocaleString()} - ${Math.max(...filteredData.map(d => d.high)).toLocaleString()}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default StockVolatility; 