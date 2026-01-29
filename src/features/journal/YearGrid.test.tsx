import { render, fireEvent } from '@testing-library/react-native';
import { YearGrid } from './YearGrid';

// Mock the journal store
const mockHasEntryForDate = jest.fn(() => false);
jest.mock('@/src/stores/journalStore', () => ({
  useJournalStore: jest.fn((selector) => {
    const state = {
      hasEntryForDate: mockHasEntryForDate,
    };
    return selector(state);
  }),
}));

// Mock date helpers
jest.mock('@/src/utils/journalDateHelpers', () => ({
  generateYearDates: jest.fn(() => {
    // Return a small subset for testing (first week of Jan 2025)
    return [
      '2025-01-01',
      '2025-01-02',
      '2025-01-03',
      '2025-01-04',
      '2025-01-05',
      '2025-01-06',
      '2025-01-07',
    ];
  }),
  isToday: jest.fn((date: string) => date === '2025-01-03'),
  isPastOrToday: jest.fn((date: string) => {
    const pastDates = ['2025-01-01', '2025-01-02', '2025-01-03'];
    return pastDates.includes(date);
  }),
}));

describe('YearGrid', () => {
  const mockOnDayPress = jest.fn();

  beforeEach(() => {
    mockOnDayPress.mockClear();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(
        <YearGrid year={2025} onDayPress={mockOnDayPress} testID="year-grid" />
      );

      expect(getByTestId('year-grid')).toBeTruthy();
    });

    it('should render weekday headers', () => {
      const { getAllByText } = render(
        <YearGrid year={2025} onDayPress={mockOnDayPress} />
      );

      // S appears twice (Sun, Sat), T appears twice (Tue, Thu)
      expect(getAllByText('S')).toHaveLength(2);
      expect(getAllByText('M')).toHaveLength(1);
      expect(getAllByText('T')).toHaveLength(2);
      expect(getAllByText('W')).toHaveLength(1);
      expect(getAllByText('F')).toHaveLength(1);
    });

    it('should render day dots', () => {
      const { getAllByTestId } = render(
        <YearGrid year={2025} onDayPress={mockOnDayPress} />
      );

      // Should have 7 dots for our mocked week
      const dots = getAllByTestId(/^day-dot-/);
      expect(dots.length).toBe(7);
    });
  });

  describe('interactions', () => {
    it('should call onDayPress when a past day is pressed', () => {
      const { getByTestId } = render(
        <YearGrid year={2025} onDayPress={mockOnDayPress} />
      );

      fireEvent.press(getByTestId('day-dot-2025-01-01'));

      expect(mockOnDayPress).toHaveBeenCalledWith('2025-01-01');
    });

    it('should call onDayPress when today is pressed', () => {
      const { getByTestId } = render(
        <YearGrid year={2025} onDayPress={mockOnDayPress} />
      );

      fireEvent.press(getByTestId('day-dot-2025-01-03'));

      expect(mockOnDayPress).toHaveBeenCalledWith('2025-01-03');
    });

    it('should NOT call onDayPress when a future day is pressed', () => {
      const { getByTestId } = render(
        <YearGrid year={2025} onDayPress={mockOnDayPress} />
      );

      // 2025-01-04 is a future date in our mock
      fireEvent.press(getByTestId('day-dot-2025-01-04'));

      expect(mockOnDayPress).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have testID when provided', () => {
      const { getByTestId } = render(
        <YearGrid year={2025} onDayPress={mockOnDayPress} testID="custom-grid" />
      );

      expect(getByTestId('custom-grid')).toBeTruthy();
    });
  });
});
