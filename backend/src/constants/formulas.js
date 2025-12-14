/**
 * 📐 FORMULES PHYSIQUES FONDAMENTALES - KOUNDOUL
 * Base de données des formules pour la résolution automatique
 */

// ========================================
// FORMULES DE MÉCANIQUE
// ========================================

export const MECHANICS_FORMULAS = {
  // Cinématique
  'vitesse_moyenne': {
    formula: 'v = Δx / Δt',
    description: 'Vitesse moyenne',
    variables: {
      'v': 'Vitesse (m/s)',
      'Δx': 'Déplacement (m)',
      'Δt': 'Intervalle de temps (s)'
    },
    category: 'kinematics'
  },

  'vitesse_instantanee': {
    formula: 'v = dx/dt',
    description: 'Vitesse instantanée (dérivée)',
    variables: {
      'v': 'Vitesse instantanée (m/s)',
      'dx': 'Déplacement infinitésimal (m)',
      'dt': 'Temps infinitésimal (s)'
    },
    category: 'kinematics'
  },

  'acceleration_moyenne': {
    formula: 'a = Δv / Δt',
    description: 'Accélération moyenne',
    variables: {
      'a': 'Accélération (m/s²)',
      'Δv': 'Variation de vitesse (m/s)',
      'Δt': 'Intervalle de temps (s)'
    },
    category: 'kinematics'
  },

  'mouvement_uniforme': {
    formula: 'x(t) = x₀ + v₀t',
    description: 'Position en mouvement uniforme',
    variables: {
      'x(t)': 'Position au temps t (m)',
      'x₀': 'Position initiale (m)',
      'v₀': 'Vitesse initiale (m/s)',
      't': 'Temps (s)'
    },
    category: 'kinematics'
  },

  'mouvement_uniformement_accelere': {
    formula: 'x(t) = x₀ + v₀t + ½at²',
    description: 'Position en mouvement uniformément accéléré',
    variables: {
      'x(t)': 'Position au temps t (m)',
      'x₀': 'Position initiale (m)',
      'v₀': 'Vitesse initiale (m/s)',
      'a': 'Accélération (m/s²)',
      't': 'Temps (s)'
    },
    category: 'kinematics'
  },

  'vitesse_finale': {
    formula: 'v = v₀ + at',
    description: 'Vitesse finale en mouvement uniformément accéléré',
    variables: {
      'v': 'Vitesse finale (m/s)',
      'v₀': 'Vitesse initiale (m/s)',
      'a': 'Accélération (m/s²)',
      't': 'Temps (s)'
    },
    category: 'kinematics'
  },

  'equation_torricelli': {
    formula: 'v² = v₀² + 2a(x - x₀)',
    description: 'Équation de Torricelli (sans temps)',
    variables: {
      'v': 'Vitesse finale (m/s)',
      'v₀': 'Vitesse initiale (m/s)',
      'a': 'Accélération (m/s²)',
      'x': 'Position finale (m)',
      'x₀': 'Position initiale (m)'
    },
    category: 'kinematics'
  },

  // Dynamique
  'deuxieme_loi_newton': {
    formula: 'F = ma',
    description: 'Deuxième loi de Newton',
    variables: {
      'F': 'Force (N)',
      'm': 'Masse (kg)',
      'a': 'Accélération (m/s²)'
    },
    category: 'dynamics'
  },

  'force_gravitationnelle': {
    formula: 'F = Gm₁m₂/r²',
    description: 'Loi de gravitation universelle',
    variables: {
      'F': 'Force gravitationnelle (N)',
      'G': 'Constante de gravitation (6.674×10⁻¹¹ N·m²/kg²)',
      'm₁, m₂': 'Masses des objets (kg)',
      'r': 'Distance entre les centres (m)'
    },
    category: 'dynamics'
  },

  'poids': {
    formula: 'P = mg',
    description: 'Poids d\'un objet',
    variables: {
      'P': 'Poids (N)',
      'm': 'Masse (kg)',
      'g': 'Accélération de la pesanteur (9.81 m/s²)'
    },
    category: 'dynamics'
  },

  'force_centripete': {
    formula: 'F = mv²/r',
    description: 'Force centripète',
    variables: {
      'F': 'Force centripète (N)',
      'm': 'Masse (kg)',
      'v': 'Vitesse tangentielle (m/s)',
      'r': 'Rayon de courbure (m)'
    },
    category: 'dynamics'
  },

  'force_frottement': {
    formula: 'f = μN',
    description: 'Force de frottement cinétique',
    variables: {
      'f': 'Force de frottement (N)',
      'μ': 'Coefficient de frottement',
      'N': 'Force normale (N)'
    },
    category: 'dynamics'
  },

  // Énergie et travail
  'travail': {
    formula: 'W = F·d·cos(θ)',
    description: 'Travail d\'une force',
    variables: {
      'W': 'Travail (J)',
      'F': 'Force (N)',
      'd': 'Déplacement (m)',
      'θ': 'Angle entre force et déplacement (rad)'
    },
    category: 'energy'
  },

  'energie_cinetique': {
    formula: 'K = ½mv²',
    description: 'Énergie cinétique',
    variables: {
      'K': 'Énergie cinétique (J)',
      'm': 'Masse (kg)',
      'v': 'Vitesse (m/s)'
    },
    category: 'energy'
  },

  'energie_potentielle_gravitationnelle': {
    formula: 'U = mgh',
    description: 'Énergie potentielle gravitationnelle',
    variables: {
      'U': 'Énergie potentielle (J)',
      'm': 'Masse (kg)',
      'g': 'Accélération de la pesanteur (m/s²)',
      'h': 'Hauteur (m)'
    },
    category: 'energy'
  },

  'energie_potentielle_gravitationnelle_generale': {
    formula: 'U = -Gm₁m₂/r',
    description: 'Énergie potentielle gravitationnelle générale',
    variables: {
      'U': 'Énergie potentielle (J)',
      'G': 'Constante de gravitation (N·m²/kg²)',
      'm₁, m₂': 'Masses (kg)',
      'r': 'Distance (m)'
    },
    category: 'energy'
  },

  'energie_potentielle_elastique': {
    formula: 'U = ½kx²',
    description: 'Énergie potentielle élastique',
    variables: {
      'U': 'Énergie potentielle (J)',
      'k': 'Constante de raideur (N/m)',
      'x': 'Allongement (m)'
    },
    category: 'energy'
  },

  'conservation_energie': {
    formula: 'E₁ = E₂',
    description: 'Conservation de l\'énergie mécanique',
    variables: {
      'E₁': 'Énergie mécanique initiale (J)',
      'E₂': 'Énergie mécanique finale (J)'
    },
    category: 'energy'
  },

  'puissance': {
    formula: 'P = W/t = F·v',
    description: 'Puissance',
    variables: {
      'P': 'Puissance (W)',
      'W': 'Travail (J)',
      't': 'Temps (s)',
      'F': 'Force (N)',
      'v': 'Vitesse (m/s)'
    },
    category: 'energy'
  },

  // Quantité de mouvement
  'quantite_mouvement': {
    formula: 'p = mv',
    description: 'Quantité de mouvement',
    variables: {
      'p': 'Quantité de mouvement (kg·m/s)',
      'm': 'Masse (kg)',
      'v': 'Vitesse (m/s)'
    },
    category: 'momentum'
  },

  'conservation_momentum': {
    formula: 'p₁ + p₂ = p₁\' + p₂\'',
    description: 'Conservation de la quantité de mouvement',
    variables: {
      'p₁, p₂': 'Quantités de mouvement initiales (kg·m/s)',
      'p₁\', p₂\'': 'Quantités de mouvement finales (kg·m/s)'
    },
    category: 'momentum'
  },

  'impulsion': {
    formula: 'J = F·Δt = Δp',
    description: 'Impulsion',
    variables: {
      'J': 'Impulsion (N·s)',
      'F': 'Force moyenne (N)',
      'Δt': 'Durée (s)',
      'Δp': 'Variation de quantité de mouvement (kg·m/s)'
    },
    category: 'momentum'
  }
};

