import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRsvps, setUserRsvps] = useState<number[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(res => res.json())
      .then(data => {
        setEvent(data);
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
  }, [id, user]);

  const handleRSVP = async () => {
    if (!user) {
      alert('Please log in to RSVP.');
      return;
    }
    
    if (!event) return;
    
    const isRsvped = userRsvps.includes(event.id);
    
    try {
      if (isRsvped) {
        if (!confirm('Are you sure you want to cancel your registration?')) return;
        const res = await fetch(`/api/events/${event.id}/rsvp`, { method: 'DELETE' });
        if (res.ok) {
          setUserRsvps(userRsvps.filter(rsvpId => rsvpId !== event.id));
        } else {
          alert('Failed to cancel RSVP');
        }
      } else {
        const res = await fetch(`/api/events/${event.id}/rsvp`, { method: 'POST' });
        if (res.ok) {
          setUserRsvps([...userRsvps, event.id]);
        } else {
          const data = await res.json();
          alert(data.error || 'Failed to RSVP');
        }
      }
    } catch (error) {
      alert('An error occurred.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center">Event not found</div>;

  const isRsvped = userRsvps.includes(event.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 py-12"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/events" className="inline-flex items-center text-gray-600 hover:text-[#BC002D] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="h-64 sm:h-96 bg-gray-200 relative">
            {event.image_url ? (
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Calendar className="w-20 h-20 text-gray-400 opacity-50" />
              </div>
            )}
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg text-center">
              <span className="block text-2xl font-bold text-[#BC002D] leading-none">
                {new Date(event.date).getDate()}
              </span>
              <span className="block text-sm font-bold uppercase tracking-wider text-gray-900 mt-1">
                {new Date(event.date).toLocaleString('default', { month: 'short' })}
              </span>
            </div>
          </div>
          
          <div className="p-8 sm:p-12">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-6">{event.title}</h1>
            
            <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-gray-100">
              <div className="flex items-center text-gray-600">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#BC002D] mr-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Date & Time</p>
                  <p>{new Date(event.date).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#BC002D] mr-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Location</p>
                  <p>{event.location}</p>
                </div>
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-600 mb-12 whitespace-pre-line">
              {event.description}
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleRSVP}
                className={`px-8 py-4 rounded-xl font-bold border transition-all duration-300 flex items-center justify-center gap-2 ${
                  isRsvped
                    ? 'bg-green-50 text-green-700 border-green-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                    : 'bg-[#BC002D] text-white border-[#BC002D] hover:bg-[#9a0025] hover:border-[#9a0025] shadow-lg shadow-[#BC002D]/20'
                }`}
              >
                <Users className="w-5 h-5" />
                {isRsvped ? 'Registered (Click to Cancel)' : 'RSVP Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
