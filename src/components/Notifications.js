import React, { useEffect, useState, useCallback } from 'react';
import API from '../api/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

 const markAsRead = useCallback(async (ids) => {
  try {
    await Promise.all(ids.map(id => 
      // Backend ke route se match karne ke liye '/read' add kiya
      API.put(`/notifications/${id}/read`, { isRead: true })
    ));
    
    // Navbar ko signal bhejna
    window.dispatchEvent(new Event('notificationsRead'));
  } catch (err) {
    console.error("Error marking as read:", err);
  }
}, []);

  // 2. Fetch Notifications and Update Logic
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await API.get('/notifications');
        
        // Filter by user ID
        const myNotifs = data.filter(n => n.userId === user?._id || n.userId === user?.id);
        setNotifications(myNotifs);

        // Find unread ones to mark them as read
        const unreadIds = myNotifs.filter(n => !n.isRead).map(n => n._id);
        
        if (unreadIds.length > 0) {
          await markAsRead(unreadIds);
          
          // Instant UI Update: Taki yellow background turant hat jaye
          setNotifications(prev => 
            prev.map(n => ({ ...n, isRead: true }))
          );
        }
      } catch (err) {
        console.error("Notifications fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, user?.id, markAsRead]); 

  const handleDelete = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      
      // Count update karne ke liye deletion par bhi event bhej sakte hain
      window.dispatchEvent(new Event('notificationsRead'));
    } catch (err) {
      alert("Delete failed!");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-800">Notifications</h1>
      
      {notifications.length === 0 ? (
        <div className="text-center p-16 border-2 border-dashed rounded-[40px] border-gray-200">
          <p className="text-gray-400 text-lg">Koi nayi notification nahi hai.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div 
              key={n._id} 
              className={`p-6 rounded-3xl border transition-all duration-500 flex justify-between items-center group ${
                n.isRead ? 'bg-white border-gray-100' : 'bg-orange-50 border-orange-100 shadow-sm'
              }`}
            >
              <div className="flex-1">
                <p className={`text-gray-800 ${!n.isRead ? 'font-bold' : 'font-medium'}`}>
                  {n.message}
                </p>
                <span className="text-[10px] text-gray-400 font-semibold uppercase mt-2 block tracking-wider">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              
              <button 
                onClick={() => handleDelete(n._id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-2 ml-4 text-xl"
                title="Delete Notification"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;