// ========================================
// FORMULES D'ÉLECTROMAGNÉTISME
// ========================================

export const ELECTROMAGNETISM_FORMULAS = {
  // Électrostatique
  'loi_coulomb': {
    formula: 'F = kq₁q₂/r²',
    description: 'Loi de Coulomb',
    variables: {
      'F': 'Force électrique (N)',
      'k': 'Constante de Coulomb (8.99×10⁹ N·m²/C²)',
      'q₁, q₂': 'Charges électriques (C)',
      'r': 'Distance entre charges (m)'
    },
    category: 'electrostatics'
  },

  'champ_electrique': {
    formula: 'E = F/q = kq/r²',
    description: 'Champ électrique',
    variables: {
      'E': 'Champ électrique (N/C)',
      'F': 'Force électrique (N)',
      'q': 'Charge d\'essai (C)',
      'k': 'Constante de Coulomb (N·m²/C²)'
    },
    category: 'electrostatics'
  },

  'potentiel_electrique': {
    formula: 'V = U/q = kq/r',
    description: 'Potentiel électrique',
    variables: {
      'V': 'Potentiel électrique (V)',
      'U': 'Énergie potentielle (J)',
      'q': 'Charge (C)',
      'k': 'Constante de Coulomb (N·m²/C²)',
      'r': 'Distance (m)'
    },
    category: 'electrostatics'
  },

  'capacite': {
    formula: 'C = Q/V',
    description: 'Capacité d\'un condensateur',
    variables: {
      'C': 'Capacité (F)',
      'Q': 'Charge (C)',
      'V': 'Tension (V)'
    },
    category: 'electrostatics'
  },

  'energie_condensateur': {
    formula: 'U = ½CV² = ½Q²/C',
    description: 'Énergie stockée dans un condensateur',
    variables: {
      'U': 'Énergie (J)',
      'C': 'Capacité (F)',
      'V': 'Tension (V)',
      'Q': 'Charge (C)'
    },
    category: 'electrostatics'
  },

  // Électrodynamique
  'courant_electrique': {
    formula: 'I = Q/t',
    description: 'Courant électrique',
    variables: {
      'I': 'Courant (A)',
      'Q': 'Charge (C)',
      't': 'Temps (s)'
    },
    category: 'electrodynamics'
  },

  'loi_ohm': {
    formula: 'V = RI',
    description: 'Loi d\'Ohm',
    variables: {
      'V': 'Tension (V)',
      'R': 'Résistance (Ω)',
      'I': 'Courant (A)'
    },
    category: 'electrodynamics'
  },

  'puissance_electrique': {
    formula: 'P = VI = RI² = V²/R',
    description: 'Puissance électrique',
    variables: {
      'P': 'Puissance (W)',
      'V': 'Tension (V)',
      'I': 'Courant (A)',
      'R': 'Résistance (Ω)'
    },
    category: 'electrodynamics'
  },

  'energie_electrique': {
    formula: 'E = Pt = VIt',
    description: 'Énergie électrique',
    variables: {
      'E': 'Énergie (J)',
      'P': 'Puissance (W)',
      't': 'Temps (s)',
      'V': 'Tension (V)',
      'I': 'Courant (A)'
    },
    category: 'electrodynamics'
  },

  // Magnétisme
  'force_magnetique': {
    formula: 'F = qvBsin(θ)',
    description: 'Force magnétique sur une charge en mouvement',
    variables: {
      'F': 'Force magnétique (N)',
      'q': 'Charge (C)',
      'v': 'Vitesse (m/s)',
      'B': 'Champ magnétique (T)',
      'θ': 'Angle entre v et B (rad)'
    },
    category: 'magnetism'
  },

  'force_laplace': {
    formula: 'F = ILBsin(θ)',
    description: 'Force de Laplace (force magnétique sur un conducteur)',
    variables: {
      'F': 'Force magnétique (N)',
      'I': 'Courant (A)',
      'L': 'Longueur du conducteur (m)',
      'B': 'Champ magnétique (T)',
      'θ': 'Angle entre I et B (rad)'
    },
    category: 'magnetism'
  },

  'induction_electromagnetique': {
    formula: 'ε = -N(dΦ/dt)',
    description: 'Loi de Faraday (induction électromagnétique)',
    variables: {
      'ε': 'Force électromotrice (V)',
      'N': 'Nombre de spires',
      'Φ': 'Flux magnétique (Wb)',
      't': 'Temps (s)'
    },
    category: 'magnetism'
  },

  'flux_magnetique': {
    formula: 'Φ = BAcos(θ)',
    description: 'Flux magnétique',
    variables: {
      'Φ': 'Flux magnétique (Wb)',
      'B': 'Champ magnétique (T)',
      'A': 'Aire (m²)',
      'θ': 'Angle entre B et normale à A (rad)'
    },
    category: 'magnetism'
  }
};

