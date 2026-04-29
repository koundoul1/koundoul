/**
 * Baseline tests for Login page.
 * Verifies: renders without crash, required field errors, no password length check.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../hooks/useTranslation.jsx'

// Mock AuthContext before importing Login
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue({ success: false }),
    isAuthenticated: false,
    user: null,
    error: null,
    clearError: vi.fn(),
    loading: false,
  }),
}))

import Login from '../pages/Login'

function renderLogin() {
  return render(
    <I18nProvider>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </I18nProvider>
  )
}

describe('Login page', () => {
  it('renders without crash', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /se connecter|sign in/i })).toBeInTheDocument()
  })

  it('shows required errors when submitting empty form', async () => {
    const user = userEvent.setup()
    renderLogin()

    const submitBtn = screen.getByRole('button', { name: /se connecter|sign in/i })
    await user.click(submitBtn)

    // Both email and password required errors should appear
    expect(screen.getByText(/email.*(requis|required)/i)).toBeInTheDocument()
    expect(screen.getByText(/mot de passe.*(requis|required)|password.*(required)/i)).toBeInTheDocument()
  })

  it('does NOT validate password length (allows 6-7 char passwords for existing users)', async () => {
    const user = userEvent.setup()
    renderLogin()

    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText('••••••••')

    await user.type(emailInput, 'test@test.com')
    await user.type(passwordInput, '1234567') // 7 chars — should be allowed

    const submitBtn = screen.getByRole('button', { name: /se connecter|sign in/i })
    await user.click(submitBtn)

    // Should NOT show a "minimum 8 characters" error
    const minLengthErrors = screen.queryAllByText(/au moins 8|at least 8/i)
    expect(minLengthErrors).toHaveLength(0)
  })
})
