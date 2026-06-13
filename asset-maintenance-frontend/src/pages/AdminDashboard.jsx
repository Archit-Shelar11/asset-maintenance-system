import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  AlertTriangle,
  ClipboardList,
  Clock,
  CheckCircle,
  Users as UsersIcon,
  ExternalLink,
  Shield,
  Search,
  X,
  Send
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Manager-like state for task actions
  const [assigningTaskId, setAssigningTaskId] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [showRemarksModal, setShowRemarksModal] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [submittingRemarks, setSubmittingRemarks] = useState(false);

  useEffect(() => {
    fetchData();

    // Poll every 5 seconds for background sync
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);

    // Listen for custom task creation event
    const handleTaskCreated = () => {
      fetchData(false);
    };
    window.addEventListener('task-created', handleTaskCreated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('task-created', handleTaskCreated);
    };
  }, [searchQuery, statusFilter, priorityFilter]);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    setError('');
    try {
      const searchParams = {
        keyword: searchQuery || '',
        status: statusFilter || '',
        priority: priorityFilter || '',
      };
      const queryStr = new URLSearchParams(searchParams).toString();

      const [taskRes, userRes, materialRes] = await Promise.all([
        api.get(`/tasks/search?${queryStr}`),
        api.get('/users'),
        api.get('/materials'),
      ]);
      setTasks(taskRes.data);
      setUsers(userRes.data);
      setMaterialRequests(materialRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch admin data. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role/${newRole}`);
      alert('User role updated successfully!');
      fetchData(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleAssignTask = async (taskId) => {
    if (!selectedTechId) {
      alert('Please select a technician to assign');
      return;
    }
    try {
      await api.put(`/tasks/${taskId}/assign/${selectedTechId}`);
      setAssigningTaskId(null);
      setSelectedTechId('');
      fetchData(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign task');
    }
  };

  const handleApproveRejectTaskSubmit = async (e) => {
    e.preventDefault();
    const { taskId, action, taskStatus } = showRemarksModal;
    let endpoint;

    if (action === 'APPROVE') {
      endpoint = 'approve';
    } else if (taskStatus === 'REPORTED') {
      endpoint = 'reject-reported';
    } else {
      endpoint = 'reject';
    }

    setSubmittingRemarks(true);
    try {
      await api.put(`/tasks/${taskId}/${endpoint}?remarks=${encodeURIComponent(remarks)}`);
      setShowRemarksModal(null);
      setRemarks('');
      fetchData(true);
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action.toLowerCase()} task`);
    } finally {
      setSubmittingRemarks(false);
    }
  };

  const handleMaterialApproval = async (requestId, isApprove) => {
    const endpoint = isApprove ? 'approve' : 'reject';
    try {
      await api.put(`/materials/${requestId}/${endpoint}`);
      fetchData(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update material request status');
    }
  };

  const getStats = () => {
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'REPORTED').length;
    const inProgress = tasks.filter(t =>
      ['ASSIGNED', 'IN_PROGRESS', 'MATERIAL_REQUESTED', 'MATERIAL_APPROVED', 'MATERIAL_REJECTED'].includes(t.status)
    ).length;
    const completedTasks = tasks.filter(t => t.status === 'APPROVED').length;
    const totalUsers = users.length;

    return { totalTasks, pendingTasks, inProgress, completedTasks, totalUsers };
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500 font-semibold">
        Loading admin panel...
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span>Admin Panel</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as: <span className="text-blue-600 font-semibold">{user?.fullName}</span> ({user?.role})
          </p>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm font-medium animate-fade-in">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <UsersIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.totalUsers}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Total Users</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.totalTasks}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Total Tasks</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.pendingTasks}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Pending Action</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.completedTasks}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Approved Tasks</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management Section */}
        <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6 lg:col-span-1">
          <div>
            <h2 className="text-base font-bold text-slate-900">User Management</h2>
            <p className="text-xs text-slate-500 mt-1">Configure floor roles and system access permissions</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3 text-right">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{u.fullName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.id !== user?.id ? (
                        <select
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                          value={u.role}
                          onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                        >
                          <option value="USER">USER</option>
                          <option value="TECHNICIAN">TECHNICIAN</option>
                          <option value="MANAGER">MANAGER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                          {u.role}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Task Control Section */}
        <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6 lg:col-span-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">System Tasks Registry</h2>
            <p className="text-xs text-slate-500 mt-1">Supervise and re-route any task status directly</p>
          </div>

          {/* Search/Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex items-center flex-grow">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 font-medium">
              <select
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-750 focus:outline-none focus:border-blue-600 focus:bg-white"
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
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-750 focus:outline-none focus:border-blue-600 focus:bg-white"
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

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-4 py-3 font-bold text-blue-600">{task.taskCode}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{task.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{task.asset?.assetName}</div>
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2 items-center justify-end">
                        {task.status === 'REPORTED' && (
                          assigningTaskId === task.id ? (
                            <div className="flex gap-1.5 items-center">
                              <select
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
                                value={selectedTechId}
                                onChange={(e) => setSelectedTechId(e.target.value)}
                              >
                                <option value="">Select Tech...</option>
                                {users
                                  .filter((u) => u.role === 'TECHNICIAN')
                                  .map((tech) => (
                                    <option key={tech.id} value={tech.id}>
                                      {tech.fullName}
                                    </option>
                                  ))}
                              </select>
                              <button
                                onClick={() => handleAssignTask(task.id)}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-all cursor-pointer"
                              >
                                Go
                              </button>
                              <button
                                onClick={() => setAssigningTaskId(null)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-semibold text-xs transition-all cursor-pointer"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => setAssigningTaskId(task.id)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-all cursor-pointer"
                              >
                                Assign
                              </button>
                              <button
                                onClick={() => setShowRemarksModal({ taskId: task.id, action: 'REJECT', taskStatus: 'REPORTED' })}
                                className="px-3 py-1.5 bg-rose-50 border border-rose-200/50 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold text-xs transition-all cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )
                        )}

                        {task.status === 'COMPLETED' && (
                          <>
                            <button
                              onClick={() => setShowRemarksModal({ taskId: task.id, action: 'APPROVE', taskStatus: 'COMPLETED' })}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setShowRemarksModal({ taskId: task.id, action: 'REJECT', taskStatus: 'COMPLETED' })}
                              className="px-3 py-1.5 bg-rose-50 border border-rose-200/50 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold text-xs transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => navigate(`/tasks/${task.id}`)}
                          className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Remarks/Approval Action Modal */}
      {showRemarksModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-[1000] p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">
                Confirm Task {showRemarksModal.action === 'APPROVE' ? 'Approval' : 'Rejection'}
              </h3>
              <button
                onClick={() => {
                  setShowRemarksModal(null);
                  setRemarks('');
                }}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApproveRejectTaskSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Decision Remarks</label>
                <textarea
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  rows="3"
                  placeholder="Provide decision review notes or reason..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRemarksModal(null);
                    setRemarks('');
                  }}
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRemarks}
                  className={`inline-flex items-center justify-center px-4 py-2.5 text-white rounded-xl font-semibold text-xs transition-all shadow-sm cursor-pointer ${
                    showRemarksModal.action === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-750'
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{submittingRemarks ? 'Saving...' : showRemarksModal.action === 'APPROVE' ? 'Approve' : 'Reject'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
