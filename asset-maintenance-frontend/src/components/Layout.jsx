import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { 
  LayoutDashboard, 
  Wrench, 
  LogOut, 
  User as UserIcon, 
  Layers,
  Shield,
  Plus,
  X,
  Send,
  Bell,
  Check,
  CheckCheck,
  Image as ImageIcon
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notificationRef = useRef(null);

  // Modals & States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [assets, setAssets] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [assetId, setAssetId] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (showTaskModal) {
      fetchAssets();
    }
  }, [showTaskModal]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);

    // Close notifications popover on click outside
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data);
    } catch (err) {
      console.error('Failed to fetch assets', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleReportTask = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !assetId || !description) {
      setError('Please fill in all fields to report a task');
      return;
    }

    setSubmitting(true);
    try {
      const taskRes = await api.post('/tasks', {
        title,
        description,
        priority,
        assetId: parseInt(assetId, 10),
      });

      const newTaskId = taskRes.data.id;

      if (attachmentFile) {
        const formData = new FormData();
        formData.append('file', attachmentFile);
        formData.append('type', 'INITIAL_REPORT');
        await api.post(`/tasks/${newTaskId}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setTitle('');
      setDescription('');
      setPriority('LOW');
      setAssetId('');
      setAttachmentFile(null);
      setShowTaskModal(false);

      // Trigger immediate update on dashboards
      window.dispatchEvent(new CustomEvent('task-created'));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit maintenance task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex min-h-screen w-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-[280px] bg-white border-r border-slate-200/80 flex flex-col p-6 h-screen sticky top-0 shrink-0 z-50">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
            <Wrench className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">AM Automation</h2>
        </div>

        {/* User Card inside Sidebar */}
        <NavLink 
          to="/profile"
          className={({ isActive }) => 
            `flex items-center gap-3 p-4 border rounded-2xl mb-6 overflow-hidden transition-all duration-200 hover:bg-slate-50 cursor-pointer ${
              isActive 
                ? 'bg-blue-50/50 border-blue-200 shadow-xs' 
                : 'bg-slate-50 border-slate-200/60'
            }`
          }
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <UserIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="text-sm font-bold text-slate-900 truncate">{user?.fullName}</div>
            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            <div className="mt-1.5 flex">
              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 tracking-wide uppercase">
                {user?.role}
              </span>
            </div>
          </div>
        </NavLink>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5 flex-grow">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-blue-50/80 border-l-4 border-blue-600 text-blue-600 pl-3' 
                  : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
              }`
            }
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/assets" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-blue-50/80 border-l-4 border-blue-600 text-blue-600 pl-3' 
                  : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
              }`
            }
          >
            <Layers className="h-4.5 w-4.5" />
            <span>Assets</span>
          </NavLink>

          {user?.role === 'ADMIN' && (
            <NavLink 
              to="/admin" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-blue-50/80 border-l-4 border-blue-600 text-blue-600 pl-3' 
                    : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                }`
              }
            >
              <Shield className="h-4.5 w-4.5" />
              <span>Admin Panel</span>
            </NavLink>
          )}

          {/* Global Report Task Button */}
          <button 
            onClick={() => setShowTaskModal(true)} 
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm shadow-blue-500/10 transition-all cursor-pointer focus:ring-4 focus:ring-blue-100"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Report Task</span>
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto pt-4 border-t border-slate-200/80">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3 w-full bg-transparent hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-grow overflow-y-auto h-screen flex flex-col">
        {/* Header containing Welcome and Notification Bell */}
        <header className="bg-white border-b border-slate-250/70 px-10 py-4 flex items-center justify-between shrink-0">
          <div className="text-sm font-semibold text-slate-500">
            Welcome back, <span className="text-slate-800 font-extrabold">{user?.fullName}</span>
          </div>

          <div className="flex items-center gap-4 relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer focus:outline-none"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[420px] animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center shrink-0">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold transition-all bg-transparent border-none outline-none cursor-pointer flex items-center gap-1"
                    >
                      <CheckCheck className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto flex-grow divide-y divide-slate-100">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 flex gap-3 text-left transition-all ${
                        item.read ? 'bg-white' : 'bg-blue-50/20'
                      }`}
                    >
                      <div className="flex-grow space-y-1">
                        <p className={`text-xs leading-relaxed ${item.read ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>
                          {item.message}
                        </p>
                        <span className="text-[9px] text-slate-400 block font-medium">
                          {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!item.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          className="shrink-0 p-1 bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-400 rounded-lg transition-all cursor-pointer"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-slate-400 space-y-2">
                      <Bell className="h-8 w-8 text-slate-300" />
                      <p className="text-xs font-medium">You have no notifications yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="p-10 max-w-7xl w-full mx-auto flex-grow">
          <Outlet />
        </div>
      </main>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-[1000] p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Report Maintenance Request</h3>
              <button 
                onClick={() => {
                  setShowTaskModal(false);
                  setAttachmentFile(null);
                  setError('');
                }} 
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-semibold animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleReportTask} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Asset Machine</label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  required
                >
                  <option value="">Select Affected Machine...</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.assetName} ({asset.assetCode}) - {asset.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Issue Title</label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  placeholder="e.g. Hydraulic pump pressure loss"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Priority Severity</label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  required
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Detailed Description</label>
                <textarea
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  rows="3"
                  placeholder="Describe the issue symptoms, steps leading to the fault..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Upload screenshot evidence */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Screenshot / Evidence Photo (Optional)</label>
                <div className="relative flex items-center">
                  <ImageIcon className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2 text-xs text-slate-700 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    onChange={(e) => setAttachmentFile(e.target.files[0])}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-semibold text-sm transition-all shadow-sm shadow-blue-500/10 cursor-pointer disabled:cursor-not-allowed" 
                disabled={submitting}
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
