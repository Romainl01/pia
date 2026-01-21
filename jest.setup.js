// Prevent expo winter runtime from loading
jest.mock("expo", () => ({}));

// Mock expo-glass-effect - GlassView renders as a regular View in tests
jest.mock("expo-glass-effect", () => {
  const { View } = require("react-native");
  const React = require("react");
  return {
    GlassView: ({ children, style, ...props }) =>
      React.createElement(
        View,
        { style, testID: "glass-view", ...props },
        children
      ),
    GlassContainer: ({ children, style, ...props }) =>
      React.createElement(
        View,
        { style, testID: "glass-container", ...props },
        children
      ),
    isLiquidGlassAvailable: jest.fn(() => false),
    isGlassEffectAPIAvailable: jest.fn(() => false),
  };
});

// Mock expo-symbols - SymbolView renders as Text with symbol name
jest.mock("expo-symbols", () => {
  const { Text } = require("react-native");
  const React = require("react");
  return {
    SymbolView: ({ name, testID, ...props }) =>
      React.createElement(
        Text,
        { testID: testID || `symbol-${name}`, ...props },
        name
      ),
  };
});

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Link: ({ children }) => children,
  Redirect: () => null,
  Tabs: ({ children }) => children,
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) =>
      React.createElement(View, { testID: "safe-area-view" }, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock @react-native-async-storage/async-storage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock expo-blur - BlurView renders as a regular View in tests
jest.mock("expo-blur", () => {
  const { View } = require("react-native");
  const React = require("react");
  return {
    BlurView: ({ children, style, ...props }) =>
      React.createElement(
        View,
        { style, testID: "blur-view", ...props },
        children
      ),
  };
});

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));
