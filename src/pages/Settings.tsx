import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Paper,
  Divider
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../contexts/AuthContext';

export const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <ArrowBackIcon 
            sx={{ cursor: 'pointer' }} 
            onClick={handleBack}
          />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Settings
          </Typography>
        </Box>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleSignOut} sx={{ py: 2 }}>
              <ListItemIcon>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Sign Out" 
                primaryTypographyProps={{ 
                  color: 'error.main',
                  fontWeight: 500 
                }} 
              />
            </ListItemButton>
          </ListItem>
          <Divider />
        </List>
      </Paper>
    </Container>
  );
}; 