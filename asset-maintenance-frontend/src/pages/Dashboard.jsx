import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { 
  Plus, 
  Send, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  UserPlus, 
  UserCheck,
  Package,
  Wrench,
  ExternalLink
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Common State
  const [tasks, setTasks] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Operator (USER) State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [assetId, setAssetId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Technician (TECHNICIAN) State
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [materialName, setMaterialName] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Manager (MANAGER) State
  const [users, setUsers] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [assigningTaskId, setAssigningTaskId] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [showRemarksModal, setShowRemarksModal] = useState(null); // { taskId, action: 'APPROVE' | 'REJECT' }
  const [remarks, setRemarks] = useState('');

  // Load dashboard data based on role
  useEffect(() => {
    fetchDashboardData();
  }, [user.role]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch assets (needed by Operator to report tasks, and Manager for reference)
      const assetRes = await api.get('/assets');
      setAssets(assetRes.data);

      // 2. Fetch tasks depending on role
      if (user.role === 'USER') {
        const taskRes = await api.get('/tasks/my');
        setTasks(taskRes.data);
      } else if (user.role === 'TECHNICIAN') {
        const taskRes = await api.get('/tasks/assigned');
        setTasks(taskRes.data);
      } else if (user.role === 'MANAGER' || user.role === 'ADMIN') {
        const taskRes = await api.get('/tasks');
        setTasks(taskRes.data);

        // Managers also need lists of technicians/users and material requests
        const userRes = await api.get('/users');
        setUsers(userRes.data);

        const materialRes = await api.get('/materials');
        setMaterialRequests(materialRes.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // --- Operator Actions ---
  const handleReportTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title || !assetId || !description) {
      setError('Please fill in all fields to report a task');
      return;
    }

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
      
      // Refresh tasks
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit maintenance task.');
    }
  };

  // --- Technician Actions ---
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status/${newStatus}`);
      fetchDashboardData();
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
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request material');
    }
  };

  // --- Manager Actions ---
  const handleAssignTask = async (taskId) => {
    if (!selectedTechId) {
      alert('Please select a technician to assign');
      return;
    }

    try {
      await api.put(`/tasks/${taskId}/assign/${selectedTechId}`);
      setAssigningTaskId(null);
      setSelectedTechId('');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign task');
    }
  };

  const handleApproveRejectTaskSubmit = async (e) => {
    e.preventDefault();
    const { taskId, action } = showRemarksModal;
    const endpoint = action === 'APPROVE' ? 'approve' : 'reject';

    try {
      await api.put(`/tasks/${taskId}/${endpoint}?remarks=${encodeURIComponent(remarks)}`);
      setShowRemarksModal(null);
      setRemarks('');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action.toLowerCase()} task`);
    }
  };

  const handleMaterialApproval = async (requestId, isApprove) => {
    const endpoint = isApprove ? 'approve' : 'reject';
    try {
      await api.put(`/materials/${requestId}/${endpoint}`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update material request status');
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role/${newRole}`);
      alert('User role updated successfully!');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  // Helper Stats generator for Managers
  const getStats = () => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'REPORTED').length;
    const assigned = tasks.filter(t => t.status === 'ASSIGNED' || t.status === 'UNDER_WAY').length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const approved = tasks.filter(t => t.status === 'APPROVED').length;
    return { total, pending, assigned, completed, approved };
  };

  if (loading) {
    return <div style={styles.loadingContainer}>Loading dashboard...</div>;
  }

  const stats = (user.role === 'MANAGER' || user.role === 'ADMIN') ? getStats() : null;

  return (
    <div className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--text-main)' }}>Dashboard</h1>
          <p>Logged in as: <span style={{ color: 'var(--primary)', fontWeight: '500' }}>{user.fullName}</span> ({user.role})</p>
        </div>
        <button onClick={fetchDashboardData} className="btn btn-secondary">Refresh Data</button>
      </header>

      {error && (
        <div style={styles.errorBanner}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* --- MANAGER & ADMIN VIEW --- */}
      {(user.role === 'MANAGER' || user.role === 'ADMIN') && (
        <div>
          {/* Stats Section */}
          <div style={styles.statsGrid}>
            <div className="glass-card" style={styles.statCard}>
              <ClipboardList size={28} color="hsl(var(--primary))" />
              <div>
                <div style={styles.statVal}>{stats.total}</div>
                <div style={styles.statLabel}>Total Tasks</div>
              </div>
            </div>
            <div className="glass-card" style={styles.statCard}>
              <Clock size={28} color="hsl(var(--warning))" />
              <div>
                <div style={styles.statVal}>{stats.pending}</div>
                <div style={styles.statLabel}>Pending Assignment</div>
              </div>
            </div>
            <div className="glass-card" style={styles.statCard}>
              <Wrench size={28} color="#818cf8" />
              <div>
                <div style={styles.statVal}>{stats.assigned}</div>
                <div style={styles.statLabel}>Under Maintenance</div>
              </div>
            </div>
            <div className="glass-card" style={styles.statCard}>
              <CheckCircle size={28} color="hsl(var(--success))" />
              <div>
                <div style={styles.statVal}>{stats.approved}</div>
                <div style={styles.statLabel}>Approved Tasks</div>
              </div>
            </div>
          </div>

          {/* Manage Tasks Section */}
          <section className="glass-card" style={{ marginBottom: '32px' }}>
            <h2 style={styles.sectionTitle}>Maintenance Task Overview</h2>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Task Code</th>
                    <th>Title</th>
                    <th>Asset</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id}>
                      <td style={{ fontWeight: '600', color: 'hsl(var(--primary))' }}>{task.taskCode}</td>
                      <td>{task.title}</td>
                      <td>{task.asset?.assetName} ({task.asset?.assetCode})</td>
                      <td>
                        <span className={`badge badge-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${task.status.toLowerCase()}`}>
                          {task.status}
                        </span>
                      </td>
                      <td>{task.assignedTo ? task.assignedTo.fullName : <span style={{ color: 'hsl(var(--text-dim))' }}>None</span>}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={styles.actionGroup}>
                          {/* Assignment option for Reported tasks */}
                          {task.status === 'REPORTED' && (
                            assigningTaskId === task.id ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <select 
                                  className="form-input form-select"
                                  style={{ width: '160px', padding: '6px 12px' }}
                                  value={selectedTechId}
                                  onChange={(e) => setSelectedTechId(e.target.value)}
                                >
                                  <option value="">Select Tech...</option>
                                  {users.filter(u => u.role === 'TECHNICIAN').map(tech => (
                                    <option key={tech.id} value={tech.id}>{tech.fullName}</option>
                                  ))}
                                </select>
                                <button onClick={() => handleAssignTask(task.id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>Assign</button>
                                <button onClick={() => setAssigningTaskId(null)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setAssigningTaskId(task.id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>Assign</button>
                            )
                          )}

                          {/* Approval / Rejection options for Completed tasks */}
                          {task.status === 'COMPLETED' && (
                            <>
                              <button 
                                onClick={() => setShowRemarksModal({ taskId: task.id, action: 'APPROVE' })} 
                                className="btn btn-primary" 
                                style={{ padding: '6px 12px', fontSize: '13px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', boxShadow: 'none' }}
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => setShowRemarksModal({ taskId: task.id, action: 'REJECT' })} 
                                className="btn btn-danger" 
                                style={{ padding: '6px 12px', fontSize: '13px' }}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* View details */}
                          <button onClick={() => navigate(`/tasks/${task.id}`)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                            <ExternalLink size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'hsl(var(--text-dim))' }}>No tasks found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Material Requests Section */}
          <div style={styles.managerDoubleGrid}>
            <section className="glass-card">
              <h2 style={styles.sectionTitle}>Material / Part Requests</h2>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Qty</th>
                      <th>Requested By</th>
                      <th>Task Code</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialRequests.map(req => (
                      <tr key={req.id}>
                        <td style={{ fontWeight: '600' }}>{req.materialName}</td>
                        <td>{req.quantity}</td>
                        <td>{req.requestedBy?.fullName}</td>
                        <td>{req.task?.taskCode}</td>
                        <td>
                          <span className={`badge badge-${req.status.toLowerCase()}`}>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {req.status === 'PENDING' && (
                            <div style={styles.actionGroup}>
                              <button onClick={() => handleMaterialApproval(req.id, true)} className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '12px' }}>Approve</button>
                              <button onClick={() => handleMaterialApproval(req.id, false)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '12px' }}>Reject</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {materialRequests.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'hsl(var(--text-dim))' }}>No material requests.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Promote/Manage User Roles */}
            <section className="glass-card">
              <h2 style={styles.sectionTitle}>User Operations & Roles</h2>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Current Role</th>
                      <th style={{ textAlign: 'right' }}>Update Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>{u.fullName}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className="badge badge-role">{u.role}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {u.id !== user.id && (
                            <select
                              className="form-input form-select"
                              style={{ width: '140px', padding: '4px 8px', fontSize: '13px' }}
                              value={u.role}
                              onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                            >
                              <option value="USER">USER</option>
                              <option value="TECHNICIAN">TECHNICIAN</option>
                              <option value="MANAGER">MANAGER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* --- TECHNICIAN VIEW --- */}
      {user.role === 'TECHNICIAN' && (
        <section className="glass-card">
          <h2 style={styles.sectionTitle}>Assigned Maintenance Workorders</h2>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Task Code</th>
                  <th>Title</th>
                  <th>Asset</th>
                  <th>Priority</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td style={{ fontWeight: '600', color: 'hsl(var(--primary))' }}>{task.taskCode}</td>
                    <td>{task.title}</td>
                    <td>{task.asset?.assetName} ({task.asset?.assetCode})</td>
                    <td>
                      <span className={`badge badge-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={styles.actionGroup}>
                        {task.status === 'ASSIGNED' && (
                          <button 
                            onClick={() => handleUpdateStatus(task.id, 'UNDER_WAY')} 
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                          >
                            Start Work
                          </button>
                        )}
                        {task.status === 'UNDER_WAY' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(task.id, 'COMPLETED')} 
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '13px', background: 'var(--success)', color: '#fff' }}
                            >
                              Mark Completed
                            </button>
                            <button 
                              onClick={() => { setSelectedTaskId(task.id); setShowMaterialModal(true); }}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '13px' }}
                            >
                              Request Parts
                            </button>
                          </>
                        )}
                        <button onClick={() => navigate(`/tasks/${task.id}`)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'hsl(var(--text-dim))' }}>No tasks assigned. You're all caught up!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* --- OPERATOR (USER) VIEW --- */}
      {user.role === 'USER' && (
        <div style={styles.userGrid}>
          {/* Form to report task */}
          <section className="glass-card">
            <h2 style={styles.sectionTitle}>Report Maintenance Request</h2>
            {successMsg && <div style={styles.successBanner}>{successMsg}</div>}
            
            <form onSubmit={handleReportTask}>
              <div className="form-group">
                <label className="form-label">Asset Machine</label>
                <select 
                  className="form-input form-select"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                >
                  <option value="">Select Affected Machine...</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>{asset.assetName} ({asset.assetCode}) - {asset.location}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Issue Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Hydraulic pump pressure loss"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority Severity</label>
                <select 
                  className="form-input form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Detailed Description</label>
                <textarea 
                  className="form-input" 
                  rows="4"
                  placeholder="Describe the issue symptoms, steps leading to the fault..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Send size={16} />
                <span>Submit Report</span>
              </button>
            </form>
          </section>

          {/* List of reported tasks */}
          <section className="glass-card">
            <h2 style={styles.sectionTitle}>My Maintenance Log</h2>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Task Code</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id}>
                      <td style={{ fontWeight: '600', color: 'hsl(var(--primary))' }}>{task.taskCode}</td>
                      <td>{task.title}</td>
                      <td>
                        <span className={`badge badge-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${task.status.toLowerCase()}`}>
                          {task.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => navigate(`/tasks/${task.id}`)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                          <ExternalLink size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'hsl(var(--text-dim))' }}>You haven't reported any issues yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* --- MODAL: Remarks for Approve/Reject (Manager) --- */}
      {showRemarksModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={styles.modalCard}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '16px' }}>
              Confirm Task {showRemarksModal.action === 'APPROVE' ? 'Approval' : 'Rejection'}
            </h3>
            <form onSubmit={handleApproveRejectTaskSubmit}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Review Remarks</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Provide feedback or notes here..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowRemarksModal(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className={showRemarksModal.action === 'APPROVE' ? 'btn btn-primary' : 'btn btn-danger'}>
                  {showRemarksModal.action === 'APPROVE' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Request Materials (Technician) --- */}
      {showMaterialModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={styles.modalCard}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '16px' }}>Request Spares/Materials</h3>
            <form onSubmit={handleRequestMaterialSubmit}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. M12 Seal, Hydraulic Oil 5L"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowMaterialModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    fontSize: '18px',
    color: 'var(--text-muted)',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'rgba(220, 38, 38, 0.08)',
    border: '1px solid rgba(220, 38, 38, 0.15)',
    borderRadius: '12px',
    color: 'var(--danger)',
    marginBottom: '24px',
  },
  successBanner: {
    padding: '12px 16px',
    background: 'rgba(22, 163, 74, 0.08)',
    border: '1px solid rgba(22, 163, 74, 0.15)',
    borderRadius: '10px',
    color: 'var(--success)',
    fontSize: '14px',
    marginBottom: '20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  statVal: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--text-main)',
    lineHeight: '1.2',
  },
  statLabel: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: '18px',
    color: 'var(--text-main)',
    marginBottom: '20px',
  },
  actionGroup: {
    display: 'inline-flex',
    gap: '8px',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  managerDoubleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '32px',
    '@media(minWidth: 1024px)': {
      gridTemplateColumns: '1.2fr 0.8fr',
    }
  },
  userGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '32px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalCard: {
    width: '100%',
    maxWidth: '480px',
    padding: '32px',
  }
};

export default Dashboard;
