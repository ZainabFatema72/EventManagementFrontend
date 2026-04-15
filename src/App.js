import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Notifications from './components/Notifications';
import AdminDashboard from './components/AdminDashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetails from './pages/EventDetails';
import MyBookings from './pages/MyBookings';

function App() {
  // ✅ Pehle local storage se user ko get karein warna 'user' undefined error aayega
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/event/:id" element={<EventDetails />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/notifications" element={<Notifications />} />
        
        {/* ✅ Admin Protected Route */}
<Route 
  path="/admin-dashboard" 
  element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
/>
        
      </Routes>

    </Router>
  );
}

export default App;