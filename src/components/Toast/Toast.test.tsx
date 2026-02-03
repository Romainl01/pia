import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Toast } from './Toast';
import { useToastStore } from '@/src/stores/toastStore';

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: View,
    Svg: View,
    Rect: View,
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  const AnimatedView = React.forwardRef(
    (
      { children, entering, exiting, ...props }: { children?: React.ReactNode; entering?: unknown; exiting?: unknown },
      ref: React.Ref<typeof View>
    ) => React.createElement(View, { ...props, ref }, children)
  );
  AnimatedView.displayName = 'AnimatedView';

  const createAnimatedComponent = (Component: React.ComponentType<unknown>) => {
    const AnimatedComponent = React.forwardRef(
      ({ animatedProps, ...props }: { animatedProps?: unknown }, ref: React.Ref<unknown>) =>
        React.createElement(Component, { ...props, ref })
    );
    AnimatedComponent.displayName = `Animated(${Component.displayName || Component.name || 'Component'})`;
    return AnimatedComponent;
  };

  const Animated = {
    View: AnimatedView,
    createAnimatedComponent,
  };

  return {
    __esModule: true,
    default: Animated,
    FadeInUp: { duration: () => ({}) },
    FadeOutDown: { duration: () => ({}) },
    useSharedValue: (initialValue: number) => ({ value: initialValue }),
    useAnimatedProps: () => ({}),
    withTiming: (toValue: number) => toValue,
    Easing: { linear: 'linear' },
  };
});

describe('Toast', () => {
  beforeEach(() => {
    useToastStore.setState({
      visible: false,
      message: '',
      undoAction: null,
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not render when not visible', () => {
    const { queryByTestId } = render(<Toast />);
    expect(queryByTestId('toast-container')).toBeNull();
  });

  it('should render when visible', () => {
    useToastStore.setState({
      visible: true,
      message: 'Test message',
      undoAction: null,
    });

    const { getByTestId, getByText } = render(<Toast />);
    expect(getByTestId('toast-container')).toBeTruthy();
    expect(getByText('Test message')).toBeTruthy();
  });

  it('should show undo button when undoAction is provided', () => {
    const undoFn = jest.fn();
    useToastStore.setState({
      visible: true,
      message: 'Test message',
      undoAction: undoFn,
    });

    const { getByTestId } = render(<Toast />);
    expect(getByTestId('toast-undo-button')).toBeTruthy();
  });

  it('should not show undo button when undoAction is null', () => {
    useToastStore.setState({
      visible: true,
      message: 'Test message',
      undoAction: null,
    });

    const { queryByTestId } = render(<Toast />);
    expect(queryByTestId('toast-undo-button')).toBeNull();
  });

  it('should call undoAction and hide toast when undo is pressed', () => {
    const undoFn = jest.fn();
    useToastStore.setState({
      visible: true,
      message: 'Test message',
      undoAction: undoFn,
    });

    const { getByTestId } = render(<Toast />);
    fireEvent.press(getByTestId('toast-undo-button'));

    expect(undoFn).toHaveBeenCalledTimes(1);
    expect(useToastStore.getState().visible).toBe(false);
  });

  it('should auto-dismiss after 4 seconds', () => {
    useToastStore.setState({
      visible: true,
      message: 'Test message',
      undoAction: null,
    });

    render(<Toast />);

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(useToastStore.getState().visible).toBe(false);
  });
});
