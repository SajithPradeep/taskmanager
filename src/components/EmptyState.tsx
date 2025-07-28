import { Box, Typography, Button } from '@mui/material';
import { AddTask as AddTaskIcon } from '@mui/icons-material';
import Lottie from 'lottie-react';
import emptyAnimation from '../assets/empty-tasks.json';

interface EmptyStateProps {
  onAddClick: () => void;
}

export const EmptyState = ({ onAddClick }: EmptyStateProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        mt: { xs: 2, sm: 3 },
        mb: 2,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Box sx={{ width: { xs: '160px', sm: '220px' }, mb: 2 }}>
        <Lottie
          animationData={emptyAnimation}
          loop={true}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
      
      <Typography
        variant="h5"
        component="h2"
        sx={{
          mb: 1,
          fontWeight: 600,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
        }}
      >
        No Tasks Yet!
      </Typography>
      
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 340, fontSize: '0.98rem' }}
      >
        Start organizing your tasks by adding your first one. It's a great way to stay on top of everything!
      </Typography>

      <Button
        variant="contained"
        size="large"
        startIcon={<AddTaskIcon />}
        onClick={onAddClick}
        sx={{
          borderRadius: 2,
          px: 4,
          py: 1.2,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1976D2 30%, #0CA8D3 90%)',
          },
        }}
      >
        Add Your First Task
      </Button>
    </Box>
  );
}; 