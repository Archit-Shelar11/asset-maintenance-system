import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
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
  Calendar,
  Tag,
  FileText,
  Download,
  AlertTriangle,
  Image as ImageIcon
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
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    fetchTaskDetails(false);
    
    // Poll everything (details, comments, history) every 5 seconds
    const interval = setInterval(() => {
      fetchTaskDetails(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  const fetchTaskDetails = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
      setError('');
    }
    try {
      // Fetch task details directly using our GET /tasks/{id} endpoint
      const res = await api.get(`/tasks/${id}`);
      setTask(res.data);

      // Fetch history and comments
      await fetchCommentsAndHistory();
    } catch (err) {
      console.error(err);
      if (!isBackground) {
        setError(err.response?.data?.message || 'Failed to load task details.');
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
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
      await api.post(`/tasks/${id}/comments?message=${encodeURIComponent(newComment)}`);
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

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await api.get(`/tasks/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `service_report_${task.taskCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF Maintenance Report.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Serve from the backend server port
    return `http://localhost:8080${path}`;
  };

  if (loading && !task) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500 font-semibold">
        Loading task details...
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button 
          onClick={() => navigate('/')} 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-sm transition-all cursor-pointer bg-transparent border-none outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm font-medium">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error || 'Task details could not be found.'}</span>
        </div>
      </div>
    );
  }

  // Calculate SLA & Overdue Status
  const isOverdue = task.dueDate && 
                    new Date(task.dueDate) < new Date() && 
                    !['COMPLETED', 'APPROVED', 'CLOSED'].includes(task.status);

  // Group attachments
  const initialAttachments = task.attachments?.filter(a => a.attachmentType === 'INITIAL_REPORT') || [];
  const beforeAttachments = task.attachments?.filter(a => a.attachmentType === 'BEFORE_REPAIR') || [];
  const afterAttachments = task.attachments?.filter(a => a.attachmentType === 'AFTER_REPAIR') || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back navigation */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <button 
          onClick={() => navigate('/')} 
          className="inline-flex items-center gap-2 text-blue-650 hover:text-blue-850 font-semibold text-sm transition-all cursor-pointer bg-transparent border-none outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* PDF Download Button (Visible for COMPLETED or APPROVED tasks) */}
        {['COMPLETED', 'APPROVED'].includes(task.status) && (
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>{downloadingPdf ? 'Compiling PDF...' : 'Download PDF Report'}</span>
          </button>
        )}
      </div>

      {/* Task Header Details */}
      <header className="pb-6 border-b border-slate-200">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono font-bold text-sm text-blue-650 tracking-wider uppercase">
              {task.taskCode}
            </span>
            <span
              className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                task.priority === 'LOW'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200/40'
                  : task.priority === 'MEDIUM'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/40'
                  : task.priority === 'HIGH'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/40'
                  : 'bg-red-105 text-red-850 border border-red-200 animate-pulse'
              }`}
            >
              {task.priority} Priority
            </span>
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                task.status === 'REPORTED'
                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                  : ['ASSIGNED', 'IN_PROGRESS'].includes(task.status)
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : ['COMPLETED', 'APPROVED'].includes(task.status)
                  ? 'bg-emerald-50 text-emerald-705 border border-emerald-200'
                  : 'bg-rose-50 text-rose-705 border border-rose-200'
              }`}
            >
              {task.status.replace('_', ' ')}
            </span>

            {/* Overdue SLA Flag */}
            {isOverdue && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider animate-bounce shadow-sm">
                <AlertTriangle className="h-3.5 w-3.5" /> OVERDUE SLA LIMIT
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{task.title}</h1>
        </div>
      </header>

      {/* Grid Layout: Left Column (Details & Evidence), Right Column (Timeline History) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Side */}
        <div className="lg:col-span-3 space-y-8">
          {/* Machine Description */}
          <section className="bg-white border border-slate-200/85 rounded-2xl shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              Task Information
            </h2>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</div>
                <p className="text-sm text-slate-700 leading-relaxed">{task.description}</p>
              </div>

              {/* SLA Target / Due Date */}
              {task.dueDate && (
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">SLA Target Due Date</div>
                  <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                    isOverdue 
                      ? 'bg-rose-50 border-rose-200 text-rose-800' 
                      : 'bg-slate-50 border-slate-250/70 text-slate-700'
                  }`}>
                    <Calendar className={`h-5 w-5 ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`} />
                    <div className="text-xs font-semibold">
                      {new Date(task.dueDate).toLocaleString()}
                      {isOverdue && <span className="ml-2 font-bold text-rose-700">(Overdue)</span>}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Affected Machinery Asset</div>
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 text-sm">{task.asset?.assetName}</div>
                  <div className="text-xs font-semibold text-blue-600 tracking-wider uppercase">{task.asset?.assetCode}</div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> <span>{task.asset?.location}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" /> <span>{task.asset?.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* People Involved */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/70 p-3 rounded-xl flex-1">
                <UserIcon className="h-5 w-5 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reported By:</span>
                  <span className="text-xs font-semibold text-slate-700 truncate block">{task.reportedBy?.fullName || 'System'}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/70 p-3 rounded-xl flex-1">
                <Shield className="h-5 w-5 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Technician:</span>
                  <span className="text-xs font-semibold text-slate-700 truncate block">
                    {task.assignedTo?.fullName || <span className="text-slate-400 italic font-medium">Unassigned</span>}
                  </span>
                </div>
              </div>
            </div>

            {/* Manager Remarks */}
            {task.managerRemarks && (
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Manager Decision Remarks:</div>
                <p className="text-sm italic text-slate-800">"{task.managerRemarks}"</p>
                <div className="text-[10px] font-semibold text-slate-500 text-right">— Actioned by {task.approvedBy?.fullName || 'Manager'}</div>
              </div>
            )}
          </section>

          {/* Technician Service Report Card */}
          {task.serviceReport && (
            <section className="bg-white border border-slate-200/85 rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <FileText className="h-5 w-5 text-blue-650" />
                <h2 className="text-lg font-bold text-slate-900">Technician Service Report</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-400 uppercase tracking-wider">Root Cause of Failure</div>
                  <p className="text-sm text-slate-700 font-semibold">{task.serviceReport.rootCause}</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-400 uppercase tracking-wider">Work Performed</div>
                  <p className="text-sm text-slate-700 font-semibold">{task.serviceReport.workPerformed}</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-400 uppercase tracking-wider">Time Spent on Repair</div>
                  <p className="text-sm text-slate-700 font-semibold">{task.serviceReport.timeSpentMinutes} mins</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-400 uppercase tracking-wider">Recommendations</div>
                  <p className="text-sm text-slate-700 font-semibold">{task.serviceReport.recommendations || 'None provided'}</p>
                </div>
              </div>
            </section>
          )}

          {/* Evidence and Photo Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <section className="bg-white border border-slate-200/85 rounded-2xl shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
                Evidence & Attachments
              </h2>

              <div className="space-y-6">
                {/* Initial report attachments */}
                {initialAttachments.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reported Issue Screenshot</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {initialAttachments.map((a) => (
                        <a key={a.id} href={getImageUrl(a.filePath)} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden border border-slate-200 rounded-xl">
                          <img src={getImageUrl(a.filePath)} alt={a.fileName} className="h-32 w-full object-cover group-hover:scale-105 transition-all duration-300" />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all">
                            View Image
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Before Repair Attachments */}
                {beforeAttachments.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Before Repair (Evidence)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {beforeAttachments.map((a) => (
                        <a key={a.id} href={getImageUrl(a.filePath)} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden border border-slate-200 rounded-xl">
                          <img src={getImageUrl(a.filePath)} alt={a.fileName} className="h-32 w-full object-cover group-hover:scale-105 transition-all duration-300" />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all">
                            View Image
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* After Repair Attachments */}
                {afterAttachments.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">After Repair (Proof of Work)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {afterAttachments.map((a) => (
                        <a key={a.id} href={getImageUrl(a.filePath)} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden border border-slate-200 rounded-xl">
                          <img src={getImageUrl(a.filePath)} alt={a.fileName} className="h-32 w-full object-cover group-hover:scale-105 transition-all duration-300" />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all">
                            View Image
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Discussion Chat board */}
          <section className="bg-white border border-slate-200/85 rounded-2xl shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              Discussion & Comments
            </h2>
            
            {/* Comment Thread */}
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {comments.map((comment, index) => (
                <div key={index} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-650">{comment.user}</span>
                    <span className="text-[10px] font-medium text-slate-450">
                      {new Date(comment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{comment.message}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center space-y-3">
                  <MessageSquare className="h-10 w-10 text-slate-350" />
                  <p className="text-sm">No comments posted yet. Ask questions or leave updates below.</p>
                </div>
              )}
            </div>

            {/* Post comment form */}
            <form onSubmit={handlePostComment} className="flex gap-3">
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-805 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white" 
                placeholder="Post an update or request advice..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={commentSubmitting}
                required
              />
              <button 
                type="submit" 
                className="inline-flex items-center justify-center p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-355 text-white rounded-xl transition-all cursor-pointer shadow-sm" 
                disabled={commentSubmitting}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </section>
        </div>

        {/* Right Side: Timeline History */}
        <div className="lg:col-span-2">
          <section className="bg-white border border-slate-200/85 rounded-2xl shadow-sm p-6 space-y-6 h-full">
            <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              Workflow History
            </h2>
            
            <div className="space-y-6 pl-2 relative before:absolute before:top-2 before:bottom-2 before:left-[17px] before:w-0.5 before:bg-slate-100">
              {history.map((log, index) => (
                <div key={index} className="flex gap-4 relative">
                  {/* Timeline Dot */}
                  <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 z-10 shadow-xs">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  
                  <div className="flex-grow space-y-1 pt-1.5 pb-2">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-sm font-bold text-slate-900 leading-tight">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0 pt-0.5">
                        {new Date(log.time).toLocaleDateString()} {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="text-xs text-slate-500 font-medium">
                      By: <span className="text-slate-800 font-semibold">{log.performedBy}</span>
                    </div>

                    {log.fromStatus && log.toStatus && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="inline-flex px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[9px] uppercase">
                          {log.fromStatus}
                        </span>
                        <ChevronRight className="h-3 w-3 text-slate-400" />
                        <span className="inline-flex px-1.5 py-0.5 rounded bg-blue-50 text-blue-650 font-bold text-[9px] uppercase border border-blue-200/30">
                          {log.toStatus}
                        </span>
                      </div>
                    )}

                    {log.remarks && (
                      <p className="text-xs italic text-slate-600 bg-slate-50 border border-slate-200/70 rounded-lg p-2.5 mt-2">
                        "{log.remarks}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-slate-400 text-center py-12 text-sm font-medium">
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

export default TaskDetail;
