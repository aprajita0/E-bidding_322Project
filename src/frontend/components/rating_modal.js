import React, { useState, useEffect } from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 400,
  bgcolor: 'background.paper',
  borderRadius: '10px',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  outline: 'none',
};

const RatingModal = ({ open, handleClose, transactionId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    console.log('RatingModal received transactionId:', transactionId);
}, [transactionId]);

  const handleSubmit = async () => {
    if (isSubmitting) return; //prevents multiple clicks
    setIsSubmitting(true); //disables button

    try {
      if (!transactionId) {
        console.error('Cannot submit rating: transactionId is null or undefined');
        alert('An error occurred. Please try again.');
        return;
      }

      if (rating === 0) {
        alert('Please select a rating!');
        return;
      }

      const response = await fetch('/api/users/rate-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ transaction_id: transactionId, rating }),
      });

      if (response.ok) {
        setSuccessMessage('Thank you for your rating!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setRating(0); // reset rating
        handleClose(); // close the modal
        onSuccess(); 
      } else {
        const error = await response.json();
        alert(error.message || 'Error submitting rating.');
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      aria-labelledby="rating-modal-title"
      aria-describedby="rating-modal-description"
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={open}>
        <Box sx={style}>
          <Typography id="rating-modal-title" variant="h6" component="h2">
            Rate the Transaction
          </Typography>
          <Typography id="rating-modal-description" sx={{ mt: 2 }}>
            Please rate the other party anonymously.
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0', fontSize: '30px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{
                  cursor: 'pointer',
                  color: star <= rating ? 'gold' : 'lightgray',
                  margin: '0 10px',
                  padding: '5px',
                  transition: 'color 0.2s, transform 0.2s',
                }}
                onClick={() => setRating(star)}
                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.2)')}
                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
              >
                ★
              </span>
            ))}
          </div>
          {successMessage && (
            <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
              {successMessage}
            </Typography>
          )}
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default RatingModal;
