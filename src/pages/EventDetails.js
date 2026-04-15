import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false); // ✅ Success Modal state

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await API.get(`/events/${id}`);
        setEvent(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(true);
      }
    };
    fetchDetails();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      alert("Please Login to book tickets!");
      navigate('/login');
      return;
    }

    try {
      const bookingPayload = {
        userId: String(user._id || user.id),
        eventId: String(id),
        seatsBooked: ticketCount,
        category: event?.category || "General"
      };

      const response = await API.post('/bookings', bookingPayload);
      
      if (response.status === 201 || response.status === 200) {
        // ✅ Alert ki jagah Modal dikhayenge
        setShowSuccess(true);
      }
    } catch (err) {
      console.error("Booking error:", err.response?.data);
      alert(err.response?.data?.message || "Booking failed!");
    }
  };

  if (error) return (
    <div className="text-center p-10 flex flex-col items-center gap-4">
      <span className="text-6xl">😕</span>
      <h2 className="text-2xl font-bold text-gray-800">Event not found!</h2>
      <button onClick={() => navigate('/')} className="text-orange-500 font-bold underline">Back to Home</button>
    </div>
  );

  if (!event) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 bg-gray-50 min-h-screen">

      <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border border-gray-100 relative">
        {/* Banner Placeholder (Optional) */}
        <div className="h-4 bg-gradient-to-r from-orange-400 to-red-500"></div>

        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <button 
        onClick={() => navigate(-1)} 
        className="mb-8 flex items-center gap-2 text-gray-500 hover:text-orange-500 font-bold transition-all"
      >
        <span className="text-xl">←</span> Back
      </button>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-800 leading-tight">
                {event.title}
              </h1>
              <p className="text-orange-500 text-xl font-bold mt-2 flex items-center gap-2">
                <span>📍</span> {event.venue}
              </p>
            </div>
            
            <div className="bg-orange-50 text-orange-600 px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-widest">
              {event.category || "General"}
            </div>
          </div>
          
          <div className="my-10 border-y border-gray-100 py-8">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">About Event</h3>
            <p className="text-gray-600 text-lg leading-relaxed italic">
              {event.description || "Join us for an amazing experience! Limited seats available."}
            </p>
            
            <div className="mt-8 flex flex-wrap gap-8 text-sm">
               <div className="flex flex-col">
                 <span className="text-gray-400 font-bold uppercase text-[10px]">Date</span>
                 <span className="font-black text-gray-800">📅 {event.date}</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-gray-400 font-bold uppercase text-[10px]">Availability</span>
                 <span className={`font-black ${event.seatsAvailable < 10 ? 'text-red-500' : 'text-green-600'}`}>
                   🎟️ {event.seatsAvailable} Left
                 </span>
               </div>
            </div>
          </div>

          {/* Ticket Selection Section */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-gray-50 p-8 rounded-[35px] border border-gray-100">
            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <label className="font-black text-gray-800 text-sm uppercase tracking-widest">Select Quantity</label>
              <div className="flex items-center gap-6">
                <div className="flex items-center border-2 border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                    className="px-6 py-3 hover:bg-orange-50 hover:text-orange-500 font-black transition-colors"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={ticketCount} 
                    readOnly
                    className="w-12 text-center font-black text-xl text-gray-800 focus:outline-none bg-transparent"
                  />
                  <button 
                    onClick={() => setTicketCount(Math.min(event.seatsAvailable, ticketCount + 1))}
                    className="px-6 py-3 hover:bg-orange-50 hover:text-orange-500 font-black border-l transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Total Price</span>
                  <span className="text-xl font-black text-gray-900">₹{event.price * ticketCount}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 w-full lg:w-auto">
              <div className="text-center md:text-right">
                <p className="text-4xl font-black text-gray-900">₹{event.price}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase">Per Ticket</p>
              </div>
              <button 
                onClick={handleBooking}
                disabled={event.seatsAvailable <= 0}
                className={`w-full md:w-auto px-12 py-5 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 ${
                  event.seatsAvailable <= 0 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600 shadow-orange-100'
                }`}
              >
                {event.seatsAvailable <= 0 ? 'Sold Out' : `Book ${ticketCount > 1 ? `${ticketCount} Tickets` : 'Now'}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Success Modal - Professional UI */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-10 rounded-[40px] max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
              ✓
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-2">Success! 🎉</h2>
            <p className="text-gray-500 mb-8 font-medium">
              Aapne successfully **{ticketCount} ticket(s)** book kar li hain.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate('/my-bookings')}
                className="bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
              >
                Go to My Bookings
              </button>
              <button 
                onClick={() => setShowSuccess(false)}
                className="text-gray-400 font-bold hover:text-gray-600 transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;