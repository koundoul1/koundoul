import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import HintSystem from '../HintSystem'

describe('HintSystem Component', () => {
  const mockHints = [
    'Indice niveau 1: Très guidant',
    'Indice niveau 2: Moyen',
    'Indice niveau 3: Difficile'
  ]
  
  const mockOnHintUsed = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  test('affiche le bon nombre d\'indices disponibles', () => {
    render(
      <HintSystem 
        hints={mockHints} 
        onHintUsed={mockOnHintUsed}
        maxHints={3}
      />
    )
    
    expect(screen.getByText(/0 \/ 3 utilisés/i)).toBeInTheDocument()
  })
  
  test('débloque le premier indice au clic', async () => {
    render(
      <HintSystem 
        hints={mockHints} 
        onHintUsed={mockOnHintUsed}
      />
    )
    
    const unlockButton = screen.getByText(/Débloquer cet indice.*-2 XP/i)
    fireEvent.click(unlockButton)
    
    await waitFor(() => {
      expect(mockOnHintUsed).toHaveBeenCalledWith({
        index: 0,
        penalty: 2
      })
    })
    
    expect(screen.getByText('Indice niveau 1: Très guidant')).toBeInTheDocument()
  })
  
  test('applique la pénalité XP progressive', async () => {
    const { rerender } = render(
      <HintSystem 
        hints={mockHints} 
        onHintUsed={mockOnHintUsed}
      />
    )
    
    // Premier indice: -2 XP
    const firstButton = screen.getByText(/Débloquer.*-2 XP/i)
    fireEvent.click(firstButton)
    
    await waitFor(() => {
      expect(mockOnHintUsed).toHaveBeenCalledWith({ index: 0, penalty: 2 })
    })
    
    // Simuler déverrouillage du premier
    rerender(
      <HintSystem 
        hints={mockHints} 
        onHintUsed={mockOnHintUsed}
      />
    )
    
    // Deuxième indice: -4 XP
    const secondButton = screen.getByText(/Débloquer.*-4 XP/i)
    expect(secondButton).toBeInTheDocument()
  })
  
  test('empêche de skip des indices', () => {
    render(
      <HintSystem 
        hints={mockHints} 
        onHintUsed={mockOnHintUsed}
      />
    )
    
    // Le 3ème indice doit afficher un message de blocage
    const hints = screen.getAllByText(/Indice niveau/i)
    const thirdHintCard = hints[2].closest('div')
    
    expect(thirdHintCard).toHaveTextContent(/Débloque les indices précédents/i)
  })
  
  test('affiche la notification de pénalité', async () => {
    render(
      <HintSystem 
        hints={mockHints} 
        onHintUsed={mockOnHintUsed}
      />
    )
    
    const unlockButton = screen.getByText(/Débloquer/i)
    fireEvent.click(unlockButton)
    
    await waitFor(() => {
      expect(screen.getByText(/-2 XP pour cet indice/i)).toBeInTheDocument()
    })
  })
  
  test('affiche le message d\'astuce', () => {
    render(
      <HintSystem 
        hints={mockHints} 
        onHintUsed={mockOnHintUsed}
      />
    )
    
    expect(screen.getByText(/Plus tu utilises d'indices/i)).toBeInTheDocument()
  })
  
  test('affiche les badges de difficulté', () => {
    render(
      <HintSystem 
        hints={mockHints} 
        onHintUsed={mockOnHintUsed}
      />
    )
    
    expect(screen.getByText('Facile')).toBeInTheDocument()
    expect(screen.getByText('Moyen')).toBeInTheDocument()
    expect(screen.getByText('Difficile')).toBeInTheDocument()
  })
})









