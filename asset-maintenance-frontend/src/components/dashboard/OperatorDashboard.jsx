import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Send, AlertTriangle, Search, ExternalLink } from 'lucide-react';

const OperatorDashboard = () => {
  const navigate = useNavigate();

  // State
  const [tasks, setTasks] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Report Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [assetId, setAssetId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(interval);
  }, [searchQuery, statusFilter, priorityFilter]);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const assetRes = await api.get('/assets');
      setAssets(assetRes.data);

      const params = {
        keyword: searchQuery || '',
        status: statusFilter || '',
        priority: priorityFilter || '',
      };
      const queryStr = new URLSearchParams(params).toString();
      const taskRes = await api.get(`/tasks/search?${queryStr}`);
      setTasks(taskRes.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to sync log data. Make sure backend is running.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleReportTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title || !assetId || !description) {
      setError('Please fill in all fields to report a task');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/tasks', {
        title,
        description,
        priority,
        assetId: parseInt(assetId, 10),
      });

      setSuccessMsg('Maintenance task reported successfully!');
      setTitle('');
      setDescription('');
      setPriority('LOW');
      setAssetId('');
      fetchData(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit maintenance task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm font-medium">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side: Report Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Report Maintenance Request</h2>
            <p className="text-xs text-slate-500 mt-1">Submit new machine issues directly to technicians</p>
          </div>

          <form onSubmit={handleReportTask} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Affected Asset Machine</label>
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
                rows="4"
                placeholder="Describe issue symptoms, fault steps, or strange machine sounds..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-semibold text-sm transition-all focus:ring-4 focus:ring-blue-100 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Maintenance Report'}</span>
            </button>
          </form>
        </div>

        {/* Right Side: Log Feed */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Maintenance Log</h2>
              <p className="text-xs text-slate-500 mt-1">Status and feed of issue tickets reported by you</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex items-center flex-grow">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search issues..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-600 focus:bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="REPORTED">REPORTED</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="MATERIAL_REQUESTED">MATERIAL_REQUESTED</option>
                <option value="MATERIAL_APPROVED">MATERIAL_APPROVED</option>
                <option value="MATERIAL_REJECTED">MATERIAL_REJECTED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>

              <select
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-600 focus:bg-white"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                  <th className="px-4 py-3.5">Code</th>
                  <th className="px-4 py-3.5">Title</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-4 py-3.5 font-bold text-blue-600">{task.taskCode}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{task.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{task.asset?.assetName}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          task.priority === 'LOW'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200/40'
                            : task.priority === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/40'
                            : task.priority === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/40'
                            : 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          task.status === 'REPORTED'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : ['ASSIGNED', 'IN_PROGRESS'].includes(task.status)
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : ['COMPLETED', 'APPROVED'].includes(task.status)
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <ExternalLink className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {tasks.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400 text-sm">
                      {loading ? 'Fetching tasks...' : 'No maintenance tasks logged.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;
