import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/login',
    query: {},
    asPath: '/login',
  }),
  usePathname: () => '/login',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    headers: new Headers(),
    status: 200,
    statusText: 'OK',
  })
) as jest.Mock;

// Mock environment variables
process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-client-id';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});
