import React, { useState, useEffect } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import * as d3 from 'd3';
import { useCrypto } from '../context/CryptoContext';

interface CryptoData {
  name: string;
  value: number;
  fill: string;
  [key: string]: string | number;
}

interface CorrelationData {
  [key: string]: CryptoData;
}

interface DisplayData {
  [key: string]: number;
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
  const { selectedCrypto } = useCrypto();
  const [data, setData] = useState<CorrelationData>({});
  const [activeCrypto, setActiveCrypto] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>('');

  // Sync activeCrypto with selectedCrypto from context
  useEffect(() => {
    if (selectedCrypto && selectedCrypto !== activeCrypto) {
      setActiveCrypto(selectedCrypto);
    }
  }, [selectedCrypto]);

  // Define correlation pairs
  const correlationPairs = [
    'RSI-SMA',
    'RSI-EMA',
    'SMA-EMA',
    'RSI-Returns',
    'SMA-Returns',
    'EMA-Returns'
  ];

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
    const averages: DisplayData = {};
    
    correlationPairs.forEach(pair => {
      const sum = cryptoPairs.reduce((acc, crypto) => {
        const value = data[crypto]?.[pair];
        return acc + (typeof value === 'number' ? value : 0);
      }, 0);
      averages[pair] = sum / cryptoPairs.length;
    });
    
    return averages;
  };

  const displayData: DisplayData = activeCrypto === "ALL" ? getAverageCorrelations() : 
    Object.entries(data[activeCrypto] || {}).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'number' ? value : 0;
      return acc;
    }, {} as DisplayData);

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
              // Sort data by time (timestamp is in milliseconds) from oldest to newest
              csvData.sort((a, b) => Number(a.time) - Number(b.time));
              
              // Get the first and last entries (now properly ordered from past to future)
              const firstDate = new Date(Number(csvData[0].time));
              const lastDate = new Date(Number(csvData[csvData.length - 1].time));
              
              if (!startDate || firstDate < startDate) {
                startDate = firstDate;
              }
              if (!endDate || lastDate > endDate) {
                endDate = lastDate;
              }

              // Extract price data
              const prices = csvData.map(row => parseFloat(row.close));
              
              // Calculate technical indicators
              const rsi = calculateRSI(prices);
              const sma = calculateSMA(prices);
              const ema = calculateEMA(prices);
              const returns = calculateReturns(prices);
              
              // Calculate correlations
              const correlations = {
                'RSI-SMA': calculateCorrelation(rsi, sma),
                'RSI-EMA': calculateCorrelation(rsi, ema),
                'SMA-EMA': calculateCorrelation(sma, ema),
                'RSI-Returns': calculateCorrelation(rsi, returns),
                'SMA-Returns': calculateCorrelation(sma, returns),
                'EMA-Returns': calculateCorrelation(ema, returns)
              };
              
              correlationData[crypto] = {
                name: crypto.split('-')[0],
                value: parseFloat(((prices[prices.length - 1] - prices[0]) / prices[0] * 100).toFixed(1)),
                fill: '#1f77b4',
                ...correlations
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

  // Use activeCrypto for tab opacity
  const getTabOpacity = (crypto: string) => {
    if (activeCrypto === "ALL") return 1;
    return crypto === activeCrypto ? 1 : 0.3;
  };

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
          <span className="glossary-term glossary-term-correlation" title="Tells how two values move together. 1.0 = move together, -1.0 = move opposite, 0 = no relationship.">Correlation</span> Strength Between <span className="glossary-term" title="A calculated value based on past price or volume (like RSI, SMA, EMA) that helps analyze market trends and guide trading decisions.">Technical Indicators</span> for Major Cryptos
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
            {Object.keys(data).map(crypto => (
              <Button
                key={crypto}
                variant={activeCrypto === crypto ? "contained" : "outlined"}
                size="small"
                onClick={() => setActiveCrypto(crypto)}
                sx={{ opacity: getTabOpacity(crypto) }}
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
                      {typeof displayData[pair] === 'number' && !isNaN(displayData[pair])
                        ? displayData[pair].toFixed(3)
                        : 'N/A'}
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
                            width:
                              typeof displayData[pair] === 'number' && !isNaN(displayData[pair])
                                ? `${Math.abs(displayData[pair] * 100)}%`
                                : '0%',
                            height: '100%',
                            bgcolor:
                              typeof displayData[pair] === 'number' && !isNaN(displayData[pair])
                                ? getColor(displayData[pair])
                                : 'transparent'
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
            <span className="glossary-term" title="A guide showing the meaning of different correlation values and their visual representation in the heatmap.">Correlation Legend</span>
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 16, height: 16, bgcolor: 'error.main', borderRadius: 0.5, mr: 1 }} />
              <Typography variant="body2"><span className="glossary-term" title="A perfect negative correlation where two indicators move in exactly opposite directions.">Strong Negative</span> (-1.0)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 16, height: 16, bgcolor: 'grey.300', borderRadius: 0.5, mr: 1 }} />
              <Typography variant="body2"><span className="glossary-term" title="No relationship between the indicators, they move independently of each other.">No Correlation</span> (0.0)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#1f77b4', borderRadius: 0.5, mr: 1 }} />
              <Typography variant="body2"><span className="glossary-term" title="A perfect positive correlation where two indicators move in exactly the same direction.">Strong Positive</span> (1.0)</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ mt: 3, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="subtitle1" gutterBottom>
            <span className="glossary-term" title="Technical indicators are mathematical calculations based on price, volume, or other market data that help traders make decisions.">Technical Indicators</span>
          </Typography>
          <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0, width: '100%', maxWidth: 600 }}>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>RSI (Relative Strength Index):</strong> Measures if a coin is overbought or oversold. High RSI = may be overbought; Low RSI = may be oversold.
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>SMA (Simple Moving Average):</strong> Calculates the average price over a set time (e.g., 14 days), smoothing out short-term price noise.
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>EMA (Exponential Moving Average):</strong> Like SMA but weights recent prices more, making it more responsive to recent trends.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CorrelationHeatmap; 