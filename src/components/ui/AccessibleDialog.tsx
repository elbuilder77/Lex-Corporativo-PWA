import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

const dialogStack: HTMLElement[] = [];
const backgroundLocks = new Map<Element, { count: number; wasInert: boolean }>();
const focusableSelector = 'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

interface AccessibleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  className?: string;
  children: ReactNode;
}

/** Owns modal focus and background interaction independently of its visual panel. */
export function AccessibleDialog({ isOpen, onClose, label, className, children }: AccessibleDialogProps) {
  const [host] = useState(() => document.createElement('div'));
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useLayoutEffect(() => { closeRef.current = onClose; }, [onClose]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.append(host);
    const dialog = dialogRef.current!;
    const background = Array.from(document.body.children).filter((element) => element !== host);
    background.forEach((element) => {
      const lock = backgroundLocks.get(element) ?? { count: 0, wasInert: element.hasAttribute('inert') };
      lock.count += 1;
      backgroundLocks.set(element, lock);
      element.setAttribute('inert', '');
    });
    dialogStack.push(dialog);

    const controls = () => Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => {
      if (element.tabIndex < 0 || element.closest('[hidden], [inert]')) return false;
      for (let current: HTMLElement | null = element; current && current !== dialog; current = current.parentElement) {
        const style = getComputedStyle(current);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
      }
      return true;
    });
    const focusStart = () => (dialog.querySelector<HTMLElement>('[data-autofocus], [autofocus]') ?? controls()[0] ?? dialog).focus();
    const isTop = () => dialogStack.at(-1) === dialog;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTop()) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
      } else if (event.key === 'Tab') {
        const elements = controls();
        const first = elements[0] ?? dialog;
        const last = elements.at(-1) ?? dialog;
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const onFocus = (event: FocusEvent) => {
      if (isTop() && event.target instanceof Node && !dialog.contains(event.target)) focusStart();
    };
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('focusin', onFocus);
    focusStart();
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('focusin', onFocus);
      dialogStack.splice(dialogStack.indexOf(dialog), 1);
      background.forEach((element) => {
        const lock = backgroundLocks.get(element)!;
        lock.count -= 1;
        if (lock.count === 0) {
          if (!lock.wasInert) element.removeAttribute('inert');
          backgroundLocks.delete(element);
        }
      });
      host.remove();
      if (previousFocus?.isConnected && !previousFocus.closest('[inert]')) previousFocus.focus();
    };
  }, [host, isOpen]);

  if (!isOpen) return null;
  return createPortal(
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} className={className}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      {children}
    </div>, host,
  );
}