// ========================================
// FORMULES DE THERMODYNAMIQUE
// ========================================

export const THERMODYNAMICS_FORMULAS = {
  // Gaz parfaits
  'loi_gaz_parfait': {
    formula: 'PV = nRT',
    description: 'Loi des gaz parfaits',
    variables: {
      'P': 'Pression (Pa)',
      'V': 'Volume (m³)',
      'n': 'Quantité de matière (mol)',
      'R': 'Constante des gaz parfaits (8.314 J/(mol·K))',
      'T': 'Température (K)'
    },
    category: 'gas_laws'
  },

  'loi_boyle': {
    formula: 'P₁V₁ = P₂V₂',
    description: 'Loi de Boyle-Mariotte (température constante)',
    variables: {
      'P₁, P₂': 'Pressions (Pa)',
      'V₁, V₂': 'Volumes (m³)'
    },
    category: 'gas_laws'
  },

  'loi_charles': {
    formula: 'V₁/T₁ = V₂/T₂',
    description: 'Loi de Charles (pression constante)',
    variables: {
      'V₁, V₂': 'Volumes (m³)',
      'T₁, T₂': 'Températures (K)'
    },
    category: 'gas_laws'
  },

  'loi_gay_lussac': {
    formula: 'P₁/T₁ = P₂/T₂',
    description: 'Loi de Gay-Lussac (volume constant)',
    variables: {
      'P₁, P₂': 'Pressions (Pa)',
      'T₁, T₂': 'Températures (K)'
    },
    category: 'gas_laws'
  },

  // Chaleur et température
  'quantite_chaleur': {
    formula: 'Q = mcΔT',
    description: 'Quantité de chaleur',
    variables: {
      'Q': 'Quantité de chaleur (J)',
      'm': 'Masse (kg)',
      'c': 'Capacité calorifique massique (J/(kg·K))',
      'ΔT': 'Variation de température (K)'
    },
    category: 'heat'
  },

  'chaleur_latente': {
    formula: 'Q = mL',
    description: 'Chaleur latente',
    variables: {
      'Q': 'Quantité de chaleur (J)',
      'm': 'Masse (kg)',
      'L': 'Chaleur latente (J/kg)'
    },
    category: 'heat'
  },

  'loi_stefan_boltzmann': {
    formula: 'P = σAT⁴',
    description: 'Loi de Stefan-Boltzmann',
    variables: {
      'P': 'Puissance rayonnée (W)',
      'σ': 'Constante de Stefan-Boltzmann (5.67×10⁻⁸ W/(m²·K⁴))',
      'A': 'Aire de surface (m²)',
      'T': 'Température absolue (K)'
    },
    category: 'radiation'
  },

  'loi_wien': {
    formula: 'λₘₐₓT = b',
    description: 'Loi de déplacement de Wien',
    variables: {
      'λₘₐₓ': 'Longueur d\'onde du maximum d\'émission (m)',
      'T': 'Température absolue (K)',
      'b': 'Constante de Wien (2.898×10⁻³ m·K)'
    },
    category: 'radiation'
  },

  // Premier principe de la thermodynamique
  'premier_principe': {
    formula: 'ΔU = Q - W',
    description: 'Premier principe de la thermodynamique',
    variables: {
      'ΔU': 'Variation d\'énergie interne (J)',
      'Q': 'Chaleur reçue (J)',
      'W': 'Travail effectué (J)'
    },
    category: 'thermodynamics'
  },

  'travail_gaz': {
    formula: 'W = PΔV',
    description: 'Travail d\'un gaz (transformation isobare)',
    variables: {
      'W': 'Travail (J)',
      'P': 'Pression (Pa)',
      'ΔV': 'Variation de volume (m³)'
    },
    category: 'thermodynamics'
  },

  // Rendement
  'rendement_thermodynamique': {
    formula: 'η = W/Qₕ = 1 - Qc/Qₕ',
    description: 'Rendement d\'une machine thermique',
    variables: {
      'η': 'Rendement',
      'W': 'Travail utile (J)',
      'Qₕ': 'Chaleur reçue de la source chaude (J)',
      'Qc': 'Chaleur cédée à la source froide (J)'
    },
    category: 'efficiency'
  }
};

