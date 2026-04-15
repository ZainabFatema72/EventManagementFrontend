import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    price: '', 
    venue: '', 
    date: '', 
    seatsAvailable: '' 
  });

  const user = JSON.parse(localStorage.getItem('user'));
  const config = { headers: { Authorization: `Bearer ${user?.token}` } };

  useEffect(() => { 
    fetchEvents(); 
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await API.get('/events');
      setEvents(data);
    } catch (err) { 
      console.error("Fetch error", err); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.patch(`/events/${currentEventId}`, newEvent, config);
        alert("Event Updated! ✨");
      } else {
        await API.post('/events', newEvent, config);
        alert("Event Added! 🎉");
      }
      resetForm();
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const handleEdit = (ev) => {
    setIsEditing(true);
    setCurrentEventId(ev._id);
    // Date formatting to YYYY-MM-DD for input field
    const formattedDate = ev.date ? new Date(ev.date).toISOString().split('T')[0] : '';
    setNewEvent({ 
      title: ev.title, 
      price: ev.price, 
      venue: ev.venue, 
      date: formattedDate, 
      seatsAvailable: ev.seatsAvailable 
    });
  };

  const resetForm = () => {
    setNewEvent({ title: '', price: '', venue: '', date: '', seatsAvailable: '' });
    setIsEditing(false);
    setCurrentEventId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Pakka delete karna hai?")) {
      try {
        await API.delete(`/events/${id}`, config);
        fetchEvents();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  // --- Analytics Data Logic ---
  const chartData = events.map(ev => ({
    name: ev.title.length > 10 ? ev.title.substring(0, 10) + '...' : ev.title,
    seats: ev.seatsAvailable
  }));

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-gray-800">Admin Dashboard</h1>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center min-w-[120px]">
          <p className="text-gray-400 text-xs uppercase tracking-wider">Total Events</p>
          <p className="text-2xl font-bold text-orange-600">{events.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        
        {/* LEFT COLUMN: Form & Chart */}
        <div className="space-y-6">
          
          {/* Form Block */}
          <div className="bg-white p-8 rounded-[35px] shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-700">
              {isEditing ? "Update Event" : "Add New Event"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                placeholder="Event Title" 
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-200 outline-none" 
                value={newEvent.title} 
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} 
                required 
              />
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Price (₹)" 
                  className="w-1/2 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-200 outline-none" 
                  value={newEvent.price} 
                  onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })} 
                  required 
                />
                <input 
                  type="number" 
                  placeholder="Seats" 
                  className="w-1/2 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-200 outline-none" 
                  value={newEvent.seatsAvailable} 
                  onChange={(e) => setNewEvent({ ...newEvent, seatsAvailable: e.target.value })} 
                  required 
                />
              </div>
              <input 
                type="text" 
                placeholder="Venue" 
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-200 outline-none" 
                value={newEvent.venue} 
                onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })} 
                required 
              />
              <input 
                type="date" 
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-200 outline-none" 
                value={newEvent.date} 
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} 
                required 
              />

              <button 
                type="submit"
                className={`w-full text-white py-4 rounded-2xl font-bold shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 ${
                  isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {isEditing ? "Save Changes" : "Create Event"}
              </button>
              
              {isEditing && (
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="w-full text-gray-400 mt-2 text-sm hover:underline"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          {/* Analytics Chart Block */}
          <div className="bg-white p-6 rounded-[35px] shadow-lg border border-gray-100 h-80">
            <h3 className="font-bold text-sm mb-4 text-gray-500 uppercase">Availability Overview</h3>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <Bar dataKey="seats" fill="#F97316" radius={[6, 6, 0, 0]} />
                  <XAxis dataKey="name" hide />
                  <Tooltip 
                    cursor={{fill: '#FFF7ED'}}
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2 italic">Seats remaining per event</p>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Events List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-700">Live Events</h2>
            <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold">Online</span>
          </div>
          
          <div className="max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {events.length === 0 ? (
              <div className="bg-white p-20 rounded-[35px] text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 italic text-lg">Koi events nahi mile. Add your first event! 🚀</p>
              </div>
            ) : (
              events.map(ev => (
                <div key={ev._id} className="bg-white p-6 rounded-[30px] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-100 relative overflow-hidden transition-all hover:shadow-md mb-4 group">
                  
                  {ev.seatsAvailable === 0 && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl shadow-md uppercase tracking-widest">
                      Sold Out
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className={`font-bold text-xl ${ev.seatsAvailable === 0 ? 'text-gray-300 line-through' : 'text-gray-800'}`}>
                      {ev.title}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <p className="text-gray-400 text-sm flex items-center">📍 {ev.venue}</p>
                      <p className="text-gray-500 text-sm font-semibold">₹{ev.price}</p>
                      <p className="text-gray-400 text-sm">📅 {new Date(ev.date).toLocaleDateString('en-IN')}</p>
                    </div>
                    
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full mt-3 inline-block tracking-tighter ${
                      ev.seatsAvailable === 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
                    }`}>
                      {ev.seatsAvailable === 0 ? "NO SEATS LEFT" : `${ev.seatsAvailable} SEATS REMAINING`}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                    <button 
                      onClick={() => handleEdit(ev)} 
                      className="flex-1 sm:flex-none text-blue-500 font-bold px-5 py-2 hover:bg-blue-50 rounded-xl transition-colors border border-blue-100"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(ev._id)} 
                      className="flex-1 sm:flex-none text-red-500 font-bold px-5 py-2 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminDashboard;