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
  it('renders step 0 with role choice (Eleve / Parent)', () => {
    renderRegister()
    expect(screen.getByText(/Eleve/i)).toBeInTheDocument()
    expect(screen.getByText(/Parent/i)).toBeInTheDocument()
  })

  it('shows auth method cards after selecting Eleve role', async () => {
    const user = userEvent.setup()
    renderRegister()
    await user.click(screen.getByText(/Eleve/i))
    expect(screen.getAllByText(/Email/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/PIN/i).length).toBeGreaterThanOrEqual(1)
  })

  it('shows email and password fields when password method selected', async () => {
    const user = userEvent.setup()
    renderRegister()
    await user.click(screen.getByText(/Eleve/i))
    const emailCards = screen.getAllByText(/Email \+ /i)
    await user.click(emailCards[0])
    expect(screen.getByPlaceholderText(/ton@email.com/i)).toBeInTheDocument()
  })

  it('rejects short password before going to step 2', async () => {
    const user = userEvent.setup()
    const { container } = renderRegister()
    await user.click(screen.getByText(/Eleve/i))
    const emailCards = screen.getAllByText(/Email \+ /i)
    await user.click(emailCards[0])

    const emailInput = container.querySelector('#email')
    const passwordInput = container.querySelector('#password')
    const confirmInput = container.querySelector('#confirmPassword')

    await user.type(emailInput, 'test@test.com')
    await user.type(passwordInput, 'Short7!')
    await user.type(confirmInput, 'Short7!')

    // Click the "Next" button (Suivant in FR)
    const nextBtn = screen.getByRole('button', { name: /suivant|next/i })
    await user.click(nextBtn)

    expect(container.textContent).toMatch(/au moins 8|at least 8/i)
  })
})
