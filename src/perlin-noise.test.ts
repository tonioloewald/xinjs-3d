import { test, expect, describe } from 'bun:test'
import { PerlinNoise } from './perlin-noise' // Adjust import path as needed

describe('PerlinNoise', () => {
  test('should initialize with default seed', () => {
    const noise = new PerlinNoise()
    expect(noise).toBeDefined()
  })

  test('should initialize with specific seed', () => {
    const noise = new PerlinNoise(42)
    expect(noise).toBeDefined()
  })

  test('noise3D should return a number between -1 and 1', () => {
    const noise = new PerlinNoise(123)
    const value = noise.noise3D(1.5, 2.5, 3.5)
    expect(typeof value).toBe('number')
    expect(value).toBeGreaterThanOrEqual(-1)
    expect(value).toBeLessThanOrEqual(1)
  })

  test('noise2D should return a number between -1 and 1', () => {
    const noise = new PerlinNoise(123)
    const value = noise.noise2D(1.5, 2.5)
    expect(typeof value).toBe('number')
    expect(value).toBeGreaterThanOrEqual(-1)
    expect(value).toBeLessThanOrEqual(1)
  })

  test('same input coordinates should produce the same output for a given seed', () => {
    const noise = new PerlinNoise(987)
    const value1 = noise.noise3D(1.5, 2.5, 3.5)
    const value2 = noise.noise3D(1.5, 2.5, 3.5)
    expect(value1).toBe(value2)
  })

  test('different seeds should produce different outputs for the same coordinates', () => {
    const noise1 = new PerlinNoise(111)
    const noise2 = new PerlinNoise(222)
    const value1 = noise1.noise3D(1.5, 2.5, 3.5)
    const value2 = noise2.noise3D(1.5, 2.5, 3.5)
    expect(value1).not.toBe(value2)
  })

  test('seed() method should change the noise pattern', () => {
    const noise = new PerlinNoise(111)
    const value1 = noise.noise3D(1.5, 2.5, 3.5)
    noise.seed(222)
    const value2 = noise.noise3D(1.5, 2.5, 3.5)
    expect(value1).not.toBe(value2)
  })

  test('noise should have spatial coherence', () => {
    const noise = new PerlinNoise(123)
    const value1 = noise.noise3D(1.0, 1.0, 1.0)
    const value2 = noise.noise3D(1.01, 1.0, 1.0)
    // Points that are close together should have similar values
    expect(Math.abs(value1 - value2)).toBeLessThan(0.1)
  })

  test('fractal noise should combine multiple octaves', () => {
    const noise = new PerlinNoise(456)
    const basicNoise = noise.noise3D(1.5, 2.5, 3.5)
    const fractalNoise = noise.fractal(1.5, 2.5, 3.5, 6, 0.5, 2.0)
    // Fractal noise should be different from basic noise
    expect(basicNoise).not.toBe(fractalNoise)
  })

  test('fractal noise should return a reasonable value range', () => {
    const noise = new PerlinNoise(789)
    const value = noise.fractal(1.5, 2.5, 3.5, 6, 0.5, 2.0)
    expect(value).toBeGreaterThanOrEqual(-1.5)
    expect(value).toBeLessThanOrEqual(1.5)
  })

  test('fractal should accept default parameters', () => {
    const noise = new PerlinNoise(789)
    const value = noise.fractal(1.5, 2.5, 3.5)
    expect(typeof value).toBe('number')
  })

  test('fractal with more octaves should have more detail', () => {
    const noise = new PerlinNoise(123)
    // Create sample arrays
    const samples1 = []
    const samples2 = []

    // Sample 100 points with different octave counts
    for (let i = 0; i < 100; i++) {
      const x = i * 0.01
      samples1.push(noise.fractal(x, 0, 0, 1, 0.5, 2.0))
      samples2.push(noise.fractal(x, 0, 0, 6, 0.5, 2.0))
    }

    // Calculate variance as a measure of detail
    const variance1 = calculateVariance(samples1)
    const variance2 = calculateVariance(samples2)

    // More octaves should generally lead to more variance in the samples
    expect(variance2).toBeGreaterThan(variance1 * 0.5)
  })
})

// Helper to calculate variance of an array
function calculateVariance(array: number[]): number {
  const mean = array.reduce((sum, val) => sum + val, 0) / array.length
  return (
    array.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / array.length
  )
}

// Performance test
test('performance benchmark', async () => {
  const noise = new PerlinNoise(123)
  const startTime = performance.now()
  let sum = 0

  // Generate 100,000 3D noise samples
  for (let i = 0; i < 100_000; i++) {
    const x = i * 0.01
    const y = i * 0.02
    const z = i * 0.03
    sum += noise.noise3D(x, y, z)
  }

  const endTime = performance.now()
  const duration = endTime - startTime

  console.log(`Generated 100,000 noise samples in ${duration.toFixed(2)}ms`)
  console.log(`Average sample value: ${sum / 100_000}`)

  // Just making sure the sum is a number (this is not a real test)
  expect(typeof sum).toBe('number')

  // Optional performance assertion - uncomment if you want to enforce performance
  // expect(duration).toBeLessThan(500); // Should complete in under 500ms
})
