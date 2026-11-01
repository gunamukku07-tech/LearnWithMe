import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotionPreference } from '../../hooks/useScrollAndMotion';

/**
 * Reusable Editorial UI Components & Motion Primitives
 * Built with hardware-accelerated CSS transforms & direct DOM refs so content is
 * 100% visible at all times and runs at 120fps with zero React re-renders.
 */

interface EditorialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'subtle';
  children: React.ReactNode;
}

export const EditorialButton: React.FC<EditorialButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ease-out cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60';

  const variants = {
    primary:
      'bg-[#D9A5A5] text-[#594438] hover:bg-[#d19595] shadow-[0_6px_20px_-6px_rgba(217,165,165,0.45)] hover:-translate-y-0.5 active:scale-[0.985]',
    secondary:
      'bg-white border border-[#EDE0D5] text-[#594438] hover:border-[#D9BFA9] hover:bg-[#F9EFE8] hover:-translate-y-0.5 active:scale-[0.985]',
    subtle:
      'bg-[#F9EFE8] text-[#594438] hover:bg-[#F7DDE1]/70 active:scale-[0.985]',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const EditorialCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
}> = ({ children, className = '', hoverLift = true }) => {
  return (
    <div
      className={`rounded-[18px] bg-white border border-[#EDE0D5] shadow-[0_4px_20px_-6px_rgba(89,68,56,0.05)] hover:shadow-[0_16px_36px_-12px_rgba(89,68,56,0.1)] transition-all duration-300 ease-out ${
        hoverLift ? 'hover:-translate-y-1' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const SectionHeading: React.FC<{
  kicker?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}> = ({ kicker, title, description, align = 'left' }) => {
  return (
    <div
      className={`space-y-2.5 ${
        align === 'center' ? 'text-center mx-auto max-w-2xl' : 'max-w-2xl'
      }`}
    >
      {kicker && (
        <p className="text-xs uppercase tracking-[0.18em] text-[#887467] font-medium">
          {kicker}
        </p>
      )}
      <div className="inline-block">
        <h2 className="font-serif-section text-3xl sm:text-4xl text-[#594438] leading-tight">
          {title}
        </h2>
        <div
          className={`mt-2 h-[2px] w-16 rounded-full bg-gradient-to-r from-[#D9A5A5] via-[#D9BFA9] to-transparent editorial-underline-draw ${
            align === 'center' ? 'mx-auto' : ''
          }`}
        />
      </div>
      {description && (
        <p className="text-sm sm:text-base text-[#887467] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export const ScrollReveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const reducedMotion = useReducedMotionPreference();
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(true);

  useEffect(() => {
    if (reducedMotion || !ref.current || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const el = ref.current;
    const rect = el.getBoundingClientRect();
    // If already in or above the viewport on mount, keep immediately visible
    if (rect.top < window.innerHeight * 0.95) {
      setRevealed(true);
      return;
    }

    setRevealed(false);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      style={{
        opacity: revealed ? 1 : 0.01,
        transform: revealed ? 'translate3d(0, 0, 0)' : 'translate3d(0, 16px, 0)',
        transition: `opacity 520ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 520ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
};

export const StaggeredText: React.FC<{
  text: string;
  className?: string;
}> = ({ text, className = '' }) => {
  const reducedMotion = useReducedMotionPreference();
  const words = text.split(' ');

  if (reducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`inline-block ${className}`} aria-label={text}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          style={{
            animationDelay: `${index * 38}ms`,
          }}
          className="inline-block mr-[0.28em] editorial-page-enter"
        >
          {word}
        </span>
      ))}
    </span>
  );
};

export const AnimatedCounter: React.FC<{
  value: number;
  durationMs?: number;
  className?: string;
}> = ({ value, durationMs = 950, className = '' }) => {
  const reducedMotion = useReducedMotionPreference();
  const ref = useRef<HTMLSpanElement | null>(null);
  const [displayValue, setDisplayValue] = useState(value);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (reducedMotion || value <= 0) {
      setDisplayValue(value);
      return;
    }

    const runCountUp = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;
      let startTimestamp: number | null = null;
      let rafId: number;

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setDisplayValue(Math.max(1, Math.round(eased * value)));

        if (progress < 1) {
          rafId = window.requestAnimationFrame(step);
        } else {
          setDisplayValue(value);
        }
      };

      rafId = window.requestAnimationFrame(step);
    };

    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      runCountUp();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          runCountUp();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, durationMs, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
};

export const MagneticWrapper: React.FC<{
  children: React.ReactNode;
  strength?: number;
  className?: string;
}> = ({ children, strength = 0.2, className = '' }) => {
  const reducedMotion = useReducedMotionPreference();
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = ((e.clientX - centerX) * strength).toFixed(2);
    const dy = ((e.clientY - centerY) * strength).toFixed(2);
    ref.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      ref.current.style.transform = 'translate3d(0px, 0px, 0)';
    }
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className={`inline-block will-change-transform ${className}`}
    >
      {children}
    </div>
  );
};

export const FloatingPastelDecor: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-[#F7DDE1]/55 blur-3xl editorial-float" />
      <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-[#EADCCB]/60 blur-3xl editorial-float" />
      <div className="hidden lg:block absolute top-16 right-12 w-12 h-12 rounded-2xl border border-[#D9BFA9]/45 bg-white/35 editorial-float" />
      <div className="hidden lg:block absolute bottom-16 right-1/3 w-8 h-8 rounded-full border border-[#D9A5A5]/50 bg-[#F7DDE1]/30 editorial-float-bg" />
    </div>
  );
};
