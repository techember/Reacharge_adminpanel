import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onEscape?: () => void;
  onToggleSidebar?: () => void;
}

export const useKeyboardShortcuts = ({ onEscape, onToggleSidebar }: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        onEscape();
      }
      
      if (event.key === 'b' && (event.metaKey || event.ctrlKey) && onToggleSidebar) {
        event.preventDefault();
        onToggleSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onToggleSidebar]);
};