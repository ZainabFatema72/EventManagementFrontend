import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import API from '../api/api';

const Navbar = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // LocalStorage se user data fetch kar rahe hain
  const user = JSON.parse(localStorage.getItem('user'));

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem('user'); 
    alert("Logged out successfully!");
    navigate('/login'); 
    window.location.reload(); 
  };

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { data } = await API.get('/notifications');
        const unread = data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Count error:", err);
      }
    };

    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <nav className="flex justify-between items-center p-6 bg-white shadow-sm border-b border-gray-100">
      {/* Logo */}
      <div className="text-2xl font-extrabold text-orange-600 tracking-tight">
        <Link to="/">Evently</Link>
      </div>
      
      <div className="flex gap-8 items-center">
        {/* Sabhi Users ke liye Links */}
        <Link className="font-medium hover:text-orange-600 transition-colors" to="/">Home</Link>
        <Link className="font-medium hover:text-orange-600 transition-colors" to="/my-bookings">My Bookings</Link>
        
        {/* ✅ CONDITION: Agar user Admin hai, toh Dashboard dikhao */}
        {user?.role === 'admin' && (
          <Link 
            to="/admin-dashboard" 
            className="bg-orange-100 text-orange-700 px-4 py-2 rounded-2xl font-bold hover:bg-orange-600 hover:text-white transition-all shadow-sm"
          >
            ⚙️ Admin Panel
          </Link>
        )}

        {/* Notifications Icon with Badge */}
        <Link title="Notifications" to="/notifications" className="relative font-medium hover:text-orange-600 transition-colors">
          Notifications
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">
              {unreadCount}
            </span>
          )}
        </Link>
        
        {/* User Info & Logout */}
        <div className="flex items-center gap-4 ml-4 border-l pl-6 border-gray-200">
          <span className="text-gray-600 text-sm italic">
            Hi, <span className="font-bold text-gray-800 not-italic">{user?.name || 'User'}</span>
          </span>
          
          <button 
            onClick={handleLogout} 
            className="text-red-500 font-bold px-4 py-2 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;