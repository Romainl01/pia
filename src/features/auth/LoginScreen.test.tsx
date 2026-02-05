import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from './LoginScreen';
import * as AppleAuthentication from 'expo-apple-authentication';
import { authService } from '@/src/services/authService';
import { useAuthStore } from '@/src/stores/authStore';

jest.mock('@/src/services/authService', () => ({
  authService: {
    signInWithApple: jest.fn(),
  },
}));

// Mock Platform to simulate iOS
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ error: null, isLoading: false });
  });

  it('should render the app name', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Memo')).toBeTruthy();
  });

  it('should render the Apple Sign-In button', () => {
    const { getByTestId } = render(<LoginScreen />);
    expect(getByTestId('apple-sign-in-button')).toBeTruthy();
  });

  it('should call signInWithApple when button is pressed', async () => {
    (authService.signInWithApple as jest.Mock).mockResolvedValue({ user: { id: '123' } });

    const { getByTestId } = render(<LoginScreen />);
    fireEvent.press(getByTestId('apple-sign-in-button'));

    await waitFor(() => {
      expect(authService.signInWithApple).toHaveBeenCalled();
    });
  });

  it('should display error message from auth store', () => {
    useAuthStore.setState({ error: 'Something went wrong' });

    const { getByText } = render(<LoginScreen />);
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should show loading state while signing in', async () => {
    // Make signInWithApple hang so we can observe loading state
    let resolveSignIn: (value: any) => void;
    (authService.signInWithApple as jest.Mock).mockImplementation(
      () => new Promise((resolve) => { resolveSignIn = resolve; })
    );

    const { getByTestId, getByText } = render(<LoginScreen />);
    fireEvent.press(getByTestId('apple-sign-in-button'));

    await waitFor(() => {
      expect(getByText('Signing in...')).toBeTruthy();
    });

    // Clean up
    resolveSignIn!(null);
  });

  it('should set error in store when sign-in fails', async () => {
    (authService.signInWithApple as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { getByTestId } = render(<LoginScreen />);
    fireEvent.press(getByTestId('apple-sign-in-button'));

    await waitFor(() => {
      expect(useAuthStore.getState().error).toBe('Network error');
    });
  });

  it('should not set error when user cancels (returns null)', async () => {
    (authService.signInWithApple as jest.Mock).mockResolvedValue(null);

    const { getByTestId } = render(<LoginScreen />);
    fireEvent.press(getByTestId('apple-sign-in-button'));

    await waitFor(() => {
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
