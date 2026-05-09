/**
 * Baseline tests for Register page (2-step flow).
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
  it('renders step 1 with two auth method cards', () => {
    renderRegister()
    expect(screen.getByText(/Email \+ Mot de passe/i)).toBeInTheDocument()
    expect(screen.getByText(/l\u00e9phone \+ Code PIN/i)).toBeInTheDocument()
  })

  it('shows email and password fields when password method selected', async () => {
    const user = userEvent.setup()
    renderRegister()

    await user.click(screen.getByText(/Email \+ Mot de passe/i))

    expect(screen.getByPlaceholderText(/ton@email.com/i)).toBeInTheDocument()
    expect(screen.getByText(/Suivant/i)).toBeInTheDocument()
  })

  it('rejects short password before going to step 2', async () => {
    const user = userEvent.setup()
    const { container } = renderRegister()

    await user.click(screen.getByText(/Email \+ Mot de passe/i))

    const emailInput = container.querySelector('#email')
    const passwordInput = container.querySelector('#password')
    const confirmInput = container.querySelector('#confirmPassword')

    await user.type(emailInput, 'test@test.com')
    await user.type(passwordInput, 'Short7!')
    await user.type(confirmInput, 'Short7!')

    await user.click(screen.getByText(/Suivant/i))

    expect(container.textContent).toMatch(/au moins 8|at least 8/i)
  })
})
