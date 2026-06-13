import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { AlertTriangle, Search, ExternalLink, X, Send, Camera, Clipboard } from 'lucide-react';

const TechnicianDashboard = () => {
  const navigate = useNavigate();

  // State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Material Modal
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [materialName, setMaterialName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submittingMaterial, setSubmittingMaterial] = useState(false);

  // Service Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [rootCause, setRootCause] = useState('');
  const [workPerformed, setWorkPerformed] = useState('');
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(30);
  const [recommendations, setRecommendations] = useState('');
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(() => fetchTasks(true), 5000);
    return () => clearInterval(interval);
  }, [searchQuery, statusFilter, priorityFilter]);

  const fetchTasks = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const params = {
        keyword: searchQuery || '',
        status: statusFilter || '',
        priority: priorityFilter || '',
      };
      const queryStr = new URLSearchParams(params).toString();
      const res = await api.get(`/tasks/search?${queryStr}`);
      setTasks(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch assigned tasks. Make sure backend is running.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status/${newStatus}`);
      fetchTasks(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleRequestMaterialSubmit = async (e) => {
    e.preventDefault();

    if (!materialName || quantity < 1) {
      alert('Please fill in material name and quantity');
      return;
    }

    setSubmittingMaterial(true);
    try {
      await api.post('/materials/request', {
        taskId: selectedTaskId,
        materialName,
        quantity: parseInt(quantity, 10),
      });

      alert('Material request submitted successfully!');
      setShowMaterialModal(false);
      setMaterialName('');
      setQuantity(1);
      fetchTasks(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request material');
    } finally {
      setSubmittingMaterial(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!rootCause || !workPerformed || !timeSpentMinutes) {
      alert('Please fill in root cause, work performed, and time spent');
      return;
    }

    setSubmittingReport(true);
    try {
      // 1. Submit service report (this also transitions status to COMPLETED)
      await api.post(`/tasks/${selectedTaskId}/report`, {
        rootCause,
        workPerformed,
        timeSpentMinutes: parseInt(timeSpentMinutes, 10),
        recommendations
      });

      // 2. Upload before repair file if selected
      if (beforeFile) {
        const formData = new FormData();
        formData.append('file', beforeFile);
        formData.append('type', 'BEFORE_REPAIR');
        await api.post(`/tasks/${selectedTaskId}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // 3. Upload after repair file if selected
      if (afterFile) {
        const formData = new FormData();
        formData.append('file', afterFile);
        formData.append('type', 'AFTER_REPAIR');
        await api.post(`/tasks/${selectedTaskId}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      alert('Service report and task completion submitted successfully!');
      setShowReportModal(false);
      
      // Reset form fields
      setRootCause('');
      setWorkPerformed('');
      setTimeSpentMinutes(30);
      setRecommendations('');
      setBeforeFile(null);
      setAfterFile(null);

      fetchTasks(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit service report');
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Assigned Maintenance Workorders</h2>
          <p className="text-xs text-slate-500 mt-1">Review your active tasks, change status, or request parts</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex items-center flex-grow">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search workorders..."
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
                <th className="px-4 py-3.5">Asset Machine</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Status</th>
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
                    <div className="text-xs text-slate-500 mt-0.5">{task.asset?.location}</div>
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
                    <div className="inline-flex gap-2">
                      {task.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                          className="inline-flex items-center justify-center px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-all shadow-sm cursor-pointer animate-fade-in"
                        >
                          Start Work
                        </button>
                      )}

                      {['IN_PROGRESS', 'MATERIAL_APPROVED', 'MATERIAL_REJECTED'].includes(task.status) && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedTaskId(task.id);
                              setShowReportModal(true);
                            }}
                            className="inline-flex items-center justify-center px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-all shadow-sm cursor-pointer animate-fade-in"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTaskId(task.id);
                              setShowMaterialModal(true);
                            }}
                            className="inline-flex items-center justify-center px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs transition-all cursor-pointer animate-fade-in"
                          >
                            Request Parts
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
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-400 text-sm">
                    {loading ? 'Loading tasks...' : "No tasks assigned. You're all caught up!"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Spares/Materials Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-[1000] p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Request Spares & Materials</h3>
              <button
                onClick={() => setShowMaterialModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRequestMaterialSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Material/Spare Item Name</label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  placeholder="e.g. M12 Seal, Hydraulic Oil 5L"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Required Quantity</label>
                <input
                  type="number"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMaterial}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-semibold text-xs transition-all shadow-sm cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{submittingMaterial ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Technician Service Report & Completion Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-[1000] p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 animate-fade-in overflow-y-auto max-h-[95vh]">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clipboard className="h-5 w-5 text-blue-605" />
                <h3 className="text-base font-bold text-slate-900">Submit Service Report & Complete</h3>
              </div>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setBeforeFile(null);
                  setAfterFile(null);
                }}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Root Cause of Failure</label>
                <textarea
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  rows="2"
                  placeholder="e.g. Blown fuse, mechanical wear, dust blockage..."
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Work Performed / Repairs Done</label>
                <textarea
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  rows="2"
                  placeholder="e.g. Replaced capacitor, re-calibrated sensors..."
                  value={workPerformed}
                  onChange={(e) => setWorkPerformed(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Time Spent (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                    placeholder="30"
                    value={timeSpentMinutes}
                    onChange={(e) => setTimeSpentMinutes(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Recommendations (Optional)</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                    placeholder="e.g. Inspect belt tension in 30 days"
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                  />
                </div>
              </div>

              {/* Upload evidence images */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Before & After Evidence Photos</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-550 flex items-center gap-1.5">
                      <Camera className="h-3.5 w-3.5 text-slate-400" /> Before Repair Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-700 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      onChange={(e) => setBeforeFile(e.target.files[0])}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-550 flex items-center gap-1.5">
                      <Camera className="h-3.5 w-3.5 text-slate-400" /> After Repair Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-700 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      onChange={(e) => setAfterFile(e.target.files[0])}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false);
                    setBeforeFile(null);
                    setAfterFile(null);
                  }}
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-semibold text-xs transition-all shadow-sm cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{submittingReport ? 'Submitting...' : 'Complete Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
