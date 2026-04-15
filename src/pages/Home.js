import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();

  // Categories list - Aap apne database ke hisaab se change kar sakte hain
  const categories = ["All", "Music", "Comedy", "Workshop", "Sports", "Conference"];

  const fetchEvents = async (query = "", category = "All") => {
    try {
      let url = '/events';
      const params = [];

      if (query) params.push(`query=${query}`);
      // Agar "All" nahi hai, toh category filter add karein
      if (category !== "All") params.push(`category=${category.toLowerCase()}`);

      if (params.length > 0) {
        url = `/events/search?${params.join('&')}`;
      }

      const { data } = await API.get(url);
      setEvents(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // Jab bhi search query ya category change ho, data fetch karein
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents(searchQuery, activeCategory);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory]);

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-black text-gray-800 mb-6 text-center">Find Your Next Event</h1>
        
        {/* --- Search Bar --- */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <input 
            type="text" 
            placeholder="Search by title or venue..." 
            className="w-full p-5 pl-8 rounded-[30px] border-none bg-white shadow-xl focus:ring-2 focus:ring-orange-500 text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* --- Category Tabs --- */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-bold transition-all border ${
                activeCategory === cat 
                ? "bg-orange-500 text-white border-orange-500 shadow-lg scale-105" 
                : "bg-white text-gray-500 border-gray-200 hover:border-orange-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* --- Events Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event._id} className="bg-white p-6 rounded-[35px] shadow-md border border-gray-100 hover:shadow-2xl transition-all">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">{event.title}</h2>
                <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  {event.category?.name || "Event"}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
                📍 {event.venue || event.location}
              </p>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <span className="text-2xl font-black text-gray-900">₹{event.price}</span>
                <button 
                  onClick={() => navigate(`/event/${event._id}`)}
                  className="bg-orange-500 text-white px-6 py-2 rounded-2xl font-bold hover:bg-orange-600 shadow-lg"
                >
                  Details
                </button>
              </div>
            </div>
          ))
        ) : (
          /* --- Empty State --- */
          <div className="col-span-full text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700">Koi event nahi mila!</h3>
            <p className="text-gray-400 mt-2">Try changing the category or search term.</p>
            <button 
              onClick={() => {setSearchQuery(""); setActiveCategory("All")}}
              className="mt-6 text-orange-500 font-bold underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
