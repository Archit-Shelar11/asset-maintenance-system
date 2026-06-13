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
