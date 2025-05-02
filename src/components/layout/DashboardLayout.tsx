import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Crypto Market Analysis Dashboard
      </Typography>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3 
      }}>
        {React.Children.map(children, (child, index) => (
          <Paper
            key={index}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: 400,
            }}
          >
            {child}
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default DashboardLayout; 