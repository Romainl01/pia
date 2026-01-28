import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CategoryFilterButton } from './CategoryFilterButton';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
}));

// Mock expo-symbols
jest.mock('expo-symbols', () => ({
  SymbolView: ({ name, testID }: { name: string; testID?: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text testID={testID}>{name}</Text>;
  },
}));

// Mock expo-glass-effect
jest.mock('expo-glass-effect', () => ({
  GlassView: ({ children, style }: { children: React.ReactNode; style?: object }) => {
    const React = require('react');
    const { View } = require('react-native');
    return <View style={style}>{children}</View>;
  },
}));

describe('CategoryFilterButton', () => {
  const defaultProps = {
    value: null as 'friend' | 'family' | 'work' | 'partner' | 'flirt' | null,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render pill with "All" when value is null', () => {
      const { getByText } = render(<CategoryFilterButton {...defaultProps} value={null} />);
      expect(getByText('All')).toBeTruthy();
    });

    it('should render pill with category name when value is set', () => {
      const { getByText } = render(<CategoryFilterButton {...defaultProps} value="family" />);
      expect(getByText('Family')).toBeTruthy();
    });

    it('should display chevron icon', () => {
      const { getByText } = render(<CategoryFilterButton {...defaultProps} />);
      expect(getByText('chevron.down')).toBeTruthy();
    });
  });

  describe('menu interaction', () => {
    it('should open menu when pill is pressed', async () => {
      const { getByTestId, getByText } = render(<CategoryFilterButton {...defaultProps} />);

      fireEvent.press(getByTestId('category-filter-button'));

      await waitFor(() => {
        expect(getByText('Friend')).toBeTruthy();
        expect(getByText('Family')).toBeTruthy();
        expect(getByText('Work')).toBeTruthy();
        expect(getByText('Partner')).toBeTruthy();
        expect(getByText('Flirt')).toBeTruthy();
      });
    });

    it('should call onChange when menu item is selected', async () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <CategoryFilterButton {...defaultProps} onChange={onChange} />
      );

      // Open menu
      fireEvent.press(getByTestId('category-filter-button'));

      // Select family
      await waitFor(() => {
        fireEvent.press(getByTestId('category-filter-menu-item-family'));
      });

      expect(onChange).toHaveBeenCalledWith('family');
    });

    it('should call onChange with null when "All" is selected', async () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <CategoryFilterButton {...defaultProps} value="family" onChange={onChange} />
      );

      // Open menu
      fireEvent.press(getByTestId('category-filter-button'));

      // Select all
      await waitFor(() => {
        fireEvent.press(getByTestId('category-filter-menu-item-null'));
      });

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('should trigger haptic feedback when opening menu', () => {
      const Haptics = require('expo-haptics');
      const { getByTestId } = render(<CategoryFilterButton {...defaultProps} />);

      fireEvent.press(getByTestId('category-filter-button'));

      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have accessible role button', () => {
      const { getByRole } = render(<CategoryFilterButton {...defaultProps} />);
      expect(getByRole('button')).toBeTruthy();
    });

    it('should have accessibility label', () => {
      const { getByLabelText } = render(<CategoryFilterButton {...defaultProps} />);
      expect(getByLabelText(/filter by category/i)).toBeTruthy();
    });
  });
});
