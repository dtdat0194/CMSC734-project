import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const WelcomePage: React.FC<{ onScrollToDashboard: () => void; className?: string }> = ({ onScrollToDashboard, className }) => {
  return (
    <div className={className} style={{ width: '100%' }}>
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          bgcolor: '#1f77b4',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          px: 2,
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, letterSpacing: 2 }}>
          Welcome to
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 3, letterSpacing: 3, color: '#ffe082' }}>
          CRYPTO MARKET ANALYSIS DASHBOARD
        </Typography>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 500, color: '#fffde7' }}>
          Our group: <span style={{ fontWeight: 700 }}>Dat Dao, Yuran Ding, Taewon Kang, Rishanth Rajendhran</span>
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500, color: '#fffde7' }}>
          Instructor: <span style={{ fontWeight: 700 }}>Leo Zhicheng Liu</span>
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: '#ffe082',
            color: '#1f77b4',
            fontWeight: 700,
            fontSize: 20,
            px: 5,
            py: 1.5,
            borderRadius: 3,
            boxShadow: 3,
            transition: 'all 0.3s',
            '&:hover': { bgcolor: '#fffde7', color: '#1565c0', boxShadow: 6 },
          }}
          onClick={onScrollToDashboard}
        >
          Explore Dashboard ↓
        </Button>
      </Box>
    </div>
  );
};

export default WelcomePage; 