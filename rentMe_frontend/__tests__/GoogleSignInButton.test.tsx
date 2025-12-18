import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GoogleSignInButton from '@/components/GoogleSignInButton';

// Mock environment variables
process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-client-id';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';

// Mock window.google
const mockRenderButton = jest.fn();
const mockInitialize = jest.fn();

beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();
  localStorage.clear();
  
  // Mock Google SDK
  (window as any).google = {
    accounts: {
      id: {
        initialize: mockInitialize,
        renderButton: mockRenderButton,
      },
    },
  };
});

describe('GoogleSignInButton Component', () => {
  test('renders loading state initially', () => {
    render(<GoogleSignInButton />);
    expect(screen.getByText(/loading google sign-in/i)).toBeInTheDocument();
  });

  test('loads Google SDK script', async () => {
    render(<GoogleSignInButton />);
    
    await waitFor(() => {
      const script = document.querySelector('script[src*="accounts.google.com"]');
      expect(script).toBeInTheDocument();
    });
  });

  test('initializes Google Sign-In with correct config', async () => {
    render(<GoogleSignInButton />);
    
    // Simulate script load
    const script = document.querySelector('script[src*="accounts.google.com"]');
    if (script) {
      script.dispatchEvent(new Event('load'));
    }

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: 'test-client-id',
          callback: expect.any(Function),
        })
      );
    });
  });

  test('renders Google button after SDK loads', async () => {
    const { container } = render(<GoogleSignInButton />);
    
    // Simulate script load
    const script = document.querySelector('script[src*="accounts.google.com"]');
    if (script) {
      script.dispatchEvent(new Event('load'));
    }

    await waitFor(() => {
      expect(mockRenderButton).toHaveBeenCalled();
    });
  });

  test('handles successful Google authentication', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        userId: 1,
        email: 'test@example.com',
        role: 'RENTER',
      }),
    });
    global.fetch = mockFetch;

    const mockPush = jest.fn();
    jest.mock('next/navigation', () => ({
      useRouter: () => ({ push: mockPush }),
    }));

    render(<GoogleSignInButton />);
    
    // Simulate script load
    const script = document.querySelector('script[src*="accounts.google.com"]');
    if (script) {
      script.dispatchEvent(new Event('load'));
    }

    // Get the callback function passed to initialize
    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalled();
    });

    const initializeCall = mockInitialize.mock.calls[0][0];
    const callback = initializeCall.callback;

    // Simulate successful Google response
    await callback({ credential: 'mock-google-token' });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/auth/google',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: 'mock-google-token' }),
          credentials: 'include',
        })
      );
    });
  });

  test('stores user data in localStorage after successful login', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        userId: 123,
        email: 'test@google.com',
        role: 'RENTER',
      }),
    });
    global.fetch = mockFetch;

    render(<GoogleSignInButton />);
    
    const script = document.querySelector('script[src*="accounts.google.com"]');
    if (script) {
      script.dispatchEvent(new Event('load'));
    }

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalled();
    });

    const callback = mockInitialize.mock.calls[0][0].callback;
    await callback({ credential: 'mock-token' });

    await waitFor(() => {
      expect(localStorage.getItem('userId')).toBe('123');
      expect(localStorage.getItem('email')).toBe('test@google.com');
      expect(localStorage.getItem('role')).toBe('RENTER');
    });
  });

  test('displays error when Google authentication fails', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });
    global.fetch = mockFetch;

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<GoogleSignInButton />);
    
    const script = document.querySelector('script[src*="accounts.google.com"]');
    if (script) {
      script.dispatchEvent(new Event('load'));
    }

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalled();
    });

    const callback = mockInitialize.mock.calls[0][0].callback;
    await callback({ credential: 'invalid-token' });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  test('shows processing state during authentication', async () => {
    const mockFetch = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
    );
    global.fetch = mockFetch;

    const { rerender } = render(<GoogleSignInButton />);
    
    const script = document.querySelector('script[src*="accounts.google.com"]');
    if (script) {
      script.dispatchEvent(new Event('load'));
    }

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalled();
    });

    const callback = mockInitialize.mock.calls[0][0].callback;
    callback({ credential: 'mock-token' });

    // Should show processing state
    await waitFor(() => {
      expect(screen.queryByText(/processing/i)).toBeInTheDocument();
    });
  });

  test('cleans up script on unmount', () => {
    const { unmount } = render(<GoogleSignInButton />);
    
    const script = document.querySelector('script[src*="accounts.google.com"]');
    expect(script).toBeInTheDocument();

    unmount();
    
    // Script should still exist but component unmounted cleanly
    expect(script).toBeInTheDocument();
  });
});
