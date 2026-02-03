import { render, fireEvent } from '@testing-library/react-native';
import { FloatingDoneButton } from './FloatingDoneButton';

// Mock reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.useAnimatedKeyboard = () => ({
    height: { value: 300 },
    state: { value: 2 }, // KeyboardState.Open
  });
  return Reanimated;
});

describe('FloatingDoneButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('should render the Done button when hasContent is true', () => {
    const { getByText } = render(
      <FloatingDoneButton hasContent={true} onPress={mockOnPress} />
    );

    expect(getByText('Done')).toBeTruthy();
  });

  it('should not render when hasContent is false', () => {
    const { queryByText } = render(
      <FloatingDoneButton hasContent={false} onPress={mockOnPress} />
    );

    expect(queryByText('Done')).toBeNull();
  });

  it('should call onPress when tapped', () => {
    const { getByText } = render(
      <FloatingDoneButton hasContent={true} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Done'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
