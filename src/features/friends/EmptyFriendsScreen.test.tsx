import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { EmptyFriendsScreen } from "./EmptyFriendsScreen";

describe("EmptyFriendsScreen", () => {
  const mockOnAddFriend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render the app title", () => {
      const { getByText } = render(
        <EmptyFriendsScreen onAddFriend={mockOnAddFriend} />
      );

      expect(getByText("Pia")).toBeTruthy();
    });

    it("should render the hero title", () => {
      const { getByText } = render(
        <EmptyFriendsScreen onAddFriend={mockOnAddFriend} />
      );

      expect(getByText("Keep your closest within reach")).toBeTruthy();
    });

    it("should render the hero subtitle", () => {
      const { getByText } = render(
        <EmptyFriendsScreen onAddFriend={mockOnAddFriend} />
      );

      expect(
        getByText(
          "Add friends to stay in touch, share memories, and never miss a birthday"
        )
      ).toBeTruthy();
    });

    it("should render the add friend CTA button", () => {
      const { getByText } = render(
        <EmptyFriendsScreen onAddFriend={mockOnAddFriend} />
      );

      expect(getByText("Add a friend")).toBeTruthy();
    });

    it("should render the plus icon button", () => {
      const { getByTestId } = render(
        <EmptyFriendsScreen onAddFriend={mockOnAddFriend} />
      );

      expect(getByTestId("add-friend-button")).toBeTruthy();
    });

    it("should render the person.fill.badge.plus SF Symbol", () => {
      const { getByTestId } = render(
        <EmptyFriendsScreen onAddFriend={mockOnAddFriend} />
      );

      expect(getByTestId("symbol-person.fill.badge.plus")).toBeTruthy();
    });
  });

  describe("interactions", () => {
    it("should call onAddFriend when plus button is pressed", () => {
      const { getByTestId } = render(
        <EmptyFriendsScreen onAddFriend={mockOnAddFriend} />
      );

      fireEvent.press(getByTestId("add-friend-button"));

      expect(mockOnAddFriend).toHaveBeenCalledTimes(1);
    });

    it("should call onAddFriend when add friend CTA is pressed", () => {
      const { getByTestId } = render(
        <EmptyFriendsScreen onAddFriend={mockOnAddFriend} />
      );

      fireEvent.press(getByTestId("add-friend-cta"));

      expect(mockOnAddFriend).toHaveBeenCalledTimes(1);
    });
  });
});
