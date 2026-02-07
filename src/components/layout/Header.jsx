/**
 * 🧭 Header Koundoul
 * Barre de navigation principale avec menu transversal
 * Utilise MobileHeader sur mobile, DesktopHeader sur desktop
 */

import React from 'react'
import MobileHeader from './MobileHeader'
import DesktopHeader from './DesktopHeader'

const Header = () => {
  return (
    <>
      {/* Header mobile - visible uniquement sur mobile */}
      <div className="md:hidden">
        <MobileHeader />
                      </div>

      {/* Header desktop - visible uniquement sur desktop */}
      <div className="hidden md:block">
        <DesktopHeader />
      </div>
    </>
  )
}

export default Header
