import React, { useState, useEffect } from 'react';
import RatingModal from '../components/rating_modal.js';
import './buyer_rating.css';

const BuyerRatings = () => {
  const [unratedTransactions, setUnratedTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  // Fetch unrated transactions
  useEffect(() => {
    const fetchUnratedTransactions = async () => {
      try {
        const response = await fetch(`/api/users/get-transactions`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const transactions = await response.json();
          console.log("Fetched transactions:", transactions);

          const unrated = transactions.filter((transaction) => !transaction.rating);
          console.log("Filtered Unrated Transactions:", unrated);

          setUnratedTransactions(unrated);
        } else {
          console.error('Failed to fetch transactions');
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchUnratedTransactions();
  }, []);

  const handleRateTransaction = (transaction) => {
    console.log('Selected transaction:', transaction);
    setCurrentTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setUnratedTransactions((prev) => prev.filter((t) => t._id !== currentTransaction?._id));
    setCurrentTransaction(null);
  };

  return (
    <div>
      <h2>Rate Your Sellers</h2>
      {unratedTransactions?.length > 0 ? (
        <ul>
          {unratedTransactions.map((transaction) => (
            <li key={transaction._id}>
              <div style={{ marginBottom: '20px' }}>
                <p>
                  <strong>Listing: </strong>{transaction.listing_id?.name || 'N/A'}
                </p>
                <p>
                  <strong>Seller: </strong>
                  {`${transaction.seller_id?.first_name || 'N/A'} ${transaction.seller_id?.last_name || 'N/A'}`}
                </p>
                <p>
                  <strong>Bought for: </strong>${transaction.amount?.$numberDecimal || '0.00'}
                </p>
                <button onClick={() => handleRateTransaction(transaction)}>
                  Rate
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No transactions to rate.</p>
      )}
      {currentTransaction && (
        <RatingModal
          open={isModalOpen && currentTransaction?._id}
          handleClose={handleModalClose}
          transactionId={currentTransaction?._id}
          onSuccess={handleModalClose}
        />
      )}
    </div>
  );
};

export default BuyerRatings;

