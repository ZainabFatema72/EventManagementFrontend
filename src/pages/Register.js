import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', formData);
      alert("Account Created!");
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border">
        <h2 className="text-3xl font-bold text-center mb-6 text-orange-600">Register</h2>
        <input type="text" placeholder="Full Name" className="w-full p-3 mb-4 border rounded-xl" 
          onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        <input type="email" placeholder="Email" className="w-full p-3 mb-4 border rounded-xl" 
          onChange={(e) => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="Password" className="w-full p-3 mb-6 border rounded-xl" 
          onChange={(e) => setFormData({...formData, password: e.target.value})} required />
        <button className="w-full bg-gray-800 text-white p-3 rounded-xl font-bold hover:bg-black">Create Account</button>
      </form>
    </div>
  );
};

export default Register;