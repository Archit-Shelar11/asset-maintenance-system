# Asset Maintenance Automation System - Full Codebase Source Code

This document contains the complete, unabridged source code for every file in both the Spring Boot backend and the React/Vite frontend. Use this file to review, search, and export the entire project structure.

## Architecture and Structure Overview

# Asset Maintenance Automation System - Code Context

## 1. Project Overview
The Asset Maintenance Management System is a full-stack web application designed to automate and streamline the maintenance workflow for factory machinery. It consists of:
- **Backend**: Spring Boot application exposing RESTful APIs.
- **Frontend**: React application (built with Vite) that provides role-based user interfaces.

## 2. High-Level Architecture
- **React Frontend**: Renders UI based on user role (Operator, Tech, Manager, Admin). Axios client intercepts and attaches HTTP Basic Auth token headers.
- **Spring Boot Backend**: Runs on Port 8080. Validates Basic Auth tokens. Secures endpoints via method-level privileges. Handles business logic and JPA/Hibernate mapping.
- **Database**: H2/MySQL database to store Assets, Maintenance Tasks, Materials, Users, Roles, and History.

## 3. Backend (Spring Boot)
Directory: `asset-maintenance`

### Tech Stack
- **Framework**: Spring Boot (Java)
- **Security**: Spring Security (Basic Auth, Method-level security)
- **Data Access**: Spring Data JPA / Hibernate
- **Database**: Relational Database (H2/MySQL)

### Key Components
- **Controllers**: Handle HTTP requests. Route APIs for `Asset`, `Task`, `Material`, `User`, `Notification`, and `TaskDiscussion`.
- **Services**: Execute business logic. Includes specialised services like `PdfReportService` (generates PDF work summaries), `NotificationService` (real-time notification triggers), `TaskDiscussionService` (discussion thread updates), and `TaskHistoryService` (audit trail logging).
- **Repositories**: JPA interfaces for data persistence.
- **Entities / DTOs**: Define the data models including `User`, `Role`, `UserRole`, `Asset`, `MaintenanceTask`, `ServiceReport`, `MaterialRequest`, `Attachment`, `Notification`, `TaskDiscussion`, and `TaskHistory`.

### Key Workflows
- **Roles**: OPERATOR, MANAGER, TECHNICIAN, ADMIN.
- **State Machine**: Tasks progress through states like `REPORTED`, `ASSIGNED`, `IN_PROGRESS`, `MATERIAL_REQUESTED`, `COMPLETED`, `CLOSED`.

## 4. Frontend (React / Vite)
Directory: `asset-maintenance-frontend`

### Tech Stack
- **Framework**: React with Vite
- **Routing**: React Router (`ProtectedRoute` for role-based access control)
- **HTTP Client**: Axios (configured with interceptors)
- **Styling**: TailwindCSS / Custom CSS

### Directory Structure & Components
- **`src/assets/`**: Static assets (images, icons).
- **`src/components/`**: 
  - `Layout.jsx`: Main UI wrapper with navigation, quick task reporting popup, and real-time notification alerts.
  - `ProtectedRoute.jsx`: Wrapper to restrict access to authenticated users based on their role.
  - **`dashboard/`**:
    - `OperatorDashboard.jsx`: Operator panel for reporting and viewing statuses.
    - `TechnicianDashboard.jsx`: Technician work queue and tasks.
    - `ManagerDashboard.jsx`: Manager console for assignment, approvals, and metrics.
- **`src/context/`**:
  - `AuthContext.jsx`: Manages global authentication state, user login, logout, and role information.
- **`src/pages/`**:
  - `Login.jsx`: User authentication page.
  - `Dashboard.jsx`: Parent dashboard routing to role-specific sub-dashboards.
  - `Assets.jsx`: Asset management view.
  - `TaskDetail.jsx`: Detailed view for a specific task supporting image uploads, discussion timeline, service report submission, spare part requests, and state changes.
  - `AdminDashboard.jsx`: Administrative actions like managing users, roles, and status changes.
  - `Profile.jsx`: User profile detail page.

## 5. Security Flow
1. User logs in via the Frontend (`Login.jsx`).
2. `AuthContext` stores the credentials and updates Axios default headers for Basic Auth.
3. Every subsequent API call to the Backend includes the `Authorization` header.
4. Backend's `Spring Security Filter Chain` intercepts the request, validates the credentials against the database, and populates the `SecurityContext`.
5. The `@PreAuthorize` annotations on Controller endpoints verify if the user's role matches the required role for the specific action.

## 6. System Features Overview
1.  **Work Order Lifecycle State Machine**: Strict, role-enforced state transitions (`REPORTED` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED` $\rightarrow$ `APPROVED`/`REJECTED`). Prevents illegal modifications using backend validation checks.
2.  **Technician Service Reports**: Form fields for technicians to log root causes, work performed, action durations, and future recommendations when marking tasks as `COMPLETED`.
3.  **Material & Spare Parts Request Pipeline**: Technicians request materials during repair, which are held in a pending state until approved or rejected by floor managers or admins.
4.  **Real-Time & Persistent Notifications**: Users receive immediate visual alerts (and persistent notification drawer logs) when assigned to a task, when tasks are completed, or when material requests are reviewed.
5.  **Interactive Task Discussion Timeline**: Direct message board thread inside each task details view, allowing technicians, operators, and managers to communicate in real-time.
6.  **Multipart Attachment Support**: Enables uploading images or documentation during task reporting or service completion, storing them securely in the upload directory and mapping references.
7.  **Task History Audit Trail**: Tracks every status transition, assignment change, approval remarks, and user intervention in a database log table for administrative oversight.
8.  **Professional PDF Work Summaries**: One-click generation of PDF summaries using OpenPDF, compiling the task details, asset information, service report diagnostics, and requested materials.
9.  **Interactive Dashboard Panel Layout**: Tailored, role-based interfaces with real-time floor metrics and stats (Operator, Technician, Manager, Admin panels).
10. **Floor Admin Panel**: Administrative tools allowing administrators to modify user roles, assign tasks, review/approve material requests, and override task status configurations.


---

## Source Code Files

### File: `README.md`

```markdown
## 📌 Project Overview

The **Asset Maintenance Management System** is a full-stack web application
designed to automate and streamline the maintenance workflow for factory
machinery. It enables users to report issues, technicians to resolve them,
and managers to oversee the entire process — all in one place.
```

---

### File: `asset-maintenance-frontend/.gitignore`

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

---

### File: `asset-maintenance-frontend/README.md`

```markdown
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
```

---

### File: `asset-maintenance-frontend/eslint.config.js`

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
```

---

### File: `asset-maintenance-frontend/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Asset Maintenance System | Industrial IoT Dashboard</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

### File: `asset-maintenance-frontend/package.json`

```json
{
  "name": "asset-maintenance-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.3.0",
    "axios": "^1.17.0",
    "lucide-react": "^1.17.0",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-router-dom": "^7.17.0",
    "tailwindcss": "^4.3.0"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.3.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "jsdom": "^29.1.1",
    "vite": "^8.0.12",
    "vitest": "^4.1.8"
  }
}
```

---

### File: `asset-maintenance-frontend/src/App.css`

```css
/* Blanked to prevent default styles from conflicting with custom index.css design system */
```

---

### File: `asset-maintenance-frontend/src/App.jsx`

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Assets from './pages/Assets';
import TaskDetail from './pages/TaskDetail';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Main Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard (Home) */}
            <Route index element={<Dashboard />} />

            {/* Admin Panel */}
            <Route path="admin" element={<AdminDashboard />} />

            {/* Assets */}
            <Route path="assets" element={<Assets />} />

            {/* Task Detail */}
            <Route path="tasks/:id" element={<TaskDetail />} />

            {/* User Profile */}
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

---

### File: `asset-maintenance-frontend/src/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080'
    : 'https://asset-maintenance-system-ftim.onrender.com',
  timeout: 60000,
});

