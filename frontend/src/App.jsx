import React from 'react';
// import './App.css'; // You can customize this
// import Dashboard from './pages/Dashboard';
// import EntryForm from './pages/EntryForm';
// import ExitForm from './pages/ExitForm';
// import PaymentForm from './pages/PaymentForm';
// import HistoryPage from './pages/HistoryPage';
// import CreateSlotsForm from './pages/CreateSlotsForm'; // <--- THIS IS THE MISSING IMPORT!
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import EntryForm from './pages/EntryForm';
import ExitForm from './pages/ExitForm';
import PaymentForm from './pages/PaymentForm';
import HistoryPage from './pages/HistoryPage';
import CreateSlotsForm from './pages/CreateSlotsForm';

// For routing, you'd typically install `react-router-dom`
// npm install react-router-dom
// import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Parking Management System</h1>
      </header>
      <main>
      
          {/* With react-router-dom, this would be: */}
          <BrowserRouter>
        <nav>
          {/* You'd use <Link> components here with react-router-dom */}
          <Link to="/"> Dashboard </Link> 
          <Link to="entry"> Park Car </Link> 
          <Link to="exit"> Exit Car </Link> 
          <Link to="payment"> Process Payment </Link> 
          <Link to="history"> Parking History </Link> 
          <Link to="create-slots"> Create Slots </Link> 
        </nav>
          
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/entry" element={<EntryForm />} />
            <Route path="/exit" element={<ExitForm />} />
            <Route path="/payment" element={<PaymentForm />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/create-slots" element={<CreateSlotsForm />} /> {/* <-- New Route */}
          </Routes>
          </BrowserRouter>
        
        {/* <section id="dashboard">
          <h2>Parking Dashboard</h2>
          <Dashboard />
        </section>
        <section id="entry">
          <h2>Park New Car</h2>
          <EntryForm />
        </section>
        <section id="exit">
          <h2>Exit Car</h2>
          <ExitForm />
        </section>
         <section id="payment">
          <h2>Process Payment</h2>
          <PaymentForm />
        </section> */}
        {/* <section id="history">
          <h2>Parking History</h2>
          <HistoryPage />
        </section> */}
        {/* <section id="create-slots"> 
          <h2>Create Parking Slots</h2>
          <CreateSlotsForm />
        </section> */}
      </main>
    </div>
  );
}

export default App;