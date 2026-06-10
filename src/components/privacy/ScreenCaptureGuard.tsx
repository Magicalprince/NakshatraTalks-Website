'use client';

/**
 * Best-effort defense against casual screenshots / content copying on
 * web. Mounted by sensitive surfaces — chat session, chat history
 * transcript.
 *
 * What this CAN do:
 *   - Disable right-click context menu (no "Save image", "Copy text").
 *   - Disable text selection via CSS (`user-select: none` on body
 *     while mounted) — copy-paste off.
 *   - Disable drag-to-save on images.
 *   - Hide content briefly when window loses focus or visibility
 *     changes (covers Cmd+Tab → screenshot patterns and Windows
 *     Snipping Tool which removes focus during its capture step).
 *   - Render a diagonal watermark with the viewer's phone (passed
 *     in by the parent) so leaked screenshots are identifiable.
 *
 * What this CANNOT do:
 *   - Block OS-level screenshots (Print Screen, Win+Shift+S without
 *     focus, macOS Cmd+Shift+4, mobile screenshot gestures). The OS
 *     owns the framebuffer; no browser API can block it.
 *   - Block screen recorders (OBS, QuickTime, etc.).
 *   - Block sound recorders.
 *
 * The honest framing: this raises the friction for the 95% case
 * (casual user trying right-click → save) without pretending to be
 * a security boundary. Watermarking gives accountability for the
 * remaining 5%.
 */

import { useEffect } from 'react';

interface Props {
  /** Watermark text — typically the viewer's masked phone number. */
  watermarkLabel?: string;
}

export function ScreenCaptureGuard({ watermarkLabel }: Props) {
  useEffect(() => {
    // 1. Suppress right-click
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Suppress text-drag-and-drop selection start
    const onDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      // Allow drag from input/textarea so people can edit normally
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
    };

    // 3. Suppress copy on the whole document while mounted. Note this
    //    is page-wide; if a sub-component needs copy, it can stopPropagation
    //    on its own copy handler.
    const onCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
    };

    // 4. Hide on visibility change — Win+Shift+S and macOS screenshot
    //    overlays both cause `visibilitychange` to fire before the
    //    snapshot is taken. We can blur the document until focus
    //    returns.
    const setBlur = (blurred: boolean) => {
      const body = document.body;
      if (!body) return;
      if (blurred) {
        body.style.filter = 'blur(24px)';
        body.style.pointerEvents = 'none';
      } else {
        body.style.filter = '';
        body.style.pointerEvents = '';
      }
    };
    const onBlur = () => setBlur(true);
    const onFocus = () => setBlur(false);
    const onVisChange = () => {
      setBlur(document.visibilityState !== 'visible');
    };

    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('copy', onCopy);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisChange);

    // 5. Disable user-select globally while mounted, but allow inside
    //    form fields. Restored on cleanup so other pages aren't affected.
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-screen-capture-guard', 'true');
    styleEl.textContent = `
      body, body * { user-select: none !important; -webkit-user-select: none !important; }
      input, textarea, [contenteditable] { user-select: text !important; -webkit-user-select: text !important; }
      img { -webkit-user-drag: none; user-drag: none; }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('copy', onCopy);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisChange);
      styleEl.remove();
      setBlur(false);
    };
  }, []);

  // Watermark overlay — fixed, pointer-events:none so it doesn't
  // interfere with the UI, but appears in any screenshot.
  if (!watermarkLabel) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0.08,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(6, 1fr)',
        userSelect: 'none',
      }}
    >
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-30deg)',
            fontSize: '12px',
            fontFamily: 'system-ui, sans-serif',
            color: '#000',
            whiteSpace: 'nowrap',
          }}
        >
          {watermarkLabel}
        </div>
      ))}
    </div>
  );
}

export default ScreenCaptureGuard;