api.interceptors.request.use(
  (config) => {
    const authHeader = localStorage.getItem('authHeader');
    if (authHeader) {
      config.headers.Authorization = authHeader;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

---

### File: `asset-maintenance-frontend/src/components/Layout.jsx`

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { 
  LayoutDashboard, 
  Wrench, 
  LogOut, 
  User as UserIcon, 
  Layers,
  Shield,
  Plus,
  X,
  Send,
  Bell,
  Check,
  CheckCheck,
  Image as ImageIcon
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notificationRef = useRef(null);

  // Modals & States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [assets, setAssets] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [assetId, setAssetId] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (showTaskModal) {
      fetchAssets();
    }
  }, [showTaskModal]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);

    // Close notifications popover on click outside
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data);
    } catch (err) {
      console.error('Failed to fetch assets', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleReportTask = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !assetId || !description) {
      setError('Please fill in all fields to report a task');
      return;
    }

    setSubmitting(true);
    try {
      const taskRes = await api.post('/tasks', {
        title,
        description,
        priority,
        assetId: parseInt(assetId, 10),
      });

      const newTaskId = taskRes.data.id;

      if (attachmentFile) {
        const formData = new FormData();
        formData.append('file', attachmentFile);
        formData.append('type', 'INITIAL_REPORT');
        await api.post(`/tasks/${newTaskId}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setTitle('');
      setDescription('');
      setPriority('LOW');
      setAssetId('');
      setAttachmentFile(null);
      setShowTaskModal(false);

      // Trigger immediate update on dashboards
      window.dispatchEvent(new CustomEvent('task-created'));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit maintenance task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex min-h-screen w-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-[280px] bg-white border-r border-slate-200/80 flex flex-col p-6 h-screen sticky top-0 shrink-0 z-50">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
            <Wrench className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">AM Automation</h2>
        </div>

        {/* User Card inside Sidebar */}
        <NavLink 
          to="/profile"
          className={({ isActive }) => 
            `flex items-center gap-3 p-4 border rounded-2xl mb-6 overflow-hidden transition-all duration-200 hover:bg-slate-50 cursor-pointer ${
              isActive 
                ? 'bg-blue-50/50 border-blue-200 shadow-xs' 
                : 'bg-slate-50 border-slate-200/60'
            }`
          }
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <UserIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="text-sm font-bold text-slate-900 truncate">{user?.fullName}</div>
            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            <div className="mt-1.5 flex">
              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 tracking-wide uppercase">
                {user?.role}
              </span>
            </div>
          </div>
        </NavLink>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5 flex-grow">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-blue-50/80 border-l-4 border-blue-600 text-blue-600 pl-3' 
                  : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
              }`
            }
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/assets" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-blue-50/80 border-l-4 border-blue-600 text-blue-600 pl-3' 
                  : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
              }`
            }
          >
            <Layers className="h-4.5 w-4.5" />
            <span>Assets</span>
          </NavLink>

          {user?.role === 'ADMIN' && (
            <NavLink 
              to="/admin" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-blue-50/80 border-l-4 border-blue-600 text-blue-600 pl-3' 
                    : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                }`
              }
            >
              <Shield className="h-4.5 w-4.5" />
              <span>Admin Panel</span>
            </NavLink>
          )}

          {/* Global Report Task Button */}
          <button 
            onClick={() => setShowTaskModal(true)} 
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm shadow-blue-500/10 transition-all cursor-pointer focus:ring-4 focus:ring-blue-100"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Report Task</span>
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto pt-4 border-t border-slate-200/80">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3 w-full bg-transparent hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-grow overflow-y-auto h-screen flex flex-col">
        {/* Header containing Welcome and Notification Bell */}
        <header className="bg-white border-b border-slate-250/70 px-10 py-4 flex items-center justify-between shrink-0">
          <div className="text-sm font-semibold text-slate-500">
            Welcome back, <span className="text-slate-800 font-extrabold">{user?.fullName}</span>
          </div>

          <div className="flex items-center gap-4 relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer focus:outline-none"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[420px] animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center shrink-0">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold transition-all bg-transparent border-none outline-none cursor-pointer flex items-center gap-1"
                    >
                      <CheckCheck className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto flex-grow divide-y divide-slate-100">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 flex gap-3 text-left transition-all ${
                        item.read ? 'bg-white' : 'bg-blue-50/20'
                      }`}
                    >
                      <div className="flex-grow space-y-1">
                        <p className={`text-xs leading-relaxed ${item.read ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>
                          {item.message}
                        </p>
                        <span className="text-[9px] text-slate-400 block font-medium">
                          {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!item.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          className="shrink-0 p-1 bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-400 rounded-lg transition-all cursor-pointer"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-slate-400 space-y-2">
                      <Bell className="h-8 w-8 text-slate-300" />
                      <p className="text-xs font-medium">You have no notifications yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="p-10 max-w-7xl w-full mx-auto flex-grow">
          <Outlet />
        </div>
      </main>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-[1000] p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Report Maintenance Request</h3>
              <button 
                onClick={() => {
                  setShowTaskModal(false);
                  setAttachmentFile(null);
                  setError('');
                }} 
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-semibold animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleReportTask} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Asset Machine</label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  required
                >
                  <option value="">Select Affected Machine...</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.assetName} ({asset.assetCode}) - {asset.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Issue Title</label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  placeholder="e.g. Hydraulic pump pressure loss"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Priority Severity</label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  required
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Detailed Description</label>
                <textarea
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  rows="3"
                  placeholder="Describe the issue symptoms, steps leading to the fault..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Upload screenshot evidence */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Screenshot / Evidence Photo (Optional)</label>
                <div className="relative flex items-center">
                  <ImageIcon className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2 text-xs text-slate-700 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    onChange={(e) => setAttachmentFile(e.target.files[0])}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-semibold text-sm transition-all shadow-sm shadow-blue-500/10 cursor-pointer disabled:cursor-not-allowed" 
                disabled={submitting}
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
```

---

### File: `asset-maintenance-frontend/src/components/ProtectedRoute.jsx`

```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    // Redirect unauthenticated users to Login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized roles back to the main dashboard
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

---

### File: `asset-maintenance-frontend/src/components/ProtectedRoute.test.jsx`

```jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { expect, test, describe, vi } from 'vitest';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute Component', () => {
  test('redirects unauthenticated users to /login', () => {
    // Mock user as null (not logged in)
    useAuth.mockReturnValue({ user: null });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Should render the Login Page content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('allows authenticated users to view protected content', () => {
    // Mock user as logged in
    useAuth.mockReturnValue({ 
      user: { id: 1, fullName: 'Arjun Patil', email: 'tech@factory.com', role: 'TECHNICIAN' } 
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Should render protected content, not redirect to login
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  test('redirects unauthorized roles to dashboard index "/"', () => {
    // Mock user role as TECHNICIAN, but only ADMIN is allowed
    useAuth.mockReturnValue({ 
      user: { id: 1, fullName: 'Arjun Patil', email: 'tech@factory.com', role: 'TECHNICIAN' } 
    });

    render(
      <MemoryRouter initialEntries={['/admin-only']}>
        <Routes>
          <Route 
            path="/admin-only" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <div>Admin Secret Content</div>
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<div>Dashboard Home</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Should redirect to Dashboard Home
    expect(screen.queryByText('Admin Secret Content')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard Home')).toBeInTheDocument();
  });

  test('allows authorized roles to view protected content', () => {
    // Mock user role as ADMIN
    useAuth.mockReturnValue({ 
      user: { id: 2, fullName: 'Rohan Mehta', email: 'admin@factory.com', role: 'ADMIN' } 
    });

    render(
      <MemoryRouter initialEntries={['/admin-only']}>
        <Routes>
          <Route 
            path="/admin-only" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <div>Admin Secret Content</div>
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<div>Dashboard Home</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Should display the Admin secret content
    expect(screen.getByText('Admin Secret Content')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Home')).not.toBeInTheDocument();
  });
});
```

---

### File: `asset-maintenance-frontend/src/components/dashboard/ManagerDashboard.jsx`

```jsx
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
```

---

### File: `asset-maintenance-frontend/src/components/dashboard/OperatorDashboard.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Send, AlertTriangle, Search, ExternalLink } from 'lucide-react';

const OperatorDashboard = () => {
  const navigate = useNavigate();

  // State
  const [tasks, setTasks] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Report Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [assetId, setAssetId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(interval);
  }, [searchQuery, statusFilter, priorityFilter]);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const assetRes = await api.get('/assets');
      setAssets(assetRes.data);

      const params = {
        keyword: searchQuery || '',
        status: statusFilter || '',
        priority: priorityFilter || '',
      };
      const queryStr = new URLSearchParams(params).toString();
      const taskRes = await api.get(`/tasks/search?${queryStr}`);
      setTasks(taskRes.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to sync log data. Make sure backend is running.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleReportTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title || !assetId || !description) {
      setError('Please fill in all fields to report a task');
      return;
    }

    setSubmitting(true);
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
      fetchData(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit maintenance task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm font-medium">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side: Report Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Report Maintenance Request</h2>
            <p className="text-xs text-slate-500 mt-1">Submit new machine issues directly to technicians</p>
          </div>

          <form onSubmit={handleReportTask} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Affected Asset Machine</label>
              <select
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                required
              >
                <option value="">Select Affected Machine...</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.assetName} ({asset.assetCode}) - {asset.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Issue Title</label>
              <input
                type="text"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                placeholder="e.g. Hydraulic pump pressure loss"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Priority Severity</label>
              <select
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Detailed Description</label>
              <textarea
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                rows="4"
                placeholder="Describe issue symptoms, fault steps, or strange machine sounds..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-semibold text-sm transition-all focus:ring-4 focus:ring-blue-100 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Maintenance Report'}</span>
            </button>
          </form>
        </div>

        {/* Right Side: Log Feed */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Maintenance Log</h2>
              <p className="text-xs text-slate-500 mt-1">Status and feed of issue tickets reported by you</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex items-center flex-grow">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search issues..."
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

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                  <th className="px-4 py-3.5">Code</th>
                  <th className="px-4 py-3.5">Title</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-4 py-3.5 font-bold text-blue-600">{task.taskCode}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{task.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{task.asset?.assetName}</div>
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
                      <button
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <ExternalLink className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {tasks.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400 text-sm">
                      {loading ? 'Fetching tasks...' : 'No maintenance tasks logged.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;
```

---

### File: `asset-maintenance-frontend/src/components/dashboard/TechnicianDashboard.jsx`

```jsx
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
```

---

### File: `asset-maintenance-frontend/src/context/AuthContext.jsx`

```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);



  // Initialize auth state on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAuthHeader = localStorage.getItem('authHeader');

    if (storedUser && storedAuthHeader) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const credentials = btoa(`${email}:${password}`);
      const header = `Basic ${credentials}`;

      // Check credentials and fetch logged-in user profile
      const response = await API.get('/users/me', {
        headers: { Authorization: header },
      });

      const userProfile = response.data;

      localStorage.setItem('authHeader', header);
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Invalid email or password';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authHeader');
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = async (fullName, email, password) => {
    try {
      // Register user
      await API.post('/users/register', {
        fullName,
        email,
        password,
      });

      // Auto-login after successful registration
      return await login(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Registration failed';
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

### File: `asset-maintenance-frontend/src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');
@import "tailwindcss";

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background-color: #f8fafc; /* bg-slate-50 */
  color: #0f172a; /* text-slate-900 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Outfit', -apple-system, sans-serif;
  letter-spacing: -0.01em;
  color: #0f172a;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #f8fafc;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Custom Fade-in Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.97) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

---

### File: `asset-maintenance-frontend/src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

### File: `asset-maintenance-frontend/src/pages/AdminDashboard.jsx`

```jsx
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
```

---

### File: `asset-maintenance-frontend/src/pages/Assets.jsx`

```jsx
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
```

---

### File: `asset-maintenance-frontend/src/pages/Dashboard.jsx`

```jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import OperatorDashboard from '../components/dashboard/OperatorDashboard';
import TechnicianDashboard from '../components/dashboard/TechnicianDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as:{' '}
            <span className="text-blue-600 font-semibold">{user?.fullName}</span>{' '}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60 uppercase ml-2">
              {user?.role}
            </span>
          </p>
        </div>
      </header>

      {user?.role === 'USER' && <OperatorDashboard />}
      {user?.role === 'TECHNICIAN' && <TechnicianDashboard />}
      {user?.role === 'MANAGER' && <ManagerDashboard />}
      {!['USER', 'TECHNICIAN', 'MANAGER'].includes(user?.role) && (
        <div className="p-8 text-center text-slate-500 font-medium bg-white border border-slate-200 rounded-2xl">
          Logged in as Administrator. Please navigate to the Admin Panel.
        </div>
      )}
    </div>
  );
};

export default Dashboard;
```

---

### File: `asset-maintenance-frontend/src/pages/Login.jsx`

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister) {
      if (!fullName || !email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      const res = await register(fullName, email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error);
      }
    } else {
      if (!email || !password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen p-6 bg-slate-50">
      <div className="w-full max-w-[440px] bg-white border border-slate-200/80 rounded-2xl shadow-sm p-10 space-y-8 animate-fade-in">
        {/* Header Logo */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
            <Wrench className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Asset Maintenance</h1>
            <p className="text-sm text-slate-500 mt-1">Automation System Portal</p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm font-medium animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Full Name</label>
              <div className="relative flex items-center">
                <UserIcon className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                placeholder="operator@factory.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="password"
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-semibold text-sm transition-all focus:ring-4 focus:ring-blue-100 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center text-sm text-slate-500">
          {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-blue-650 hover:text-blue-805 font-bold transition-all ml-1 cursor-pointer bg-transparent border-none outline-none"
          >
            {isRegister ? 'Sign In' : 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

---

### File: `asset-maintenance-frontend/src/pages/Profile.jsx`

```jsx
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
```

---

### File: `asset-maintenance-frontend/src/pages/Profile.test.jsx`

```jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Profile from './Profile';
import { useAuth } from '../context/AuthContext';
import { expect, test, describe, vi } from 'vitest';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Profile Page Component', () => {
  test('renders profile info for a Technician user', () => {
    // Mock Technician user
    useAuth.mockReturnValue({
      user: {
        id: 42,
        fullName: 'Arjun Patil',
        email: 'arjun@factory.com',
        role: 'TECHNICIAN'
      }
    });

    render(<Profile />);

    // Assert name and email are displayed
    expect(screen.getAllByText('Arjun Patil')[0]).toBeInTheDocument();
    expect(screen.getAllByText('arjun@factory.com')[0]).toBeInTheDocument();
    
    // Assert status and ID are displayed
    expect(screen.getByText('#42')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();

    // Assert role badge is displayed
    const badgeElements = screen.getAllByText('TECHNICIAN');
    expect(badgeElements.length).toBeGreaterThan(0);

    // Assert role-based responsibilities text exists
    expect(screen.getByText(/In charge of physical repairs on the factory floor/i)).toBeInTheDocument();
  });

  test('renders profile info for a Manager user', () => {
    // Mock Manager user
    useAuth.mockReturnValue({
      user: {
        id: 10,
        fullName: 'Aarav Sharma',
        email: 'aarav@factory.com',
        role: 'MANAGER'
      }
    });

    render(<Profile />);

    // Assert name and email are displayed
    expect(screen.getAllByText('Aarav Sharma')[0]).toBeInTheDocument();
    expect(screen.getAllByText('aarav@factory.com')[0]).toBeInTheDocument();
    
    // Assert status and ID are displayed
    expect(screen.getByText('#10')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();

    // Assert role-based responsibilities text exists
    expect(screen.getByText(/Responsible for overseeing asset status operational levels/i)).toBeInTheDocument();
  });
});
```

---

### File: `asset-maintenance-frontend/src/pages/TaskDetail.jsx`

```jsx
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
```

---

### File: `asset-maintenance-frontend/src/setupTests.js`

```javascript
import '@testing-library/jest-dom';
```

---

### File: `asset-maintenance-frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/users': 'http://localhost:8080',
      '/tasks': 'http://localhost:8080',
      '/materials': 'http://localhost:8080',
      '/assets': 'http://localhost:8080'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  }
})
```

---

### File: `asset-maintenance/.gitattributes`

```
/mvnw text eol=lf
*.cmd text eol=crlf
```

---

### File: `asset-maintenance/.gitignore`

```
###################################
# 🔧 GENERAL
###################################
*.log
*.tmp
*.swp
*.swo
.DS_Store
Thumbs.db

###################################
# 🧠 IDE FILES (DO NOT PUSH)
###################################
.idea/
.vscode/
*.iml

###################################
# 🟢 SPRING BOOT (BACKEND)
###################################
# Maven
target/
!.mvn/wrapper/maven-wrapper.jar

# Build artifacts
*.jar
*.war

# Logs
logs/

# Local uploads (VERY IMPORTANT)
uploads/

###################################
# 🟢 REACT / FRONTEND
###################################
node_modules/
dist/
build/

###################################
# 🟢 ENVIRONMENT FILES
###################################
.env
.env.local
.env.*.local

###################################
# 🟢 DATABASE
###################################
*.sql
*.db

###################################
# 🐳 DOCKER (OPTIONAL)
###################################
docker-compose.override.yml

###################################
# 🔐 OS / SYSTEM FILES
###################################
*.exe
*.dll
*.class
```

---

### File: `asset-maintenance/.mvn/wrapper/maven-wrapper.properties`

```properties
wrapperVersion=3.3.4
distributionType=only-script
distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.16/apache-maven-3.9.16-bin.zip
```

---

### File: `asset-maintenance/Config.java`

```java
package com.example.asset.asset_maintenance.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173")
                        .allowedMethods("*")
                        .allowedHeaders("*");
            }
        };
    }
}
```

---

### File: `asset-maintenance/Dockerfile`

```
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
```

---

### File: `asset-maintenance/HELP.md`

```markdown
# Read Me First
The following was discovered as part of building this project:

* The original package name 'com.example.asset.asset-maintenance' is invalid and this project uses 'com.example.asset.asset_maintenance' instead.

# Getting Started

### Reference Documentation
For further reference, please consider the following sections:

* [Official Apache Maven documentation](https://maven.apache.org/guides/index.html)
* [Spring Boot Maven Plugin Reference Guide](https://docs.spring.io/spring-boot/3.5.14/maven-plugin)
* [Create an OCI image](https://docs.spring.io/spring-boot/3.5.14/maven-plugin/build-image.html)
* [Spring Web](https://docs.spring.io/spring-boot/3.5.14/reference/web/servlet.html)
* [Spring Data JPA](https://docs.spring.io/spring-boot/3.5.14/reference/data/sql.html#data.sql.jpa-and-spring-data)
* [Spring Security](https://docs.spring.io/spring-boot/3.5.14/reference/web/spring-security.html)
* [Validation](https://docs.spring.io/spring-boot/3.5.14/reference/io/validation.html)

### Guides
The following guides illustrate how to use some features concretely:

* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [Building REST services with Spring](https://spring.io/guides/tutorials/rest/)
* [Accessing Data with JPA](https://spring.io/guides/gs/accessing-data-jpa/)
* [Accessing data with MySQL](https://spring.io/guides/gs/accessing-data-mysql/)
* [Securing a Web Application](https://spring.io/guides/gs/securing-web/)
* [Spring Boot and OAuth2](https://spring.io/guides/tutorials/spring-boot-oauth2/)
* [Authenticating a User with LDAP](https://spring.io/guides/gs/authenticating-ldap/)
* [Validation](https://spring.io/guides/gs/validating-form-input/)

### Maven Parent overrides

Due to Maven's design, elements are inherited from the parent POM to the project POM.
While most of the inheritance is fine, it also inherits unwanted elements like `<license>` and `<developers>` from the parent.
To prevent this, the project POM contains empty overrides for these elements.
If you manually switch to a different parent and actually want the inheritance, you need to remove those overrides.

```

---

### File: `asset-maintenance/mvnw`

```
#!/bin/sh
# ----------------------------------------------------------------------------
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
# ----------------------------------------------------------------------------

# ----------------------------------------------------------------------------
# Apache Maven Wrapper startup batch script, version 3.3.4
#
# Optional ENV vars
# -----------------
#   JAVA_HOME - location of a JDK home dir, required when download maven via java source
#   MVNW_REPOURL - repo url base for downloading maven distribution
#   MVNW_USERNAME/MVNW_PASSWORD - user and password for downloading maven
#   MVNW_VERBOSE - true: enable verbose log; debug: trace the mvnw script; others: silence the output
# ----------------------------------------------------------------------------

set -euf
[ "${MVNW_VERBOSE-}" != debug ] || set -x

# OS specific support.
native_path() { printf %s\\n "$1"; }
case "$(uname)" in
CYGWIN* | MINGW*)
  [ -z "${JAVA_HOME-}" ] || JAVA_HOME="$(cygpath --unix "$JAVA_HOME")"
  native_path() { cygpath --path --windows "$1"; }
  ;;
esac

# set JAVACMD and JAVACCMD
set_java_home() {
  # For Cygwin and MinGW, ensure paths are in Unix format before anything is touched
  if [ -n "${JAVA_HOME-}" ]; then
    if [ -x "$JAVA_HOME/jre/sh/java" ]; then
      # IBM's JDK on AIX uses strange locations for the executables
      JAVACMD="$JAVA_HOME/jre/sh/java"
      JAVACCMD="$JAVA_HOME/jre/sh/javac"
    else
      JAVACMD="$JAVA_HOME/bin/java"
      JAVACCMD="$JAVA_HOME/bin/javac"

      if [ ! -x "$JAVACMD" ] || [ ! -x "$JAVACCMD" ]; then
        echo "The JAVA_HOME environment variable is not defined correctly, so mvnw cannot run." >&2
        echo "JAVA_HOME is set to \"$JAVA_HOME\", but \"\$JAVA_HOME/bin/java\" or \"\$JAVA_HOME/bin/javac\" does not exist." >&2
        return 1
      fi
    fi
  else
    JAVACMD="$(
      'set' +e
      'unset' -f command 2>/dev/null
      'command' -v java
    )" || :
    JAVACCMD="$(
      'set' +e
      'unset' -f command 2>/dev/null
      'command' -v javac
    )" || :

    if [ ! -x "${JAVACMD-}" ] || [ ! -x "${JAVACCMD-}" ]; then
      echo "The java/javac command does not exist in PATH nor is JAVA_HOME set, so mvnw cannot run." >&2
      return 1
    fi
  fi
}

# hash string like Java String::hashCode
hash_string() {
  str="${1:-}" h=0
  while [ -n "$str" ]; do
    char="${str%"${str#?}"}"
    h=$(((h * 31 + $(LC_CTYPE=C printf %d "'$char")) % 4294967296))
    str="${str#?}"
  done
  printf %x\\n $h
}

verbose() { :; }
[ "${MVNW_VERBOSE-}" != true ] || verbose() { printf %s\\n "${1-}"; }

die() {
  printf %s\\n "$1" >&2
  exit 1
}

trim() {
  # MWRAPPER-139:
  #   Trims trailing and leading whitespace, carriage returns, tabs, and linefeeds.
  #   Needed for removing poorly interpreted newline sequences when running in more
  #   exotic environments such as mingw bash on Windows.
  printf "%s" "${1}" | tr -d '[:space:]'
}

scriptDir="$(dirname "$0")"
scriptName="$(basename "$0")"

# parse distributionUrl and optional distributionSha256Sum, requires .mvn/wrapper/maven-wrapper.properties
while IFS="=" read -r key value; do
  case "${key-}" in
  distributionUrl) distributionUrl=$(trim "${value-}") ;;
  distributionSha256Sum) distributionSha256Sum=$(trim "${value-}") ;;
  esac
done <"$scriptDir/.mvn/wrapper/maven-wrapper.properties"
[ -n "${distributionUrl-}" ] || die "cannot read distributionUrl property in $scriptDir/.mvn/wrapper/maven-wrapper.properties"

case "${distributionUrl##*/}" in
maven-mvnd-*bin.*)
  MVN_CMD=mvnd.sh _MVNW_REPO_PATTERN=/maven/mvnd/
  case "${PROCESSOR_ARCHITECTURE-}${PROCESSOR_ARCHITEW6432-}:$(uname -a)" in
  *AMD64:CYGWIN* | *AMD64:MINGW*) distributionPlatform=windows-amd64 ;;
  :Darwin*x86_64) distributionPlatform=darwin-amd64 ;;
  :Darwin*arm64) distributionPlatform=darwin-aarch64 ;;
  :Linux*x86_64*) distributionPlatform=linux-amd64 ;;
  *)
    echo "Cannot detect native platform for mvnd on $(uname)-$(uname -m), use pure java version" >&2
    distributionPlatform=linux-amd64
    ;;
  esac
  distributionUrl="${distributionUrl%-bin.*}-$distributionPlatform.zip"
  ;;
maven-mvnd-*) MVN_CMD=mvnd.sh _MVNW_REPO_PATTERN=/maven/mvnd/ ;;
*) MVN_CMD="mvn${scriptName#mvnw}" _MVNW_REPO_PATTERN=/org/apache/maven/ ;;
esac

# apply MVNW_REPOURL and calculate MAVEN_HOME
# maven home pattern: ~/.m2/wrapper/dists/{apache-maven-<version>,maven-mvnd-<version>-<platform>}/<hash>
[ -z "${MVNW_REPOURL-}" ] || distributionUrl="$MVNW_REPOURL$_MVNW_REPO_PATTERN${distributionUrl#*"$_MVNW_REPO_PATTERN"}"
distributionUrlName="${distributionUrl##*/}"
distributionUrlNameMain="${distributionUrlName%.*}"
distributionUrlNameMain="${distributionUrlNameMain%-bin}"
MAVEN_USER_HOME="${MAVEN_USER_HOME:-${HOME}/.m2}"
MAVEN_HOME="${MAVEN_USER_HOME}/wrapper/dists/${distributionUrlNameMain-}/$(hash_string "$distributionUrl")"

exec_maven() {
  unset MVNW_VERBOSE MVNW_USERNAME MVNW_PASSWORD MVNW_REPOURL || :
  exec "$MAVEN_HOME/bin/$MVN_CMD" "$@" || die "cannot exec $MAVEN_HOME/bin/$MVN_CMD"
}

if [ -d "$MAVEN_HOME" ]; then
  verbose "found existing MAVEN_HOME at $MAVEN_HOME"
  exec_maven "$@"
fi

case "${distributionUrl-}" in
*?-bin.zip | *?maven-mvnd-?*-?*.zip) ;;
*) die "distributionUrl is not valid, must match *-bin.zip or maven-mvnd-*.zip, but found '${distributionUrl-}'" ;;
esac

# prepare tmp dir
if TMP_DOWNLOAD_DIR="$(mktemp -d)" && [ -d "$TMP_DOWNLOAD_DIR" ]; then
  clean() { rm -rf -- "$TMP_DOWNLOAD_DIR"; }
  trap clean HUP INT TERM EXIT
else
  die "cannot create temp dir"
fi

mkdir -p -- "${MAVEN_HOME%/*}"

# Download and Install Apache Maven
verbose "Couldn't find MAVEN_HOME, downloading and installing it ..."
verbose "Downloading from: $distributionUrl"
verbose "Downloading to: $TMP_DOWNLOAD_DIR/$distributionUrlName"

# select .zip or .tar.gz
if ! command -v unzip >/dev/null; then
  distributionUrl="${distributionUrl%.zip}.tar.gz"
  distributionUrlName="${distributionUrl##*/}"
fi

# verbose opt
__MVNW_QUIET_WGET=--quiet __MVNW_QUIET_CURL=--silent __MVNW_QUIET_UNZIP=-q __MVNW_QUIET_TAR=''
[ "${MVNW_VERBOSE-}" != true ] || __MVNW_QUIET_WGET='' __MVNW_QUIET_CURL='' __MVNW_QUIET_UNZIP='' __MVNW_QUIET_TAR=v

# normalize http auth
case "${MVNW_PASSWORD:+has-password}" in
'') MVNW_USERNAME='' MVNW_PASSWORD='' ;;
has-password) [ -n "${MVNW_USERNAME-}" ] || MVNW_USERNAME='' MVNW_PASSWORD='' ;;
esac

if [ -z "${MVNW_USERNAME-}" ] && command -v wget >/dev/null; then
  verbose "Found wget ... using wget"
  wget ${__MVNW_QUIET_WGET:+"$__MVNW_QUIET_WGET"} "$distributionUrl" -O "$TMP_DOWNLOAD_DIR/$distributionUrlName" || die "wget: Failed to fetch $distributionUrl"
elif [ -z "${MVNW_USERNAME-}" ] && command -v curl >/dev/null; then
  verbose "Found curl ... using curl"
  curl ${__MVNW_QUIET_CURL:+"$__MVNW_QUIET_CURL"} -f -L -o "$TMP_DOWNLOAD_DIR/$distributionUrlName" "$distributionUrl" || die "curl: Failed to fetch $distributionUrl"
elif set_java_home; then
  verbose "Falling back to use Java to download"
  javaSource="$TMP_DOWNLOAD_DIR/Downloader.java"
  targetZip="$TMP_DOWNLOAD_DIR/$distributionUrlName"
  cat >"$javaSource" <<-END
	public class Downloader extends java.net.Authenticator
	{
	  protected java.net.PasswordAuthentication getPasswordAuthentication()
	  {
	    return new java.net.PasswordAuthentication( System.getenv( "MVNW_USERNAME" ), System.getenv( "MVNW_PASSWORD" ).toCharArray() );
	  }
	  public static void main( String[] args ) throws Exception
	  {
	    setDefault( new Downloader() );
	    java.nio.file.Files.copy( java.net.URI.create( args[0] ).toURL().openStream(), java.nio.file.Paths.get( args[1] ).toAbsolutePath().normalize() );
	  }
	}
	END
  # For Cygwin/MinGW, switch paths to Windows format before running javac and java
  verbose " - Compiling Downloader.java ..."
  "$(native_path "$JAVACCMD")" "$(native_path "$javaSource")" || die "Failed to compile Downloader.java"
  verbose " - Running Downloader.java ..."
  "$(native_path "$JAVACMD")" -cp "$(native_path "$TMP_DOWNLOAD_DIR")" Downloader "$distributionUrl" "$(native_path "$targetZip")"
fi

# If specified, validate the SHA-256 sum of the Maven distribution zip file
if [ -n "${distributionSha256Sum-}" ]; then
  distributionSha256Result=false
  if [ "$MVN_CMD" = mvnd.sh ]; then
    echo "Checksum validation is not supported for maven-mvnd." >&2
    echo "Please disable validation by removing 'distributionSha256Sum' from your maven-wrapper.properties." >&2
    exit 1
  elif command -v sha256sum >/dev/null; then
    if echo "$distributionSha256Sum  $TMP_DOWNLOAD_DIR/$distributionUrlName" | sha256sum -c - >/dev/null 2>&1; then
      distributionSha256Result=true
    fi
  elif command -v shasum >/dev/null; then
    if echo "$distributionSha256Sum  $TMP_DOWNLOAD_DIR/$distributionUrlName" | shasum -a 256 -c >/dev/null 2>&1; then
      distributionSha256Result=true
    fi
  else
    echo "Checksum validation was requested but neither 'sha256sum' or 'shasum' are available." >&2
    echo "Please install either command, or disable validation by removing 'distributionSha256Sum' from your maven-wrapper.properties." >&2
    exit 1
  fi
  if [ $distributionSha256Result = false ]; then
    echo "Error: Failed to validate Maven distribution SHA-256, your Maven distribution might be compromised." >&2
    echo "If you updated your Maven version, you need to update the specified distributionSha256Sum property." >&2
    exit 1
  fi
fi

# unzip and move
if command -v unzip >/dev/null; then
  unzip ${__MVNW_QUIET_UNZIP:+"$__MVNW_QUIET_UNZIP"} "$TMP_DOWNLOAD_DIR/$distributionUrlName" -d "$TMP_DOWNLOAD_DIR" || die "failed to unzip"
else
  tar xzf${__MVNW_QUIET_TAR:+"$__MVNW_QUIET_TAR"} "$TMP_DOWNLOAD_DIR/$distributionUrlName" -C "$TMP_DOWNLOAD_DIR" || die "failed to untar"
fi

# Find the actual extracted directory name (handles snapshots where filename != directory name)
actualDistributionDir=""

# First try the expected directory name (for regular distributions)
if [ -d "$TMP_DOWNLOAD_DIR/$distributionUrlNameMain" ]; then
  if [ -f "$TMP_DOWNLOAD_DIR/$distributionUrlNameMain/bin/$MVN_CMD" ]; then
    actualDistributionDir="$distributionUrlNameMain"
  fi
fi

# If not found, search for any directory with the Maven executable (for snapshots)
if [ -z "$actualDistributionDir" ]; then
  # enable globbing to iterate over items
  set +f
  for dir in "$TMP_DOWNLOAD_DIR"/*; do
    if [ -d "$dir" ]; then
      if [ -f "$dir/bin/$MVN_CMD" ]; then
        actualDistributionDir="$(basename "$dir")"
        break
      fi
    fi
  done
  set -f
fi

if [ -z "$actualDistributionDir" ]; then
  verbose "Contents of $TMP_DOWNLOAD_DIR:"
  verbose "$(ls -la "$TMP_DOWNLOAD_DIR")"
  die "Could not find Maven distribution directory in extracted archive"
fi

verbose "Found extracted Maven distribution directory: $actualDistributionDir"
printf %s\\n "$distributionUrl" >"$TMP_DOWNLOAD_DIR/$actualDistributionDir/mvnw.url"
mv -- "$TMP_DOWNLOAD_DIR/$actualDistributionDir" "$MAVEN_HOME" || [ -d "$MAVEN_HOME" ] || die "fail to move MAVEN_HOME"

clean || :
exec_maven "$@"
```

---

### File: `asset-maintenance/mvnw.cmd`

```powershell
<# : batch portion
@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.3.4
@REM
@REM Optional ENV vars
@REM   MVNW_REPOURL - repo url base for downloading maven distribution
@REM   MVNW_USERNAME/MVNW_PASSWORD - user and password for downloading maven
@REM   MVNW_VERBOSE - true: enable verbose log; others: silence the output
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET __MVNW_CMD__=
@SET __MVNW_ERROR__=
@SET __MVNW_PSMODULEP_SAVE=%PSModulePath%
@SET PSModulePath=
@FOR /F "usebackq tokens=1* delims==" %%A IN (`powershell -noprofile "& {$scriptDir='%~dp0'; $script='%__MVNW_ARG0_NAME__%'; icm -ScriptBlock ([Scriptblock]::Create((Get-Content -Raw '%~f0'))) -NoNewScope}"`) DO @(
  IF "%%A"=="MVN_CMD" (set __MVNW_CMD__=%%B) ELSE IF "%%B"=="" (echo %%A) ELSE (echo %%A=%%B)
)
@SET PSModulePath=%__MVNW_PSMODULEP_SAVE%
@SET __MVNW_PSMODULEP_SAVE=
@SET __MVNW_ARG0_NAME__=
@SET MVNW_USERNAME=
@SET MVNW_PASSWORD=
@IF NOT "%__MVNW_CMD__%"=="" ("%__MVNW_CMD__%" %*)
@echo Cannot start maven from wrapper >&2 && exit /b 1
@GOTO :EOF
: end batch / begin powershell #>

$ErrorActionPreference = "Stop"
if ($env:MVNW_VERBOSE -eq "true") {
  $VerbosePreference = "Continue"
}

# calculate distributionUrl, requires .mvn/wrapper/maven-wrapper.properties
$distributionUrl = (Get-Content -Raw "$scriptDir/.mvn/wrapper/maven-wrapper.properties" | ConvertFrom-StringData).distributionUrl
if (!$distributionUrl) {
  Write-Error "cannot read distributionUrl property in $scriptDir/.mvn/wrapper/maven-wrapper.properties"
}

switch -wildcard -casesensitive ( $($distributionUrl -replace '^.*/','') ) {
  "maven-mvnd-*" {
    $USE_MVND = $true
    $distributionUrl = $distributionUrl -replace '-bin\.[^.]*$',"-windows-amd64.zip"
    $MVN_CMD = "mvnd.cmd"
    break
  }
  default {
    $USE_MVND = $false
    $MVN_CMD = $script -replace '^mvnw','mvn'
    break
  }
}

