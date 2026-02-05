import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuthStore } from '@/src/stores/authStore';
import { authService } from '@/src/services/authService';
import { useTheme } from '@/src/hooks/useTheme';
import { typography } from '@/src/constants/typography';

export function LoginScreen(): React.ReactElement {
  const { colors, isDark } = useTheme();
  const error = useAuthStore((state) => state.error);
  const setError = useAuthStore((state) => state.setError);
  const clearError = useAuthStore((state) => state.clearError);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  const handleSignInWithApple = useCallback(async (): Promise<void> => {
    clearError();
    setIsSigningIn(true);

    try {
      const session = await authService.signInWithApple();
      // null means the user cancelled — not an error
      if (session === null) {
        return;
      }
    } catch (error: any) {
      const errorMessage = error.message ?? 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsSigningIn(false);
    }
  }, [clearError, setError]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceLight }]}>
      <View style={styles.brandingContainer}>
        <Text style={[styles.appName, { color: colors.primary }]}>Memo</Text>
        <Text style={[styles.tagline, { color: colors.neutralGray }]}>
          Stay close to the people who matter
        </Text>
      </View>

      <View style={styles.authContainer}>
        {error && (
          <Text style={[styles.errorText, { color: colors.feedbackError }]}>
            {error}
          </Text>
        )}

        {isSigningIn ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.neutralGray }]}>
              Signing in...
            </Text>
          </View>
        ) : (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={
              isDark
                ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={12}
            style={styles.appleButton}
            onPress={handleSignInWithApple}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: '40%',
    paddingBottom: 80,
  },
  brandingContainer: {
    alignItems: 'center',
  },
  appName: {
    ...typography.titleH0,
    fontSize: 56,
    lineHeight: 56,
    marginBottom: 12,
  },
  tagline: {
    ...typography.body1,
    textAlign: 'center',
  },
  authContainer: {
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    ...typography.body2,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 50,
  },
  loadingText: {
    ...typography.body2,
  },
  appleButton: {
    width: '100%',
    height: 50,
  },
});
