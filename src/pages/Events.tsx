import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [userRsvps, setUserRsvps] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    if (user) {
      fetch('/api/users/me/rsvps')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setUserRsvps(data.map((e: Event) => e.id));
          } else {
            setUserRsvps([]);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const handleRSVP = async (eventId: number) => {
    if (!user) {
      alert('Please log in to RSVP.');
      return;
    }
    
    const isRsvped = userRsvps.includes(eventId);
    
    try {
      if (isRsvped) {
        if (!confirm('Are you sure you want to cancel your registration?')) return;
        const res = await fetch(`/api/events/${eventId}/rsvp`, { method: 'DELETE' });
        if (res.ok) {
          setUserRsvps(userRsvps.filter(id => id !== eventId));
        } else {
          alert('Failed to cancel RSVP');
        }
      } else {
        const res = await fetch(`/api/events/${eventId}/rsvp`, { method: 'POST' });
        if (res.ok) {
          setUserRsvps([...userRsvps, eventId]);
        } else {
          const data = await res.json();
          alert(data.error || 'Failed to RSVP');
        }
      }
    } catch (error) {
      alert('An error occurred.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white py-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-serif font-bold text-gray-900 mb-6">Events Gallery</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join us in our upcoming cultural celebrations, business networking sessions, 
            and community outreach programs.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BC002D]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 group flex flex-col h-full"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={event.image_url || `https://picsum.photos/seed/event${event.id}/800/600`}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-center shadow-md">
                    <div className="text-[#BC002D] font-bold text-xl leading-none">
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="text-gray-600 text-xs font-medium uppercase tracking-wider">
                      {new Date(event.date).toLocaleString('default', { month: 'short' })}
                    </div>
                  </div>
                </div>
                <div className="p-8 flex-grow flex flex-col">
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4 leading-snug">
                    {event.title}
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar className="w-5 h-5 text-[#BC002D]" />
                      <span className="text-sm font-medium">
                        {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="w-5 h-5 text-[#BC002D]" />
                      <span className="text-sm font-medium">{event.location}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">
                    {event.description}
                  </p>
                  <Link 
                    to={`/events/${event.id}`}
                    className="inline-flex items-center text-[#BC002D] font-bold hover:underline mb-6"
                  >
                    View Details <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                  <button
                    onClick={() => handleRSVP(event.id)}
                    className={`w-full py-4 rounded-xl font-bold border transition-all duration-300 flex items-center justify-center gap-2 mt-auto ${
                      userRsvps.includes(event.id)
                        ? 'bg-green-50 text-green-700 border-green-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                        : 'bg-gray-50 text-[#BC002D] border-red-100 hover:bg-[#BC002D] hover:text-white group-hover:shadow-lg group-hover:shadow-[#BC002D]/20'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    {userRsvps.includes(event.id) ? 'Registered (Click to Cancel)' : 'RSVP Now'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
