import { render } from '@testing-library/react-native';
import { DaysRemainingCounter } from './DaysRemainingCounter';

describe('DaysRemainingCounter', () => {
  describe('rendering', () => {
    it('should render "365 days left" for 365 days', () => {
      const { getByText } = render(<DaysRemainingCounter daysRemaining={365} />);

      expect(getByText('365 days left')).toBeTruthy();
    });

    it('should render "1 day left" for singular day', () => {
      const { getByText } = render(<DaysRemainingCounter daysRemaining={1} />);

      expect(getByText('1 day left')).toBeTruthy();
    });

    it('should render "100 days left" for 100 days', () => {
      const { getByText } = render(<DaysRemainingCounter daysRemaining={100} />);

      expect(getByText('100 days left')).toBeTruthy();
    });

    it('should render "0 days left" for 0 days', () => {
      const { getByText } = render(<DaysRemainingCounter daysRemaining={0} />);

      expect(getByText('0 days left')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have testID when provided', () => {
      const { getByTestId } = render(
        <DaysRemainingCounter daysRemaining={100} testID="counter" />
      );

      expect(getByTestId('counter')).toBeTruthy();
    });
  });
});
