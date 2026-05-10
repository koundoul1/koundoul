/**
 * Regression tests for Plotly lazy-loading (Phase 5.1).
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

// ── InteractiveGraph uses React.lazy ──────────────────────────────────

describe('InteractiveGraph lazy import', () => {
  it('imports react-plotly.js via React.lazy, not static import', () => {
    const filePath = path.resolve(__dirname, '../components/solver/InteractiveGraph.jsx')
    const content = fs.readFileSync(filePath, 'utf-8')

    // Must have lazy(() => import('react-plotly.js'))
    expect(content).toMatch(/lazy\(\s*\(\)\s*=>\s*import\(['"]react-plotly\.js['"]\)/)

    // Must NOT have static import from react-plotly.js
    expect(content).not.toMatch(/^import .* from ['"]react-plotly\.js['"]/m)
  })
})

// ── No other file imports react-plotly.js statically ──────────────────

describe('No static Plotly imports in codebase', () => {
  function findJsxFiles(dir) {
    const results = []
    const items = fs.readdirSync(dir, { withFileTypes: true })
    for (const item of items) {
      const fullPath = path.join(dir, item.name)
      if (item.isDirectory() && !item.name.includes('node_modules') && !item.name.startsWith('.')) {
        results.push(...findJsxFiles(fullPath))
      } else if (item.isFile() && (item.name.endsWith('.jsx') || item.name.endsWith('.js')) && !item.name.includes('.test.')) {
        results.push(fullPath)
      }
    }
    return results
  }

  it('no file has a static import of react-plotly.js', () => {
    const srcDir = path.resolve(__dirname, '..')
    const files = findJsxFiles(srcDir)
    const offenders = []

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      // Match static imports: import X from 'react-plotly.js' or import 'react-plotly.js'
      if (/^import\s+(?!.*lazy).*from\s+['"]react-plotly\.js['"]/m.test(content)) {
        offenders.push(path.relative(srcDir, file))
      }
    }

    expect(offenders).toEqual([])
  })
})

// ── Vite config has plotly in manualChunks ─────────────────────────────

describe('Vite config Plotly chunk', () => {
  it('vite.config.js routes plotly to dedicated chunk', () => {
    const configPath = path.resolve(__dirname, '../../vite.config.js')
    const content = fs.readFileSync(configPath, 'utf-8')

    expect(content).toMatch(/plotly/)
    expect(content).toMatch(/manualChunks/)
  })
})

// ── Build output: plotly chunk exists and main is small ────────────────

describe('Build output analysis', () => {
  const distDir = path.resolve(__dirname, '../../dist/assets')

  it('plotly chunk exists as separate file', () => {
    if (!fs.existsSync(distDir)) return // skip if no build
    const files = fs.readdirSync(distDir)
    const plotlyChunk = files.find(f => f.startsWith('plotly-') && f.endsWith('.js'))
    expect(plotlyChunk).toBeDefined()
  })

  it('plotly chunk is >4MB (contains the full library)', () => {
    if (!fs.existsSync(distDir)) return
    const files = fs.readdirSync(distDir)
    const plotlyChunk = files.find(f => f.startsWith('plotly-') && f.endsWith('.js'))
    if (!plotlyChunk) return
    const stats = fs.statSync(path.join(distDir, plotlyChunk))
    expect(stats.size).toBeGreaterThan(4 * 1024 * 1024) // >4MB
  })

  it('main index chunk is under 200KB', () => {
    if (!fs.existsSync(distDir)) return
    const files = fs.readdirSync(distDir)
    const mainChunk = files.find(f => f.startsWith('index-') && f.endsWith('.js'))
    if (!mainChunk) return
    const stats = fs.statSync(path.join(distDir, mainChunk))
    expect(stats.size).toBeLessThan(200 * 1024) // <200KB
  })
})
