import React, { useEffect, useRef, useState } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  t: number;
}

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

type CursorMode = 'default' | 'link' | 'read' | 'text';

export const StudyPencilCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');
  const [ripples, setRipples] = useState<ClickRipple[]>([]);

  // Direct DOM refs for 120fps zero-re-render cursor & trail tracking
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const trailPathRef = useRef<SVGPathElement | null>(null);

  const targetPosRef = useRef({ x: -100, y: -100 });
  const currentPosRef = useRef({ x: -100, y: -100 });
  const trailPointsRef = useRef<TrailPoint[]>([]);
  const rafRef = useRef<number | null>(null);

  const visibleRef = useRef(false);
  const modeRef = useRef<CursorMode>('default');
  const isMovingRef = useRef(false);
  const moveTimeoutRef = useRef<number | null>(null);
  const pointIdRef = useRef(0);

  // Enable only on desktop devices with a fine pointer and no reduced-motion preference
  useEffect(() => {
    const finePointerMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateEligibility = () => {
      const shouldEnable = finePointerMedia.matches && !reducedMotionMedia.matches;
      setEnabled(shouldEnable);
      if (shouldEnable) {
        document.documentElement.classList.add('study-cursor-active');
      } else {
        document.documentElement.classList.remove('study-cursor-active');
      }
    };

    updateEligibility();
    finePointerMedia.addEventListener('change', updateEligibility);
    reducedMotionMedia.addEventListener('change', updateEligibility);

    return () => {
      document.documentElement.classList.remove('study-cursor-active');
      finePointerMedia.removeEventListener('change', updateEligibility);
      reducedMotionMedia.removeEventListener('change', updateEligibility);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const classifyTarget = (target: EventTarget | null): CursorMode => {
      if (!(target instanceof HTMLElement)) return 'default';

      const explicitRead = target.closest('[data-cursor="read"]');
      if (explicitRead) return 'read';

      if (target.closest('input, textarea, select, [contenteditable="true"]')) {
        return 'text';
      }

      const blogLink = target.closest('a[href^="/blog/"]');
      if (blogLink && target.closest('h1, h2, h3, h4')) {
        return 'read';
      }

      if (
        target.closest(
          'a, button, [role="button"], label, summary, input[type="submit"], input[type="button"]'
        )
      ) {
        return 'link';
      }

      return 'default';
    };

    const tick = () => {
      // Smooth exponential lerp for cursor position
      const cur = currentPosRef.current;
      const tgt = targetPosRef.current;
      cur.x += (tgt.x - cur.x) * 0.42;
      cur.y += (tgt.y - cur.y) * 0.42;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cur.x.toFixed(2)}px, ${cur.y.toFixed(2)}px, 0)`;
      }

      // Smooth quadratic Bezier SVG path for graphite trail
      const now = performance.now();
      trailPointsRef.current = trailPointsRef.current.filter((pt) => now - pt.t < 220);
      const pts = trailPointsRef.current;

      if (trailPathRef.current) {
        if (pts.length < 2) {
          trailPathRef.current.setAttribute('d', '');
        } else {
          let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
          for (let i = 1; i < pts.length - 1; i++) {
            const xc = ((pts[i].x + pts[i + 1].x) / 2).toFixed(1);
            const yc = ((pts[i].y + pts[i + 1].y) / 2).toFixed(1);
            d += ` Q ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}, ${xc} ${yc}`;
          }
          const last = pts[pts.length - 1];
          d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
          trailPathRef.current.setAttribute('d', d);
        }
      }

      const distRemaining = Math.hypot(tgt.x - cur.x, tgt.y - cur.y);
      if (distRemaining > 0.15 || trailPointsRef.current.length > 0) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    const ensureLoop = () => {
      if (!rafRef.current) {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      if (!visibleRef.current) {
        visibleRef.current = true;
        currentPosRef.current = { x: clientX, y: clientY };
        setVisible(true);
      }
      targetPosRef.current = { x: clientX, y: clientY };

      const nextMode = classifyTarget(e.target);
      if (nextMode !== modeRef.current) {
        modeRef.current = nextMode;
        setMode(nextMode);
      }

      if (!isMovingRef.current) {
        isMovingRef.current = true;
        setIsMoving(true);
      }
      if (moveTimeoutRef.current) {
        window.clearTimeout(moveTimeoutRef.current);
      }
      moveTimeoutRef.current = window.setTimeout(() => {
        isMovingRef.current = false;
        setIsMoving(false);
      }, 110);

      const pts = trailPointsRef.current;
      const last = pts[pts.length - 1];
      if (!last || Math.hypot(clientX - last.x, clientY - last.y) > 3) {
        pts.push({ x: clientX, y: clientY, t: performance.now() });
        if (pts.length > 14) pts.shift();
      }

      ensureLoop();
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsPressed(true);
      const id = ++pointIdRef.current;
      setRipples((prev) => [...prev.slice(-4), { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 480);
    };

    const handleMouseUp = () => {
      setIsPressed(false);
    };

    const handleMouseLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };

    const handleMouseEnter = () => {
      visibleRef.current = true;
      setVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (moveTimeoutRef.current) {
        window.clearTimeout(moveTimeoutRef.current);
      }
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  const baseRotation =
    mode === 'read'
      ? -12
      : mode === 'link'
      ? -8
      : mode === 'text'
      ? -22
      : isMoving
      ? -17.5
      : -15;

  const baseScale = isPressed ? 0.9 : mode === 'read' ? 1.06 : mode === 'link' ? 1.04 : 1;
  const translateYOffset = isMoving ? -0.8 : 0;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden select-none"
    >
      {/* 1. Silky Smooth Quadratic Bezier Graphite Trail on Paper */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none">
        <path
          ref={trailPathRef}
          d=""
          fill="none"
          stroke="#887467"
          strokeOpacity="0.22"
          strokeWidth="1.15"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 1.5"
        />
      </svg>

      {/* 2. Tiny Ink-Dot Ripple Effect on Click */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
          className="fixed -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping"
        >
          <div className="w-2.5 h-2.5 rounded-full border border-[#594438]/60 bg-[#D9A5A5]/35" />
        </div>
      ))}

      {/* 3. Main Animated Study Pencil Cursor (Compact 22px Size, Direct 120fps RAF Transform) */}
      <div
        ref={cursorRef}
        style={{
          opacity: !visible ? 0 : mode === 'text' ? 0.55 : 1,
          transform: `translate3d(${currentPosRef.current.x}px, ${currentPosRef.current.y}px, 0)`,
        }}
        className="fixed top-0 left-0 pointer-events-none will-change-transform transition-opacity duration-150"
      >
        {/* Delicate Nib Contact Point Dot */}
        <div
          className={`w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-200 ${
            mode === 'link' || mode === 'read'
              ? 'bg-[#D9A5A5] scale-125'
              : 'bg-[#594438]/75 scale-90'
          }`}
        />

        {/* Pencil Body Wrapper — anchored at the exact graphite tip (1.2px, 20.8px) */}
        <div
          style={{
            transformOrigin: '1.2px 20.8px',
            transform: `translate3d(0, ${translateYOffset}px, 0) rotate(${baseRotation}deg) scale(${baseScale})`,
            transition: 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="absolute -left-[1.2px] -top-[20.8px] pointer-events-none will-change-transform"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_2px_4px_rgba(89,68,56,0.14)]"
          >
            {/* Soft Wooden Cone Collar */}
            <path
              d="M2.2 33.8L10.8 29.9L6.1 25.2L2.2 33.8Z"
              fill="#EADCCB"
              stroke="#594438"
              strokeWidth="1.35"
              strokeLinejoin="round"
            />

            {/* Espresso Graphite Lead Tip at (2, 34) */}
            <path d="M2 34L5.6 32.3L3.7 30.4L2 34Z" fill="#594438" />

            {/* Warm Brown Main Hexagonal Pencil Barrel */}
            <path
              d="M6.1 25.2L23.6 7.7L28.3 12.4L10.8 29.9L6.1 25.2Z"
              fill="#D9BFA9"
              stroke="#594438"
              strokeWidth="1.35"
              strokeLinejoin="round"
            />

            {/* Subtle Editorial Highlight Facet Along Pencil Barrel */}
            <path
              d="M7.7 26.8L25.2 9.3"
              stroke="#FFF8EF"
              strokeWidth="1.25"
              strokeLinecap="round"
              opacity="0.75"
            />

            {/* Cream Metal Ferrule Band */}
            <path
              d="M23.6 7.7L26.5 4.8L31.2 9.5L28.3 12.4L23.6 7.7Z"
              fill="#FFF8EF"
              stroke="#594438"
              strokeWidth="1.35"
              strokeLinejoin="round"
            />

            {/* Dusty Pink Rounded Eraser Cap */}
            <path
              d="M26.5 4.8L28.4 2.9C29.4 1.9 31.0 1.9 32.0 2.9L33.1 4.0C34.1 5.0 34.1 6.6 33.1 7.6L31.2 9.5L26.5 4.8Z"
              fill="#D9A5A5"
              stroke="#594438"
              strokeWidth="1.35"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 4. Small Animated "READ" Editorial Badge when hovering over Blog Titles */}
        <div
          style={{
            opacity: mode === 'read' ? 1 : 0,
            transform:
              mode === 'read'
                ? 'translate3d(13px, 2px, 0) scale(1)'
                : 'translate3d(9px, 4px, 0) scale(0.85)',
            transition: 'opacity 160ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="absolute top-0 left-0 px-1.5 py-0.5 rounded bg-[#FFF8EF] border border-[#D9A5A5] shadow-[0_3px_8px_rgba(89,68,56,0.12)] pointer-events-none whitespace-nowrap"
        >
          <span className="font-mono text-[8.5px] font-semibold tracking-[0.14em] text-[#594438] uppercase">
            READ
          </span>
        </div>
      </div>
    </div>
  );
};
