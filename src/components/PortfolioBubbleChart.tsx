import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis,
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';

interface PortfolioData {
  market: string;
  expectedReturn: number;
  risk: number;
  marketCap: number;
  technicalScore: number;
  sharpeRatio: number;
  latestPrice: number;
  normalizedSize: number;
  fill: string;
}

interface EfficientFrontierPoint {
  risk: number;
  expectedReturn: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PortfolioData;
  }>;
}

const defaultData: PortfolioData[] = [
  {
    market: 'BTC-EUR',
    expectedReturn: 65.3,
    risk: 28.7,
    marketCap: 800000000000,
    technicalScore: 72.5,
    sharpeRatio: 2.15,
    latestPrice: 48250.75,
    normalizedSize: 8.9,
    fill: '#1f77b4'
  },
  {
    market: 'ETH-EUR',
    expectedReturn: 58.7,
    risk: 33.2,
    marketCap: 250000000000,
    technicalScore: 68.3,
    sharpeRatio: 1.67,
    latestPrice: 2150.45,
    normalizedSize: 5.0,
    fill: '#1f77b4'
  },
  {
    market: 'ADA-EUR',
    expectedReturn: 42.1,
    risk: 38.5,
    marketCap: 15000000000,
    technicalScore: 61.2,
    sharpeRatio: 1.03,
    latestPrice: 0.45,
    normalizedSize: 1.2,
    fill: '#5fa8d8'
  },
  {
    market: 'XRP-EUR',
    expectedReturn: 35.8,
    risk: 41.2,
    marketCap: 25000000000,
    technicalScore: 55.6,
    sharpeRatio: 0.82,
    latestPrice: 0.62,
    normalizedSize: 1.6,
    fill: '#93c1e4'
  },
  {
    market: 'LTC-EUR',
    expectedReturn: 29.4,
    risk: 36.3,
    marketCap: 5000000000,
    technicalScore: 52.8,
    sharpeRatio: 0.75,
    latestPrice: 71.35,
    normalizedSize: 0.7,
    fill: '#93c1e4'
  }
];

const efficientFrontier: EfficientFrontierPoint[] = [
  {risk: 25.00, expectedReturn: 25.00},
  {risk: 26.00, expectedReturn: 34.31},
  {risk: 27.00, expectedReturn: 37.73},
  {risk: 28.00, expectedReturn: 40.18},
  {risk: 29.00, expectedReturn: 42.12},
  {risk: 30.00, expectedReturn: 43.75},
  {risk: 31.00, expectedReturn: 45.15},
  {risk: 32.00, expectedReturn: 46.37},
  {risk: 33.00, expectedReturn: 47.46},
  {risk: 34.00, expectedReturn: 48.44},
  {risk: 35.00, expectedReturn: 49.32},
  {risk: 36.00, expectedReturn: 50.12},
  {risk: 37.00, expectedReturn: 50.86},
  {risk: 38.00, expectedReturn: 51.53},
  {risk: 39.00, expectedReturn: 52.15},
  {risk: 40.00, expectedReturn: 52.72},
  {risk: 41.00, expectedReturn: 53.25},
  {risk: 42.00, expectedReturn: 53.74},
  {risk: 43.00, expectedReturn: 54.19},
  {risk: 44.00, expectedReturn: 54.61},
  {risk: 45.00, expectedReturn: 55.00}
];

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    let technicalSignal = "Sell";
    if (data.technicalScore >= 70) technicalSignal = "Strong Buy";
    else if (data.technicalScore >= 60) technicalSignal = "Buy";
    else if (data.technicalScore >= 50) technicalSignal = "Hold";
    
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle1" fontWeight="bold">{data.market}</Typography>
        <Typography variant="body2">Expected Return: {data.expectedReturn}%</Typography>
        <Typography variant="body2">Risk: {data.risk}%</Typography>
        <Typography variant="body2">Market Cap: ${(data.marketCap / 1e9).toFixed(1)}B</Typography>
        <Typography variant="body2">Technical Signal: {technicalSignal} ({data.technicalScore})</Typography>
        <Typography variant="body2">Sharpe Ratio: {data.sharpeRatio}</Typography>
      </Paper>
    );
  }
  return null;
};

