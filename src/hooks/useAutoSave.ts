import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoSaveOptions {
  content: string;
  onSave: (content: string) => void;
  debounceMs?: number;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  justSaved: boolean;
  saveNow: () => void;
}

const JUST_SAVED_DURATION_MS = 1500;

/**
 * Auto-save hook with debouncing.
 * Saves content after a delay, shows "just saved" indicator briefly.
 */
export function useAutoSave({
  content,
  onSave,
  debounceMs = 500,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Refs to track latest values and timers
  const contentRef = useRef(content);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justSavedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep contentRef updated
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // The actual save function
  const performSave = useCallback(() => {
    const currentContent = contentRef.current;

    // Don't save empty or whitespace-only content
    if (!currentContent.trim()) {
      return;
    }

    setIsSaving(true);
    onSave(currentContent);
    setIsSaving(false);
    setJustSaved(true);

    // Reset justSaved after delay
    if (justSavedTimerRef.current) {
      clearTimeout(justSavedTimerRef.current);
    }
    justSavedTimerRef.current = setTimeout(() => {
      setJustSaved(false);
    }, JUST_SAVED_DURATION_MS);
  }, [onSave]);

  // Debounce content changes and save after delay
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);

    // Cleanup on unmount or content change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [content, debounceMs, performSave]);

  // Cleanup justSaved timer on unmount
  useEffect(() => {
    return () => {
      if (justSavedTimerRef.current) {
        clearTimeout(justSavedTimerRef.current);
      }
    };
  }, []);

  // Immediate save function (cancels pending debounce)
  const saveNow = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    performSave();
  }, [performSave]);

  return { isSaving, justSaved, saveNow };
}