# apply MVNW_REPOURL and calculate MAVEN_HOME
# maven home pattern: ~/.m2/wrapper/dists/{apache-maven-<version>,maven-mvnd-<version>-<platform>}/<hash>
if ($env:MVNW_REPOURL) {
  $MVNW_REPO_PATTERN = if ($USE_MVND -eq $False) { "/org/apache/maven/" } else { "/maven/mvnd/" }
  $distributionUrl = "$env:MVNW_REPOURL$MVNW_REPO_PATTERN$($distributionUrl -replace "^.*$MVNW_REPO_PATTERN",'')"
}
$distributionUrlName = $distributionUrl -replace '^.*/',''
$distributionUrlNameMain = $distributionUrlName -replace '\.[^.]*$','' -replace '-bin$',''

$MAVEN_M2_PATH = "$HOME/.m2"
if ($env:MAVEN_USER_HOME) {
  $MAVEN_M2_PATH = "$env:MAVEN_USER_HOME"
}

if (-not (Test-Path -Path $MAVEN_M2_PATH)) {
    New-Item -Path $MAVEN_M2_PATH -ItemType Directory | Out-Null
}

$MAVEN_WRAPPER_DISTS = $null
if ((Get-Item $MAVEN_M2_PATH).Target[0] -eq $null) {
  $MAVEN_WRAPPER_DISTS = "$MAVEN_M2_PATH/wrapper/dists"
} else {
  $MAVEN_WRAPPER_DISTS = (Get-Item $MAVEN_M2_PATH).Target[0] + "/wrapper/dists"
}

$MAVEN_HOME_PARENT = "$MAVEN_WRAPPER_DISTS/$distributionUrlNameMain"
$MAVEN_HOME_NAME = ([System.Security.Cryptography.SHA256]::Create().ComputeHash([byte[]][char[]]$distributionUrl) | ForEach-Object {$_.ToString("x2")}) -join ''
$MAVEN_HOME = "$MAVEN_HOME_PARENT/$MAVEN_HOME_NAME"

if (Test-Path -Path "$MAVEN_HOME" -PathType Container) {
  Write-Verbose "found existing MAVEN_HOME at $MAVEN_HOME"
  Write-Output "MVN_CMD=$MAVEN_HOME/bin/$MVN_CMD"
  exit $?
}

if (! $distributionUrlNameMain -or ($distributionUrlName -eq $distributionUrlNameMain)) {
  Write-Error "distributionUrl is not valid, must end with *-bin.zip, but found $distributionUrl"
}

# prepare tmp dir
$TMP_DOWNLOAD_DIR_HOLDER = New-TemporaryFile
$TMP_DOWNLOAD_DIR = New-Item -Itemtype Directory -Path "$TMP_DOWNLOAD_DIR_HOLDER.dir"
$TMP_DOWNLOAD_DIR_HOLDER.Delete() | Out-Null
trap {
  if ($TMP_DOWNLOAD_DIR.Exists) {
    try { Remove-Item $TMP_DOWNLOAD_DIR -Recurse -Force | Out-Null }
    catch { Write-Warning "Cannot remove $TMP_DOWNLOAD_DIR" }
  }
}

New-Item -Itemtype Directory -Path "$MAVEN_HOME_PARENT" -Force | Out-Null

# Download and Install Apache Maven
Write-Verbose "Couldn't find MAVEN_HOME, downloading and installing it ..."
Write-Verbose "Downloading from: $distributionUrl"
Write-Verbose "Downloading to: $TMP_DOWNLOAD_DIR/$distributionUrlName"

$webclient = New-Object System.Net.WebClient
if ($env:MVNW_USERNAME -and $env:MVNW_PASSWORD) {
  $webclient.Credentials = New-Object System.Net.NetworkCredential($env:MVNW_USERNAME, $env:MVNW_PASSWORD)
}
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$webclient.DownloadFile($distributionUrl, "$TMP_DOWNLOAD_DIR/$distributionUrlName") | Out-Null

# If specified, validate the SHA-256 sum of the Maven distribution zip file
$distributionSha256Sum = (Get-Content -Raw "$scriptDir/.mvn/wrapper/maven-wrapper.properties" | ConvertFrom-StringData).distributionSha256Sum
if ($distributionSha256Sum) {
  if ($USE_MVND) {
    Write-Error "Checksum validation is not supported for maven-mvnd. `nPlease disable validation by removing 'distributionSha256Sum' from your maven-wrapper.properties."
  }
  Import-Module $PSHOME\Modules\Microsoft.PowerShell.Utility -Function Get-FileHash
  if ((Get-FileHash "$TMP_DOWNLOAD_DIR/$distributionUrlName" -Algorithm SHA256).Hash.ToLower() -ne $distributionSha256Sum) {
    Write-Error "Error: Failed to validate Maven distribution SHA-256, your Maven distribution might be compromised. If you updated your Maven version, you need to update the specified distributionSha256Sum property."
  }
}

# unzip and move
Expand-Archive "$TMP_DOWNLOAD_DIR/$distributionUrlName" -DestinationPath "$TMP_DOWNLOAD_DIR" | Out-Null

# Find the actual extracted directory name (handles snapshots where filename != directory name)
$actualDistributionDir = ""

# First try the expected directory name (for regular distributions)
$expectedPath = Join-Path "$TMP_DOWNLOAD_DIR" "$distributionUrlNameMain"
$expectedMvnPath = Join-Path "$expectedPath" "bin/$MVN_CMD"
if ((Test-Path -Path $expectedPath -PathType Container) -and (Test-Path -Path $expectedMvnPath -PathType Leaf)) {
  $actualDistributionDir = $distributionUrlNameMain
}

# If not found, search for any directory with the Maven executable (for snapshots)
if (!$actualDistributionDir) {
  Get-ChildItem -Path "$TMP_DOWNLOAD_DIR" -Directory | ForEach-Object {
    $testPath = Join-Path $_.FullName "bin/$MVN_CMD"
    if (Test-Path -Path $testPath -PathType Leaf) {
      $actualDistributionDir = $_.Name
    }
  }
}

if (!$actualDistributionDir) {
  Write-Error "Could not find Maven distribution directory in extracted archive"
}

Write-Verbose "Found extracted Maven distribution directory: $actualDistributionDir"
Rename-Item -Path "$TMP_DOWNLOAD_DIR/$actualDistributionDir" -NewName $MAVEN_HOME_NAME | Out-Null
try {
  Move-Item -Path "$TMP_DOWNLOAD_DIR/$MAVEN_HOME_NAME" -Destination $MAVEN_HOME_PARENT | Out-Null
} catch {
  if (! (Test-Path -Path "$MAVEN_HOME" -PathType Container)) {
    Write-Error "fail to move MAVEN_HOME"
  }
} finally {
  try { Remove-Item $TMP_DOWNLOAD_DIR -Recurse -Force | Out-Null }
  catch { Write-Warning "Cannot remove $TMP_DOWNLOAD_DIR" }
}

Write-Output "MVN_CMD=$MAVEN_HOME/bin/$MVN_CMD"
```

---

### File: `asset-maintenance/pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.5.14</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.example.asset</groupId>
	<artifactId>asset-maintenance</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name/>
	<description/>
	<url/>
	<licenses>
		<license/>
	</licenses>
	<developers>
		<developer/>
	</developers>
	<scm>
		<connection/>
		<developerConnection/>
		<tag/>
		<url/>
	</scm>
	<properties>
		<java.version>21</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-security</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-validation</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>com.mysql</groupId>
			<artifactId>mysql-connector-j</artifactId>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.security</groupId>
			<artifactId>spring-security-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
		</dependency>
		<dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
        </dependency>
		<dependency>
			<groupId>com.github.librepdf</groupId>
			<artifactId>openpdf</artifactId>
			<version>2.0.2</version>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<excludes>
						<exclude>
							<groupId>org.projectlombok</groupId>
							<artifactId>lombok</artifactId>
						</exclude>
					</excludes>
				</configuration>
			</plugin>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-compiler-plugin</artifactId>
				<executions>
					<execution>
						<id>default-compile</id>
						<phase>compile</phase>
						<goals>
							<goal>compile</goal>
						</goals>
						<configuration>
							<annotationProcessorPaths>
								<path>
									<groupId>org.projectlombok</groupId>
									<artifactId>lombok</artifactId>
								</path>
							</annotationProcessorPaths>
						</configuration>
					</execution>
					<execution>
						<id>default-testCompile</id>
						<phase>test-compile</phase>
						<goals>
							<goal>testCompile</goal>
						</goals>
						<configuration>
							<annotationProcessorPaths>
								<path>
									<groupId>org.projectlombok</groupId>
									<artifactId>lombok</artifactId>
								</path>
							</annotationProcessorPaths>
						</configuration>
					</execution>
				</executions>
			</plugin>
		</plugins>
	</build>

