import React, { useState, useEffect } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import * as d3 from 'd3';

interface CorrelationData {
  [key: string]: {
    [key: string]: number;
  };
}

interface CorrelationHeatmapProps {
  data?: CorrelationData;
}

// Technical indicator calculations
const calculateRSI = (prices: number[], period: number = 14): number[] => {
  const changes = prices.slice(1).map((price, i) => price - prices[i]);
  const gains = changes.map(change => change > 0 ? change : 0);
  const losses = changes.map(change => change < 0 ? -change : 0);
  
  const avgGain = d3.rollup(gains, v => d3.mean(v) || 0, d => Math.floor(d / period));
  const avgLoss = d3.rollup(losses, v => d3.mean(v) || 0, d => Math.floor(d / period));
  
  return prices.map((_, i) => {
    if (i < period) return 50; // Default value for initial period
    const gain = avgGain.get(Math.floor(i / period)) || 0;
    const loss = avgLoss.get(Math.floor(i / period)) || 0;
    const rs = gain / (loss || 1); // Avoid division by zero
    return 100 - (100 / (1 + rs));
  });
};

const calculateSMA = (prices: number[], period: number = 20): number[] => {
  return prices.map((_, i) => {
    if (i < period - 1) return prices[i];
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    return sum / period;
  });
};

const calculateEMA = (prices: number[], period: number = 20): number[] => {
  const multiplier = 2 / (period + 1);
  return prices.map((price, i) => {
    if (i === 0) return price;
    return price * multiplier + prices[i - 1] * (1 - multiplier);
  });
};

const calculateReturns = (prices: number[]): number[] => {
  return prices.map((price, i) => {
    if (i === 0) return 0;
    return ((price - prices[i - 1]) / prices[i - 1]) * 100;
  });
};

const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  const meanX = d3.mean(x) || 0;
  const meanY = d3.mean(y) || 0;

  const covariance = d3.sum(x.slice(0, n).map((xi, i) => 
    (xi - meanX) * (y[i] - meanY)
  )) / (n - 1);

  const stdX = Math.sqrt(d3.sum(x.slice(0, n).map(xi => 
    Math.pow(xi - meanX, 2)
  )) / (n - 1));

  const stdY = Math.sqrt(d3.sum(y.slice(0, n).map(yi => 
    Math.pow(yi - meanY, 2)
  )) / (n - 1));

  return covariance / (stdX * stdY);
};

const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = () => {
  const [data, setData] = useState<CorrelationData>({});
  const [activeCrypto, setActiveCrypto] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const basePath = process.env.PUBLIC_URL || '';
        const cryptos = ['BTC-EUR', 'ETH-EUR', 'ADA-EUR', 'XRP-EUR', 'LTC-EUR'];
        
        const correlationData: CorrelationData = {};
        let startDate: Date | null = null;
        let endDate: Date | null = null;
        
        for (const crypto of cryptos) {
          try {
            const csvData = await d3.csv(`${basePath}/candles/${crypto}.csv`);
            
            if (csvData.length >= 2) {
              // Sort data by time
              csvData.sort((a, b) => Number(a.time) - Number(b.time));
              
              // Update date range
              const firstDate = new Date(Number(csvData[0].time));
              const lastDate = new Date(Number(csvData[csvData.length - 1].time));
              
              if (!startDate || firstDate < startDate) {
                startDate = firstDate;
              }
              if (!endDate || lastDate > endDate) {
                endDate = lastDate;
              }
              
              // Extract closing prices
              const prices = csvData.map(d => parseFloat(d.close));
              
              // Calculate indicators
              const rsi = calculateRSI(prices);
              const sma = calculateSMA(prices);
              const ema = calculateEMA(prices);
              const returns = calculateReturns(prices);
              
              // Calculate correlations
              correlationData[crypto] = {
                "RSI-Returns": calculateCorrelation(rsi, returns),
                "SMA-Returns": calculateCorrelation(sma, returns),
                "EMA-Returns": calculateCorrelation(ema, returns),
                "RSI-SMA": calculateCorrelation(rsi, sma),
                "RSI-EMA": calculateCorrelation(rsi, ema),
                "SMA-EMA": calculateCorrelation(sma, ema)
              };
            }
          } catch (error) {
            console.error(`Error loading data for ${crypto}:`, error);
          }
        }
        
        setData(correlationData);

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
      } catch (error) {
        setError('Failed to load correlation data');
        console.error('Error loading correlation data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const correlationPairs = Object.keys(data["BTC-EUR"] || {});
  const cryptoPairs = Object.keys(data);

  const getColor = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '#f5f5f5';
    
    if (value > 0) {
      const intensity = Math.min(Math.abs(value), 1);
      return `rgba(31, 119, 180, ${intensity})`;
    } else {
      const intensity = Math.min(Math.abs(value), 1);
      const red = Math.floor(255 * intensity);
      return `rgb(255, ${255-red}, ${255-red})`;
    }
  };

  const getAverageCorrelations = () => {
    const averages: { [key: string]: number } = {};
    
    correlationPairs.forEach(pair => {
      const sum = cryptoPairs.reduce((acc, crypto) => acc + data[crypto][pair], 0);
      averages[pair] = sum / cryptoPairs.length;
    });
    
    return averages;
  };

  const displayData = activeCrypto === "ALL" ? getAverageCorrelations() : data[activeCrypto];

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography>Loading correlation data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 700, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
          Technical Indicator Correlation Heatmap for Major Cryptocurrencies
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
          {dateRange ? `Period: ${dateRange}` : 'Loading period...'}
        </Typography>
        <Box sx={{ my: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="subtitle2" gutterBottom>
            Select Cryptocurrency:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant={activeCrypto === "ALL" ? "contained" : "outlined"}
              size="small"
              onClick={() => setActiveCrypto("ALL")}
            >
              ALL
            </Button>
            {cryptoPairs.map(crypto => (
              <Button
                key={crypto}
                variant={activeCrypto === crypto ? "contained" : "outlined"}
                size="small"
                onClick={() => setActiveCrypto(crypto)}
              >
                {crypto}
              </Button>
            ))}
          </Box>
        </Box>
        <Box sx={{ width: '100%', flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <TableContainer component={Paper} sx={{ width: '100%', maxWidth: 600 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Correlation Pair</TableCell>
                  <TableCell align="center">Value</TableCell>
                  <TableCell align="center">Visualization</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {correlationPairs.map(pair => (
                  <TableRow key={pair}>
                    <TableCell component="th" scope="row">
                      {pair}
                    </TableCell>
                    <TableCell align="center">
                      {displayData[pair].toFixed(3)}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          width: '100%',
                          height: 24,
                          bgcolor: 'grey.200',
                          borderRadius: 1,
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            width: `${Math.abs(displayData[pair] * 100)}%`,
                            height: '100%',
                            bgcolor: getColor(displayData[pair])
                          }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box sx={{ mt: 3, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="subtitle1" gutterBottom>
            Correlation Legend
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 16, height: 16, bgcolor: 'error.main', borderRadius: 0.5, mr: 1 }} />
              <Typography variant="body2">Strong Negative (-1.0)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 16, height: 16, bgcolor: 'grey.300', borderRadius: 0.5, mr: 1 }} />
              <Typography variant="body2">No Correlation (0.0)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#1f77b4', borderRadius: 0.5, mr: 1 }} />
              <Typography variant="body2">Strong Positive (1.0)</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CorrelationHeatmap; 