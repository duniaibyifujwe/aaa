import React, { useState, useEffect } from 'react';
import { recordEntry } from '../api/carApi'; // Keep recordEntry if you still want to park car from here
import { getCars, registerCar, updateCar, deleteCar } from '../api/carApi'; // Import new CRUD functions
import NavBar from '../components/NavBar';
// import '../App.css'; // Ensure you have basic styles in App.css

function EntryForm() {
  const [plateNo, setPlateNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [slotNo, setSlotNo] = useState(''); // For parking functionality
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cars, setCars] = useState([]); // State to store list of cars
  const [editingCarId, setEditingCarId] = useState(null); // State to track which car is being edited

  // --- Fetch Cars on Component Mount ---
  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await getCars();
      setCars(response.data);
    } catch (err) {
      console.error('Error fetching cars:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.msg || 'Failed to fetch cars.');
    }
  };

  // --- Handle Form Submission (Create or Update Car) ---
  const handleCarSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const carData = { plateNo, driverName, phoneNo };

    try {
      if (editingCarId) {
        // UPDATE existing car
        const response = await updateCar(editingCarId, { driverName, phoneNo }); // PlateNo usually not editable
        setMessage(`Car ${response.data.car.plateNo} updated successfully!`);
        setEditingCarId(null); // Exit editing mode
      } else {
        // CREATE new car
        const response = await registerCar(carData);
        setMessage(`Car ${response.data.car.plateNo} registered successfully!`);
      }
      clearForm();
      fetchCars(); // Refresh the list of cars
    } catch (err) {
      console.error('Error saving car:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.msg || 'Failed to save car. Please try again.');
    }
  };

  // --- Handle Parking a Car (Original functionality) ---
  const handleParkCar = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // If a car is selected for editing, we should register a *new* parking record
    // not try to update an existing car's details while parking.
    // So, ensure we are not in editing mode when parking.
    if (editingCarId) {
      setError('Cannot park a car while in edit mode. Please cancel edit or create new entry.');
      return;
    }

    try {
      const response = await recordEntry({ plateNo, driverName, phoneNo, slotNo });
      setMessage(`Car ${response.data.parkingRecord.car.plateNo} parked successfully in slot ${response.data.parkingRecord.slot.slotNo}!`);
      clearForm();
      // No need to fetch cars again for parking, but good to refresh Dashboard.
    } catch (err) {
      console.error('Error recording entry:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.msg || 'Failed to record entry. Please try again.');
    }
  };


  // --- Handle Edit Button Click ---
  const handleEdit = (car) => {
    setEditingCarId(car._id);
    setPlateNo(car.plateNo);
    setDriverName(car.driverName);
    setPhoneNo(car.phoneNo);
    setMessage('');
    setError('');
  };

  // --- Handle Delete Button Click ---
  const handleDelete = async (id, plate) => {
    if (window.confirm(`Are you sure you want to delete car ${plate}? This cannot be undone.`)) {
      setMessage('');
      setError('');
      try {
        const response = await deleteCar(id);
        setMessage(response.data.msg);
        fetchCars(); // Refresh the list
      } catch (err) {
        console.error('Error deleting car:', err.response ? err.response.data : err.message);
        setError(err.response?.data?.msg || 'Failed to delete car. It might be currently parked or has associated records.');
      }
    }
  };

  // --- Clear Form Fields ---
  const clearForm = () => {
    setPlateNo('');
    setDriverName('');
    setPhoneNo('');
    setSlotNo('');
    setEditingCarId(null); // Exit editing mode
  };

  return (
    <>
      <NavBar />
      <div className="car-management-container">
        <h2>{editingCarId ? 'Edit Car Details' : 'Register New Car'}</h2>
        <form onSubmit={handleCarSubmit} className="car-form">
          <div>
            <label htmlFor="plateNo">Plate No:</label>
            <input
              id="plateNo"
              type="text"
              value={plateNo}
              onChange={(e) => setPlateNo(e.target.value.toUpperCase())} // Ensure uppercase
              required
              disabled={!!editingCarId} // Disable plateNo input when editing
            />
          </div>
          <div>
            <label htmlFor="driverName">Driver Name:</label>
            <input
              id="driverName"
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNo">Phone No:</label>
            <input
              id="phoneNo"
              type="text"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              required
            />
          </div>
          <button type="submit">
            {editingCarId ? 'Update Car' : 'Register Car'}
          </button>
          {editingCarId && (
            <button type="button" onClick={clearForm} className="cancel-button">
              Cancel Edit
            </button>
          )}
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>

        {/* --- Optional: Park Car functionality (can be removed if not needed here) --- */}
        <hr className="form-separator" />
        <h2>Park Car</h2>
        <form onSubmit={handleParkCar} className="park-car-form">
          <p>Enter details below to park a car. If the car is new, register it first above.</p>
          <div>
            <label htmlFor="parkPlateNo">Plate No (existing car):</label>
            <input
              id="parkPlateNo"
              type="text"
              value={plateNo} // Reusing plateNo state for simplicity
              onChange={(e) => setPlateNo(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div>
            <label htmlFor="parkSlotNo">Desired Slot (Optional):</label>
            <input
              id="parkSlotNo"
              type="text"
              value={slotNo}
              onChange={(e) => setSlotNo(e.target.value.toUpperCase())}
            />
          </div>
          <button type="submit" className="park-button">Park Car</button>
        </form>
        {/* --- End Optional Parking Functionality --- */}


        <hr className="section-separator" />

        <h2>Registered Cars</h2>
        {cars.length === 0 ? (
          <p>No cars registered yet.</p>
        ) : (
          <table className="cars-table">
            <thead>
              <tr>
                <th>Plate No</th>
                <th>Driver Name</th>
                <th>Phone No</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car._id}>
                  <td>{car.plateNo}</td>
                  <td>{car.driverName}</td>
                  <td>{car.phoneNo}</td>
                  <td className="actions">
                    <button onClick={() => handleEdit(car)} className="edit-button">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(car._id, car.plateNo)} className="delete-button">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default EntryForm;