import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { Plus, Search, Filter, AlertTriangle, Layers, Calendar, MapPin, Tag } from 'lucide-react';

const Assets = () => {
  const { user } = useAuth();
  
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create Asset Modal State
  const [showModal, setShowModal] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [installationDate, setInstallationDate] = useState('');
  const [status, setStatus] = useState('OPERATIONAL');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/assets');
      setAssets(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch assets. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    if (!assetCode || !assetName || !category || !location) {
      alert('Please fill in code, name, category, and location');
      return;
    }

    try {
      await api.post('/assets', {
        assetCode,
        assetName,
        category,
        location,
        manufacturer,
        installationDate: installationDate || null,
        status,
        description,
      });

      alert('Asset registered successfully!');
      setShowModal(false);
      
      // Reset form
      setAssetCode('');
      setAssetName('');
      setCategory('');
      setLocation('');
      setManufacturer('');
      setInstallationDate('');
      setStatus('OPERATIONAL');
      setDescription('');

      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register asset');
    }
  };

  // Filter & search implementation
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter ? asset.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div style={styles.loadingContainer}>Loading asset database...</div>;
  }

  const isManagerOrAdmin = user.role === 'MANAGER' || user.role === 'ADMIN';

  return (
    <div className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--text-main)' }}>Asset Registry</h1>
          <p>Track, manage, and inspect factory machinery and physical assets.</p>
        </div>
        {isManagerOrAdmin && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Register New Asset</span>
          </button>
        )}
      </header>

      {error && (
        <div style={styles.errorBanner}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-card" style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search by code, name, location or brand..."
            style={{ paddingLeft: '44px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={styles.filterWrapper}>
          <Filter size={18} style={styles.filterIcon} />
          <select 
            className="form-input form-select"
            style={{ paddingLeft: '40px', width: '200px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="OPERATIONAL">OPERATIONAL</option>
            <option value="DEGRADED">DEGRADED</option>
            <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
            <option value="OFFLINE">OFFLINE</option>
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      <div style={styles.grid}>
        {filteredAssets.map(asset => (
          <div key={asset.id} className="glass-card" style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.assetCode}>{asset.assetCode}</span>
              <span className={`badge badge-status-${asset.status.toLowerCase()}`} style={badgeStyle(asset.status)}>
                {asset.status}
              </span>
            </div>
            
            <h3 style={styles.assetName}>{asset.assetName}</h3>
            <p style={styles.description}>{asset.description || 'No description available for this machine.'}</p>
            
            <div style={styles.metaSection}>
              <div style={styles.metaItem}>
                <Tag size={14} color="#94a3b8" />
                <span>{asset.category}</span>
              </div>
              <div style={styles.metaItem}>
                <MapPin size={14} color="#94a3b8" />
                <span>{asset.location}</span>
              </div>
              {asset.manufacturer && (
                <div style={styles.metaItem}>
                  <Layers size={14} color="#94a3b8" />
                  <span>{asset.manufacturer}</span>
                </div>
              )}
              {asset.installationDate && (
                <div style={styles.metaItem}>
                  <Calendar size={14} color="#94a3b8" />
                  <span>Installed: {asset.installationDate}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredAssets.length === 0 && (
          <div style={styles.emptyContainer}>
            <Layers size={48} color="hsl(var(--text-dim))" />
            <p style={{ marginTop: '16px' }}>No machinery assets match your filters.</p>
          </div>
        )}
      </div>

      {/* --- REGISTER ASSET MODAL --- */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={styles.modalCard}>
            <h3 style={{ fontSize: '20px', color: 'var(--text-main)', marginBottom: '20px' }}>Register Industrial Asset</h3>
            <form onSubmit={handleCreateAsset} style={styles.formGrid}>
              <div className="form-group" style={{ gridColumn: 'span 1' }}>
                <label className="form-label">Asset Code</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. CNC-301"
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 1' }}>
                <label className="form-label">Asset Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. 5-Axis Milling Machine"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 1' }}>
                <label className="form-label">Category</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Milling, Logistics, Hydraulics"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 1' }}>
                <label className="form-label">Operating Status</label>
                <select 
                  className="form-input form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="OPERATIONAL">OPERATIONAL</option>
                  <option value="DEGRADED">DEGRADED</option>
                  <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
                  <option value="OFFLINE">OFFLINE</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 1' }}>
                <label className="form-label">Manufacturer</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Siemens, KUKA"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 1' }}>
                <label className="form-label">Installation Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={installationDate}
                  onChange={(e) => setInstallationDate(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Factory Location</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Section A - Machining Center"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: '24px' }}>
                <label className="form-label">Machine Specifications</label>
                <textarea 
                  className="form-input" 
                  rows="3"
                  placeholder="Input dimensions, electrical specifications, warning constraints..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Machine</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helpers for Asset statuses
const badgeStyle = (status) => {
  switch (status) {
    case 'OPERATIONAL':
      return { background: '#d1fae5', color: '#047857' };
    case 'DEGRADED':
      return { background: '#fef3c7', color: '#b45309' };
    case 'UNDER_MAINTENANCE':
      return { background: '#dbeafe', color: '#1d4ed8' };
    case 'OFFLINE':
      return { background: '#fee2e2', color: '#b91c1c' };
    default:
      return {};
  }
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
  filterBar: {
    display: 'flex',
    gap: '24px',
    marginBottom: '32px',
    alignItems: 'center',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-dim)',
  },
  filterWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  filterIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-dim)',
    pointerEvents: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  assetCode: {
    fontFamily: 'var(--font-family-title)',
    fontWeight: '700',
    fontSize: '15px',
    color: 'var(--primary)',
    letterSpacing: '0.05em',
  },
  assetName: {
    fontSize: '18px',
    color: 'var(--text-main)',
    marginBottom: '10px',
  },
  description: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    flexGrow: 1,
    marginBottom: '20px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  metaSection: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  emptyContainer: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px',
    color: 'var(--text-dim)',
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
    maxWidth: '560px',
    padding: '32px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  modalActions: {
    gridColumn: 'span 2',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '12px',
  }
};

export default Assets;