// ========================================
// FORMULES D'OPTIQUE
// ========================================

export const OPTICS_FORMULAS = {
  // Réflexion
  'loi_reflexion': {
    formula: 'θᵢ = θᵣ',
    description: 'Loi de la réflexion',
    variables: {
      'θᵢ': 'Angle d\'incidence (rad)',
      'θᵣ': 'Angle de réflexion (rad)'
    },
    category: 'reflection'
  },

  // Réfraction
  'loi_snell': {
    formula: 'n₁sin(θ₁) = n₂sin(θ₂)',
    description: 'Loi de Snell-Descartes',
    variables: {
      'n₁': 'Indice de réfraction du milieu 1',
      'θ₁': 'Angle d\'incidence (rad)',
      'n₂': 'Indice de réfraction du milieu 2',
      'θ₂': 'Angle de réfraction (rad)'
    },
    category: 'refraction'
  },

  'indice_refraction': {
    formula: 'n = c/v',
    description: 'Indice de réfraction',
    variables: {
      'n': 'Indice de réfraction',
      'c': 'Vitesse de la lumière dans le vide (m/s)',
      'v': 'Vitesse de la lumière dans le milieu (m/s)'
    },
    category: 'refraction'
  },

  'angle_critique': {
    formula: 'sin(θc) = n₂/n₁',
    description: 'Angle critique (réflexion totale)',
    variables: {
      'θc': 'Angle critique (rad)',
      'n₁': 'Indice du milieu incident',
      'n₂': 'Indice du milieu réfracté'
    },
    category: 'refraction'
  },

  // Lentilles
  'formule_lentille': {
    formula: '1/f = 1/p + 1/q',
    description: 'Formule des lentilles minces',
    variables: {
      'f': 'Distance focale (m)',
      'p': 'Distance objet (m)',
      'q': 'Distance image (m)'
    },
    category: 'lenses'
  },

  'grandissement': {
    formula: 'm = -q/p = h\'/h',
    description: 'Grandissement',
    variables: {
      'm': 'Grandissement',
      'q': 'Distance image (m)',
      'p': 'Distance objet (m)',
      'h\'': 'Taille de l\'image (m)',
      'h': 'Taille de l\'objet (m)'
    },
    category: 'lenses'
  },

  'puissance_lentille': {
    formula: 'P = 1/f',
    description: 'Puissance d\'une lentille',
    variables: {
      'P': 'Puissance (dioptries)',
      'f': 'Distance focale (m)'
    },
    category: 'lenses'
  },

  // Interférence
  'difference_marche': {
    formula: 'δ = dsin(θ)',
    description: 'Différence de marche (fentes de Young)',
    variables: {
      'δ': 'Différence de marche (m)',
      'd': 'Distance entre fentes (m)',
      'θ': 'Angle (rad)'
    },
    category: 'interference'
  },

  'condition_interference': {
    formula: 'δ = mλ (constructive), δ = (m + ½)λ (destructive)',
    description: 'Conditions d\'interférence',
    variables: {
      'δ': 'Différence de marche (m)',
      'm': 'Ordre d\'interférence',
      'λ': 'Longueur d\'onde (m)'
    },
    category: 'interference'
  }
};

