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
