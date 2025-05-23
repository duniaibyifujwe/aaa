import React, { useEffect, useState } from 'react';
import { getParkingSlots } from '../api/parkingApi';
import NavBar from '../components/NavBar';

function Dashboard() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await getParkingSlots();
      setSlots(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching parking slots:', err);
      setError('Failed to load parking slots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    // Optional: Polling for real-time updates (simpler to start)
    const interval = setInterval(fetchSlots, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  if (loading) return <p>Loading parking slots...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  // Simple visual representation
  return (
    <>
    <NavBar/>

    <div className="dashboard-container">
      <h3>Slot Overview:</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {slots.length === 0 ? (
            <p>No parking slots configured yet. Please configure slots via API.</p>
        ) : (
          slots.map(slot => (
            <div
              key={slot._id}
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                textAlign: 'center',
                backgroundColor: slot.slotStatus === 'available' ? '#e6ffe6' : '#ffe6e6',
                borderRadius: '5px'
              }}
              >
              <strong>{slot.slotNo}</strong>
              <p>{slot.slotStatus.toUpperCase()}</p>
            </div>
          ))
        )}
      </div>
    </div>
        </>
  );
}

export default Dashboard;