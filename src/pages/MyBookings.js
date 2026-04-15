import React, { useEffect, useState ,useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { jsPDF } from 'jspdf'; 

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

 const fetchBookings = useCallback(async () => {
  try {
    const { data } = await API.get('/bookings'); 
    const myData = data.filter(b => b.userId === user?._id || b.userId === user?.id);
    setBookings(myData);
  } catch (err) {
    console.error("Fetch error:", err);
  } finally {
    setLoading(false);
  }
}, [user?._id, user?.id]); // User ID change hone par hi function update hoga

  useEffect(() => {
  if (user) fetchBookings();
}, [fetchBookings, user]);

  // ✅ Professional PDF Download Function
  const downloadTicket = (item) => {
    const doc = new jsPDF();
    const eventName = item.eventId?.title || "Event";
    
    // Design Elements
    doc.setFillColor(255, 90, 31); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("EVENT TICKET", 105, 25, { align: "center" });

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(16);
    doc.text(`Event: ${eventName}`, 20, 60);
    doc.setFontSize(12);
    doc.text(`Venue: ${item.eventId?.venue || "N/A"}`, 20, 75);
    doc.text(`Date: ${new Date(item.bookedAt || item.createdAt).toLocaleDateString()}`, 20, 85);
    doc.text(`Tickets: ${item.seatsBooked || 1}`, 20, 95);
    doc.text(`Total Paid: Rs. ${(item.eventId?.price || 0) * (item.seatsBooked || 1)}`, 20, 105);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 120, 190, 120);
    doc.setFontSize(10);
    doc.text(`Booking ID: ${item._id}`, 20, 130);
    doc.text("Status: Confirmed", 20, 140);

    doc.save(`Ticket_${eventName}.pdf`);
  };

  const handleCancel = async (id) => {
    if (window.confirm("Kya aap ye booking cancel karna chahte hain?")) {
      try {
        await API.delete(`/bookings/${id}`);
        alert("Booking Cancelled!");
        fetchBookings(); 
      } catch (err) {
        alert("Cancellation failed!");
      }
    }
  };

  if (loading) return <div className="text-center p-10 font-bold text-orange-500">Loading your bookings...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 font-bold transition-all group"
        >
          <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
          Back to Events
        </button>
        <h1 className="text-3xl font-black text-gray-800">My Bookings ({bookings.length})</h1>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white p-16 rounded-[40px] text-center shadow-sm border border-gray-100">
          <div className="text-6xl mb-6">🎟️</div>
          <p className="text-gray-400 text-xl mb-8 font-medium">Aapne abhi tak koi event book nahi kiya hai.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black hover:bg-orange-600 shadow-xl shadow-orange-100 transition-all"
          >
            Explore Events Now
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((item) => (
            <div key={item._id} className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center hover:shadow-xl hover:scale-[1.01] transition-all">
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-black text-gray-800">
                  {item.eventId?.title || "Event Details Deleted"}
                </h3>
                
                <div className="flex flex-wrap gap-5 text-sm font-bold text-gray-400">
                  <span className="flex items-center gap-1">📍 {item.eventId?.venue || "Venue N/A"}</span>
                  <span className="flex items-center gap-1">📅 {new Date(item.bookedAt || item.createdAt).toLocaleDateString()}</span>
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] uppercase">
                    {item.seatsBooked || 1} Ticket(s)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-6 md:mt-0">
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-900">
                    ₹{(item.eventId?.price || 0) * (item.seatsBooked || 1)}
                  </p>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Paid Amount</p>
                </div>

                <div className="flex flex-col gap-2">
                  {/* ✅ Ticket Download Button */}
                  <button 
                    onClick={() => downloadTicket(item)}
                    className="bg-gray-900 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-orange-500 transition-all flex items-center gap-2"
                  >
                    <span>⬇️</span> Download
                  </button>
                  
                  <button 
                    onClick={() => handleCancel(item._id)}
                    className="text-red-500 text-[10px] font-black uppercase tracking-tighter hover:underline"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;   