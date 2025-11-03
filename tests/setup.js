// Test setup for unit tests
import { beforeEach, afterEach, vi } from 'vitest'

let localStorageStore = new Map()

const localStorageMock = {
  getItem: vi.fn(key =>
    localStorageStore.has(key) ? localStorageStore.get(key) : null
  ),
  setItem: vi.fn((key, value) => {
    localStorageStore.set(key, value == null ? '' : String(value))
  }),
  removeItem: vi.fn(key => {
    localStorageStore.delete(key)
  }),
  clear: vi.fn(() => {
    localStorageStore.clear()
  }),
}

// Mock Firebase
global.firebase = {
  initializeApp: vi.fn(),
  auth: vi.fn(() => ({
    onAuthStateChanged: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
  })),
  firestore: vi.fn(() => ({
    collection: vi.fn(),
    doc: vi.fn(),
    enableNetwork: vi.fn(),
    disableNetwork: vi.fn(),
  })),
}

beforeEach(() => {
  localStorageStore = new Map()
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    configurable: true,
  })

  // Reset mocks
  vi.clearAllMocks()
})

afterEach(() => {
  // Clean up DOM
  document.body.innerHTML = ''
})
