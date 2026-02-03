import { render } from '@testing-library/react-native';

import { GlassDateChip } from './GlassDateChip';

// Mock the date helpers to control "today"
jest.mock('@/src/utils/journalDateHelpers', () => ({
  ...jest.requireActual('@/src/utils/journalDateHelpers'),
  isToday: jest.fn(),
  formatShortDate: jest.fn(),
}));

import { isToday, formatShortDate } from '@/src/utils/journalDateHelpers';

const mockIsToday = isToday as jest.Mock;
const mockFormatShortDate = formatShortDate as jest.Mock;

describe('GlassDateChip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display "Today" for today\'s date', () => {
    mockIsToday.mockReturnValue(true);
    mockFormatShortDate.mockReturnValue('Wed, Jan 29');

    const { getByText } = render(<GlassDateChip date="2026-01-29" />);

    expect(getByText('Today')).toBeTruthy();
  });

  it('should display formatted date for other dates', () => {
    mockIsToday.mockReturnValue(false);
    mockFormatShortDate.mockReturnValue('Mon, Jan 27');

    const { getByText } = render(<GlassDateChip date="2026-01-27" />);

    expect(getByText('Mon, Jan 27')).toBeTruthy();
  });

  it('should render with testID when provided', () => {
    mockIsToday.mockReturnValue(false);
    mockFormatShortDate.mockReturnValue('Tue, Jan 28');

    const { getByTestId } = render(
      <GlassDateChip date="2026-01-28" testID="date-chip" />
    );

    expect(getByTestId('date-chip')).toBeTruthy();
  });
});
