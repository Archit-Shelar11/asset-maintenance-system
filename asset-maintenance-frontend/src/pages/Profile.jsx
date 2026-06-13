import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Shield, Mail, Calendar, Info, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  // Custom role-based details for factories
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-amber-500/10 text-amber-700 border-amber-200';
      case 'MANAGER':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'TECHNICIAN':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-500/10 text-slate-700 border-slate-200';
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Full administrative control of the system, including system audit configurations, user role re-assignment, database monitoring, and master entity settings.';
      case 'MANAGER':
        return 'Responsible for overseeing asset status operational levels, task scheduling, assigning work orders to technicians, reviewing service reports, and approving material request costs.';
      case 'TECHNICIAN':
        return 'In charge of physical repairs on the factory floor, reporting tool states, submitting detailed service diagnostic reports, and requesting material supplies.';
      default:
        return 'Factory Floor Operator. Empowered to report machinery faults, initiate immediate maintenance request orders, and track active request updates.';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Cover */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-8 md:p-12 text-white shadow-lg shadow-blue-500/10">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -top-10 w-44 h-44 bg-white/5 rounded-full blur-2xl"></div>

        <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Avatar Circle */}
          <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-3xl font-black shadow-inner shrink-0 animate-pulse-slow">
            {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : <UserIcon className="h-10 w-10" />}
          </div>

          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 tracking-wider uppercase">
              {user?.role || 'USER'}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">{user?.fullName}</h1>
            <p className="text-white/80 text-sm font-medium flex items-center justify-center md:justify-start gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <span>{user?.email}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Profile Details Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
              Account Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 p-4 bg-slate-50/60 border border-slate-100 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Account Status</span>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-800">Active</span>
                </div>
              </div>

              <div className="space-y-1.5 p-4 bg-slate-50/60 border border-slate-100 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">System ID</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono font-bold text-slate-800">#{user?.id || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-1.5 p-4 bg-slate-50/60 border border-slate-100 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Full Name</span>
                <div className="text-sm font-bold text-slate-800 mt-1">{user?.fullName}</div>
              </div>

              <div className="space-y-1.5 p-4 bg-slate-50/60 border border-slate-100 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Registered Email</span>
                <div className="text-sm font-bold text-slate-800 mt-1">{user?.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Role Permissions Summary Card */}
        <div className="space-y-8">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Security & Roles</h3>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Assigned Role</span>
                <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold border tracking-wider uppercase ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role || 'USER'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Role Responsibilities</span>
                <p className="text-xs leading-relaxed text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {getRoleDescription(user?.role)}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-amber-600 font-medium">
                <Info className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>If you require modifications to your access level or permissions, please contact your factory system administrator.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
