import React, { useState, useEffect } from 'react';
import { recordPayment, getParkingHistory } from '../api/parkingApi'; // Import getParkingHistory
import NavBar from '../components/NavBar';

function PaymentForm() {
  const [unpaidRecords, setUnpaidRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingRecords, setLoadingRecords] = useState(true); // New loading state for records

  // Fetch unpaid parking records on component mount
  useEffect(() => {
    const fetchUnpaidRecords = async () => {
      try {
        setLoadingRecords(true);
        // Fetch records that are 'exited_unpaid'
        const response = await getParkingHistory({ status: 'exited_unpaid' });
        setUnpaidRecords(response.data);
        if (response.data.length > 0) {
          // Optionally pre-select the first unpaid record
          setSelectedRecordId(response.data[0]._id);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching unpaid parking records:', err);
        setError('Failed to load unpaid parking records.');
      } finally {
        setLoadingRecords(false);
      }
    };

    fetchUnpaidRecords();
  }, []); // Empty dependency array means this runs once on mount

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!selectedRecordId) {
      setError('Please select a parking record.');
      return;
    }
    if (isNaN(parseFloat(amountPaid)) || parseFloat(amountPaid) <= 0) {
      setError('Please enter a valid amount paid.');
      return;
    }

    try {
      const response = await recordPayment(selectedRecordId, parseFloat(amountPaid));
      setMessage(`Payment of $${response.data.payment.amountPaid.toFixed(2)} recorded successfully for record ID: ${response.data.payment.parkingRecord}!`);

      // After successful payment, re-fetch unpaid records to update the list
      const updatedRecordsResponse = await getParkingHistory({ status: 'exited_unpaid' });
      setUnpaidRecords(updatedRecordsResponse.data);
      setSelectedRecordId(updatedRecordsResponse.data.length > 0 ? updatedRecordsResponse.data[0]._id : ''); // Select first or clear
      setAmountPaid('');
    } catch (err) {
      console.error('Error recording payment:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.msg || 'Failed to record payment. Check parking record ID and amount.');
    }
  };

  return (
    <>
    <NavBar/>

    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="parkingRecordSelect">Select Parking Record (Unpaid):</label>
        {loadingRecords ? (
          <p>Loading unpaid records...</p>
        ) : unpaidRecords.length === 0 ? (
          <p>No unpaid parking records found.</p>
        ) : (
          <select
            id="parkingRecordSelect"
            value={selectedRecordId}
            onChange={(e) => setSelectedRecordId(e.target.value)}
            required
          >
            {unpaidRecords.map((record) => (
              <option key={record._id} value={record._id}>
                Car: {record.car?.plateNo || 'N/A'} - Slot: {record.slot?.slotNo || 'N/A'} - Fee: ${record.parkingFee?.toFixed(2) || '0.00'}
                {record.duration ? ` (${record.duration} min)` : ''}
              </option>
            ))}
          </select>
        )}
      </div>
      <div>
        <label htmlFor="amountPaid">Amount Paid ($):</label>
        <input
          id="amountPaid"
          type="number"
          step="0.01"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          required
          min="0" // Ensure positive amount
          />
      </div>
      <button type="submit" disabled={loadingRecords || unpaidRecords.length === 0}>Record Payment</button>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
          </>
  );
}

export default PaymentForm;