import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '@/lib/supabase/client';
import { authService } from './authService';

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithApple', () => {
    it('should call AppleAuthentication.signInAsync with correct scopes', async () => {
      (AppleAuthentication.signInAsync as jest.Mock).mockResolvedValue({
        identityToken: 'mock-identity-token',
        fullName: { givenName: 'John', familyName: 'Doe' },
      });
      (supabase.auth.signInWithIdToken as jest.Mock).mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
        error: null,
      });

      await authService.signInWithApple();

      expect(AppleAuthentication.signInAsync).toHaveBeenCalledWith({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
    });

    it('should exchange identity token with Supabase', async () => {
      (AppleAuthentication.signInAsync as jest.Mock).mockResolvedValue({
        identityToken: 'mock-identity-token',
        fullName: null,
      });
      (supabase.auth.signInWithIdToken as jest.Mock).mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
        error: null,
      });

      await authService.signInWithApple();

      expect(supabase.auth.signInWithIdToken).toHaveBeenCalledWith({
        provider: 'apple',
        token: 'mock-identity-token',
      });
    });

    it('should update profile with full name when Apple provides it', async () => {
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      const mockUpdate = jest.fn(() => ({ eq: mockEq }));
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      (AppleAuthentication.signInAsync as jest.Mock).mockResolvedValue({
        identityToken: 'mock-identity-token',
        fullName: { givenName: 'John', familyName: 'Doe' },
      });
      (supabase.auth.signInWithIdToken as jest.Mock).mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
        error: null,
      });

      await authService.signInWithApple();

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith({ full_name: 'John Doe' });
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
    });

    it('should not update profile when Apple does not provide a name', async () => {
      (AppleAuthentication.signInAsync as jest.Mock).mockResolvedValue({
        identityToken: 'mock-identity-token',
        fullName: null,
      });
      (supabase.auth.signInWithIdToken as jest.Mock).mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
        error: null,
      });

      await authService.signInWithApple();

      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should throw when identity token is missing', async () => {
      (AppleAuthentication.signInAsync as jest.Mock).mockResolvedValue({
        identityToken: null,
        fullName: null,
      });

      await expect(authService.signInWithApple()).rejects.toThrow(
        'No identity token received from Apple'
      );
    });

    it('should throw when Supabase returns an error', async () => {
      (AppleAuthentication.signInAsync as jest.Mock).mockResolvedValue({
        identityToken: 'mock-identity-token',
        fullName: null,
      });
      (supabase.auth.signInWithIdToken as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid token' },
      });

      await expect(authService.signInWithApple()).rejects.toThrow(
        'Invalid token'
      );
    });

    it('should return null when user cancels Apple sign-in', async () => {
      const cancelError = new Error('User cancelled');
      (cancelError as any).code = 'ERR_REQUEST_CANCELED';
      (AppleAuthentication.signInAsync as jest.Mock).mockRejectedValue(cancelError);

      const result = await authService.signInWithApple();

      expect(result).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should call supabase signOut', async () => {
      await authService.signOut();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw when signOut fails', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: { message: 'Sign out failed' },
      });

      await expect(authService.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('getSession', () => {
    it('should return current session', async () => {
      const mockSession = { user: { id: 'user-123' } };
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const session = await authService.getSession();

      expect(session).toBe(mockSession);
    });

    it('should return null when no session exists', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const session = await authService.getSession();

      expect(session).toBeNull();
    });
  });

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', () => {
      const callback = jest.fn();

      authService.onAuthStateChange(callback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(callback);
    });

    it('should return the subscription for cleanup', () => {
      const callback = jest.fn();

      const result = authService.onAuthStateChange(callback);

      expect(result.data.subscription.unsubscribe).toBeDefined();
    });
  });
});
