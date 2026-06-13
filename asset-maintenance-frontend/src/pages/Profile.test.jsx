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
