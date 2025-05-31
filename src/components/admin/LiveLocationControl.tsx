import React, { useEffect, useState } from 'react';
import { useLocation } from '../../hooks/useLocation';
import { Button, Alert, Snackbar, Typography, Box, Paper, Container } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface LiveLocationControlProps {
  onClose: () => void;
}

const LiveLocationControl: React.FC<LiveLocationControlProps> = ({ onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [isStoppingTracking, setIsStoppingTracking] = useState<boolean>(false);
  const [showBackgroundInfo, setShowBackgroundInfo] = useState<boolean>(false);
  
  // Use the location hook for public tracking
  const { 
    startPublicTracking,
    stopLiveTracking, 
    isTracking, 
    deliveryLocation,
    getPublicLocation,
    updateLocation
  } = useLocation();
  
  // Show background tracking info when starting tracking
  useEffect(() => {
    if (isTracking) {
      setShowBackgroundInfo(true);
      // Auto-hide after 15 seconds
      const timer = setTimeout(() => {
        setShowBackgroundInfo(false);
      }, 15000);
      
      return () => clearTimeout(timer);
    }
  }, [isTracking]);
  
  // Check if public location is active on mount
  useEffect(() => {
    const checkPublicLocation = async () => {
      await getPublicLocation();
    };
    
    checkPublicLocation();
  }, [getPublicLocation]);

  // Update the last update time whenever delivery location changes
  useEffect(() => {
    if (deliveryLocation) {
      setLastUpdateTime(deliveryLocation.timestamp);
    }
  }, [deliveryLocation]);

  // Calculate time since last update
  const getTimeSinceUpdate = () => {
    const now = Date.now();
    const diffMs = now - lastUpdateTime;
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 5) {
      return 'just now';
    } else if (diffSecs < 60) {
      return `${diffSecs} seconds ago`;
    } else {
      return `${Math.floor(diffSecs / 60)} minutes ago`;
    }
  };

  // Start live tracking
  const handleStartTracking = async () => {
    // Get the initial location immediately for instant feedback
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Update location first to avoid delay
          await updateLocation({ latitude, longitude }, 'Delivery Driver');
          
          // Then start continuous tracking
          const success = await startPublicTracking('Delivery Driver');
          if (!success) {
            setError('Failed to start location tracking. Please check location permissions.');
          } else {
            // Show background tracking info
            setShowBackgroundInfo(true);
          }
        },
        (err) => {
          console.error('Initial location error:', err);
          setError('Failed to get initial location. Please check location permissions.');
        },
        { 
          enableHighAccuracy: true,
          timeout: 5000
        }
      );
    }
  };

  // Stop live tracking
  const handleStopTracking = async () => {
    try {
      setIsStoppingTracking(true);
      setError(null); // Clear any previous errors
      setSuccessMessage(null); // Clear any previous success messages
      
      // Clear the tracking
      const success = await stopLiveTracking();
      
      if (success) {
        // Set success message
        setSuccessMessage('Location sharing stopped successfully!');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setError('Failed to stop location tracking. Please try again.');
      }
    } catch (err) {
      console.error('Error in stop tracking:', err);
      setError('An error occurred while stopping tracking.');
    } finally {
      setIsStoppingTracking(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        Live Location Tracking
      </Typography>
      
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      <Snackbar 
        open={showBackgroundInfo} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setShowBackgroundInfo(false)}
      >
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          onClose={() => setShowBackgroundInfo(false)}
          sx={{ width: '100%' }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Keep this window open and visible for reliable tracking
          </Typography>
          <Typography variant="body2">
            For best location tracking performance:
            <ul>
              <li>Keep this browser window open</li>
              <li>Keep your device unlocked</li>
              <li>Disable battery optimization for this browser</li>
            </ul>
          </Typography>
        </Alert>
      </Snackbar>
      
      <Box display="flex" justifyContent="center" mb={4}>
        {isTracking ? (
          <Box width="100%" maxWidth="md">
            <Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: '#f0f8ff' }}>
              <Box display="flex" alignItems="center" mb={1}>
                <InfoIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  Location tracking is active
                </Typography>
              </Box>
              <Typography variant="body2">
                Last updated: {getTimeSinceUpdate()}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                For reliable tracking, keep this window open and your device unlocked.
              </Typography>
            </Paper>
            
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleStopTracking}
              disabled={isStoppingTracking}
              fullWidth
              startIcon={<StopIcon />}
              size="large"
            >
              {isStoppingTracking ? 'Stopping...' : 'Stop Tracking'}
            </Button>
          </Box>
        ) : (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleStartTracking}
            fullWidth
            startIcon={<PlayArrowIcon />}
            size="large"
            sx={{ maxWidth: "md" }}
          >
            Start Live Tracking
          </Button>
        )}
      </Box>
      
      <Box display="flex" justifyContent="center" mt={4}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </Box>
    </Container>
  );
};

export default LiveLocationControl; 