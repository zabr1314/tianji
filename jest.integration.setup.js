// Integration test setup
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY = 'test-anon-key'
process.env.DEEPSEEK_API_KEY = 'test-deepseek-key'
process.env.TIANJI_POINTS_RATE = '10'

// Setup mock service worker for API mocking
import { beforeAll, afterEach, afterAll } from '@jest/globals'
import { server } from './lib/__mocks__/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Suppress console logs during integration tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}