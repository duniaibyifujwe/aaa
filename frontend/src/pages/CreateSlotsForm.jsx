// parking-management-frontend/src/pages/CreateSlotsForm.js

import React, { useState } from 'react';
import { createParkingSlots } from '../api/parkingApi';

function CreateSlotsForm() {
  const [slotNumbersInput, setSlotNumbersInput] = useState(''); // e.g., "A1, A2, B1, B2"
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    if (!slotNumbersInput.trim()) {
      setError('Please enter at least one slot number.');
      setLoading(false);
      return;
    }

    try {
      // Split the input string by comma, trim whitespace, and map to objects
      const slotNumbersArray = slotNumbersInput.split(',')
                                            .map(s => s.trim())
                                            .filter(s => s !== '') // Remove empty strings
                                            .map(slotNo => ({ slotNo: slotNo.toUpperCase() })); // Convert to uppercase for consistency

      if (slotNumbersArray.length === 0) {
        setError('No valid slot numbers found after processing input.');
        setLoading(false);
        return;
      }

      const response = await createParkingSlots(slotNumbersArray);
      setMessage(`Successfully created ${response.data.length} parking slots!`);
      setSlotNumbersInput(''); // Clear the input
    } catch (err) {
      console.error('Error creating parking slots:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.msg || 'Failed to create parking slots. Please check input and server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-slots-container">
      <h3>Configure Parking Slots</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="slotNumbers">Enter Slot Numbers (comma-separated):</label>
          <input
            id="slotNumbers"
            type="text"
            value={slotNumbersInput}
            onChange={(e) => setSlotNumbersInput(e.target.value)}
            placeholder="e.g., A1, A2, B1, C5"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Slots'}
        </button>
        {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>
      <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#555' }}>
        * Only create slots once or when you need to add more. Existing slots with the same number will be ignored by the backend.
      </p>
    </div>
  );
}

export default CreateSlotsForm;