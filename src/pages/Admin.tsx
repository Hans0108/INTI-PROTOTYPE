import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Users, Calendar, FileText, Settings, Plus, Trash2 } from 'lucide-react';

export default function Admin() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ users: 0, events: 0, posts: 0 });
  const [usersList, setUsersList] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [postsList, setPostsList] = useState<any[]>([]);

  // Form states
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', location: '', image_url: '' });
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Culture', image_url: '' });

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersRes, eventsRes, postsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/events'),
        fetch('/api/posts')
      ]);

      if (usersRes.ok) {
        const users = await usersRes.json();
        setUsersList(users);
        setStats(s => ({ ...s, users: users.length }));
      }
      if (eventsRes.ok) {
        const events = await eventsRes.json();
        setEventsList(events);
        setStats(s => ({ ...s, events: events.length }));
      }
      if (postsRes.ok) {
        const posts = await postsRes.json();
        setPostsList(posts);
        setStats(s => ({ ...s, posts: posts.length }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      if (res.ok) {
        alert('Event created successfully');
        setNewEvent({ title: '', description: '', date: '', location: '', image_url: '' });
        fetchData();
      } else {
        alert('Failed to create event');
      }
    } catch (error) {
      alert('Error creating event');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      alert('Error deleting event');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      if (res.ok) {
        alert('Post created successfully');
        setNewPost({ title: '', content: '', category: 'Culture', image_url: '' });
        fetchData();
      } else {
        alert('Failed to create post');
      }
    } catch (error) {
      alert('Error creating post');
    }
  };

  const handleRoleChange = async (id: number, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update role');
      }
    } catch (error) {
      alert('Error updating role');
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      alert('Error deleting post');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete their posts and RSVPs.')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      alert('Error deleting user');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-serif font-bold text-gray-900">Command Center</h2>
          <p className="text-sm text-gray-500 capitalize">{user.role}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'overview', label: 'Global Overview', icon: Settings },
            { id: 'events', label: 'Event Manager', icon: Calendar },
            { id: 'cms', label: 'Content CMS', icon: FileText },
            { id: 'users', label: 'User Management', icon: Users, superadminOnly: true }
          ].map((item) => {
            if (item.superadminOnly && user.role !== 'superadmin') return null;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-red-50 text-[#BC002D]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Dashboard Overview</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 font-medium">Total Members</h3>
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-gray-900">{stats.users}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 font-medium">Active Events</h3>
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-gray-900">{stats.events}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 font-medium">Published Posts</h3>
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-gray-900">{stats.posts}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold text-gray-900">Event Manager</h1>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Event</h3>
                <form onSubmit={handleCreateEvent} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                      <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#BC002D]" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                      <input type="datetime-local" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#BC002D]" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#BC002D]" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
                      <input type="url" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#BC002D]" value={newEvent.image_url} onChange={e => setNewEvent({...newEvent, image_url: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea required rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#BC002D]" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}></textarea>
                  </div>
                  <button type="submit" className="px-6 py-3 bg-[#BC002D] text-white rounded-lg font-medium hover:bg-[#9a0025] flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Create Event
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 font-medium text-gray-500">Event</th>
                      <th className="px-6 py-4 font-medium text-gray-500">Date</th>
                      <th className="px-6 py-4 font-medium text-gray-500">Location</th>
                      <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {eventsList.map(event => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{event.title}</td>
                        <td className="px-6 py-4 text-gray-600">{new Date(event.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-gray-600">{event.location}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteEvent(event.id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'cms' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-serif font-bold text-gray-900">Content Management System</h1>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Draft New Post</h3>
                <form onSubmit={handleCreatePost} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#BC002D]" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#BC002D]" value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})}>
                        <option>Culture</option>
                        <option>Business</option>
                        <option>Events</option>
                        <option>Community</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
                      <input type="url" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#BC002D]" value={newPost.image_url} onChange={e => setNewPost({...newPost, image_url: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea required rows={8} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#BC002D]" value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})}></textarea>
                  </div>
                  <button type="submit" className="px-6 py-3 bg-[#BC002D] text-white rounded-lg font-medium hover:bg-[#9a0025] flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Publish Post
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 font-medium text-gray-500">Title</th>
                      <th className="px-6 py-4 font-medium text-gray-500">Category</th>
                      <th className="px-6 py-4 font-medium text-gray-500">Author</th>
                      <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {postsList.map(post => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{post.title}</td>
                        <td className="px-6 py-4 text-gray-600">{post.category}</td>
                        <td className="px-6 py-4 text-gray-600">{post.author_name}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && user.role === 'superadmin' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-serif font-bold text-gray-900">User Management</h1>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 font-medium text-gray-500">Name</th>
                      <th className="px-6 py-4 font-medium text-gray-500">Email</th>
                      <th className="px-6 py-4 font-medium text-gray-500">Role</th>
                      <th className="px-6 py-4 font-medium text-gray-500">Tier</th>
                      <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usersList.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                        <td className="px-6 py-4 text-gray-600">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            u.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            u.tier === 'VIP' ? 'bg-yellow-100 text-yellow-800' :
                            u.tier === 'Premium' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {u.tier || 'Standard'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          <select 
                            className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-[#BC002D]"
                            value={u.tier || 'Standard'}
                            onChange={async (e) => {
                              try {
                                const res = await fetch(`/api/admin/users/${u.id}/tier`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ tier: e.target.value })
                                });
                                if (res.ok) fetchData();
                              } catch (err) {
                                alert('Error updating tier');
                              }
                            }}
                            disabled={u.id === user.id}
                          >
                            <option value="Standard">Standard</option>
                            <option value="Premium">Premium</option>
                            <option value="VIP">VIP</option>
                          </select>
                          <select 
                            className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-[#BC002D]"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={u.id === user.id}
                          >
                            <option value="guest">Guest</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                          </select>
                          <button 
                            onClick={() => handleDeleteUser(u.id)} 
                            disabled={u.id === user.id}
                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
