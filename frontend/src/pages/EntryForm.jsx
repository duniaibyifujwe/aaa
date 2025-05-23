import React, { useState } from 'react';
import { recordEntry } from '../api/parkingApi';

function EntryForm() {
  const [plateNo, setPlateNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [slotNo, setSlotNo] = useState(''); // Optional: if user wants to pick a specific slot
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await recordEntry({ plateNo, driverName, phoneNo, slotNo });
      setMessage(`Car ${response.data.parkingRecord.car.plateNo} parked successfully in slot ${response.data.parkingRecord.slot.slotNo}!`);
      // Clear form
      setPlateNo('');
      setDriverName('');
      setPhoneNo('');
      setSlotNo('');
    } catch (err) {
      console.error('Error recording entry:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.msg || 'Failed to record entry. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Plate No:</label>
        <input
          type="text"
          value={plateNo}
          onChange={(e) => setPlateNo(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Driver Name:</label>
        <input
          type="text"
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Phone No:</label>
        <input
          type="text"
          value={phoneNo}
          onChange={(e) => setPhoneNo(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Desired Slot (Optional):</label>
        <input
          type="text"
          value={slotNo}
          onChange={(e) => setSlotNo(e.target.value)}
        />
      </div>
      <button type="submit">Park Car</button>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default EntryForm;