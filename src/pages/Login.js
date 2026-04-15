import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
        {error && <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-center">{error}</p>}
        <input type="email" placeholder="Email" className="w-full p-3 mb-4 border rounded-xl" 
          onChange={(e) => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="Password" className="w-full p-3 mb-6 border rounded-xl" 
          onChange={(e) => setFormData({...formData, password: e.target.value})} required />
        <button className="w-full bg-orange-500 text-white p-3 rounded-xl font-bold hover:bg-orange-600">Login</button>
        <p className="mt-4 text-center">New here? <Link to="/register" className="text-orange-500">Register</Link></p>
      </form>
    </div>
  );
};

export default Login;