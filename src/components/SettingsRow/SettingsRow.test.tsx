import { render, fireEvent } from '@testing-library/react-native';
import type { SFSymbol } from 'sf-symbols-typescript';
import { SettingsRow } from './SettingsRow';

// Mock expo-symbols
jest.mock('expo-symbols', () => ({
  SymbolView: ({ name, testID }: { name: string; testID?: string }) => {
    const { View } = require('react-native');
    return <View testID={testID || `symbol-${name}`} />;
  },
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
}));

describe('SettingsRow', () => {
  const defaultProps = {
    icon: 'gift' as SFSymbol,
    label: 'Birthday',
    value: 'Oct 20, 1990',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render label and value', () => {
    const { getByText } = render(<SettingsRow {...defaultProps} />);

    expect(getByText('Birthday')).toBeTruthy();
    expect(getByText('Oct 20, 1990')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByRole } = render(
      <SettingsRow {...defaultProps} onPress={onPressMock} />
    );

    fireEvent.press(getByRole('button'));

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('should trigger haptic feedback on press', () => {
    const Haptics = require('expo-haptics');
    const { getByRole } = render(<SettingsRow {...defaultProps} />);

    fireEvent.press(getByRole('button'));

    expect(Haptics.selectionAsync).toHaveBeenCalled();
  });

  it('should render with expand chevron by default', () => {
    const { getByTestId } = render(<SettingsRow {...defaultProps} />);

    // Default chevron type is 'expand' which uses 'plus' icon
    expect(getByTestId('symbol-plus')).toBeTruthy();
  });

  it('should render with dropdown chevron when specified', () => {
    const { getByTestId } = render(
      <SettingsRow {...defaultProps} chevronType="dropdown" />
    );

    expect(getByTestId('symbol-chevron.up.chevron.down')).toBeTruthy();
  });

  it('should have correct accessibility label', () => {
    const { getByLabelText } = render(<SettingsRow {...defaultProps} />);

    expect(getByLabelText('Birthday: Oct 20, 1990')).toBeTruthy();
  });

  it('should use testID when provided', () => {
    const { getByTestId } = render(
      <SettingsRow {...defaultProps} testID="birthday-row" />
    );

    expect(getByTestId('birthday-row')).toBeTruthy();
  });
});
