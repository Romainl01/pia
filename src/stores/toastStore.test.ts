import { useToastStore } from './toastStore';

describe('toastStore', () => {
  beforeEach(() => {
    useToastStore.setState({
      visible: false,
      message: '',
      undoAction: null,
      toastId: 0,
    });
  });

  describe('initial state', () => {
    it('should start with toast hidden', () => {
      const { visible, message, undoAction } = useToastStore.getState();
      expect(visible).toBe(false);
      expect(message).toBe('');
      expect(undoAction).toBeNull();
    });
  });

  describe('showToast', () => {
    it('should show toast with message', () => {
      const { showToast } = useToastStore.getState();

      showToast('Test message');

      const { visible, message } = useToastStore.getState();
      expect(visible).toBe(true);
      expect(message).toBe('Test message');
    });

    it('should set undoAction when provided', () => {
      const { showToast } = useToastStore.getState();
      const undoFn = jest.fn();

      showToast('Test message', undoFn);

      const { undoAction } = useToastStore.getState();
      expect(undoAction).toBe(undoFn);
    });

    it('should set undoAction to null when not provided', () => {
      const { showToast } = useToastStore.getState();

      showToast('Test message');

      const { undoAction } = useToastStore.getState();
      expect(undoAction).toBeNull();
    });

    it('should increment toastId on each call to force component remount', () => {
      const { showToast, hideToast } = useToastStore.getState();

      showToast('First message');
      const firstId = useToastStore.getState().toastId;
      expect(firstId).toBe(1);

      hideToast();
      showToast('Second message');
      const secondId = useToastStore.getState().toastId;
      expect(secondId).toBe(2);

      hideToast();
      showToast('Third message');
      const thirdId = useToastStore.getState().toastId;
      expect(thirdId).toBe(3);
    });
  });

  describe('hideToast', () => {
    it('should hide the toast', () => {
      const { showToast, hideToast } = useToastStore.getState();

      showToast('Test message');
      hideToast();

      const { visible } = useToastStore.getState();
      expect(visible).toBe(false);
    });

    it('should clear the message and undoAction', () => {
      const { showToast, hideToast } = useToastStore.getState();

      showToast('Test message', jest.fn());
      hideToast();

      const { message, undoAction } = useToastStore.getState();
      expect(message).toBe('');
      expect(undoAction).toBeNull();
    });
  });
});