// ========================================
// FORMULES DE MÉCANIQUE QUANTIQUE
// ========================================

export const QUANTUM_MECHANICS_FORMULAS = {
  // Relation de Planck-Einstein
  'energie_photon': {
    formula: 'E = hf = hc/λ',
    description: 'Énergie d\'un photon',
    variables: {
      'E': 'Énergie du photon (J)',
      'h': 'Constante de Planck (6.626×10⁻³⁴ J·s)',
      'f': 'Fréquence (Hz)',
      'c': 'Vitesse de la lumière (m/s)',
      'λ': 'Longueur d\'onde (m)'
    },
    category: 'photons'
  },

  // Effet photoélectrique
  'effet_photoelectrique': {
    formula: 'Eₖ = hf - φ',
    description: 'Énergie cinétique des photoélectrons',
    variables: {
      'Eₖ': 'Énergie cinétique maximale (J)',
      'h': 'Constante de Planck (J·s)',
      'f': 'Fréquence de la lumière (Hz)',
      'φ': 'Travail de sortie (J)'
    },
    category: 'photoelectric'
  },

  // Relation de Broglie
  'longueur_onde_broglie': {
    formula: 'λ = h/p = h/(mv)',
    description: 'Longueur d\'onde de Broglie',
    variables: {
      'λ': 'Longueur d\'onde (m)',
      'h': 'Constante de Planck (J·s)',
      'p': 'Quantité de mouvement (kg·m/s)',
      'm': 'Masse (kg)',
      'v': 'Vitesse (m/s)'
    },
    category: 'wave_particle'
  },

  // Principe d\'incertitude de Heisenberg
  'incertitude_heisenberg': {
    formula: 'Δx·Δp ≥ ℏ/2',
    description: 'Principe d\'incertitude de Heisenberg',
    variables: {
      'Δx': 'Incertitude sur la position (m)',
      'Δp': 'Incertitude sur la quantité de mouvement (kg·m/s)',
      'ℏ': 'Constante de Planck réduite (1.055×10⁻³⁴ J·s)'
    },
    category: 'uncertainty'
  },

  // Atome de Bohr
  'rayon_bohr': {
    formula: 'rₙ = n²a₀',
    description: 'Rayon de l\'orbite de Bohr',
    variables: {
      'rₙ': 'Rayon de l\'orbite (m)',
      'n': 'Nombre quantique principal',
      'a₀': 'Rayon de Bohr (5.292×10⁻¹¹ m)'
    },
    category: 'bohr_model'
  },

  'energie_bohr': {
    formula: 'Eₙ = -13.6/n² eV',
    description: 'Énergie de l\'atome d\'hydrogène (modèle de Bohr)',
    variables: {
      'Eₙ': 'Énergie de l\'état n (eV)',
      'n': 'Nombre quantique principal'
    },
    category: 'bohr_model'
  }
};

