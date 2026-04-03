import '@testing-library/jest-dom'

// Clear call history between tests but preserve mock implementations
afterEach(() => {
  vi.clearAllMocks()
})
