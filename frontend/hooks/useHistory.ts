import { useState, useCallback, useRef, useEffect } from 'react';

export function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [pointer, setPointer] = useState<number>(0);
  const isUndoRedoAction = useRef(false);

  const canUndo = pointer > 0;
  const canRedo = pointer < history.length - 1;

  const pushState = useCallback((newState: T) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    setHistory((prev) => {
      // Avoid pushing identical state (shallow compare)
      if (JSON.stringify(prev[pointer]) === JSON.stringify(newState)) {
        return prev;
      }
      const updatedHistory = prev.slice(0, pointer + 1);
      // Limit history to 50 states to prevent memory issues
      if (updatedHistory.length > 50) {
        updatedHistory.shift();
        setPointer(p => p - 1);
      }
      return [...updatedHistory, newState];
    });
    setPointer((prev) => {
      // If we shifted, prev might be different, but we rely on the effect above
      return prev + 1;
    });
  }, [pointer]);

  // Fix for pointer when history length changes
  const pushStateSafe = useCallback((newState: T) => {
     if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    setHistory((prev) => {
      if (JSON.stringify(prev[pointer]) === JSON.stringify(newState)) return prev;
      const nextHistory = [...prev.slice(0, pointer + 1), newState];
      if (nextHistory.length > 50) {
        setPointer(50);
        return nextHistory.slice(nextHistory.length - 51);
      }
      setPointer(nextHistory.length - 1);
      return nextHistory;
    });
  }, [pointer]);

  const undo = useCallback(() => {
    if (canUndo) {
      isUndoRedoAction.current = true;
      setPointer((prev) => prev - 1);
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      isUndoRedoAction.current = true;
      setPointer((prev) => prev + 1);
    }
  }, [canRedo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Filter out if user is typing in an input EXCEPT if we want to support undo in inputs?
      // Browsers have native undo for inputs, but since we are wrapping state, it might conflict.
      // Usually, it's safer to only trigger history undo if they are NOT actively typing inside an input/textarea
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (!isInput) {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    state: history[pointer],
    pushState: pushStateSafe,
    undo,
    redo,
    canUndo,
    canRedo,
    isUndoRedoAction: isUndoRedoAction.current,
  };
}
