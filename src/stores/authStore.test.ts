import { useAuthStore } from './authStore';
import { supabase } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

// Helper to create a mock session
function createMockSession(overrides?: Partial<Session>): Session {
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    token_type: 'bearer',
    user: createMockUser(),
    ...overrides,
  } as Session;
}

function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: { full_name: 'Test User' },
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  } as User;
}

describe('authStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.setState({
      session: null,
      user: null,
      isLoading: false,
      isInitialized: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should have null session and user', () => {
      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.user).toBeNull();
    });

    it('should not be loading or initialized', () => {
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(false);
    });

    it('should have no error', () => {
      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('setSession', () => {
    it('should set session and extract user', () => {
      const mockSession = createMockSession();

      useAuthStore.getState().setSession(mockSession);

      const state = useAuthStore.getState();
      expect(state.session).toBe(mockSession);
      expect(state.user).toBe(mockSession.user);
    });

    it('should clear user when session is null', () => {
      // First set a session
      useAuthStore.getState().setSession(createMockSession());
      expect(useAuthStore.getState().user).not.toBeNull();

      // Then clear it
      useAuthStore.getState().setSession(null);

      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.user).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('should update loading state', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      useAuthStore.getState().setError('Something went wrong');
      expect(useAuthStore.getState().error).toBe('Something went wrong');
    });

    it('should clear error with null', () => {
      useAuthStore.getState().setError('error');
      useAuthStore.getState().setError(null);
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('setInitialized', () => {
    it('should update initialized state', () => {
      useAuthStore.getState().setInitialized(true);
      expect(useAuthStore.getState().isInitialized).toBe(true);
    });
  });

  describe('clearError', () => {
    it('should set error to null', () => {
      useAuthStore.getState().setError('Some error');
      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should call supabase signOut', async () => {
      useAuthStore.getState().setSession(createMockSession());

      await useAuthStore.getState().signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should clear session and user after sign out', async () => {
      useAuthStore.getState().setSession(createMockSession());

      await useAuthStore.getState().signOut();

      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.user).toBeNull();
    });

    it('should set error if signOut fails', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: { message: 'Sign out failed' },
      });

      await useAuthStore.getState().signOut();

      expect(useAuthStore.getState().error).toBe('Sign out failed');
    });
  });
});
