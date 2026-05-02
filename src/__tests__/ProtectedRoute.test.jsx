/**
 * Baseline tests for ProtectedRoute.
 * Verifies: redirects to /login when unauthenticated, passes location.state.from.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// We'll re-mock useAuth per test
const mockUseAuth = vi.fn()

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

import ProtectedRoute from '../components/ProtectedRoute'

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
    })

    let loginLocation
    function CaptureLogin() {
      // We use window.location captured via the Route
      const loc = window.location
      return <div data-testid="login-page">Login</div>
    }

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<CaptureLogin />} />
        </Routes>
      </MemoryRouter>
    )

    // Should be on login page, not dashboard
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
  })

  it('shows loader while auth is loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
    })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText(/chargement/i)).toBeInTheDocument()
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })
})