// ========================================
// FORMULES DE RELATIVITÉ
// ========================================

export const RELATIVITY_FORMULAS = {
  // Dilatation du temps
  'dilatation_temps': {
    formula: 'Δt = Δt₀/√(1 - v²/c²)',
    description: 'Dilatation du temps',
    variables: {
      'Δt': 'Temps mesuré dans le référentiel en mouvement (s)',
      'Δt₀': 'Temps propre (s)',
      'v': 'Vitesse relative (m/s)',
      'c': 'Vitesse de la lumière (m/s)'
    },
    category: 'time_dilation'
  },

  // Contraction des longueurs
  'contraction_longueur': {
    formula: 'L = L₀√(1 - v²/c²)',
    description: 'Contraction des longueurs',
    variables: {
      'L': 'Longueur mesurée dans le référentiel en mouvement (m)',
      'L₀': 'Longueur propre (m)',
      'v': 'Vitesse relative (m/s)',
      'c': 'Vitesse de la lumière (m/s)'
    },
    category: 'length_contraction'
  },

  // Équivalence masse-énergie
  'equivalence_masse_energie': {
    formula: 'E = mc²',
    description: 'Équivalence masse-énergie d\'Einstein',
    variables: {
      'E': 'Énergie (J)',
      'm': 'Masse (kg)',
      'c': 'Vitesse de la lumière (m/s)'
    },
    category: 'mass_energy'
  },

  // Énergie relativiste
  'energie_relativiste': {
    formula: 'E = γmc²',
    description: 'Énergie relativiste totale',
    variables: {
      'E': 'Énergie totale (J)',
      'γ': 'Facteur de Lorentz = 1/√(1 - v²/c²)',
      'm': 'Masse au repos (kg)',
      'c': 'Vitesse de la lumière (m/s)'
    },
    category: 'relativistic_energy'
  },

  // Quantité de mouvement relativiste
  'momentum_relativiste': {
    formula: 'p = γmv',
    description: 'Quantité de mouvement relativiste',
    variables: {
      'p': 'Quantité de mouvement (kg·m/s)',
      'γ': 'Facteur de Lorentz',
      'm': 'Masse au repos (kg)',
      'v': 'Vitesse (m/s)'
    },
    category: 'relativistic_momentum'
  }
};

