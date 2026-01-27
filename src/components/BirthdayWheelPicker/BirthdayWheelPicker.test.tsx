import { render, fireEvent } from '@testing-library/react-native';
import { BirthdayWheelPicker, BirthdayValue } from './BirthdayWheelPicker';

// The ITEM_HEIGHT constant from the component
const ITEM_HEIGHT = 44;

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
}));

/** Helper: simulate a scroll-snap to a given index in a WheelColumn */
function scrollToIndex(
  getByTestId: ReturnType<typeof render>['getByTestId'],
  columnTestID: string,
  index: number,
) {
  const scrollView = getByTestId(`${columnTestID}-scroll`);
  fireEvent(scrollView, 'momentumScrollEnd', {
    nativeEvent: { contentOffset: { y: index * ITEM_HEIGHT } },
  });
}

describe('BirthdayWheelPicker', () => {
  const defaultValue: BirthdayValue = { day: 15, month: 0, year: undefined };
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render three picker columns when expanded', () => {
    const { getByTestId } = render(
      <BirthdayWheelPicker value={defaultValue} onChange={mockOnChange} expanded={true} />
    );

    expect(getByTestId('day-picker')).toBeTruthy();
    expect(getByTestId('month-picker')).toBeTruthy();
    expect(getByTestId('year-picker')).toBeTruthy();
  });

  it('should display day items', () => {
    const { getByTestId } = render(
      <BirthdayWheelPicker value={{ day: 27, month: 0, year: undefined }} onChange={mockOnChange} expanded={true} />
    );

    expect(getByTestId('day-picker-item-1')).toBeTruthy();
    expect(getByTestId('day-picker-item-27')).toBeTruthy();
    expect(getByTestId('day-picker-item-31')).toBeTruthy();
  });

  it('should display month items', () => {
    const { getByTestId } = render(
      <BirthdayWheelPicker value={{ day: 1, month: 5, year: undefined }} onChange={mockOnChange} expanded={true} />
    );

    expect(getByTestId('month-picker-item-0')).toBeTruthy();
    expect(getByTestId('month-picker-item-5')).toBeTruthy();
    expect(getByTestId('month-picker-item-11')).toBeTruthy();
  });

  it('should display year items including "none"', () => {
    const { getByTestId } = render(
      <BirthdayWheelPicker value={{ day: 1, month: 0, year: undefined }} onChange={mockOnChange} expanded={true} />
    );

    expect(getByTestId('year-picker-item-none')).toBeTruthy();
    expect(getByTestId('year-picker-item-2000')).toBeTruthy();
  });

  it('should call onChange when day scroll snaps', () => {
    const { getByTestId } = render(
      <BirthdayWheelPicker value={{ day: 15, month: 0, year: undefined }} onChange={mockOnChange} expanded={true} />
    );

    scrollToIndex(getByTestId, 'day-picker', 19);

    expect(mockOnChange).toHaveBeenCalledWith({ day: 20, month: 0, year: undefined });
  });

  it('should call onChange when month scroll snaps', () => {
    const { getByTestId } = render(
      <BirthdayWheelPicker value={{ day: 15, month: 0, year: undefined }} onChange={mockOnChange} expanded={true} />
    );

    scrollToIndex(getByTestId, 'month-picker', 6);

    expect(mockOnChange).toHaveBeenCalledWith({ day: 15, month: 6, year: undefined });
  });

  it('should call onChange when year scroll snaps', () => {
    const { getByTestId } = render(
      <BirthdayWheelPicker value={{ day: 15, month: 0, year: undefined }} onChange={mockOnChange} expanded={true} />
    );

    const currentYear = new Date().getFullYear();
    const yearIndex = 1 + (currentYear - 2000);
    scrollToIndex(getByTestId, 'year-picker', yearIndex);

    expect(mockOnChange).toHaveBeenCalledWith({ day: 15, month: 0, year: 2000 });
  });

  it('should set year to undefined when scrolled to "none"', () => {
    const { getByTestId } = render(
      <BirthdayWheelPicker value={{ day: 15, month: 0, year: 2000 }} onChange={mockOnChange} expanded={true} />
    );

    scrollToIndex(getByTestId, 'year-picker', 0);

    expect(mockOnChange).toHaveBeenCalledWith({ day: 15, month: 0, year: undefined });
  });

  it('should clamp day when switching to a shorter month', () => {
    const { getByTestId } = render(
      <BirthdayWheelPicker value={{ day: 31, month: 0, year: undefined }} onChange={mockOnChange} expanded={true} />
    );

    scrollToIndex(getByTestId, 'month-picker', 1);

    expect(mockOnChange).toHaveBeenCalledWith({ day: 28, month: 1, year: undefined });
  });

  it('should allow 29 days in February for leap years', () => {
    const { getByTestId } = render(
      <BirthdayWheelPicker value={{ day: 31, month: 0, year: 2000 }} onChange={mockOnChange} expanded={true} />
    );

    scrollToIndex(getByTestId, 'month-picker', 1);

    expect(mockOnChange).toHaveBeenCalledWith({ day: 29, month: 1, year: 2000 });
  });
});
