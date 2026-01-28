import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilteredEmptyState } from './FilteredEmptyState';

describe('FilteredEmptyState', () => {
  const mockOnAddFriend = jest.fn();

  beforeEach(() => {
    mockOnAddFriend.mockClear();
  });

  describe('rendering', () => {
    it('should display category name in message', () => {
      const { getByText } = render(
        <FilteredEmptyState category="family" onAddFriend={mockOnAddFriend} />
      );

      expect(getByText('No family yet')).toBeTruthy();
    });

    it('should display correct category name for each category', () => {
      const { rerender, getByText } = render(
        <FilteredEmptyState category="work" onAddFriend={mockOnAddFriend} />
      );
      expect(getByText('No work yet')).toBeTruthy();

      rerender(<FilteredEmptyState category="partner" onAddFriend={mockOnAddFriend} />);
      expect(getByText('No partner yet')).toBeTruthy();

      rerender(<FilteredEmptyState category="flirt" onAddFriend={mockOnAddFriend} />);
      expect(getByText('No flirt yet')).toBeTruthy();
    });

    it('should display contextual subtitle text', () => {
      const { getByText, rerender } = render(
        <FilteredEmptyState category="family" onAddFriend={mockOnAddFriend} />
      );
      expect(getByText('Keep track of birthdays and catch-ups')).toBeTruthy();

      rerender(<FilteredEmptyState category="friend" onAddFriend={mockOnAddFriend} />);
      expect(getByText('Add someone from your contacts')).toBeTruthy();

      rerender(<FilteredEmptyState category="work" onAddFriend={mockOnAddFriend} />);
      expect(getByText('Stay connected with your professional network')).toBeTruthy();
    });

    it('should render contextual button label for each category', () => {
      const { getByText, rerender } = render(
        <FilteredEmptyState category="family" onAddFriend={mockOnAddFriend} />
      );
      expect(getByText('Add a family member')).toBeTruthy();

      rerender(<FilteredEmptyState category="work" onAddFriend={mockOnAddFriend} />);
      expect(getByText('Add a colleague')).toBeTruthy();

      rerender(<FilteredEmptyState category="partner" onAddFriend={mockOnAddFriend} />);
      expect(getByText('Add a partner')).toBeTruthy();

      rerender(<FilteredEmptyState category="friend" onAddFriend={mockOnAddFriend} />);
      expect(getByText('Add a friend')).toBeTruthy();
    });
  });

  describe('interaction', () => {
    it('should call onAddFriend when button is pressed', () => {
      const { getByTestId } = render(
        <FilteredEmptyState category="family" onAddFriend={mockOnAddFriend} />
      );

      fireEvent.press(getByTestId('filtered-empty-add-button'));
      expect(mockOnAddFriend).toHaveBeenCalledTimes(1);
    });
  });
});
