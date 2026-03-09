import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import MembershipCard from '../components/MembershipCard';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [rsvps, setRsvps] = useState<Event[]>([]);

  useEffect(() => {
    if (user) {
      fetch('/api/users/me/rsvps')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setRsvps(data);
          } else {
            setRsvps([]);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const handleCancelRSVP = async (eventId: number) => {
    if (!confirm('Are you sure you want to cancel your registration?')) return;
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, { method: 'DELETE' });
      if (res.ok) {
        setRsvps(rsvps.filter(e => e.id !== eventId));
      } else {
        alert('Failed to cancel RSVP');
      }
    } catch (error) {
      alert('Error canceling RSVP');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/portal" />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-gray-50 min-h-screen py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column - Card & Profile */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Digital ID</h2>
              <MembershipCard />
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">Profile Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                  <p className="text-gray-900 font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                  <p className="text-gray-900 font-medium">{user.email}</p>
                </div>
                {user.nik && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">NIK / ID</p>
                    <p className="text-gray-900 font-medium">{user.nik}</p>
                  </div>
                )}
                {user.location && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                    <p className="text-gray-900 font-medium">{user.location}</p>
                  </div>
                )}
                {user.interests && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Interests</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.interests.split(',').map((interest, i) => (
                        <span key={i} className="px-3 py-1 bg-red-50 text-[#BC002D] text-xs font-bold rounded-full">
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Activity & RSVPs */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif font-bold text-gray-900">My Registered Events</h3>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-bold">
                  {rsvps.length} Events
                </span>
              </div>

              {rsvps.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500 mb-4">You haven't registered for any events yet.</p>
                  <a href="/events" className="text-[#BC002D] font-medium hover:underline">
                    Browse Upcoming Events
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {rsvps.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col sm:flex-row gap-6 p-6 rounded-xl border border-gray-100 hover:border-[#BC002D]/30 hover:shadow-md transition-all group"
                    >
                      <div className="w-20 h-20 bg-red-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-[#BC002D]">
                        <span className="text-2xl font-bold leading-none">{new Date(event.date).getDate()}</span>
                        <span className="text-xs font-bold uppercase tracking-wider">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div className="flex-grow flex flex-col justify-center">
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-[#BC002D] transition-colors">
                          {event.title}
                        </h4>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center sm:justify-end gap-3">
                        <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-bold">
                          Confirmed
                        </span>
                        <button 
                          onClick={() => handleCancelRSVP(event.id)}
                          className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-sm font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
