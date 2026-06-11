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
  Shield
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Manager-like state for task actions
  const [assigningTaskId, setAssigningTaskId] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [showRemarksModal, setShowRemarksModal] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [taskRes, userRes, materialRes] = await Promise.all([
        api.get('/tasks'),
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
      fetchData();
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
      fetchData();
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

    try {
      await api.put(`/tasks/${taskId}/${endpoint}?remarks=${encodeURIComponent(remarks)}`);
      setShowRemarksModal(null);
      setRemarks('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action.toLowerCase()} task`);
    }
  };

  const handleMaterialApproval = async (requestId, isApprove) => {
    const endpoint = isApprove ? 'approve' : 'reject';
    try {
      await api.put(`/materials/${requestId}/${endpoint}`);
      fetchData();
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

  if (loading) {
    return <div style={styles.loadingContainer}>Loading admin panel...</div>;
  }

  const stats = getStats();

  return (
    <div className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--text-main)' }}>
            <Shield size={28} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
            Admin Panel
          </h1>
          <p>
            Logged in as:{' '}
            <span style={{ color: 'var(--primary)', fontWeight: '500' }}>
              {user?.fullName}
            </span>{' '}
            ({user?.role})
          </p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary">
          Refresh Data
        </button>
      </header>

      {error && (
        <div style={styles.errorBanner}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div className="glass-card" style={styles.statCard}>
          <UsersIcon size={28} color="hsl(var(--primary))" />
          <div>
            <div style={styles.statVal}>{stats.totalUsers}</div>
            <div style={styles.statLabel}>Total Users</div>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <ClipboardList size={28} color="hsl(var(--warning))" />
          <div>
            <div style={styles.statVal}>{stats.totalTasks}</div>
            <div style={styles.statLabel}>Total Tasks</div>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <Clock size={28} color="#818cf8" />
          <div>
            <div style={styles.statVal}>{stats.pendingTasks}</div>
            <div style={styles.statLabel}>Pending</div>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <CheckCircle size={28} color="hsl(var(--success))" />
          <div>
            <div style={styles.statVal}>{stats.completedTasks}</div>
            <div style={styles.statLabel}>Approved</div>
          </div>
        </div>
      </div>

      {/* User Management */}
      <section className="glass-card" style={{ marginBottom: '32px' }}>
        <h2 style={styles.sectionTitle}>User Management & Roles</h2>
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
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: '600' }}>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge badge-role">{u.role}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {u.id !== user?.id && (
                      <select
                        className="form-input form-select"
                        style={{ width: '160px', padding: '4px 8px', fontSize: '13px' }}
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

      {/* Task Overview */}
      <section className="glass-card" style={{ marginBottom: '32px' }}>
        <h2 style={styles.sectionTitle}>All Maintenance Tasks</h2>
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
              {tasks.map((task) => (
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
                  <td>
                    {task.assignedTo ? task.assignedTo.fullName : <span style={{ color: 'hsl(var(--text-dim))' }}>None</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={styles.actionGroup}>
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
                              {users
                                .filter((u) => u.role === 'TECHNICIAN')
                                .map((tech) => (
                                  <option key={tech.id} value={tech.id}>
                                    {tech.fullName}
                                  </option>
                                ))}
                            </select>
                            <button onClick={() => handleAssignTask(task.id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                              Assign
                            </button>
                            <button onClick={() => setAssigningTaskId(null)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => setAssigningTaskId(task.id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                              Assign
                            </button>
                            <button
                              onClick={() => setShowRemarksModal({ taskId: task.id, action: 'REJECT', taskStatus: 'REPORTED' })}
                              className="btn btn-danger"
                              style={{ padding: '6px 12px', fontSize: '13px' }}
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
                            className="btn btn-primary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '13px',
                              background: 'rgba(52, 211, 153, 0.15)',
                              color: '#34d399',
                              border: '1px solid rgba(52, 211, 153, 0.3)',
                              boxShadow: 'none'
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setShowRemarksModal({ taskId: task.id, action: 'REJECT', taskStatus: 'COMPLETED' })}
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                          >
                            Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {tasks.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'hsl(var(--text-dim))' }}>
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Material Requests */}
      <section className="glass-card" style={{ marginBottom: '32px' }}>
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
              {materialRequests.map((req) => (
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
                        <button
                          onClick={() => handleMaterialApproval(req.id, true)}
                          className="btn btn-primary"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleMaterialApproval(req.id, false)}
                          className="btn btn-danger"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
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
                  <td colSpan="6" style={{ textAlign: 'center', color: 'hsl(var(--text-dim))' }}>
                    No material requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Remarks Modal */}
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
                <button type="button" onClick={() => setShowRemarksModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  className={showRemarksModal.action === 'APPROVE' ? 'btn btn-primary' : 'btn btn-danger'}
                >
                  {showRemarksModal.action === 'APPROVE' ? 'Approve' : 'Reject'}
                </button>
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
  },
};

export default AdminDashboard;