interface PortfolioBubbleChartProps {
  data?: PortfolioData[];
}

const PortfolioBubbleChart: React.FC<PortfolioBubbleChartProps> = ({ data = defaultData }) => {
  return (
    <Box sx={{ width: '100%', height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
        Portfolio Allocation Risk-Return Analysis
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
        Bubble size represents market cap, color indicates technical signal strength
      </Typography>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
        <Box sx={{ width: '100%', maxWidth: 700, height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="risk" 
                name="Risk" 
                domain={[25, 45]}
                label={{ value: 'Risk/Volatility (%)', position: 'bottom', offset: 0 }}
              />
              <YAxis 
                type="number" 
                dataKey="expectedReturn" 
                name="Expected Return" 
                domain={[20, 70]}
                label={{ value: 'Expected Return (%)', angle: -90, position: 'center', offset: 40 }}
              />
              <ZAxis type="number" dataKey="normalizedSize" range={[100, 1000]} />
              <Tooltip content={<CustomTooltip />} />
              {data.map((asset, index) => (
                <Scatter 
                  key={`asset-${index}`}
                  name={asset.market} 
                  data={[asset]} 
                  fill={asset.fill}
                />
              ))}
              <Scatter 
                name="Efficient Frontier" 
                data={efficientFrontier} 
                line={{ stroke: '#ff7300', strokeWidth: 2 }}
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </Box>
      </Box>
      {/* Custom legend below the chart */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, mt: 2, mb: 1, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#1f77b4', borderRadius: '50%', mr: 0.5 }} />
          <Typography variant="body2">BTC-EUR</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#1f77b4', borderRadius: '50%', mr: 0.5 }} />
          <Typography variant="body2">ETH-EUR</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#5fa8d8', borderRadius: '50%', mr: 0.5 }} />
          <Typography variant="body2">ADA-EUR</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#93c1e4', borderRadius: '50%', mr: 0.5 }} />
          <Typography variant="body2">XRP-EUR</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#93c1e4', borderRadius: '50%', mr: 0.5 }} />
          <Typography variant="body2">LTC-EUR</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#000', borderRadius: '50%', mr: 0.5, border: '2px solid #ff7300' }} />
          <Typography variant="body2">Efficient Frontier</Typography>
        </Box>
      </Box>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 1,
        mt: 2, 
        width: '100%',
        maxWidth: 700,
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto'
      }}>
        <Paper sx={{ p: 1, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ fontSize: 14 }}>
            Technical Signal Legend
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 1 }}>
            <Box sx={{ width: 10, height: 10, bgcolor: '#1f77b4', borderRadius: 0.5, mr: 0.5 }} />
            <Typography variant="body2" sx={{ fontSize: 13 }}>Strong Buy (70+)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 1 }}>
            <Box sx={{ width: 10, height: 10, bgcolor: '#5fa8d8', borderRadius: 0.5, mr: 0.5 }} />
            <Typography variant="body2" sx={{ fontSize: 13 }}>Buy (60-70)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, bgcolor: '#93c1e4', borderRadius: 0.5, mr: 0.5 }} />
            <Typography variant="body2" sx={{ fontSize: 13 }}>Hold (50-60)</Typography>
          </Box>
        </Paper>
        <Paper sx={{ p: 1, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ fontSize: 14 }}>
            Key Insights
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 13}}>• Larger bubbles = Higher market cap</Typography>
          <Typography variant="body2" sx={{ fontSize: 13}}>• BTC & ETH have best risk-adjusted returns</Typography>
          <Typography variant="body2" sx={{ fontSize: 13 }}>• Orange curve = Efficient frontier</Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default PortfolioBubbleChart; 