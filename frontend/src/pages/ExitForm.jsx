import React, { useState } from 'react';
import { recordExit } from '../api/parkingApi';

function ExitForm() {
  const [plateNo, setPlateNo] = useState('');
  const [exitDetails, setExitDetails] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setExitDetails(null);

    try {
      const response = await recordExit(plateNo);
      setExitDetails(response.data.parkingRecord);
      setMessage(`Car ${plateNo} exited successfully!`);
      setPlateNo(''); // Clear plate number after successful exit
    } catch (err) {
      console.error('Error recording exit:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.msg || 'Failed to record exit. Please check plate number.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Plate No to Exit:</label>
          <input
            type="text"
            value={plateNo}
            onChange={(e) => setPlateNo(e.target.value)}
            required
          />
        </div>
        <button type="submit">Process Exit</button>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      {exitDetails && (
        <div style={{ marginTop: '20px', border: '1px solid #eee', padding: '15px' }}>
          <h3>Exit Summary:</h3>
          <p><strong>Car Plate:</strong> {exitDetails.car?.plateNo}</p>
          <p><strong>Parking Slot:</strong> {exitDetails.slot?.slotNo}</p>
          <p><strong>Entry Time:</strong> {new Date(exitDetails.entryTime).toLocaleString()}</p>
          <p><strong>Exit Time:</strong> {new Date(exitDetails.exitTime).toLocaleString()}</p>
          <p><strong>Duration:</strong> {exitDetails.duration} minutes</p>
          <p><strong>Parking Fee:</strong> ${exitDetails.parkingFee.toFixed(2)}</p>
          {/* You might add a button here to navigate to PaymentForm or automatically populate it */}
        </div>
      )}
    </div>
  );
}

export default ExitForm;