// ========================================
// RÉFÉRENCE COMPLÈTE
// ========================================

export const ALL_FORMULAS = {
  ...MECHANICS_FORMULAS,
  ...ELECTROMAGNETISM_FORMULAS,
  ...THERMODYNAMICS_FORMULAS,
  ...OPTICS_FORMULAS,
  ...QUANTUM_MECHANICS_FORMULAS,
  ...RELATIVITY_FORMULAS
};

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

/**
 * Recherche une formule par nom ou description
 * @param {string} keyword - Mot-clé de recherche
 * @returns {Array} - Formules correspondantes
 */
export function findFormulas(keyword) {
  const lowerKeyword = keyword.toLowerCase();
  return Object.entries(ALL_FORMULAS).filter(([key, formula]) => 
    key.toLowerCase().includes(lowerKeyword) ||
    formula.description.toLowerCase().includes(lowerKeyword) ||
    formula.formula.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Recherche des formules par catégorie
 * @param {string} category - Catégorie (ex: 'kinematics', 'electrostatics')
 * @returns {Array} - Formules de la catégorie
 */
export function findFormulasByCategory(category) {
  return Object.entries(ALL_FORMULAS).filter(([key, formula]) => 
    formula.category === category
  );
}

/**
 * Obtient toutes les catégories disponibles
 * @returns {Array} - Liste des catégories
 */
export function getAllFormulaCategories() {
  return [...new Set(Object.values(ALL_FORMULAS).map(formula => formula.category))];
}

/**
 * Formate une formule pour l'affichage
 * @param {Object} formula - Formule à formater
 * @returns {string} - Formule formatée
 */
export function formatFormula(formula) {
  if (!formula) return '';
  
  return `${formula.formula} - ${formula.description}`;
}

/**
 * Extrait les variables d'une formule
 * @param {string} formulaString - Chaîne de la formule
 * @returns {Array} - Liste des variables
 */
export function extractVariables(formulaString) {
  // Expression régulière pour trouver les variables
  const variablePattern = /[a-zA-Z_][a-zA-Z0-9_]*/g;
  const variables = formulaString.match(variablePattern) || [];
  
  // Supprimer les doublons et filtrer les mots-clés communs
  const keywords = ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'abs'];
  return [...new Set(variables)].filter(variable => !keywords.includes(variable));
}
