import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import * as d3 from 'd3';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { useCrypto } from '../context/CryptoContext';

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

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle1" fontWeight="bold">{data.name.split('-')[0]}</Typography>
        <Typography variant="body2">Value: {data.value}%</Typography>
      </Paper>
    );
  }
  return null;
};

interface BarChartProps {
  title?: string;
  subtitle?: string;
  yAxisLabel?: string;
}

const BarChart: React.FC<BarChartProps> = ({ 
  title = 'Cryptocurrency Performance for Major Cryptos',
  subtitle = 'Percentage change over the last 30 days',
  yAxisLabel = 'Change (%)'
}) => {
  const [data, setData] = useState<BarData[]>([]);
  const [dateRange, setDateRange] = useState<string>('');
  const { selectedCrypto, setSelectedCrypto } = useCrypto();

  useEffect(() => {
    const loadData = async () => {
      const basePath = process.env.PUBLIC_URL || '';
      const cryptos = ['BTC-EUR', 'ETH-EUR', 'ADA-EUR', 'XRP-EUR', 'LTC-EUR'];
      
      const performanceData: BarData[] = [];
      let startDate: Date | null = null;
      let endDate: Date | null = null;
      
      for (const crypto of cryptos) {
        try {
          const csvData = await d3.csv(`${basePath}/candles/${crypto}.csv`);
          
          if (csvData.length >= 2) {
            // Sort data by time (timestamp is in milliseconds) from oldest to newest
            csvData.sort((a, b) => Number(a.time) - Number(b.time));
            
            // Get the first and last entries (now properly ordered from past to future)
            const firstPrice = parseFloat(csvData[0].close);
            const lastPrice = parseFloat(csvData[csvData.length - 1].close);
            
            // Update date range
            const firstDate = new Date(Number(csvData[0].time));
            const lastDate = new Date(Number(csvData[csvData.length - 1].time));
            
            if (!startDate || firstDate < startDate) {
              startDate = firstDate;
            }
            if (!endDate || lastDate > endDate) {
              endDate = lastDate;
            }
            
            // Calculate percentage change
            const percentageChange = ((lastPrice - firstPrice) / firstPrice) * 100;
            
            // Determine color based on performance
            let fill = '#93c1e4'; // Low performance
            if (percentageChange > 60) {
              fill = '#1f77b4'; // Strong performance
            } else if (percentageChange > 40) {
              fill = '#5fa8d8'; // Moderate performance
            }
            
            performanceData.push({
              name: crypto,
              value: parseFloat(percentageChange.toFixed(1)),
              fill
            });
          }
        } catch (error) {
          console.error(`Error loading data for ${crypto}:`, error);
        }
      }
      
      // Sort by performance
      performanceData.sort((a, b) => b.value - a.value);
      setData(performanceData);

      // Set date range
      if (startDate && endDate) {
        const formatDate = (date: Date) => {
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
        };
        setDateRange(`${formatDate(startDate)} to ${formatDate(endDate)}`);
      }
    };
    
    loadData();
  }, []);

  const getOpacity = (name: string) => {
    if (!selectedCrypto) return 1;
    return name === selectedCrypto ? 1 : 0.3;
  };

  return (
    <Box sx={{ width: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
        {dateRange ? `Period: ${dateRange}` : subtitle}
      </Typography>
      
      <Box sx={{ height: 400, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tickFormatter={name => name.split('-')[0]} />
            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="value"
              name="Performance"
              isAnimationActive={false}
              onClick={(_, index) => setSelectedCrypto(data[index].name)}
              fillOpacity={1}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.fill}
                  opacity={getOpacity(entry.name)}
                  cursor="pointer"
                />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </Box>
      
      <Box sx={{ mt: 2, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Paper sx={{ p: 2, bgcolor: 'background.paper', width: '100%', maxWidth: 600 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom align="center">
            Performance Categories
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#1f77b4', borderRadius: 0.5, mr: 1 }} />
              <Typography variant="body2">Strong Performance ({'>'}60%)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#5fa8d8', borderRadius: 0.5, mr: 1 }} />
              <Typography variant="body2">Moderate Performance (40-60%)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#93c1e4', borderRadius: 0.5, mr: 1 }} />
              <Typography variant="body2">Low Performance ({'<'}40%)</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default BarChart;