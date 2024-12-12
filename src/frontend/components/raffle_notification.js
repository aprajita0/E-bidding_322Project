import React from 'react';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const RaffleNotification = ({ open, winningEntry, onClose, onMarkAsRead }) => {
  if (!winningEntry) return null; // Don't render if there's no winning entry

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={open}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">
            🎉 Congratulations!
          </Typography>
          <Typography sx={{ mt: 2 }}>
            You've won the raffle: {winningEntry?.raffle_id || 'Unnamed Raffle'}!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={onMarkAsRead}
            sx={{ mt: 2 }}
          >
            Mark as Read
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default RaffleNotification;

