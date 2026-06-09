import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  User as UserIcon, 
  Send, 
  AlertCircle, 
  ChevronRight,
  Shield,
  Layers,
  MapPin,
  Calendar
} from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [task, setTask] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
    
    // Poll comments and history every 5 seconds for a dynamic "live chat" experience
    const interval = setInterval(() => {
      fetchCommentsAndHistory();
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch task details
      // Note: Since there isn't a direct GET /tasks/{id} endpoint in the controller (it's not defined in the backend controllers we inspected), 
      // we can load the task from the list of all tasks.
      let taskData = null;
      if (user.role === 'USER') {
        const res = await api.get('/tasks/my');
        taskData = res.data.find(t => t.id === parseInt(id, 10));
      } else if (user.role === 'TECHNICIAN') {
        const res = await api.get('/tasks/assigned');
        taskData = res.data.find(t => t.id === parseInt(id, 10));
      } else {
        const res = await api.get('/tasks');
        taskData = res.data.find(t => t.id === parseInt(id, 10));
      }

      if (!taskData) {
        throw new Error('Task not found or unauthorized to view.');
      }
      setTask(taskData);

      // 2. Fetch history and comments
      await fetchCommentsAndHistory();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsAndHistory = async () => {
    try {
      const historyRes = await api.get(`/tasks/${id}/history`);
      setHistory(historyRes.data);

      const commentsRes = await api.get(`/tasks/${id}/comments`);
      setComments(commentsRes.data);
    } catch (err) {
      console.error('Background updates failed:', err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentSubmitting(true);
    try {
      // POST comment: /tasks/{taskId}/comments?userId={userId}&message={message}
      await api.post(`/tasks/${id}/comments?userId=${user.id}&message=${encodeURIComponent(newComment)}`);
      setNewComment('');
      
      // Immediately reload comments
      const commentsRes = await api.get(`/tasks/${id}/comments`);
      setComments(commentsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) {
    return <div style={styles.loadingContainer}>Loading task details...</div>;
  }

  if (error || !task) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
        <div style={styles.errorBanner}>
          <AlertCircle size={20} />
          <span>{error || 'Task details could not be found.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Back navigation */}
      <button onClick={() => navigate('/')} style={styles.backBtn}>
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </button>

      {/* Task Header Details */}
      <header style={styles.header}>
        <div>
          <div style={styles.headerMeta}>
            <span style={styles.taskCode}>{task.taskCode}</span>
            <span className={`badge badge-${task.priority.toLowerCase()}`}>
              {task.priority} Priority
            </span>
            <span className={`badge badge-${task.status.toLowerCase()}`}>
              {task.status}
            </span>
          </div>
          <h1 style={styles.title}>{task.title}</h1>
        </div>
      </header>

      {/* Grid Layout: Left Column (Details & Chat), Right Column (Timeline History) */}
      <div style={styles.layoutGrid}>
        
        {/* Left Side */}
        <div style={styles.leftCol}>
          {/* Machine Description */}
          <section className="glass-card" style={styles.section}>
            <h2 style={styles.sectionTitle}>Task Information</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoBlock}>
                <div style={styles.infoLabel}>Description</div>
                <div style={styles.infoText}>{task.description}</div>
              </div>
              <div style={styles.infoBlock}>
                <div style={styles.infoLabel}>Affected Machinery Asset</div>
                <div style={styles.assetCard}>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '15px' }}>{task.asset?.assetName}</div>
                  <div style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: '500', margin: '4px 0' }}>{task.asset?.assetCode}</div>
                  <div style={styles.assetMetaRow}>
                    <MapPin size={12} /> <span>{task.asset?.location}</span>
                    <span style={{ margin: '0 4px' }}>•</span>
                    <Tag size={12} /> <span>{task.asset?.category}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* People Involved */}
            <div style={styles.peopleRow}>
              <div style={styles.personBlock}>
                <UserIcon size={16} color="hsl(var(--text-dim))" />
                <div>
                  <span style={styles.personLabel}>Reported By:</span>
                  <span style={styles.personValue}>{task.reportedBy?.fullName || 'System'}</span>
                </div>
              </div>
              
              <div style={styles.personBlock}>
                <Shield size={16} color="hsl(var(--text-dim))" />
                <div>
                  <span style={styles.personLabel}>Assigned Technician:</span>
                  <span style={styles.personValue}>{task.assignedTo?.fullName || <span style={{ color: 'hsl(var(--text-dim))' }}>Not Assigned</span>}</span>
                </div>
              </div>
            </div>

            {/* Manager Remarks */}
            {task.managerRemarks && (
              <div style={styles.remarksBlock}>
                <div style={styles.remarksLabel}>Manager Review Remarks:</div>
                <div style={styles.remarksText}>"{task.managerRemarks}"</div>
                <div style={styles.remarksAuthor}>— Reviewed by {task.approvedBy?.fullName || 'Manager'}</div>
              </div>
            )}
          </section>

          {/* Discussion Chat board */}
          <section className="glass-card" style={styles.section}>
            <h2 style={styles.sectionTitle}>Discussion & Comments</h2>
            
            {/* Comment Thread */}
            <div style={styles.commentList}>
              {comments.map((comment, index) => (
                <div key={index} style={styles.commentItem}>
                  <div style={styles.commentHeader}>
                    <span style={styles.commentAuthor}>{comment.user}</span>
                    <span style={styles.commentTime}>
                      {new Date(comment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={styles.commentMsg}>{comment.message}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <div style={styles.emptyComments}>
                  <MessageSquare size={36} color="hsl(var(--text-dim))" />
                  <p style={{ marginTop: '12px' }}>No comments posted yet. Ask questions or leave logs below.</p>
                </div>
              )}
            </div>

            {/* Post comment form */}
            <form onSubmit={handlePostComment} style={styles.commentForm}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Post an update or request help..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={commentSubmitting}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 18px' }} disabled={commentSubmitting}>
                <Send size={16} />
              </button>
            </form>
          </section>
        </div>

        {/* Right Side: Timeline History */}
        <div style={styles.rightCol}>
          <section className="glass-card" style={{ height: '100%' }}>
            <h2 style={styles.sectionTitle}>Workflow History</h2>
            
            <div style={styles.timeline}>
              {history.map((log, index) => (
                <div key={index} style={styles.timelineItem}>
                  <div style={styles.timelineIndicator}>
                    <div style={styles.timelineLine}></div>
                    <div style={styles.timelineDot}></div>
                  </div>
                  
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineHeader}>
                      <span style={styles.timelineAction}>{log.action}</span>
                      <span style={styles.timelineTime}>
                        {new Date(log.time).toLocaleDateString()} {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div style={styles.timelineActor}>
                      Performed by: <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{log.performedBy}</span>
                    </div>

                    {log.fromStatus && log.toStatus && (
                      <div style={styles.timelineTransition}>
                        <span className={`badge badge-${log.fromStatus.toLowerCase()}`} style={{ fontSize: '10px' }}>{log.fromStatus}</span>
                        <ChevronRight size={12} color="hsl(var(--text-dim))" />
                        <span className={`badge badge-${log.toStatus.toLowerCase()}`} style={{ fontSize: '10px' }}>{log.toStatus}</span>
                      </div>
                    )}

                    {log.remarks && (
                      <p style={styles.timelineRemarks}>"{log.remarks}"</p>
                    )}
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div style={{ color: 'hsl(var(--text-dim))', textAlign: 'center', paddingTop: '40px' }}>
                  No history logs compiled.
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

const Tag = ({ size, color }) => <Layers size={size} color={color} />;

const styles = {
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--primary)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '20px',
    padding: 0,
    outline: 'none',
  },
  header: {
    marginBottom: '32px',
  },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  taskCode: {
    fontFamily: 'var(--font-family-title)',
    fontWeight: '700',
    fontSize: '16px',
    color: 'var(--primary)',
    letterSpacing: '0.05em',
  },
  title: {
    fontSize: '28px',
    color: 'var(--text-main)',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '32px',
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  rightCol: {},
  sectionTitle: {
    fontSize: '18px',
    color: 'var(--text-main)',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  infoBlock: {},
  infoLabel: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontWeight: '500',
    marginBottom: '6px',
  },
  infoText: {
    fontSize: '15px',
    color: 'var(--text-main)',
    lineHeight: '1.6',
  },
  assetCard: {
    padding: '16px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
  },
  assetMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '6px',
  },
  peopleRow: {
    display: 'flex',
    gap: '24px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-color)',
    flexWrap: 'wrap',
  },
  personBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--bg-hover)',
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
  },
  personLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    display: 'block',
  },
  personValue: {
    fontSize: '13px',
    color: 'var(--text-main)',
    fontWeight: '500',
  },
  remarksBlock: {
    marginTop: '24px',
    padding: '16px',
    background: '#eff6ff',
    border: '1px dashed #bfdbfe',
    borderRadius: '10px',
  },
  remarksLabel: {
    fontSize: '13px',
    color: 'var(--primary)',
    fontWeight: '600',
    marginBottom: '6px',
  },
  remarksText: {
    fontStyle: 'italic',
    color: 'var(--text-main)',
  },
  remarksAuthor: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '8px',
    textAlign: 'right',
  },
  commentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: '360px',
    overflowY: 'auto',
    marginBottom: '20px',
    paddingRight: '6px',
  },
  commentItem: {
    padding: '14px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  commentAuthor: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--primary)',
  },
  commentTime: {
    fontSize: '11px',
    color: 'var(--text-dim)',
  },
  commentMsg: {
    fontSize: '14px',
    color: 'var(--text-main)',
    lineHeight: '1.4',
  },
  emptyComments: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    color: 'var(--text-dim)',
    textAlign: 'center',
  },
  commentForm: {
    display: 'flex',
    gap: '12px',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: '10px',
  },
  timelineItem: {
    display: 'flex',
    gap: '16px',
  },
  timelineIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  timelineLine: {
    width: '2px',
    background: 'var(--border-color)',
    height: '100%',
    position: 'absolute',
    top: '12px',
  },
  timelineDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'var(--primary)',
    border: '3px solid var(--bg-main)',
    boxShadow: '0 0 8px 0 rgba(37, 99, 235, 0.4)',
    zIndex: 2,
    marginTop: '6px',
  },
  timelineContent: {
    flexGrow: 1,
    paddingBottom: '28px',
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  timelineAction: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-main)',
    letterSpacing: '0.02em',
  },
  timelineTime: {
    fontSize: '11px',
    color: 'var(--text-dim)',
  },
  timelineActor: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  timelineTransition: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '8px 0',
  },
  timelineRemarks: {
    fontSize: '13px',
    fontStyle: 'italic',
    color: 'var(--text-muted)',
    marginTop: '6px',
    background: 'var(--bg-hover)',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
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
    background: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    borderRadius: '12px',
    color: 'var(--danger)',
  }
};

export default TaskDetail;
