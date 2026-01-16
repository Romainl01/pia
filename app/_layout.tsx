import { useEffect, useRef } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import {
  useFonts,
  CrimsonPro_400Regular,
  CrimsonPro_500Medium,
} from '@expo-google-fonts/crimson-pro';
import {
  Inter_400Regular,
  Inter_500Medium,
} from '@expo-google-fonts/inter';
import { NotificationService } from '@/src/services/notificationService';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { useNotificationStateStore } from '@/src/stores/notificationStateStore';
import { useNotificationPermission } from '@/src/hooks/useNotificationPermission';
import { getDeviceCornerRadius } from '@/src/utils';

// Delay before requesting permission to allow sheet dismiss animation to complete
const SHEET_DISMISS_DELAY_MS = 400;

SplashScreen.preventAutoHideAsync();

export default function RootLayout(): React.ReactElement | null {
  const router = useRouter();
  const responseListener = useRef<Notifications.Subscription>();
  const { width, height } = useWindowDimensions();

  const sheetCornerRadius = getDeviceCornerRadius(width, height);

  const friends = useFriendsStore((state) => state.friends);
  const {
    shouldSendBirthdayNotification,
    shouldSendCatchUpNotification,
    hasRequestedPermission,
    pendingPermissionRequest,
    setPendingPermissionRequest,
  } = useNotificationStateStore();
  const { requestPermission } = useNotificationPermission();

  const [fontsLoaded] = useFonts({
    CrimsonPro_400Regular,
    CrimsonPro_500Medium,
    Inter_400Regular,
    Inter_500Medium,
  });

  useEffect(() => {
    NotificationService.initialize();

    responseListener.current = NotificationService.addNotificationResponseListener(
      () => {
        router.navigate('/(tabs)/friends');
      }
    );

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);

  useEffect(() => {
    if (hasRequestedPermission && friends.length > 0) {
      NotificationService.scheduleAllNotifications(
        friends,
        shouldSendBirthdayNotification,
        shouldSendCatchUpNotification
      );
    }
  }, [friends, hasRequestedPermission, shouldSendBirthdayNotification, shouldSendCatchUpNotification]);

  // Request notification permission after sheet dismisses (deferred from add-friend screen)
  useEffect(() => {
    if (!pendingPermissionRequest) return;

    const timeoutId = setTimeout(() => {
      // Double-check the flag is still set (prevents race conditions)
      if (useNotificationStateStore.getState().pendingPermissionRequest) {
        setPendingPermissionRequest(false);
        requestPermission();
      }
    }, SHEET_DISMISS_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [pendingPermissionRequest, setPendingPermissionRequest, requestPermission]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="add-friend"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: 'fitToContents',
              sheetGrabberVisible: true,
              sheetCornerRadius,
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
