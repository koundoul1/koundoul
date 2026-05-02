/**
 * Test wrapper providing the same providers as App.jsx:
 * I18nProvider + AuthContext + MemoryRouter
 */
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../hooks/useTranslation.jsx'

// Minimal auth context for tests — override via props
import React, { createContext, useContext } from 'react'

const AuthContext = createContext()

export const MockAuthProvider = ({ value, children }) => {
  const defaults = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    clearError: vi.fn(),
    ...value,
  }
  return <AuthContext.Provider value={defaults}>{children}</AuthContext.Provider>
}

// Patch useAuth to use our mock context in tests
export { AuthContext }

/**
 * Full wrapper for rendering components in tests.
 * Usage: render(<MyComponent />, { wrapper: createWrapper({ auth, route }) })
 */
export function createWrapper({ auth = {}, route = '/' } = {}) {
  return function Wrapper({ children }) {
    return (
      <I18nProvider>
        <MockAuthProvider value={auth}>
          <MemoryRouter initialEntries={[route]}>
            {children}
          </MemoryRouter>
        </MockAuthProvider>
      </I18nProvider>
    )
  }
}
