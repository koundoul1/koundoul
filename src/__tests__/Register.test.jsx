/**
 * Baseline tests for Register page.
 * Verifies: renders without crash, password 8-char minimum, required fields validation.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../hooks/useTranslation.jsx'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    register: vi.fn().mockResolvedValue({ success: false }),
    isAuthenticated: false,
    user: null,
    error: null,
    clearError: vi.fn(),
    loading: false,
  }),
}))

vi.mock('../services/api', () => ({
  default: {
    utils: {
      checkEmail: vi.fn().mockResolvedValue({ available: true }),
      checkUsername: vi.fn().mockResolvedValue({ available: true }),
    },
  },
}))

import Register from '../pages/Register'

function renderRegister() {
  return render(
    <I18nProvider>
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    </I18nProvider>
  )
}

describe('Register page', () => {
  it('renders without crash', () => {
    renderRegister()
    expect(screen.getByRole('button', { name: /créer mon compte|create my account/i })).toBeInTheDocument()
  })

  it('shows required field errors when submitting empty form', async () => {
    const user = userEvent.setup()
    renderRegister()

    await user.click(screen.getByRole('button', { name: /créer mon compte|create my account/i }))

    // At least one error message should appear (first name required)
    const errorMessages = document.querySelectorAll('.text-red-600, .text-red-400')
    expect(errorMessages.length).toBeGreaterThan(0)
  })

  it('rejects passwords shorter than 8 characters', async () => {
    const user = userEvent.setup()
    const { container } = renderRegister()

    // Fill all required fields with valid data except short password
    await user.type(container.querySelector('#firstName'), 'Test')
    await user.type(container.querySelector('#lastName'), 'User')
    await user.type(container.querySelector('#username'), 'testuser')
    await user.type(container.querySelector('#email'), 'test@test.com')
    await user.type(container.querySelector('#password'), 'Short7!')  // 7 chars
    await user.type(container.querySelector('#confirmPassword'), 'Short7!')

    await user.click(screen.getByRole('button', { name: /créer mon compte|create my account/i }))

    // Should show the "at least 8 characters" error
    expect(container.textContent).toMatch(/au moins 8|at least 8/i)
  })
})
