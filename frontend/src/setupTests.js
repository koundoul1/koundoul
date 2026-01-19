import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock window.speechSynthesis (pour AccessibilityControls)
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => []),
}

// Mock window.SpeechSynthesisUtterance
global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
  text,
  lang: 'fr-FR',
  rate: 1,
  pitch: 1,
  volume: 1,
}))

// Mock Plotly (lourd, on mock pour les tests)
jest.mock('react-plotly.js', () => {
  return function PlotlyMock() {
    return <div data-testid="plotly-mock">Plotly Graph</div>
  }
})

// Mock window.Plotly pour InteractiveGraph
global.window.Plotly = {
  downloadImage: jest.fn(),
}

// Supprimer les warnings de console pendant les tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}