</project>
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/AssetMaintenanceApplication.java`

```java
package com.example.asset.asset_maintenance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AssetMaintenanceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AssetMaintenanceApplication.class, args);
	}

}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/config/DatabaseSeeder.java`

```java
package com.example.asset.asset_maintenance.config;

import com.example.asset.asset_maintenance.entity.*;
import com.example.asset.asset_maintenance.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final AssetRepository assetRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Roles if not present
        if (roleRepository.count() == 0) {
            Role admin = Role.builder().roleName(Role.RoleName.ADMIN).description("System Administrator").build();
            Role manager = Role.builder().roleName(Role.RoleName.MANAGER).description("Factory Maintenance Manager").build();
            Role technician = Role.builder().roleName(Role.RoleName.TECHNICIAN).description("Maintenance Technician").build();
            Role user = Role.builder().roleName(Role.RoleName.USER).description("Machinery Operator / Reporter").build();

            roleRepository.saveAll(List.of(admin, manager, technician, user));
        }

        // Retrieve saved roles
        Role adminRole = roleRepository.findByRoleName(Role.RoleName.ADMIN)
                .orElseThrow(() -> new RuntimeException("ADMIN role not found"));
        Role managerRole = roleRepository.findByRoleName(Role.RoleName.MANAGER)
                .orElseThrow(() -> new RuntimeException("MANAGER role not found"));
        Role technicianRole = roleRepository.findByRoleName(Role.RoleName.TECHNICIAN)
                .orElseThrow(() -> new RuntimeException("TECHNICIAN role not found"));
        Role userRole = roleRepository.findByRoleName(Role.RoleName.USER)
                .orElseThrow(() -> new RuntimeException("USER role not found"));

        // Ensure a manager user exists (outside of any count check)
        User managerUser = userRepository.findByEmail("manager@factory.com")
                .orElseGet(() -> {
                    User newManager = User.builder()
                            .fullName("Aarav Sharma")
                            .email("manager@factory.com")
                            .password(passwordEncoder.encode("password123"))
                            .isActive(true)
                            .build();
                    userRepository.save(newManager);
                    userRoleRepository.save(UserRole.builder().user(newManager).role(managerRole).build());
                    return newManager;
                });

        // 2. Seed each user individually (idempotent – skips users that already exist)
        // Admin
        userRepository.findByEmail("admin@factory.com").orElseGet(() -> {
            User adminUser = User.builder()
                    .fullName("Rohan Mehta")
                    .email("admin@factory.com")
                    .password(passwordEncoder.encode("password123"))
                    .isActive(true)
                    .build();
            userRepository.save(adminUser);
            userRoleRepository.save(UserRole.builder().user(adminUser).role(adminRole).build());
            return adminUser;
        });

        // Technician 1
        userRepository.findByEmail("tech1@factory.com").orElseGet(() -> {
            User tech1 = User.builder()
                    .fullName("Arjun Patil")
                    .email("tech1@factory.com")
                    .password(passwordEncoder.encode("password123"))
                    .isActive(true)
                    .build();
            userRepository.save(tech1);
            userRoleRepository.save(UserRole.builder().user(tech1).role(technicianRole).build());
            return tech1;
        });

        // Technician 2
        userRepository.findByEmail("tech2@factory.com").orElseGet(() -> {
            User tech2 = User.builder()
                    .fullName("Amit Shinde")
                    .email("tech2@factory.com")
                    .password(passwordEncoder.encode("password123"))
                    .isActive(true)
                    .build();
            userRepository.save(tech2);
            userRoleRepository.save(UserRole.builder().user(tech2).role(technicianRole).build());
            return tech2;
        });

        // Operator 1
        userRepository.findByEmail("user1@factory.com").orElseGet(() -> {
            User op1 = User.builder()
                    .fullName("Vijay Kumar")
                    .email("user1@factory.com")
                    .password(passwordEncoder.encode("password123"))
                    .isActive(true)
                    .build();
            userRepository.save(op1);
            userRoleRepository.save(UserRole.builder().user(op1).role(userRole).build());
            return op1;
        });

        // Operator 2
        userRepository.findByEmail("user2@factory.com").orElseGet(() -> {
            User op2 = User.builder()
                    .fullName("Neha Joshi")
                    .email("user2@factory.com")
                    .password(passwordEncoder.encode("password123"))
                    .isActive(true)
                    .build();
            userRepository.save(op2);
            userRoleRepository.save(UserRole.builder().user(op2).role(userRole).build());
            return op2;
        });


        // 3. Seed Assets if empty
        if (assetRepository.count() == 0) {
            Asset cnc = Asset.builder()
                    .assetCode("CNC-301")
                    .assetName("CNC Milling Machine")
                    .category("Milling")
                    .location("Section A - Machining Center")
                    .manufacturer("Siemens")
                    .installationDate(LocalDate.of(2024, 1, 15))
                    .status("OPERATIONAL")
                    .description("High-precision 5-axis CNC vertical milling machine.")
                    .manager(managerUser)
                    .build();

            Asset press = Asset.builder()
                    .assetCode("HYD-102")
                    .assetName("Hydraulic Press 500T")
                    .category("Pressing")
                    .location("Section B - Metal Stamping")
                    .manufacturer("Bosch Rexroth")
                    .installationDate(LocalDate.of(2023, 11, 20))
                    .status("OPERATIONAL")
                    .description("Heavy-duty hydraulic metal stamping and pressing machine.")
                    .manager(managerUser)
                    .build();

            Asset conveyor = Asset.builder()
                    .assetCode("CONV-503")
                    .assetName("Main Assembly Conveyor")
                    .category("Logistics")
                    .location("Section C - Assembly Line")
                    .manufacturer("Dematic")
                    .installationDate(LocalDate.of(2025, 2, 10))
                    .status("OPERATIONAL")
                    .description("Variable speed automated belt conveyor for main line assembly.")
                    .manager(managerUser)
                    .build();

            Asset robot = Asset.builder()
                    .assetCode("ROB-204")
                    .assetName("Robotic Welder Arm")
                    .category("Robotics")
                    .location("Section A - Machining Center")
                    .manufacturer("KUKA")
                    .installationDate(LocalDate.of(2024, 8, 5))
                    .status("DEGRADED")
                    .description("Articulated welding robotic arm with automatic tool changer.")
                    .manager(managerUser)
                    .build();

            assetRepository.saveAll(List.of(cnc, press, conveyor, robot));
        }
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/config/SecurityConfig.java`

```java
package com.example.asset.asset_maintenance.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationEntryPoint customAuthEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"error\":\"Unauthorized\",\"message\":\"" + authException.getMessage() + "\"}"
            );
        };
    }

   @Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

    http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(request -> {
            var corsConfig = new org.springframework.web.cors.CorsConfiguration();
            
            corsConfig.addAllowedOriginPattern("*");
            corsConfig.addAllowedMethod("*");
            corsConfig.addAllowedHeader("*");
            corsConfig.setAllowCredentials(true);
            
            return corsConfig;
        }))
        .headers(headers -> headers.frameOptions(frame -> frame.disable()))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/users/register").permitAll()
            .requestMatchers("/uploads/**").permitAll()
            .requestMatchers("/h2-console/**").permitAll()
            .anyRequest().authenticated()
        )
        .httpBasic(Customizer.withDefaults());

    return http.build();
}


}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/config/WebConfig.java`

```java
package com.example.asset.asset_maintenance.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Ensure uploads folder exists in working directory
        File uploadDir = new File("uploads");
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/controller/AssetController.java`

```java
package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.entity.Asset;
import com.example.asset.asset_maintenance.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    // CREATE ASSET - MANAGER and ADMIN can create assets
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public Asset createAsset(@RequestBody Asset asset, Principal principal) {
        return assetService.createAsset(asset, principal);
    }

    // GET ALL ASSETS - any authenticated user can view
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Asset> getAllAssets() {
        return assetService.getAllAssets();
    }

    // GET ONE ASSET - any authenticated user can view
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Asset getAsset(@PathVariable Long id) {
        return assetService.getAssetById(id);
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/controller/MaintenanceTaskController.java`

```java
package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.dto.CreateTaskRequest;
import com.example.asset.asset_maintenance.dto.TaskHistoryResponse;
import com.example.asset.asset_maintenance.entity.Attachment;
import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.service.MaintenanceTaskService;
import com.example.asset.asset_maintenance.service.PdfReportService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class MaintenanceTaskController {

    private final MaintenanceTaskService taskService;
    private final PdfReportService pdfReportService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'MANAGER', 'ADMIN')")
    public MaintenanceTask createTask(@Valid @RequestBody CreateTaskRequest request, Principal principal) {
        return taskService.createTask(request, principal.getName());
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public List<MaintenanceTask> searchTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String keyword,
            Principal principal) {

        MaintenanceTask.TaskStatus taskStatus = (status != null && !status.trim().isEmpty()) ? MaintenanceTask.TaskStatus.valueOf(status.toUpperCase()) : null;
        MaintenanceTask.Priority taskPriority = (priority != null && !priority.trim().isEmpty()) ? MaintenanceTask.Priority.valueOf(priority.toUpperCase()) : null;

        return taskService.searchTasks(taskStatus, taskPriority, keyword, principal.getName());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public List<MaintenanceTask> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'MANAGER')")
    public List<MaintenanceTask> getUserTasks(Principal principal) {
        return taskService.getTasksByUser(principal.getName());
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public List<MaintenanceTask> getTechnicianTasks(Principal principal) {
        return taskService.getTasksAssignedToTechnician(principal.getName());
    }

    @PutMapping("/{taskId}/assign/{userId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public MaintenanceTask assignTask(
            @PathVariable Long taskId,
            @PathVariable Long userId,
            Principal principal) {

        return taskService.assignTask(taskId, principal.getName(), userId);
    }

    @PutMapping("/{taskId}/status/{status}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'MANAGER')")
    public MaintenanceTask updateTaskStatus(
            @PathVariable Long taskId,
            @PathVariable String status,
            Principal principal) {

        return taskService.updateTaskStatus(taskId, status, principal.getName());
    }

    @PutMapping("/{taskId}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public MaintenanceTask approveTask(
            @PathVariable Long taskId,
            @RequestParam String remarks,
            Principal principal) {

        return taskService.approveTask(taskId, principal.getName(), remarks);
    }

    @PutMapping("/{taskId}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public MaintenanceTask rejectTask(
            @PathVariable Long taskId,
            @RequestParam String remarks,
            Principal principal) {

        return taskService.rejectTask(taskId, principal.getName(), remarks);
    }

    @PutMapping("/{taskId}/reject-reported")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public MaintenanceTask rejectReportedTask(
            @PathVariable Long taskId,
            @RequestParam String remarks,
            Principal principal) {

        return taskService.rejectReportedTask(taskId, principal.getName(), remarks);
    }


    @GetMapping("/{taskId}/history")
    @PreAuthorize("isAuthenticated()")
    public List<TaskHistoryResponse> getHistory(@PathVariable Long taskId) {
        return taskService.getTaskHistory(taskId);
    }

    @GetMapping("/{taskId}")
    @PreAuthorize("isAuthenticated()")
    public MaintenanceTask getTaskById(@PathVariable Long taskId) {
        return taskService.getTaskById(taskId);
    }

    @GetMapping(value = "/{taskId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InputStreamResource> downloadPdf(@PathVariable Long taskId) {
        MaintenanceTask task = taskService.getTaskById(taskId);
        java.io.ByteArrayInputStream bis = pdfReportService.generateMaintenanceReport(task);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=service_report_" + task.getTaskCode() + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @PostMapping("/{taskId}/attachments")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'MANAGER', 'ADMIN')")
    public Attachment uploadAttachment(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type,
            Principal principal) {
        return taskService.addAttachment(taskId, file, type, principal.getName());
    }

    @PostMapping("/{taskId}/report")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public MaintenanceTask submitReport(
            @PathVariable Long taskId,
            @Valid @RequestBody SubmitReportRequest request,
            Principal principal) {
        return taskService.submitServiceReport(
                taskId,
                request.getRootCause(),
                request.getWorkPerformed(),
                request.getTimeSpentMinutes(),
                request.getRecommendations(),
                principal.getName()
        );
    }

    @lombok.Data
    public static class SubmitReportRequest {
        @jakarta.validation.constraints.NotBlank(message = "Root cause is required")
        private String rootCause;
        
        @jakarta.validation.constraints.NotBlank(message = "Work performed is required")
        private String workPerformed;
        
        @jakarta.validation.constraints.NotNull(message = "Time spent is required")
        @jakarta.validation.constraints.Min(value = 1, message = "Time spent must be positive")
        private Integer timeSpentMinutes;
        
        private String recommendations;
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/controller/MaterialRequestController.java`

```java
package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.dto.MaterialRequestDTO;
import com.example.asset.asset_maintenance.entity.MaterialRequest;
import com.example.asset.asset_maintenance.service.MaterialRequestService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/materials")
@RequiredArgsConstructor
public class MaterialRequestController {

    private final MaterialRequestService materialService;

    @PostMapping("/request")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public MaterialRequest requestMaterial(@Valid @RequestBody MaterialRequestDTO request, Principal principal) {
        return materialService.requestMaterial(
                request.getTaskId(),
                request.getMaterialName(),
                request.getQuantity(),
                principal.getName()
        );
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public MaterialRequest approveRequest(@PathVariable Long id, Principal principal) {
        return materialService.approveRequest(id, principal.getName());
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public MaterialRequest rejectRequest(@PathVariable Long id, Principal principal) {
        return materialService.rejectRequest(id, principal.getName());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public List<MaterialRequest> getAllRequests() {
        return materialService.getAllRequests();
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/controller/NotificationController.java`

```java
package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.entity.Notification;
import com.example.asset.asset_maintenance.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<Notification> getMyNotifications(Principal principal) {
        return notificationService.getNotificationsForUser(principal.getName());
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    @PutMapping("/read-all")
    public void markAllAsRead(Principal principal) {
        notificationService.markAllAsRead(principal.getName());
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/controller/TaskDiscussionController.java`

```java
package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.dto.TaskDiscussionResponse;
import com.example.asset.asset_maintenance.entity.TaskDiscussion;
import com.example.asset.asset_maintenance.service.TaskDiscussionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class TaskDiscussionController {

    private final TaskDiscussionService discussionService;

    @PostMapping("/{taskId}/comments")
    public TaskDiscussion addComment(
            @PathVariable Long taskId,
            Principal principal,
            @RequestParam String message) {

        return discussionService.addComment(taskId, principal.getName(), message);
    }

    @GetMapping("/{taskId}/comments")
    public List<TaskDiscussionResponse> getComments(@PathVariable Long taskId) {
        return discussionService.getComments(taskId);
    }

}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/controller/UserController.java`

```java
package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.dto.RegisterRequest;
import com.example.asset.asset_maintenance.dto.UserDTO;
import com.example.asset.asset_maintenance.entity.Role;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.entity.UserRole;
import com.example.asset.asset_maintenance.repository.RoleRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import com.example.asset.asset_maintenance.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(this::mapToDTO).toList();
    }

    @PostMapping("/register")
    public UserDTO registerUser(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // Fetch USER role (default)
        Role userRole = roleRepository.findByRoleName(Role.RoleName.USER)
                .orElseThrow(() -> new RuntimeException("Default USER role not found in database"));

        UserRole mapping = UserRole.builder()
                .user(savedUser)
                .role(userRole)
                .build();
        userRoleRepository.save(mapping);

        return UserDTO.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role("USER")
                .build();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UserDTO getProfile(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDTO(user);
    }

    @PutMapping("/{userId}/role/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UserDTO changeUserRole(@PathVariable Long userId, @PathVariable String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role.RoleName parsedRoleName;
        try {
            parsedRoleName = Role.RoleName.valueOf(roleName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role name: " + roleName);
        }

        Role newRole = roleRepository.findByRoleName(parsedRoleName)
                .orElseThrow(() -> new RuntimeException("Role not found in database: " + parsedRoleName));

        // Delete existing roles for this user
        if (user.getUserRoles() != null) {
            userRoleRepository.deleteAll(user.getUserRoles());
            user.getUserRoles().clear();
        }

        // Assign new role
        UserRole newMapping = UserRole.builder()
                .user(user)
                .role(newRole)
                .build();
        userRoleRepository.save(newMapping);
        user.getUserRoles().add(newMapping);

        userRepository.saveAndFlush(user);

        return mapToDTO(user);
    }


    private UserDTO mapToDTO(User u) {
        String roleName = "USER";
        if (u.getUserRoles() != null && !u.getUserRoles().isEmpty()) {
            roleName = u.getUserRoles().get(0).getRole().getRoleName().name();
        }
        return UserDTO.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .role(roleName)
                .build();
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/dto/CreateTaskRequest.java`

```java
package com.example.asset.asset_maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Priority is required")
    private String priority;

    @NotNull(message = "Asset ID is required")
    private Long assetId;
    
    private Long reportedByUserId;
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/dto/MaterialRequestDTO.java`

```java
package com.example.asset.asset_maintenance.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MaterialRequestDTO {

    @NotNull(message = "Task ID is required")
    private Long taskId;

    @NotBlank(message = "Material name cannot be empty")
    private String materialName;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Max(value = 10000, message = "Quantity cannot exceed 10,000")
    private Integer quantity;

    private Long userId;
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/dto/RegisterRequest.java`

```java
package com.example.asset.asset_maintenance.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email address is required")
    @Email(message = "Email address must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 50, message = "Password must be between 6 and 50 characters")
    private String password;
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/dto/TaskDiscussionResponse.java`

```java
package com.example.asset.asset_maintenance.dto;

import lombok.Data;

@Data
public class TaskDiscussionResponse {

    private String message;
    private String user;
    private String time;
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/dto/TaskHistoryResponse.java`

```java
package com.example.asset.asset_maintenance.dto;

import lombok.Data;

@Data
public class TaskHistoryResponse {

    private String action;
    private String fromStatus;
    private String toStatus;
    private String performedBy;
    private String remarks;
    private String time;
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/dto/UserDTO.java`

```java
package com.example.asset.asset_maintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String fullName;
    private String email;
    private String role;
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/entity/Asset.java`

```java
package com.example.asset.asset_maintenance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_code", unique = true, nullable = false)
    private String assetCode;

    @Column(name = "asset_name")
    private String assetName;

    private String category;

    private String location;

    // New relationship to the manager who owns the asset
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "manager_id", nullable = false)
    private com.example.asset.asset_maintenance.entity.User manager;

    private String manufacturer;

    private LocalDate installationDate;

    private String status;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/entity/Attachment.java`

```java
package com.example.asset.asset_maintenance.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "attachment_type", nullable = false)
    private AttachmentType attachmentType;

    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @ManyToOne
    @JoinColumn(name = "task_id")
    @JsonIgnore
    private MaintenanceTask task;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum AttachmentType {
        INITIAL_REPORT,
        BEFORE_REPAIR,
        AFTER_REPAIR
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/entity/MaintenanceTask.java`

```java
package com.example.asset.asset_maintenance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "maintenance_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_code", unique = true, nullable = false)
    private String taskCode;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    //  Asset
    @ManyToOne
    @JoinColumn(name = "asset_id")
    private Asset asset;

    //  Reporter (user who created task)
    @ManyToOne
    @JoinColumn(name = "reported_by")
    private User reportedBy;

    //  Technician assigned
    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    //  Manager who assigned (ownership)
    @ManyToOne
    @JoinColumn(name = "assigned_by")
    private User assignedBy;

    //  Manager who approved/rejected
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "manager_remarks", columnDefinition = "TEXT")
    private String managerRemarks;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @OneToOne(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ServiceReport serviceReport;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Attachment> attachments;

    //  Audit fields
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    //  Auto timestamps
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();

        //  Auto-set completed time (optional but useful)
        if (this.status == TaskStatus.COMPLETED && this.completedAt == null) {
            this.completedAt = LocalDateTime.now();
        }
    }

    //  Priority enum
    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    //  Task lifecycle enum
    public enum TaskStatus {
        REPORTED,
        ASSIGNED,
        IN_PROGRESS,

        MATERIAL_REQUESTED,
        MATERIAL_APPROVED,
        MATERIAL_REJECTED,

        COMPLETED,

        APPROVED,
        REJECTED,

        CLOSED
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/entity/MaterialRequest.java`

```java
package com.example.asset.asset_maintenance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "material_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Linked Task
    @ManyToOne
    @JoinColumn(name = "task_id")
    private MaintenanceTask task;

    //  Technician requesting
    @ManyToOne
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    //  Manager approving
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    private String materialName;

    private Integer quantity;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    private String remarks;

    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;

    @PrePersist
    protected void onCreate() {
        requestedAt = LocalDateTime.now();
    }

    public enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/entity/Notification.java`

```java
package com.example.asset.asset_maintenance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/entity/Role.java`

```java
package com.example.asset.asset_maintenance.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_name", nullable = false, unique = true)
    private RoleName roleName;

    private String description;


    @JsonIgnore
    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserRole> userRoles;

    public enum RoleName {
        ADMIN,
        MANAGER,
        TECHNICIAN,
        USER
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/entity/ServiceReport.java`

```java
package com.example.asset.asset_maintenance.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "task_id", nullable = false)
    @JsonIgnore
    private MaintenanceTask task;

    @Column(name = "root_cause", columnDefinition = "TEXT", nullable = false)
    private String rootCause;

    @Column(name = "work_performed", columnDefinition = "TEXT", nullable = false)
    private String workPerformed;

    @Column(name = "time_spent_minutes", nullable = false)
    private Integer timeSpentMinutes;

    @Column(name = "recommendations", columnDefinition = "TEXT")
    private String recommendations;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/entity/TaskDiscussion.java`

```java
package com.example.asset.asset_maintenance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_discussions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDiscussion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "task_id")
    private MaintenanceTask task;


    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/entity/TaskHistory.java`

```java
package com.example.asset.asset_maintenance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "task_id")
    private MaintenanceTask task;


    @ManyToOne
    @JoinColumn(name = "performed_by")
    private User performedBy;


    private String action;


    @Enumerated(EnumType.STRING)
    private MaintenanceTask.TaskStatus fromStatus;


    @Enumerated(EnumType.STRING)
    private MaintenanceTask.TaskStatus toStatus;


    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "action_time")
    private LocalDateTime actionTime;

    @PrePersist
    protected void onCreate() {
        actionTime = LocalDateTime.now();
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/entity/User.java`

```java
package com.example.asset.asset_maintenance.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name")
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;


    @Column(name = "is_active")
    private Boolean isActive = true;
    //just not to delete the record of the other tabje  we will just mark it as false

    @JsonIgnore
    @Column(name = "reset_token")
    private String resetToken;

    @JsonIgnore
    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserRole> userRoles;


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/entity/UserRole.java`

```java
package com.example.asset.asset_maintenance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;


    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    private LocalDateTime assignedAt;

    @PrePersist
    protected void onCreate() {
        assignedAt = LocalDateTime.now();
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/repository/AssetRepository.java`

```java
package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetRepository  extends JpaRepository<Asset,Long> {
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/repository/AttachmentRepository.java`

```java
package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByTaskId(Long taskId);
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/repository/MaintenanceTaskRepository.java`

```java
package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTask, Long> {


    List<MaintenanceTask> findByReportedBy(User user);


    List<MaintenanceTask> findByAssignedTo(User user);

    boolean existsByTaskCode(String taskCode);

    @Query("SELECT t FROM MaintenanceTask t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<MaintenanceTask> searchTasks(
        @Param("status") com.example.asset.asset_maintenance.entity.MaintenanceTask.TaskStatus status,
        @Param("priority") com.example.asset.asset_maintenance.entity.MaintenanceTask.Priority priority,
        @Param("keyword") String keyword
    );
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/repository/MaterialRequestRepository.java`

```java
package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.MaterialRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaterialRequestRepository extends JpaRepository<MaterialRequest, Long> {
    List<MaterialRequest> findByTaskId(Long taskId);
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/repository/NotificationRepository.java`

```java
package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String email);
    List<Notification> findByRecipientEmailAndIsReadOrderByCreatedAtDesc(String email, boolean isRead);
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/repository/RoleRepository.java`

```java
package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository  extends JpaRepository<Role,Long> {
    Optional<Role> findByRoleName(Role.RoleName roleName);
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/repository/ServiceReportRepository.java`

```java
package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.ServiceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ServiceReportRepository extends JpaRepository<ServiceReport, Long> {
    Optional<ServiceReport> findByTaskId(Long taskId);
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/repository/TaskDiscussionRepository.java`

```java
package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.TaskDiscussion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskDiscussionRepository extends JpaRepository<TaskDiscussion, Long> {
    List<TaskDiscussion> findByTaskId(Long taskId);
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/repository/TaskHistoryRepository.java`

```java
package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.TaskHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskHistoryRepository extends JpaRepository<TaskHistory, Long> {
    List<TaskHistory> findByTaskId(Long taskId);
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/repository/UserRepository.java`

```java
package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/repository/UserRoleRepository.java`

```java
package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.UserRole;
import com.example.asset.asset_maintenance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    // it will gidve us  all the roles  of given user 
    List<UserRole> findByUser(User user);
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/service/AssetService.java`

```java
package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.Asset;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.AssetRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    /**
     * Create a new asset and associate it with the manager who creates it.
     */
    public Asset createAsset(Asset asset, Principal principal) {
        // Generate unique asset code
        asset.setAssetCode("ASSET-" + System.currentTimeMillis());
        // Find manager user entity from principal
        User manager = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Manager user not found"));
        asset.setManager(manager);
        return assetRepository.save(asset);
    }

    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    public Asset getAssetById(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/service/CustomUserDetailsService.java`

```java
package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        List<SimpleGrantedAuthority> authorities = user.getUserRoles().stream()
                .map(ur -> new SimpleGrantedAuthority("ROLE_" + ur.getRole().getRoleName().name()))
                .toList();

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.getIsActive() != null ? user.getIsActive() : true,
                true,
                true,
                true,
                authorities
        );
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/service/MaintenanceTaskService.java`

```java
package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.dto.CreateTaskRequest;
import com.example.asset.asset_maintenance.dto.TaskHistoryResponse;
import com.example.asset.asset_maintenance.entity.Asset;
import com.example.asset.asset_maintenance.entity.Attachment;
import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.ServiceReport;
import com.example.asset.asset_maintenance.entity.TaskHistory;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.AssetRepository;
import com.example.asset.asset_maintenance.repository.AttachmentRepository;
import com.example.asset.asset_maintenance.repository.MaintenanceTaskRepository;
import com.example.asset.asset_maintenance.repository.ServiceReportRepository;
import com.example.asset.asset_maintenance.repository.TaskHistoryRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceTaskService {

    private final MaintenanceTaskRepository taskRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final TaskHistoryRepository taskHistoryRepository;
    private final TaskHistoryService historyService;
    private final NotificationService notificationService;
    private final AttachmentRepository attachmentRepository;
    private final ServiceReportRepository serviceReportRepository;

    //  CREATE TASK
    public MaintenanceTask createTask(CreateTaskRequest request, String email) {
        if (request.getAssetId() == null) {
            throw new IllegalArgumentException("Asset ID must not be null");
        }

        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new RuntimeException("Asset not found"));

        if (email == null) {
            throw new IllegalArgumentException("Email must not be null");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MaintenanceTask task = new MaintenanceTask();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(MaintenanceTask.Priority.valueOf(request.getPriority()));
        task.setStatus(MaintenanceTask.TaskStatus.REPORTED);
        task.setAsset(asset);
        task.setReportedBy(user);
        task.setTaskCode(generateUniqueTaskCode());

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        switch (task.getPriority()) {
            case CRITICAL:
                task.setDueDate(now.plusHours(4));
                break;
            case HIGH:
                task.setDueDate(now.plusHours(24));
                break;
            case MEDIUM:
                task.setDueDate(now.plusDays(3));
                break;
            case LOW:
            default:
                task.setDueDate(now.plusDays(7));
                break;
        }

        MaintenanceTask savedTask = taskRepository.save(task);

        historyService.logAction(savedTask, "CREATED", null,
                MaintenanceTask.TaskStatus.REPORTED, user, "Task created");

        notificationService.sendNotificationToRole(
                com.example.asset.asset_maintenance.entity.Role.RoleName.MANAGER,
                "New work order " + savedTask.getTaskCode() + " reported for machine: " + asset.getAssetName()
        );

        return savedTask;
    }

    //  FETCH
    public List<MaintenanceTask> getTasksByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return taskRepository.findByReportedBy(user);
    }

    public List<MaintenanceTask> getTasksAssignedToTechnician(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return taskRepository.findByAssignedTo(user);
    }

    // ASSIGN TASK (UPDATED WITH STATE VALIDATION)
    public MaintenanceTask assignTask(Long taskId, String managerEmail, Long technicianId) {
        if (taskId == null) {
            throw new IllegalArgumentException("Task ID must not be null");
        }
        if (technicianId == null) {
            throw new IllegalArgumentException("Technician ID must not be null");
        }
        if (managerEmail == null) {
            throw new IllegalArgumentException("Manager email must not be null");
        }

        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        String managerRole = manager.getUserRoles().get(0).getRole().getRoleName().name();

        // Validate state transition rules
        if (!TaskStatusTransition.isAllowed(oldStatus, MaintenanceTask.TaskStatus.ASSIGNED, managerRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to ASSIGNED by role " + managerRole);
        }

        task.setAssignedTo(technician);
        task.setAssignedBy(manager); 
        task.setStatus(MaintenanceTask.TaskStatus.ASSIGNED);

        MaintenanceTask savedTask = taskRepository.save(task);

        historyService.logAction(savedTask, "ASSIGNED", oldStatus,
                MaintenanceTask.TaskStatus.ASSIGNED,
                manager, "Task assigned by manager");

        notificationService.sendNotification(
                technician,
                "You have been assigned to task " + savedTask.getTaskCode() + " by Manager " + manager.getFullName()
        );

        return savedTask;
    }

    //  STATUS UPDATE (UPDATED WITH STATE VALIDATION)
    public MaintenanceTask updateTaskStatus(Long taskId, String status, String technicianEmail) {
        if (taskId == null) {
            throw new IllegalArgumentException("Task ID must not be null");
        }
        if (status == null) {
            throw new IllegalArgumentException("Status must not be null");
        }
        if (technicianEmail == null) {
            throw new IllegalArgumentException("Technician email must not be null");
        }

        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User tech = userRepository.findByEmail(technicianEmail)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        if (task.getAssignedTo() == null || !task.getAssignedTo().getEmail().equals(technicianEmail)) {
            throw new RuntimeException("Only the assigned technician can update status of this task");
        }

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        MaintenanceTask.TaskStatus newStatus = MaintenanceTask.TaskStatus.valueOf(status.toUpperCase());
        String techRole = tech.getUserRoles().get(0).getRole().getRoleName().name();

        // Validate state transition rules
        if (!TaskStatusTransition.isAllowed(oldStatus, newStatus, techRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to " + newStatus + " by role " + techRole);
        }

        task.setStatus(newStatus);

        MaintenanceTask savedTask = taskRepository.save(task);

        historyService.logAction(savedTask, "STATUS_UPDATE", oldStatus,
                newStatus, tech, "Status updated to " + status);

        if (newStatus == MaintenanceTask.TaskStatus.IN_PROGRESS) {
            notificationService.sendNotification(
                    savedTask.getReportedBy(),
                    "Your reported task " + savedTask.getTaskCode() + " is now IN_PROGRESS"
            );
        } else if (newStatus == MaintenanceTask.TaskStatus.COMPLETED) {
            if (savedTask.getAssignedBy() != null) {
                notificationService.sendNotification(
                        savedTask.getAssignedBy(),
                        "Technician " + tech.getFullName() + " marked task " + savedTask.getTaskCode() + " as COMPLETED"
                );
            } else {
                notificationService.sendNotificationToRole(
                        com.example.asset.asset_maintenance.entity.Role.RoleName.MANAGER,
                        "Technician " + tech.getFullName() + " marked task " + savedTask.getTaskCode() + " as COMPLETED"
                );
            }
        }

        return savedTask;
    }

    //  APPROVE (UPDATED WITH STATE VALIDATION)
    @Transactional
    public MaintenanceTask approveTask(Long taskId, String managerEmail, String remarks) {
        if (taskId == null) {
            throw new IllegalArgumentException("Task ID must not be null");
        }
        if (managerEmail == null) {
            throw new IllegalArgumentException("Manager email must not be null");
        }

        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        String managerRole = manager.getUserRoles().get(0).getRole().getRoleName().name();

        // Validate state transition rules
        if (!TaskStatusTransition.isAllowed(oldStatus, MaintenanceTask.TaskStatus.APPROVED, managerRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to APPROVED by role " + managerRole);
        }

        task.setApprovedBy(manager);
        task.setManagerRemarks(remarks);
        task.setStatus(MaintenanceTask.TaskStatus.APPROVED);

        MaintenanceTask savedTask = taskRepository.save(task);

        historyService.logAction(savedTask, "APPROVED", oldStatus,
                MaintenanceTask.TaskStatus.APPROVED,
                manager, remarks);

        // Send notifications
        notificationService.sendNotification(
                savedTask.getReportedBy(),
                "Your reported task " + savedTask.getTaskCode() + " has been APPROVED by Manager " + manager.getFullName()
        );
        if (savedTask.getAssignedTo() != null) {
            notificationService.sendNotification(
                    savedTask.getAssignedTo(),
                    "Your completed task " + savedTask.getTaskCode() + " has been APPROVED by Manager " + manager.getFullName()
            );
        }

        return savedTask;
    }

    //  REJECT (UPDATED WITH STATE VALIDATION)
    @Transactional
    public MaintenanceTask rejectTask(Long taskId, String managerEmail, String remarks) {
        if (taskId == null) {
            throw new IllegalArgumentException("Task ID must not be null");
        }
        if (managerEmail == null) {
            throw new IllegalArgumentException("Manager email must not be null");
        }

        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        String managerRole = manager.getUserRoles().get(0).getRole().getRoleName().name();

        // Validate state transition rules
        if (!TaskStatusTransition.isAllowed(oldStatus, MaintenanceTask.TaskStatus.REJECTED, managerRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to REJECTED by role " + managerRole);
        }

        task.setApprovedBy(manager);
        task.setManagerRemarks(remarks);
        task.setStatus(MaintenanceTask.TaskStatus.REJECTED);

        MaintenanceTask savedTask = taskRepository.save(task);

        historyService.logAction(savedTask, "REJECTED", oldStatus,
                MaintenanceTask.TaskStatus.REJECTED,
                manager, remarks);

        // Send notifications
        notificationService.sendNotification(
                savedTask.getReportedBy(),
                "Your reported task " + savedTask.getTaskCode() + " has been REJECTED by Manager " + manager.getFullName() + ". Remarks: " + remarks
        );
        if (savedTask.getAssignedTo() != null) {
            notificationService.sendNotification(
                    savedTask.getAssignedTo(),
                    "Your completed task " + savedTask.getTaskCode() + " has been REJECTED by Manager " + manager.getFullName() + ". Remarks: " + remarks
            );
        }

        return savedTask;
    }

    //  REJECT REPORTED TASK (UPDATED WITH STATE VALIDATION)
    @Transactional
    public MaintenanceTask rejectReportedTask(Long taskId, String managerEmail, String remarks) {
        if (taskId == null) {
            throw new IllegalArgumentException("Task ID must not be null");
        }
        if (managerEmail == null) {
            throw new IllegalArgumentException("Manager email must not be null");
        }

        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        String managerRole = manager.getUserRoles().get(0).getRole().getRoleName().name();

        // Validate state transition rules
        if (!TaskStatusTransition.isAllowed(oldStatus, MaintenanceTask.TaskStatus.REJECTED, managerRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to REJECTED by role " + managerRole);
        }

        task.setApprovedBy(manager);
        task.setManagerRemarks(remarks);
        task.setStatus(MaintenanceTask.TaskStatus.REJECTED);

        MaintenanceTask savedTask = taskRepository.save(task);

        historyService.logAction(savedTask, "REJECTED_REPORTED", oldStatus,
                MaintenanceTask.TaskStatus.REJECTED,
                manager, remarks);

        // Send notification
        notificationService.sendNotification(
                savedTask.getReportedBy(),
                "Your reported task " + savedTask.getTaskCode() + " has been REJECTED by Manager " + manager.getFullName() + ". Remarks: " + remarks
        );

        return savedTask;
    }

    // ATTACHMENT UPLOAD
    @Transactional
    public Attachment addAttachment(Long taskId, org.springframework.web.multipart.MultipartFile file, String type, String email) {
        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "file";
        }
        String fileName = System.currentTimeMillis() + "_" + originalFilename.replaceAll("\\s+", "_");
        java.io.File uploadDir = new java.io.File("uploads");
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        java.io.File destFile = new java.io.File(uploadDir, fileName);
        try {
            file.transferTo(destFile);
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to store attachment file", e);
        }

        Attachment.AttachmentType attachmentType;
        try {
            attachmentType = Attachment.AttachmentType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid attachment type: " + type);
        }

        Attachment attachment = Attachment.builder()
                .fileName(originalFilename)
                .fileType(file.getContentType())
                .filePath("/uploads/" + fileName)
                .attachmentType(attachmentType)
                .uploadedBy(user)
                .task(task)
                .build();

        Attachment savedAttachment = attachmentRepository.save(attachment);

        historyService.logAction(task, "ATTACHMENT_ADDED", null, task.getStatus(), user,
                "Uploaded " + attachmentType + " attachment: " + originalFilename);

        return savedAttachment;
    }

    // SUBMIT SERVICE REPORT
    @Transactional
    public MaintenanceTask submitServiceReport(Long taskId, String rootCause, String workPerformed, Integer timeSpentMinutes, String recommendations, String technicianEmail) {
        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User tech = userRepository.findByEmail(technicianEmail)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        if (task.getAssignedTo() == null || !task.getAssignedTo().getEmail().equals(technicianEmail)) {
            throw new RuntimeException("Only the assigned technician can submit a service report for this task");
        }

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        MaintenanceTask.TaskStatus newStatus = MaintenanceTask.TaskStatus.COMPLETED;
        String techRole = tech.getUserRoles().get(0).getRole().getRoleName().name();

        if (!TaskStatusTransition.isAllowed(oldStatus, newStatus, techRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to " + newStatus + " by role " + techRole);
        }

        // Delete old service report if re-submitting after rejection
        ServiceReport existingReport = task.getServiceReport();
        if (existingReport != null) {
            task.setServiceReport(null);
            taskRepository.save(task);
            serviceReportRepository.delete(existingReport);
            serviceReportRepository.flush();
        }

        // Save new service report
        ServiceReport report = ServiceReport.builder()
                .task(task)
                .rootCause(rootCause)
                .workPerformed(workPerformed)
                .timeSpentMinutes(timeSpentMinutes)
                .recommendations(recommendations)
                .build();
        serviceReportRepository.save(report);
        task.setServiceReport(report);

        // Reset completedAt for fresh timestamp and update status to COMPLETED
        task.setCompletedAt(null);
        task.setStatus(newStatus);
        MaintenanceTask savedTask = taskRepository.save(task);

        // Log history
        historyService.logAction(savedTask, "COMPLETED", oldStatus, newStatus, tech,
                "Service report submitted and task marked completed.");

        // Send notifications
        if (savedTask.getAssignedBy() != null) {
            notificationService.sendNotification(
                    savedTask.getAssignedBy(),
                    "Technician " + tech.getFullName() + " submitted a service report and marked task " + savedTask.getTaskCode() + " as COMPLETED"
            );
        } else {
            notificationService.sendNotificationToRole(
                    com.example.asset.asset_maintenance.entity.Role.RoleName.MANAGER,
                    "Technician " + tech.getFullName() + " submitted a service report and marked task " + savedTask.getTaskCode() + " as COMPLETED"
            );
        }

        return savedTask;
    }

    //  FETCH HISTORY (DTO)
    public List<TaskHistoryResponse> getTaskHistory(Long taskId) {
        List<TaskHistory> historyList = taskHistoryRepository.findByTaskId(taskId);

        return historyList.stream().map(h -> {
            TaskHistoryResponse res = new TaskHistoryResponse();
            res.setAction(h.getAction());
            res.setFromStatus(h.getFromStatus() != null ? h.getFromStatus().name() : null);
            res.setToStatus(h.getToStatus() != null ? h.getToStatus().name() : null);
            res.setPerformedBy(h.getPerformedBy().getFullName());
            res.setRemarks(h.getRemarks());
            res.setTime(h.getActionTime().toString());
            return res;
        }).toList();
    }

    // GET ALL TASKS
    public List<MaintenanceTask> getAllTasks() {
        return taskRepository.findAll();
    }

    // SEARCH TASKS (WITH ROLE-BASED VISIBILITY FILTERING)
    public List<MaintenanceTask> searchTasks(MaintenanceTask.TaskStatus status, MaintenanceTask.Priority priority, String keyword, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String roleName = user.getUserRoles().get(0).getRole().getRoleName().name();
        String keywordParam = keyword != null && !keyword.trim().isEmpty() ? keyword.trim() : null;

        List<MaintenanceTask> results = taskRepository.searchTasks(status, priority, keywordParam);

        if (roleName.equals("ADMIN") || roleName.equals("MANAGER")) {
            return results;
        } else if (roleName.equals("TECHNICIAN")) {
            return results.stream()
                    .filter(t -> (t.getAssignedTo() != null && t.getAssignedTo().getEmail().equals(email))
                            || t.getReportedBy().getEmail().equals(email))
                    .toList();
        } else {
            return results.stream()
                    .filter(t -> t.getReportedBy().getEmail().equals(email))
                    .toList();
        }
    }

    public MaintenanceTask getTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    // UNIQUE ALPHANUMERIC TASK CODE GENERATOR (TSK-XXXX-YYY)
    private String generateUniqueTaskCode() {
        java.util.Random random = new java.util.Random();
        while (true) {
            int number = 1000 + random.nextInt(9000);
            StringBuilder letterCode = new StringBuilder();
            for (int i = 0; i < 3; i++) {
                letterCode.append((char) ('A' + random.nextInt(26)));
            }
            String code = "TSK-" + number + "-" + letterCode.toString();
            if (!taskRepository.existsByTaskCode(code)) {
                return code;
            }
        }
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/service/MaterialRequestService.java`

```java
package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.MaterialRequest;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.MaintenanceTaskRepository;
import com.example.asset.asset_maintenance.repository.MaterialRequestRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialRequestService {

    private final MaterialRequestRepository materialRequestRepository;
    private final MaintenanceTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskHistoryService historyService;

    public MaterialRequest requestMaterial(Long taskId, String materialName,
                                           Integer quantity, String technicianEmail) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        if (materialName == null || materialName.trim().isEmpty()) {
            throw new IllegalArgumentException("Material name is required");
        }

        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User user = userRepository.findByEmail(technicianEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (task.getAssignedTo() == null || !task.getAssignedTo().getEmail().equals(technicianEmail)) {
            throw new RuntimeException("Only the assigned technician can request materials for this task");
        }

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        String userRole = user.getUserRoles().get(0).getRole().getRoleName().name();

        // Validate state transition
        if (!TaskStatusTransition.isAllowed(oldStatus, MaintenanceTask.TaskStatus.MATERIAL_REQUESTED, userRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to MATERIAL_REQUESTED by role " + userRole);
        }

        MaterialRequest request = new MaterialRequest();
        request.setTask(task);
        request.setMaterialName(materialName);
        request.setQuantity(quantity);
        request.setRequestedBy(user);
        request.setStatus(MaterialRequest.RequestStatus.PENDING);

        MaterialRequest savedRequest = materialRequestRepository.save(request);

        task.setStatus(MaintenanceTask.TaskStatus.MATERIAL_REQUESTED);
        taskRepository.save(task);

        historyService.logAction(task, "MATERIAL_REQUESTED", oldStatus,
                MaintenanceTask.TaskStatus.MATERIAL_REQUESTED,
                user, "Requested material: " + materialName + " (Qty: " + quantity + ")");

        return savedRequest;
    }

    public MaterialRequest approveRequest(Long requestId, String managerEmail) {

        MaterialRequest request = materialRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        MaintenanceTask task = request.getTask();
        if (task.getAssignedBy() == null || !task.getAssignedBy().getEmail().equals(managerEmail)) {
            throw new RuntimeException("Only the assigned manager can approve material requests for this task");
        }

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        String managerRole = manager.getUserRoles().get(0).getRole().getRoleName().name();

        // Validate state transition
        if (!TaskStatusTransition.isAllowed(oldStatus, MaintenanceTask.TaskStatus.MATERIAL_APPROVED, managerRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to MATERIAL_APPROVED by role " + managerRole);
        }

        request.setApprovedBy(manager);
        request.setStatus(MaterialRequest.RequestStatus.APPROVED);

        MaterialRequest savedRequest = materialRequestRepository.save(request);

        task.setStatus(MaintenanceTask.TaskStatus.MATERIAL_APPROVED);
        taskRepository.save(task);

        historyService.logAction(task, "MATERIAL_APPROVED", oldStatus,
                MaintenanceTask.TaskStatus.MATERIAL_APPROVED,
                manager, "Material request approved by manager");

        return savedRequest;
    }

    public MaterialRequest rejectRequest(Long requestId, String managerEmail) {

        MaterialRequest request = materialRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        MaintenanceTask task = request.getTask();
        if (task.getAssignedBy() == null || !task.getAssignedBy().getEmail().equals(managerEmail)) {
            throw new RuntimeException("Only the assigned manager can reject material requests for this task");
        }

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        String managerRole = manager.getUserRoles().get(0).getRole().getRoleName().name();

        // Validate state transition
        if (!TaskStatusTransition.isAllowed(oldStatus, MaintenanceTask.TaskStatus.MATERIAL_REJECTED, managerRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to MATERIAL_REJECTED by role " + managerRole);
        }

        request.setApprovedBy(manager);
        request.setStatus(MaterialRequest.RequestStatus.REJECTED);

        MaterialRequest savedRequest = materialRequestRepository.save(request);

        task.setStatus(MaintenanceTask.TaskStatus.MATERIAL_REJECTED);
        taskRepository.save(task);

        historyService.logAction(task, "MATERIAL_REJECTED", oldStatus,
                MaintenanceTask.TaskStatus.MATERIAL_REJECTED,
                manager, "Material request rejected by manager");

        return savedRequest;
    }

    public List<MaterialRequest> getAllRequests() {
        return materialRequestRepository.findAll();
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/service/NotificationService.java`

```java
package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.Notification;
import com.example.asset.asset_maintenance.entity.Role;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.NotificationRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void sendNotification(User recipient, String message) {
        if (recipient == null) return;
        Notification notification = Notification.builder()
                .recipient(recipient)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void sendNotificationToRole(Role.RoleName roleName, String message) {
        // Query users with roleName
        List<User> recipients = userRepository.findAll().stream()
                .filter(u -> u.getUserRoles().stream()
                        .anyMatch(ur -> ur.getRole().getRoleName() == roleName))
                .toList();
        
        for (User u : recipients) {
            sendNotification(u, message);
        }
    }

    public List<Notification> getNotificationsForUser(String email) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
    }

    @Transactional
    public void markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllAsRead(String email) {
        List<Notification> unread = notificationRepository.findByRecipientEmailAndIsReadOrderByCreatedAtDesc(email, false);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/service/PdfReportService.java`

```java
package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.MaterialRequest;
import com.example.asset.asset_maintenance.entity.ServiceReport;
import com.example.asset.asset_maintenance.repository.MaterialRequestRepository;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfReportService {

    private final MaterialRequestRepository materialRequestRepository;

    public ByteArrayInputStream generateMaintenanceReport(MaintenanceTask task) {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Styling colors
            Color primaryColor = new Color(37, 99, 235); // Blue
            Color secondaryColor = new Color(71, 85, 105); // Slate
            Color lightGray = new Color(248, 250, 252);

            // Fonts
            Font mainTitleFont = new Font(Font.HELVETICA, 20, Font.BOLD, primaryColor);
            Font sectionTitleFont = new Font(Font.HELVETICA, 13, Font.BOLD, secondaryColor);
            Font labelFont = new Font(Font.HELVETICA, 9, Font.BOLD, Color.BLACK);
            Font valueFont = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.DARK_GRAY);
            Font italicFont = new Font(Font.HELVETICA, 9, Font.ITALIC, Color.DARK_GRAY);

            // Header Banner Table
            PdfPTable headerTable = new PdfPTable(1);
            headerTable.setWidthPercentage(100);
            headerTable.setSpacingAfter(20);
            
            PdfPCell titleCell = new PdfPCell(new Paragraph("WORK ORDER SERVICE REPORT", mainTitleFont));
            titleCell.setBorder(Rectangle.BOTTOM);
            titleCell.setBorderColor(primaryColor);
            titleCell.setBorderWidth(2);
            titleCell.setPaddingBottom(10);
            headerTable.addCell(titleCell);
            document.add(headerTable);

            // Section 1: Task Information
            Paragraph s1Title = new Paragraph("1. Task Information", sectionTitleFont);
            s1Title.setSpacingAfter(8);
            document.add(s1Title);

            PdfPTable taskInfoTable = new PdfPTable(2);
            taskInfoTable.setWidthPercentage(100);
            taskInfoTable.setSpacingAfter(16);
            taskInfoTable.setWidths(new float[]{1f, 1f});

            addTaskInfoRow(taskInfoTable, "Task Code:", task.getTaskCode(), labelFont, valueFont);
            addTaskInfoRow(taskInfoTable, "Priority:", task.getPriority().name(), labelFont, valueFont);
            addTaskInfoRow(taskInfoTable, "Title:", task.getTitle(), labelFont, valueFont);
            addTaskInfoRow(taskInfoTable, "Current Status:", task.getStatus().name(), labelFont, valueFont);
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            addTaskInfoRow(taskInfoTable, "Reported At:", task.getCreatedAt() != null ? task.getCreatedAt().format(formatter) : "N/A", labelFont, valueFont);
            addTaskInfoRow(taskInfoTable, "Completed At:", task.getCompletedAt() != null ? task.getCompletedAt().format(formatter) : "N/A", labelFont, valueFont);
            
            document.add(taskInfoTable);

            // Section 2: Asset Details
            Paragraph s2Title = new Paragraph("2. Affected Asset", sectionTitleFont);
            s2Title.setSpacingAfter(8);
            document.add(s2Title);

            PdfPTable assetInfoTable = new PdfPTable(2);
            assetInfoTable.setWidthPercentage(100);
            assetInfoTable.setSpacingAfter(16);
            
            if (task.getAsset() != null) {
                addTaskInfoRow(assetInfoTable, "Asset Name:", task.getAsset().getAssetName(), labelFont, valueFont);
                addTaskInfoRow(assetInfoTable, "Asset Code:", task.getAsset().getAssetCode(), labelFont, valueFont);
                addTaskInfoRow(assetInfoTable, "Category:", task.getAsset().getCategory(), labelFont, valueFont);
                addTaskInfoRow(assetInfoTable, "Location:", task.getAsset().getLocation(), labelFont, valueFont);
                addTaskInfoRow(assetInfoTable, "Manufacturer:", task.getAsset().getManufacturer() != null ? task.getAsset().getManufacturer() : "N/A", labelFont, valueFont);
                addTaskInfoRow(assetInfoTable, "Installation Date:", task.getAsset().getInstallationDate() != null ? task.getAsset().getInstallationDate().toString() : "N/A", labelFont, valueFont);
            } else {
                PdfPCell emptyAssetCell = new PdfPCell(new Paragraph("No asset associated with this task.", italicFont));
                emptyAssetCell.setColspan(2);
                emptyAssetCell.setBorder(Rectangle.NO_BORDER);
                assetInfoTable.addCell(emptyAssetCell);
            }
            document.add(assetInfoTable);

            // Section 3: Technician Service Report
            Paragraph s3Title = new Paragraph("3. Service Report", sectionTitleFont);
            s3Title.setSpacingAfter(8);
            document.add(s3Title);

            ServiceReport report = task.getServiceReport();
            if (report != null) {
                PdfPTable reportTable = new PdfPTable(1);
                reportTable.setWidthPercentage(100);
                reportTable.setSpacingAfter(16);

                addBlockCell(reportTable, "Root Cause of Issue:", report.getRootCause(), labelFont, valueFont, lightGray);
                addBlockCell(reportTable, "Work Performed:", report.getWorkPerformed(), labelFont, valueFont, Color.WHITE);
                addBlockCell(reportTable, "Time Spent (Minutes):", String.valueOf(report.getTimeSpentMinutes()) + " mins", labelFont, valueFont, lightGray);
                addBlockCell(reportTable, "Maintenance Recommendations:", report.getRecommendations() != null ? report.getRecommendations() : "None provided", labelFont, valueFont, Color.WHITE);

                document.add(reportTable);
            } else {
                Paragraph noReport = new Paragraph("No technician service report submitted yet.", italicFont);
                noReport.setSpacingAfter(16);
                document.add(noReport);
            }

            // Section 4: Materials Consumed
            Paragraph s4Title = new Paragraph("4. Materials & Spares Consumed", sectionTitleFont);
            s4Title.setSpacingAfter(8);
            document.add(s4Title);

            List<MaterialRequest> requests = materialRequestRepository.findByTaskId(task.getId());
            List<MaterialRequest> approvedRequests = requests.stream()
                    .filter(r -> r.getStatus() == MaterialRequest.RequestStatus.APPROVED)
                    .toList();

            if (!approvedRequests.isEmpty()) {
                PdfPTable materialTable = new PdfPTable(3);
                materialTable.setWidthPercentage(100);
                materialTable.setSpacingAfter(16);
                materialTable.setWidths(new float[]{2f, 1f, 1f});

                // Headers
                PdfPCell h1 = new PdfPCell(new Paragraph("Material Name", labelFont));
                h1.setBackgroundColor(lightGray);
                PdfPCell h2 = new PdfPCell(new Paragraph("Quantity Approved", labelFont));
                h2.setBackgroundColor(lightGray);
                PdfPCell h3 = new PdfPCell(new Paragraph("Status", labelFont));
                h3.setBackgroundColor(lightGray);

                materialTable.addCell(h1);
                materialTable.addCell(h2);
                materialTable.addCell(h3);

                for (MaterialRequest r : approvedRequests) {
                    materialTable.addCell(new PdfPCell(new Paragraph(r.getMaterialName(), valueFont)));
                    materialTable.addCell(new PdfPCell(new Paragraph(String.valueOf(r.getQuantity()), valueFont)));
                    materialTable.addCell(new PdfPCell(new Paragraph(r.getStatus().name(), valueFont)));
                }
                document.add(materialTable);
            } else {
                Paragraph noMaterials = new Paragraph("No materials or spare parts approved for this work order.", italicFont);
                noMaterials.setSpacingAfter(20);
                document.add(noMaterials);
            }

            // Footer / Signature Section
            document.add(new Chunk("\n\n"));
            PdfPTable sigTable = new PdfPTable(2);
            sigTable.setWidthPercentage(100);
            sigTable.setWidths(new float[]{1f, 1f});

            PdfPCell leftSig = new PdfPCell();
            leftSig.setBorder(Rectangle.NO_BORDER);
            leftSig.addElement(new Paragraph("Technician Signature: _______________________", labelFont));
            leftSig.addElement(new Paragraph("Assigned To: " + (task.getAssignedTo() != null ? task.getAssignedTo().getFullName() : "N/A"), valueFont));
            sigTable.addCell(leftSig);

            PdfPCell rightSig = new PdfPCell();
            rightSig.setBorder(Rectangle.NO_BORDER);
            rightSig.addElement(new Paragraph("Manager Signature: _______________________", labelFont));
            rightSig.addElement(new Paragraph("Approved By: " + (task.getApprovedBy() != null ? task.getApprovedBy().getFullName() : "N/A"), valueFont));
            sigTable.addCell(rightSig);

            document.add(sigTable);

            document.close();

        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addTaskInfoRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell c1 = new PdfPCell(new Paragraph(label, labelFont));
        c1.setBorder(Rectangle.NO_BORDER);
        c1.setPadding(4);
        table.addCell(c1);

        PdfPCell c2 = new PdfPCell(new Paragraph(value != null ? value : "N/A", valueFont));
        c2.setBorder(Rectangle.NO_BORDER);
        c2.setPadding(4);
        table.addCell(c2);
    }

    private void addBlockCell(PdfPTable table, String title, String content, Font titleFont, Font contentFont, Color bg) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(bg);
        cell.setPadding(8);
        cell.setBorder(Rectangle.BOX);
        cell.setBorderColor(new Color(226, 232, 240)); // border-slate-200
        
        Paragraph t = new Paragraph(title, titleFont);
        t.setSpacingAfter(4);
        cell.addElement(t);
        cell.addElement(new Paragraph(content, contentFont));
        
        table.addCell(cell);
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/service/TaskDiscussionService.java`

```java
package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.dto.TaskDiscussionResponse;
import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.TaskDiscussion;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.MaintenanceTaskRepository;
import com.example.asset.asset_maintenance.repository.TaskDiscussionRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskDiscussionService {

    private final TaskDiscussionRepository discussionRepository;
    private final MaintenanceTaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskDiscussion addComment(Long taskId, String userEmail, String message) {

        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TaskDiscussion discussion = new TaskDiscussion();
        discussion.setTask(task);
        discussion.setUser(user);
        discussion.setMessage(message);

        return discussionRepository.save(discussion);
    }


    public List<TaskDiscussionResponse> getComments(Long taskId) {

        return discussionRepository.findByTaskId(taskId)
                .stream()
                .map(d -> {
                    TaskDiscussionResponse res = new TaskDiscussionResponse();

                    res.setMessage(d.getMessage());
                    res.setUser(d.getUser().getFullName());
                    res.setTime(d.getCreatedAt().toString());

                    return res;
                })
                .toList();
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/service/TaskHistoryService.java`

```java
package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.TaskHistory;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.TaskHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TaskHistoryService {

    private final TaskHistoryRepository taskHistoryRepository;

    @Autowired
    public TaskHistoryService(TaskHistoryRepository taskHistoryRepository) {
        this.taskHistoryRepository = taskHistoryRepository;
    }

    public void logAction(MaintenanceTask task, String action,
                          MaintenanceTask.TaskStatus fromStatus,
                          MaintenanceTask.TaskStatus toStatus,
                          User user, String remarks) {
        TaskHistory history = TaskHistory.builder()
                .task(task)
                .action(action)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .performedBy(user)
                .remarks(remarks)
                .build();

        taskHistoryRepository.save(history);
    }
}
```

---

### File: `asset-maintenance/src/main/java/com/example/asset/asset_maintenance/service/TaskStatusTransition.java`

```java
package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.MaintenanceTask.TaskStatus;
import java.util.Arrays;

public enum TaskStatusTransition {
    // Technician transitions
    ASSIGNED_TO_IN_PROGRESS(TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, "TECHNICIAN"),
    IN_PROGRESS_TO_COMPLETED(TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, "TECHNICIAN"),
    MATERIAL_APPROVED_TO_COMPLETED(TaskStatus.MATERIAL_APPROVED, TaskStatus.COMPLETED, "TECHNICIAN"),
    MATERIAL_REJECTED_TO_COMPLETED(TaskStatus.MATERIAL_REJECTED, TaskStatus.COMPLETED, "TECHNICIAN"),
    IN_PROGRESS_TO_MATERIAL_REQUESTED(TaskStatus.IN_PROGRESS, TaskStatus.MATERIAL_REQUESTED, "TECHNICIAN"),
    MATERIAL_APPROVED_TO_MATERIAL_REQUESTED(TaskStatus.MATERIAL_APPROVED, TaskStatus.MATERIAL_REQUESTED, "TECHNICIAN"),
    MATERIAL_REJECTED_TO_MATERIAL_REQUESTED(TaskStatus.MATERIAL_REJECTED, TaskStatus.MATERIAL_REQUESTED, "TECHNICIAN"),

    // Technician rework after manager rejection
    REJECTED_TO_IN_PROGRESS(TaskStatus.REJECTED, TaskStatus.IN_PROGRESS, "TECHNICIAN"),
    REJECTED_TO_MATERIAL_REQUESTED(TaskStatus.REJECTED, TaskStatus.MATERIAL_REQUESTED, "TECHNICIAN"),
    REJECTED_TO_COMPLETED(TaskStatus.REJECTED, TaskStatus.COMPLETED, "TECHNICIAN"),

    // Manager transitions
    REPORTED_TO_ASSIGNED(TaskStatus.REPORTED, TaskStatus.ASSIGNED, "MANAGER"),
    REPORTED_TO_REJECTED(TaskStatus.REPORTED, TaskStatus.REJECTED, "MANAGER"),
    COMPLETED_TO_APPROVED(TaskStatus.COMPLETED, TaskStatus.APPROVED, "MANAGER"),
    COMPLETED_TO_REJECTED(TaskStatus.COMPLETED, TaskStatus.REJECTED, "MANAGER"),
    MATERIAL_REQUESTED_TO_MATERIAL_APPROVED(TaskStatus.MATERIAL_REQUESTED, TaskStatus.MATERIAL_APPROVED, "MANAGER"),
    MATERIAL_REQUESTED_TO_MATERIAL_REJECTED(TaskStatus.MATERIAL_REQUESTED, TaskStatus.MATERIAL_REJECTED, "MANAGER");

    private final TaskStatus from;
    private final TaskStatus to;
    private final String allowedRole;

    TaskStatusTransition(TaskStatus from, TaskStatus to, String allowedRole) {
        this.from = from;
        this.to = to;
        this.allowedRole = allowedRole;
    }

    public TaskStatus getFrom() {
        return from;
    }

    public TaskStatus getTo() {
        return to;
    }

    public String getAllowedRole() {
        return allowedRole;
    }

    public static boolean isAllowed(TaskStatus from, TaskStatus to, String role) {
        // ADMIN has super privilege: can do any MANAGER transitions
        String effectiveRole = "ADMIN".equalsIgnoreCase(role) ? "MANAGER" : role;
        
        return Arrays.stream(values())
                .anyMatch(t -> t.from == from && t.to == to && t.allowedRole.equalsIgnoreCase(effectiveRole));
    }
}
```

---

### File: `asset-maintenance/src/main/resources/application.properties`

```properties
spring.application.name=asset-maintenance

# H2 Database
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# H2 Console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JPA
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

server.port=${PORT:8080}

# Multipart File Upload
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

---

### File: `asset-maintenance/src/test/java/com/example/asset/asset_maintenance/AssetMaintenanceApplicationTests.java`

```java
package com.example.asset.asset_maintenance;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AssetMaintenanceApplicationTests {

	@Test
	void contextLoads() {
	}

}
```

---

### File: `asset-maintenance/src/test/java/com/example/asset/asset_maintenance/controller/AssetControllerTest.java`

```java
package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.entity.Asset;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AssetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "manager@factory.com", roles = {"MANAGER"})
    void testCreateAssetAsManagerSuccess() throws Exception {
        Asset asset = Asset.builder()
                .assetName("Laser Engraver")
                .location("Section D")
                .status("OPERATIONAL")
                .build();

        mockMvc.perform(post("/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(asset)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assetName").value("Laser Engraver"))
                .andExpect(jsonPath("$.assetCode").isNotEmpty())
                .andExpect(jsonPath("$.manager.email").value("manager@factory.com"));
    }

    @Test
    @WithMockUser(username = "user1@factory.com", roles = {"USER"})
    void testCreateAssetAsOperatorForbidden() throws Exception {
        Asset asset = Asset.builder()
                .assetName("Laser Engraver")
                .location("Section D")
                .status("OPERATIONAL")
                .build();

        mockMvc.perform(post("/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(asset)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user1@factory.com", roles = {"USER"})
    void testGetAllAssetsAuthenticated() throws Exception {
        mockMvc.perform(get("/assets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].assetCode").exists());
    }

    @Test
    void testGetAllAssetsUnauthenticated() throws Exception {
        mockMvc.perform(get("/assets"))
                .andExpect(status().isUnauthorized());
    }
}
```

---

### File: `asset-maintenance/src/test/java/com/example/asset/asset_maintenance/controller/UserControllerTest.java`

```java
package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.dto.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRegisterUserSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest("New Operator", "new_op@factory.com", "password123");

        mockMvc.perform(post("/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("New Operator"))
                .andExpect(jsonPath("$.email").value("new_op@factory.com"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void testRegisterUserDuplicateEmail() {
        // user1@factory.com is seeded in DatabaseSeeder
        RegisterRequest request = new RegisterRequest("Duplicate", "user1@factory.com", "password123");

        Exception exception = org.junit.jupiter.api.Assertions.assertThrows(Exception.class, () -> {
            mockMvc.perform(post("/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)));
        });

        org.junit.jupiter.api.Assertions.assertNotNull(exception.getCause());
        org.junit.jupiter.api.Assertions.assertTrue(exception.getCause() instanceof RuntimeException);
        org.junit.jupiter.api.Assertions.assertEquals("User with this email already exists", exception.getCause().getMessage());
    }

    @Test
    @WithMockUser(username = "user1@factory.com", roles = {"USER"})
    void testGetProfileAuthenticated() throws Exception {
        mockMvc.perform(get("/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user1@factory.com"));
    }

    @Test
    void testGetProfileUnauthenticated() throws Exception {
        mockMvc.perform(get("/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin@factory.com", roles = {"ADMIN"})
    void testChangeUserRoleAdminSuccess() throws Exception {
        // user2@factory.com is seeded with role USER. We want to update it to TECHNICIAN.
        // First retrieve user list or hardcode user ID based on DB structure, or we can just mock
        // Since we are running on real seeded DB, let's find user2's ID.
        // Wait, to be safe and robust, let's look at updating a role.
        // In the database user2 is seeded. Let's see if we can perform change role.
        // If we don't know the exact ID, we can register a user first, get their ID, and then update their role!
        // That is very robust and guarantees we have the correct user ID. Let's do that!
        
        String registerJson = mockMvc.perform(post("/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterRequest("Temp User", "temp@factory.com", "password123"))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        // Extract ID
        Number id = objectMapper.readTree(registerJson).get("id").numberValue();
        
        mockMvc.perform(put("/users/" + id + "/role/TECHNICIAN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("TECHNICIAN"));
    }

    @Test
    @WithMockUser(username = "user1@factory.com", roles = {"USER"})
    void testChangeUserRoleForbiddenForNonAdmin() throws Exception {
        mockMvc.perform(put("/users/1/role/TECHNICIAN"))
                .andExpect(status().isForbidden());
    }
}
```

---

### File: `asset-maintenance/src/test/java/com/example/asset/asset_maintenance/service/AssetServiceTest.java`

```java
package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.Asset;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.AssetRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.security.Principal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AssetService assetService;

    private User manager;
    private Asset asset;
    private Principal principal;

    @BeforeEach
    void setUp() {
        manager = User.builder()
                .id(1L)
                .email("manager@example.com")
                .fullName("Manager User")
                .build();

        asset = Asset.builder()
                .id(1L)
                .assetName("CNC Milling Machine")
                .location("Floor A")
                .status("ACTIVE")
                .build();

        principal = mock(Principal.class);
    }

    @Test
    void testCreateAssetSuccess() {
        when(principal.getName()).thenReturn("manager@example.com");
        when(userRepository.findByEmail("manager@example.com")).thenReturn(Optional.of(manager));
        when(assetRepository.save(any(Asset.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Asset created = assetService.createAsset(asset, principal);

        assertNotNull(created);
        assertNotNull(created.getAssetCode());
        assertTrue(created.getAssetCode().startsWith("ASSET-"));
        assertEquals(manager, created.getManager());
        
        verify(userRepository, times(1)).findByEmail("manager@example.com");
        verify(assetRepository, times(1)).save(asset);
    }

    @Test
    void testCreateAssetManagerNotFound() {
        when(principal.getName()).thenReturn("unknown@example.com");
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
                assetService.createAsset(asset, principal)
        );

        assertEquals("Manager user not found", exception.getMessage());
        verify(assetRepository, never()).save(any(Asset.class));
    }

    @Test
    void testGetAllAssets() {
        List<Asset> assets = Arrays.asList(asset, new Asset());
        when(assetRepository.findAll()).thenReturn(assets);

        List<Asset> result = assetService.getAllAssets();

        assertEquals(2, result.size());
        verify(assetRepository, times(1)).findAll();
    }

    @Test
    void testGetAssetByIdSuccess() {
        when(assetRepository.findById(1L)).thenReturn(Optional.of(asset));

        Asset result = assetService.getAssetById(1L);

        assertNotNull(result);
        assertEquals("CNC Milling Machine", result.getAssetName());
        verify(assetRepository, times(1)).findById(1L);
    }

    @Test
    void testGetAssetByIdNotFound() {
        when(assetRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
                assetService.getAssetById(99L)
        );

        assertEquals("Asset not found", exception.getMessage());
        verify(assetRepository, times(1)).findById(99L);
    }
}
```

---

### File: `asset-maintenance/src/test/java/com/example/asset/asset_maintenance/service/MaintenanceTaskServiceTest.java`

```java
package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.dto.CreateTaskRequest;
import com.example.asset.asset_maintenance.dto.TaskHistoryResponse;
import com.example.asset.asset_maintenance.entity.*;
import com.example.asset.asset_maintenance.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaintenanceTaskServiceTest {

    @Mock private MaintenanceTaskRepository taskRepository;
    @Mock private AssetRepository assetRepository;
    @Mock private UserRepository userRepository;
    @Mock private TaskHistoryRepository taskHistoryRepository;
    @Mock private TaskHistoryService historyService;
    @Mock private NotificationService notificationService;
    @Mock private AttachmentRepository attachmentRepository;
    @Mock private ServiceReportRepository serviceReportRepository;

    @InjectMocks
    private MaintenanceTaskService taskService;

    private User manager;
    private User technician;
    private User operator;
    private Asset asset;
    private MaintenanceTask task;

    @BeforeEach
    void setUp() {
        Role managerRole = Role.builder().id(1L).roleName(Role.RoleName.MANAGER).build();
        Role techRole = Role.builder().id(2L).roleName(Role.RoleName.TECHNICIAN).build();
        Role userRole = Role.builder().id(3L).roleName(Role.RoleName.USER).build();

        manager = User.builder().id(10L).email("manager@example.com").fullName("Manager").build();
        manager.setUserRoles(new ArrayList<>(List.of(UserRole.builder().user(manager).role(managerRole).build())));

        technician = User.builder().id(11L).email("tech@example.com").fullName("Technician").build();
        technician.setUserRoles(new ArrayList<>(List.of(UserRole.builder().user(technician).role(techRole).build())));

        operator = User.builder().id(12L).email("operator@example.com").fullName("Operator").build();
        operator.setUserRoles(new ArrayList<>(List.of(UserRole.builder().user(operator).role(userRole).build())));

        asset = Asset.builder().id(1L).assetName("Milling Machine").assetCode("ASSET-100").build();

        task = MaintenanceTask.builder()
                .id(20L)
                .taskCode("TSK-1234-ABC")
                .title("Belt Broken")
                .description("Main driving belt is broken")
                .priority(MaintenanceTask.Priority.HIGH)
                .status(MaintenanceTask.TaskStatus.REPORTED)
                .asset(asset)
                .reportedBy(operator)
                .build();
    }

    @Test
    void testCreateTaskSuccess() {
        CreateTaskRequest request = new CreateTaskRequest();
        request.setAssetId(1L);
        request.setTitle("Belt Broken");
        request.setDescription("Main driving belt is broken");
        request.setPriority("HIGH");

        when(assetRepository.findById(1L)).thenReturn(Optional.of(asset));
        when(userRepository.findByEmail("operator@example.com")).thenReturn(Optional.of(operator));
        when(taskRepository.save(any(MaintenanceTask.class))).thenAnswer(inv -> inv.getArgument(0));

        MaintenanceTask createdTask = taskService.createTask(request, "operator@example.com");

        assertNotNull(createdTask);
        assertEquals(MaintenanceTask.TaskStatus.REPORTED, createdTask.getStatus());
        assertEquals("Belt Broken", createdTask.getTitle());
        assertEquals(operator, createdTask.getReportedBy());
        assertEquals(asset, createdTask.getAsset());
        assertNotNull(createdTask.getDueDate());

        verify(historyService, times(1)).logAction(any(), eq("CREATED"), isNull(), eq(MaintenanceTask.TaskStatus.REPORTED), eq(operator), anyString());
        verify(notificationService, times(1)).sendNotificationToRole(eq(Role.RoleName.MANAGER), anyString());
    }

    @Test
    void testAssignTaskSuccess() {
        when(taskRepository.findById(20L)).thenReturn(Optional.of(task));
        when(userRepository.findById(11L)).thenReturn(Optional.of(technician));
        when(userRepository.findByEmail("manager@example.com")).thenReturn(Optional.of(manager));
        when(taskRepository.save(any(MaintenanceTask.class))).thenAnswer(inv -> inv.getArgument(0));

        MaintenanceTask assigned = taskService.assignTask(20L, "manager@example.com", 11L);

        assertEquals(MaintenanceTask.TaskStatus.ASSIGNED, assigned.getStatus());
        assertEquals(technician, assigned.getAssignedTo());
        assertEquals(manager, assigned.getAssignedBy());

        verify(historyService, times(1)).logAction(any(), eq("ASSIGNED"), eq(MaintenanceTask.TaskStatus.REPORTED), eq(MaintenanceTask.TaskStatus.ASSIGNED), eq(manager), anyString());
        verify(notificationService, times(1)).sendNotification(eq(technician), anyString());
    }

    @Test
    void testAssignTaskInvalidStateTransition() {
        task.setStatus(MaintenanceTask.TaskStatus.COMPLETED); // Completed task cannot be assigned directly
        when(taskRepository.findById(20L)).thenReturn(Optional.of(task));
        when(userRepository.findById(11L)).thenReturn(Optional.of(technician));
        when(userRepository.findByEmail("manager@example.com")).thenReturn(Optional.of(manager));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> 
                taskService.assignTask(20L, "manager@example.com", 11L)
        );

        assertTrue(exception.getMessage().contains("Cannot transition"));
        verify(taskRepository, never()).save(any());
    }

    @Test
    void testSubmitServiceReportSuccess() {
        task.setStatus(MaintenanceTask.TaskStatus.IN_PROGRESS);
        task.setAssignedTo(technician);
        task.setAssignedBy(manager);

        when(taskRepository.findById(20L)).thenReturn(Optional.of(task));
        when(userRepository.findByEmail("tech@example.com")).thenReturn(Optional.of(technician));
        when(taskRepository.save(any(MaintenanceTask.class))).thenAnswer(inv -> inv.getArgument(0));

        MaintenanceTask result = taskService.submitServiceReport(20L, "Root Cause A", "Replaced parts", 120, "Rec A", "tech@example.com");

        assertEquals(MaintenanceTask.TaskStatus.COMPLETED, result.getStatus());
        assertNotNull(result.getServiceReport());
        assertEquals("Root Cause A", result.getServiceReport().getRootCause());

        verify(serviceReportRepository, times(1)).save(any(ServiceReport.class));
        verify(historyService, times(1)).logAction(any(), eq("COMPLETED"), eq(MaintenanceTask.TaskStatus.IN_PROGRESS), eq(MaintenanceTask.TaskStatus.COMPLETED), eq(technician), anyString());
        verify(notificationService, times(1)).sendNotification(eq(manager), anyString());
    }

    @Test
    void testSubmitServiceReportNotAssignedTech() {
        task.setStatus(MaintenanceTask.TaskStatus.IN_PROGRESS);
        task.setAssignedTo(User.builder().email("other@example.com").build());

        when(taskRepository.findById(20L)).thenReturn(Optional.of(task));
        when(userRepository.findByEmail("tech@example.com")).thenReturn(Optional.of(technician));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
                taskService.submitServiceReport(20L, "Root Cause A", "Replaced parts", 120, "Rec A", "tech@example.com")
        );

        assertEquals("Only the assigned technician can submit a service report for this task", exception.getMessage());
    }

    @Test
    void testSearchTasksManagerHasFullVisibility() {
        when(userRepository.findByEmail("manager@example.com")).thenReturn(Optional.of(manager));
        List<MaintenanceTask> mockList = Arrays.asList(task);
        when(taskRepository.searchTasks(any(), any(), any())).thenReturn(mockList);

        List<MaintenanceTask> result = taskService.searchTasks(null, null, "Belt", "manager@example.com");

        assertEquals(1, result.size());
        verify(taskRepository, times(1)).searchTasks(null, null, "Belt");
    }

    @Test
    void testSearchTasksTechnicianHasFilteredVisibility() {
        when(userRepository.findByEmail("tech@example.com")).thenReturn(Optional.of(technician));
        
        MaintenanceTask assignedToTech = MaintenanceTask.builder().reportedBy(operator).assignedTo(technician).build();
        MaintenanceTask assignedToOther = MaintenanceTask.builder().reportedBy(operator).assignedTo(User.builder().email("other@example.com").build()).build();
        
        when(taskRepository.searchTasks(any(), any(), any())).thenReturn(Arrays.asList(assignedToTech, assignedToOther));

        List<MaintenanceTask> result = taskService.searchTasks(null, null, null, "tech@example.com");

        assertEquals(1, result.size());
        assertEquals(technician, result.get(0).getAssignedTo());
    }
}
```

---

### File: `asset-maintenance/src/test/java/com/example/asset/asset_maintenance/service/TaskStatusTransitionTest.java`

```java
package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.MaintenanceTask.TaskStatus;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TaskStatusTransitionTest {

    @Test
    void testAllowedTechnicianTransitions() {
        // Technician can transition ASSIGNED -> IN_PROGRESS
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, "TECHNICIAN"));
        
        // Technician can transition IN_PROGRESS -> COMPLETED
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, "TECHNICIAN"));
        
        // Technician can transition IN_PROGRESS -> MATERIAL_REQUESTED
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.IN_PROGRESS, TaskStatus.MATERIAL_REQUESTED, "TECHNICIAN"));
        
        // Technician can transition REJECTED -> IN_PROGRESS (for rework)
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.REJECTED, TaskStatus.IN_PROGRESS, "TECHNICIAN"));
    }

    @Test
    void testAllowedManagerTransitions() {
        // Manager can transition REPORTED -> ASSIGNED
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.REPORTED, TaskStatus.ASSIGNED, "MANAGER"));
        
        // Manager can transition COMPLETED -> APPROVED
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.COMPLETED, TaskStatus.APPROVED, "MANAGER"));
        
        // Manager can transition MATERIAL_REQUESTED -> MATERIAL_APPROVED
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.MATERIAL_REQUESTED, TaskStatus.MATERIAL_APPROVED, "MANAGER"));
    }

    @Test
    void testAdminSuperPrivilege() {
        // ADMIN should be treated as MANAGER, and thus pass manager-only transitions
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.REPORTED, TaskStatus.ASSIGNED, "ADMIN"));
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.COMPLETED, TaskStatus.APPROVED, "ADMIN"));
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.MATERIAL_REQUESTED, TaskStatus.MATERIAL_APPROVED, "ADMIN"));
    }

    @Test
    void testInvalidTransitions() {
        // Technician cannot perform manager-only transitions
        assertFalse(TaskStatusTransition.isAllowed(TaskStatus.REPORTED, TaskStatus.ASSIGNED, "TECHNICIAN"));
        assertFalse(TaskStatusTransition.isAllowed(TaskStatus.COMPLETED, TaskStatus.APPROVED, "TECHNICIAN"));

        // Manager cannot perform technician-only transitions
        assertFalse(TaskStatusTransition.isAllowed(TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, "MANAGER"));
        assertFalse(TaskStatusTransition.isAllowed(TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, "MANAGER"));

        // Operator/User cannot perform any transitions in the enum
        assertFalse(TaskStatusTransition.isAllowed(TaskStatus.REPORTED, TaskStatus.ASSIGNED, "USER"));
        assertFalse(TaskStatusTransition.isAllowed(TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, "USER"));

        // Random illegal transitions
        assertFalse(TaskStatusTransition.isAllowed(TaskStatus.REPORTED, TaskStatus.APPROVED, "MANAGER"));
        assertFalse(TaskStatusTransition.isAllowed(TaskStatus.ASSIGNED, TaskStatus.COMPLETED, "TECHNICIAN"));
    }
}
```

---

### File: `asset-maintenance/src/test/resources/application.properties`

```properties
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MySQL
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
```

---

### File: `system_diagram_explanation.txt`

```
================================================================================
          ASSET MAINTENANCE AUTOMATION SYSTEM - SYSTEM WORKING DIAGRAMS
================================================================================

This document contains flow charts, sequence diagrams, and architecture descriptions 
to help you understand exactly how the system operates across all user roles.

--------------------------------------------------------------------------------
1. HIGH-LEVEL ARCHITECTURE & DATA FLOW
--------------------------------------------------------------------------------

+--------------------------------------------------------------------------+
|                            REACT FRONTEND (Vite)                         |
|  - Renders UI based on user role (Operator, Tech, Manager, Admin)        |
|  - Axios client interceptor attaches HTTP Basic Auth token header        |
+--------------------------------------------------------------------------+
                                    |
                                    | HTTP Requests (REST APIs)
                                    v
+--------------------------------------------------------------------------+
|                          SPRING BOOT BACKEND (Port 8080)                 |
|                                                                          |
|  [Spring Security Filter Chain]                                          |
|    - Validates "Authorization: Basic Base64(email:password)"             |
|    - Checks method-level privileges (e.g. @PreAuthorize("hasRole('ADMIN')")|
|                                                                          |
|  [Controllers]                                                           |
|    - RestControllers route requests (Asset, Task, Material, User)        |
|                                                                          |
|  [Services & Repositories]                                               |
|    - Business logic execution & Task history logging                     |
|    - JPA / Hibernate mapping                                             |
+--------------------------------------------------------------------------+
                                    |
                                    | SQL Queries
                                    v
+--------------------------------------------------------------------------+
|                             DATABASE (H2 / MySQL)                        |
|  - Stores Assets, Maintenance Tasks, Materials, Users, Roles, History    |
+--------------------------------------------------------------------------+

--------------------------------------------------------------------------------
2. ROLE-BASED SEQUENCE FLOW (HOW ROLES INTERACT)
--------------------------------------------------------------------------------

  OPERATOR                  MANAGER                     TECHNICIAN                ADMIN
     │                         │                            │                       │
     │ 1. Reports breakdown    │                            │                       │
     ├────────────────────────►│                            │                       │
     │    (e.g., CNC axis jam) │                            │                       │
     │                         │ 2. Assigns technician      │                       │
     │                         ├───────────────────────────►│                       │
     │                         │    (Status: ASSIGNED)      │                       │
     │                         │                            │                       │
     │                         │                            │ 3. Clicks "Start"     │
     │                         │                            ├────────┐              │
     │                         │                            │        │              │
     │                         │                            │◄───────┘              │
     │                         │                            │ (Status: IN_PROGRESS) │
     │                         │                            │                       │
     │                         │                            │ 4. Requests parts     │
     │                         │ 5. Approves / Rejects      │◄───────┤              │
     │                         │◄───────────────────────────┤                       │
     │                         │    (MATERIAL_APPROVED/     │                       │
     │                         │     MATERIAL_REJECTED)     │                       │
     │                         │                            │                       │
     │                         │                            │ 6. Marks completed    │
     │                         │ 7. Reviews completed task  │◄───────┤              │
     │                         │◄───────────────────────────┤                       │
     │                         │    (Status: COMPLETED)     │                       │
     │                         ├────────┐                   │                       │
     │                         │        │                   │                       │
     │                         │◄───────┘                   │                       │
     │                         │                            │                       │
     │                         ├───────────────────────────►│                       │
     │                         │  Rejects (Rework needed)   │                       │
     │                         │  (Status goes back to      │                       │
     │                         │   IN_PROGRESS)             │                       │
     │                         │                            │                       │
     │                         ├────────────────────────────┼──────────────────────►│
     │                         │                            │                       │ 8. Manages User Roles
     │                         │                            │                       │    & system assets
     │                         │                            │                       │    (ADMIN Panel only)

--------------------------------------------------------------------------------
3. DETAILED MAINTENANCE TASK LIFECYCLE (STATE TRANSITION DIAGRAM)
--------------------------------------------------------------------------------

  [Operator Reports]
         │
         v
    ( REPORTED ) ──[Manager Rejects reported task]──> ( REJECTED_REPORTED )
         │
         │ [Manager Assigns Task to Tech]
         v
    ( ASSIGNED )
         │
         │ [Tech clicks "Start Work"]
         v
  +-> ( IN_PROGRESS ) <───────────────────────────────────────────────────────+
  │      │                                                                    │
  │      ├──[Tech needs parts]──> ( MATERIAL_REQUESTED )                      │
  │      │                             │                                      │
  │      │                             ├──[Manager Approves]─> ( MAT_APPROVED )
  │      │                             │                                      │
  │      │                             └──[Manager Rejects]──> ( MAT_REJECTED )
  │      │                                                            │
  │      │ [Tech completes job]                                       │
  │      +────────────────────────────────────────────────────────────+
  │                                    │
  │                                    v
  │                              ( COMPLETED )
  │                                    │
  │                                    ├──[Manager approves work]──> ( APPROVED / CLOSED )
  │                                    │
  │                                    └──[Manager rejects work]────> [Loop back to IN_PROGRESS]
  └────────────────────────────────────┘

================================================================================
```

---

