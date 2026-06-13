import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import {
  ClipboardList,
  Clock,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Search,
  ExternalLink,
  X,
  Send,
  Users
} from 'lucide-react';

const ManagerDashboard = () => {
  const navigate = useNavigate();

  // State
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Assignments
  const [assigningTaskId, setAssigningTaskId] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState('');

  // Remarks Modal (Approve/Reject Completed Tasks)
  const [showRemarksModal, setShowRemarksModal] = useState(null); // { taskId, action, taskStatus }
  const [remarks, setRemarks] = useState('');
  const [submittingRemarks, setSubmittingRemarks] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(interval);
  }, [searchQuery, statusFilter, priorityFilter]);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const params = {
        keyword: searchQuery || '',
        status: statusFilter || '',
        priority: priorityFilter || '',
      };
      const queryStr = new URLSearchParams(params).toString();

      const [taskRes, userRes, materialRes] = await Promise.all([
        api.get(`/tasks/search?${queryStr}`),
        api.get('/users'),
        api.get('/materials'),
      ]);

      setTasks(taskRes.data);
      setUsers(userRes.data);
      setMaterialRequests(materialRes.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to refresh manager data. Make sure backend is running.');
    } finally {
      if (!isBackground) setLoading(false);
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

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role/${newRole}`);
      alert('User role updated successfully!');
      fetchData(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const getStats = () => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === 'REPORTED').length;
    const assigned = tasks.filter((t) =>
      ['ASSIGNED', 'IN_PROGRESS', 'MATERIAL_REQUESTED', 'MATERIAL_APPROVED', 'MATERIAL_REJECTED'].includes(t.status)
    ).length;
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const approved = tasks.filter((t) => t.status === 'APPROVED').length;

    return { total, pending, assigned, completed, approved };
  };

  const stats = getStats();

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500 font-semibold">
        Loading Manager Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.total}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Total Tasks</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.pending}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Pending Assignment</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.assigned}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Under Repair</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.approved}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Approved Workorders</div>
          </div>
        </div>
      </div>

      {/* Task Overview */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Maintenance Task Overview</h2>
          <p className="text-xs text-slate-500 mt-1">Assign reported issues to technicians and verify completions</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex items-center flex-grow">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search work orders..."
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

        {/* Task Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                <th className="px-4 py-3.5">Code</th>
                <th className="px-4 py-3.5">Title</th>
                <th className="px-4 py-3.5">Asset</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Assignee</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-4 py-3.5 font-bold text-blue-600">{task.taskCode}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900">{task.title}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-800">{task.asset?.assetName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{task.asset?.assetCode}</div>
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
                  <td className="px-4 py-3.5">
                    {task.assignedTo ? (
                      <div className="font-medium text-slate-800">{task.assignedTo.fullName}</div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex gap-2 items-center justify-end">
                      {task.status === 'REPORTED' && (
                        assigningTaskId === task.id ? (
                          <div className="flex gap-1.5 items-center">
                            <select
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
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
                              onClick={() =>
                                setShowRemarksModal({ taskId: task.id, action: 'REJECT', taskStatus: 'REPORTED' })
                              }
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
                            onClick={() =>
                              setShowRemarksModal({ taskId: task.id, action: 'APPROVE', taskStatus: 'COMPLETED' })
                            }
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              setShowRemarksModal({ taskId: task.id, action: 'REJECT', taskStatus: 'COMPLETED' })
                            }
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

              {tasks.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400 text-sm">
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Material Request Management */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 text-slate-900">Material Request Approvals</h2>
            <p className="text-xs text-slate-500 mt-1">Review parts and spares requested by technicians</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Requested By</th>
                  <th className="px-4 py-3">Task Code</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {materialRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-4 py-3 font-semibold text-slate-900">{req.materialName}</td>
                    <td className="px-4 py-3 font-semibold">{req.quantity}</td>
                    <td className="px-4 py-3">{req.requestedBy?.fullName}</td>
                    <td className="px-4 py-3 font-medium text-blue-600">{req.task?.taskCode}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          req.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/40'
                            : req.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/40'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/40'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'PENDING' && (
                        <div className="inline-flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleMaterialApproval(req.id, true)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleMaterialApproval(req.id, false)}
                            className="px-2.5 py-1 bg-rose-50 border border-rose-200/50 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold text-xs transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {materialRequests.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-400 text-sm">
                      No material requests pending.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Role Configuration */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-400" />
              <span>User & Role Permissions</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Configure staff hierarchy roles on the factory floor</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3 text-right">Assigned Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-4 py-3 font-semibold text-slate-900">{u.fullName}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3 text-right">
                      <select
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
                        value={u.role}
                        onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                      >
                        <option value="USER">OPERATOR (USER)</option>
                        <option value="TECHNICIAN">TECHNICIAN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMINISTRATOR</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Remarks Dialog (Approve / Reject Action Modal) */}
      {showRemarksModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-[1000] p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">
                {showRemarksModal.action} Maintenance Task Request
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
                <label className="text-xs font-semibold text-slate-600">Decision Remarks / Reason</label>
                <textarea
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  rows="4"
                  placeholder="Enter a reason or feedback for this approval/rejection decision..."
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
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-semibold text-xs transition-all shadow-sm cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{submittingRemarks ? 'Submitting...' : 'Confirm Decision'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
