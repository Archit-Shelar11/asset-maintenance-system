import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Plus, Search, Filter, AlertTriangle, Layers, Calendar, MapPin, Tag, X } from 'lucide-react';

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
  const [assetCode, setAssetCode] = useState('');
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

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter ? asset.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500 font-semibold">
        Loading asset database...
      </div>
    );
  }

  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Asset Registry</h1>
          <p className="text-sm text-slate-500 mt-1">Track, manage, and inspect factory machinery and physical assets.</p>
        </div>

        {isManagerOrAdmin && (
          <button 
            onClick={() => setShowModal(true)} 
            className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Register New Asset</span>
          </button>
        )}
      </header>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm font-medium">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex items-center flex-grow w-full">
          <Search className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50"
            placeholder="Search by code, name, location or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative flex items-center w-full sm:w-[200px] shrink-0">
          <Filter className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-600 focus:bg-white"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-300 transition-all p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-xs text-blue-600 tracking-wider uppercase">
                  {asset.assetCode}
                </span>
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                    asset.status === 'OPERATIONAL'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/40'
                      : asset.status === 'DEGRADED'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/40'
                      : asset.status === 'UNDER_MAINTENANCE'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/40'
                      : 'bg-rose-50 text-rose-700 border border-rose-200/40'
                  }`}
                >
                  {asset.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{asset.assetName}</h3>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                {asset.description || 'No description available for this machine.'}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4 flex flex-col gap-2.5 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                <span>{asset.category}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{asset.location}</span>
              </div>

              {asset.manufacturer && (
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-slate-400" />
                  <span>{asset.manufacturer}</span>
                </div>
              )}

              {asset.installationDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Installed: {asset.installationDate}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredAssets.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <Layers className="h-12 w-12 text-slate-300" />
            <p className="text-sm font-medium">No machinery assets match your filters.</p>
          </div>
        )}
      </div>

      {/* Register Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-[1000] p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Register Industrial Asset</h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Asset Code</label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-850 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. CNC-301"
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Asset Name</label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-850 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. 5-Axis Milling Machine"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Category</label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-850 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. Milling, Logistics, Hydraulics"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Operating Status</label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-850 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="OPERATIONAL">OPERATIONAL</option>
                  <option value="DEGRADED">DEGRADED</option>
                  <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
                  <option value="OFFLINE">OFFLINE</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Manufacturer</label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-850 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. Siemens, KUKA"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Installation Date</label>
                <input
                  type="date"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-850 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  value={installationDate}
                  onChange={(e) => setInstallationDate(e.target.value)}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Factory Location</label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-850 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. Section A - Machining Center"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Machine Specifications</label>
                <textarea
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-850 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  rows="3"
                  placeholder="Input dimensions, electrical specifications, warning constraints..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-sm shadow-blue-500/10"
                >
                  Save Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
