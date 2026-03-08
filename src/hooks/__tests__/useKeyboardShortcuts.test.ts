import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

const fireKey = (key: string, opts: Partial<KeyboardEventInit> = {}) => {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...opts }));
};

describe('useKeyboardShortcuts', () => {
  it('calls onNext on Ctrl+Enter', () => {
    const onNext = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onNext }));

    fireKey('Enter', { ctrlKey: true });
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('calls onNext on Meta+Enter', () => {
    const onNext = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onNext }));

    fireKey('Enter', { metaKey: true });
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('calls onBack on Escape', () => {
    const onBack = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onBack }));

    fireKey('Escape');
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('calls onCopy on Ctrl+C when no text selected', () => {
    const onCopy = vi.fn();
    vi.spyOn(window, 'getSelection').mockReturnValue({ toString: () => '' } as Selection);
    renderHook(() => useKeyboardShortcuts({ onCopy }));

    fireKey('c', { ctrlKey: true });
    expect(onCopy).toHaveBeenCalledOnce();
  });

  it('does NOT call onCopy on Ctrl+C when text is selected', () => {
    const onCopy = vi.fn();
    vi.spyOn(window, 'getSelection').mockReturnValue({ toString: () => 'some text' } as Selection);
    renderHook(() => useKeyboardShortcuts({ onCopy }));

    fireKey('c', { ctrlKey: true });
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('does not call handlers for unrelated keys', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    const onCopy = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onNext, onBack, onCopy }));

    fireKey('a');
    fireKey('Enter'); // no modifier
    expect(onNext).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('cleans up listener on unmount', () => {
    const onNext = vi.fn();
    const { unmount } = renderHook(() => useKeyboardShortcuts({ onNext }));

    unmount();
    fireKey('Enter', { ctrlKey: true });
    expect(onNext).not.toHaveBeenCalled();
  });
});
