import React, { useState } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

interface CorrelationData {
  [key: string]: {
    [key: string]: number;
  };
}

interface CorrelationHeatmapProps {
  data?: CorrelationData;
}

const defaultData: CorrelationData = {
  "ADA-EUR": {
    "RSI-Returns": 0.271,
    "SMA-Returns": -0.024,
    "EMA-Returns": -0.020,
    "RSI-SMA": 0.000,
    "RSI-EMA": 0.015,
    "SMA-EMA": 0.999
  },
  "BTC-EUR": {
    "RSI-Returns": 0.270,
    "SMA-Returns": -0.011,
    "EMA-Returns": -0.008,
    "RSI-SMA": 0.033,
    "RSI-EMA": 0.046,
    "SMA-EMA": 1.000
  },
  "XRP-EUR": {
    "RSI-Returns": 0.277,
    "SMA-Returns": -0.007,
    "EMA-Returns": -0.003,
    "RSI-SMA": 0.052,
    "RSI-EMA": 0.070,
    "SMA-EMA": 0.999
  },
  "LTC-EUR": {
    "RSI-Returns": 0.239,
    "SMA-Returns": -0.049,
    "EMA-Returns": -0.042,
    "RSI-SMA": 0.019,
    "RSI-EMA": 0.046,
    "SMA-EMA": 0.998
  },
  "ETH-EUR": {
    "RSI-Returns": 0.260,
    "SMA-Returns": -0.049,
    "EMA-Returns": -0.043,
    "RSI-SMA": -0.019,
    "RSI-EMA": 0.007,
    "SMA-EMA": 0.998
  }
};

const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ data = defaultData }) => {
  const [activeCrypto, setActiveCrypto] = useState<string>("ALL");
  
  const correlationPairs = Object.keys(data["BTC-EUR"]);
  const cryptoPairs = Object.keys(data);

  const getColor = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '#f5f5f5';
    
    if (value > 0) {
      const intensity = Math.min(Math.abs(value), 1);
      const blue = Math.floor(255 * intensity);
      return `rgb(${255-blue}, ${255-blue}, 255)`;
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

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 700, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" align="center" gutterBottom>
          Technical Indicator Correlation Heatmap for Major Cryptocurrencies
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
          Period: 14 days
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
              <Box sx={{ width: 16, height: 16, bgcolor: 'primary.main', borderRadius: 0.5, mr: 1 }} />
              <Typography variant="body2">Strong Positive (1.0)</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CorrelationHeatmap; 