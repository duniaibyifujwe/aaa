import React, { useEffect, useState } from 'react';
import { getParkingHistory } from '../api/parkingApi';
import NavBar from '../components/NavBar';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPlateNo, setFilterPlateNo] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getParkingHistory(filterPlateNo);
      setHistory(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching parking history:', err);
      setError(err.response?.data?.msg || 'Failed to load parking history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterPlateNo]); // Refetch when filterPlateNo changes

  const handleFilterChange = (e) => {
    setFilterPlateNo(e.target.value);
  };

  if (loading) return <p>Loading parking history...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
    <NavBar/>

      <div>
        {/* <label>Filter by Plate No:</label> */}
        {/* <input
          type="text"
          value={filterPlateNo}
          onChange={handleFilterChange}
          placeholder="Enter plate number..."
        /> */}
      </div>
      {history.length === 0 ? (
        <p>No parking records found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Plate No</th>
              <th>Driver Name</th>
              <th>Slot No</th>
              <th>Entry Time</th>
              <th>Exit Time</th>
              <th>Duration (min)</th>
              <th>Fee ($)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map(record => (
              <tr key={record._id}>
                <td>{record.car?.plateNo || 'N/A'}</td>
                <td>{record.car?.driverName || 'N/A'}</td>
                <td>{record.slot?.slotNo || 'N/A'}</td>
                <td>{new Date(record.entryTime).toLocaleString()}</td>
                <td>{record.exitTime ? new Date(record.exitTime).toLocaleString() : 'N/A'}</td>
                <td>{record.duration || 'N/A'}</td>
                <td>{record.parkingFee ? record.parkingFee.toFixed(2) : 'N/A'}</td>
                <td>{record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default HistoryPage;