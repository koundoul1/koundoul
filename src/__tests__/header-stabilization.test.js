/**
 * Regression tests for header stabilization (bugs #2, #3, #8).
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const srcDir = path.resolve(__dirname, '..')

function readFile(relativePath) {
  return fs.readFileSync(path.join(srcDir, relativePath), 'utf-8')
}

// ── TopBar overflow prevention (#2, #3) ───────────────────────────────

describe('TopBar responsive overflow prevention', () => {
  const topBar = readFile('components/TopBar.jsx')

  it('streak/XP badges are hidden below lg breakpoint', () => {
    // They should be hidden lg:flex, not visible at md
    expect(topBar).toMatch(/hidden lg:flex.*items-center.*gap-2/)
  })

  it('search button is hidden below lg breakpoint', () => {
    expect(topBar).toMatch(/hidden lg:block.*p-2/)
  })

  it('share button is hidden below lg breakpoint', () => {
    expect(topBar).toContain('hidden lg:block p-2')
  })

  it('right side gap reduces on md viewport', () => {
    expect(topBar).toContain('gap-1.5 lg:gap-3')
  })

  it('notification bell is always visible at md+', () => {
    // NotificationBell should NOT have hidden lg: — it must be visible at md
    const notifSection = topBar.match(/Notifications.*?NotificationBell/s)
    expect(notifSection).toBeTruthy()
    // The div wrapping NotificationBell should not have hidden lg:
    expect(topBar).not.toMatch(/hidden lg:.*NotificationBell/)
  })

  it('user avatar is always visible at md+', () => {
    // The avatar button should not have hidden lg:
    expect(topBar).not.toMatch(/hidden lg:.*showUserMenu/)
  })

  it('dropdown has max-width guard', () => {
    expect(topBar).toContain('max-w-[calc(100vw-1rem)]')
  })
})

// ── ForgotPassword page (#8) ──────────────────────────────────────────

describe('ForgotPassword page', () => {
  it('page component exists', () => {
    const filePath = path.join(srcDir, 'pages/ForgotPassword.jsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('has dark theme (no light bg)', () => {
    const content = readFile('pages/ForgotPassword.jsx')
    expect(content).toContain('bg-gray-900')
    expect(content).not.toMatch(/bg-white[\s"']/)
    expect(content).not.toMatch(/bg-gray-50[\s"']/)
  })

  it('has email link and back to login', () => {
    const content = readFile('pages/ForgotPassword.jsx')
    expect(content).toContain('contact@koundoul.com')
    expect(content).toContain('/login')
  })

  it('uses i18n translations', () => {
    const content = readFile('pages/ForgotPassword.jsx')
    expect(content).toContain("t('auth.forgotPassword.title')")
    expect(content).toContain("t('auth.forgotPassword.description')")
    expect(content).toContain("t('auth.forgotPassword.backToLogin')")
  })

  it('route is registered in App.jsx', () => {
    const appContent = readFile('App.jsx')
    expect(appContent).toContain('/forgot-password')
    expect(appContent).toContain('ForgotPassword')
  })
})
