import React, { useState } from 'react';

interface EditorialArtworkProps {
  src: string;
  alt: string;
  category?: string;
  week?: number;
  className?: string;
  aspectClass?: string;
}

export const EditorialArtwork: React.FC<EditorialArtworkProps> = ({
  src,
  alt,
  category = 'Computer Science',
  week,
  className = '',
  aspectClass = 'aspect-[4/3]',
}) => {
  const [imgError, setImgError] = useState(false);

  const isCustomUrl =
    src &&
    !src.startsWith('editorial:') &&
    !src.startsWith('project:') &&
    (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:') || src.startsWith('/'));

  const renderSvgIllustration = (variant: string) => {
    switch (variant) {
      case 'editorial:java':
        return (
          <svg viewBox="0 0 600 450" className="w-full h-full" aria-hidden="true">
            <defs>
              <linearGradient id="javaBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF8EF" />
                <stop offset="55%" stopColor="#F9EFE8" />
                <stop offset="100%" stopColor="#F7DDE1" />
              </linearGradient>
              <linearGradient id="javaAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D9A5A5" />
                <stop offset="100%" stopColor="#D9BFA9" />
              </linearGradient>
            </defs>
            <rect width="600" height="450" fill="url(#javaBg)" />
            <circle cx="480" cy="100" r="110" fill="#F7DDE1" opacity="0.65" className="svg-float-orb" />
            <circle cx="110" cy="360" r="130" fill="#EADCCB" opacity="0.55" className="svg-float-orb" />
            <g stroke="#EDE0D5" strokeWidth="1" opacity="0.8">
              <line x1="80" y1="0" x2="80" y2="450" />
              <line x1="520" y1="0" x2="520" y2="450" />
              <line x1="0" y1="90" x2="600" y2="90" />
              <line x1="0" y1="360" x2="600" y2="360" />
            </g>
            <rect x="115" y="105" width="370" height="240" rx="20" fill="#FFFFFF" stroke="#EDE0D5" strokeWidth="2" />
            <rect x="115" y="105" width="370" height="42" rx="20" fill="#F9EFE8" />
            <circle cx="142" cy="126" r="5" fill="#D9A5A5" />
            <circle cx="160" cy="126" r="5" fill="#D9BFA9" />
            <circle cx="178" cy="126" r="5" fill="#EADCCB" />
            <text x="205" y="131" fill="#887467" fontSize="11" fontFamily="JetBrains Mono, monospace">
              Main.java → JVM Bytecode
            </text>
            <rect x="145" y="172" width="95" height="68" rx="12" fill="#FFF8EF" stroke="#D9BFA9" strokeWidth="1.5" />
            <text x="192" y="203" textAnchor="middle" fill="#594438" fontSize="12" fontWeight="600" fontFamily="Playfair Display, serif">
              .java
            </text>
            <text x="192" y="221" textAnchor="middle" fill="#887467" fontSize="10" fontFamily="DM Sans, sans-serif">
              Source Code
            </text>
            <path d="M 248 206 L 268 206" stroke="#D9A5A5" strokeWidth="2.2" strokeLinecap="round" className="svg-flow-line" />
            <rect x="275" y="172" width="95" height="68" rx="12" fill="#F7DDE1" stroke="#D9A5A5" strokeWidth="1.5" />
            <text x="322" y="203" textAnchor="middle" fill="#594438" fontSize="12" fontWeight="600" fontFamily="Playfair Display, serif">
              .class
            </text>
            <text x="322" y="221" textAnchor="middle" fill="#594438" fontSize="10" fontFamily="DM Sans, sans-serif">
              Bytecode
            </text>
            <path d="M 378 206 L 396 206" stroke="#D9A5A5" strokeWidth="2.2" strokeLinecap="round" className="svg-flow-line" />
            <circle cx="428" cy="206" r="26" fill="url(#javaAccent)" className="svg-float-orb" />
            <text x="428" y="210" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">
              JVM
            </text>
            <rect x="145" y="264" width="160" height="8" rx="4" fill="#EADCCB" />
            <rect x="145" y="284" width="240" height="8" rx="4" fill="#F7DDE1" />
            <rect x="145" y="304" width="195" height="8" rx="4" fill="#EDE0D5" />
          </svg>
        );

      case 'editorial:arrays':
      case 'project:memory':
        return (
          <svg viewBox="0 0 600 450" className="w-full h-full" aria-hidden="true">
            <defs>
              <linearGradient id="arrBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F9EFE8" />
                <stop offset="50%" stopColor="#FFF8EF" />
                <stop offset="100%" stopColor="#EADCCB" />
              </linearGradient>
            </defs>
            <rect width="600" height="450" fill="url(#arrBg)" />
            <circle cx="130" cy="110" r="95" fill="#F7DDE1" opacity="0.6" className="svg-float-orb" />
            <circle cx="490" cy="340" r="115" fill="#D9BFA9" opacity="0.25" className="svg-float-orb" />
            <rect x="85" y="130" width="430" height="190" rx="22" fill="#FFFFFF" stroke="#EDE0D5" strokeWidth="2" />
            <text x="115" y="168" fill="#887467" fontSize="11" fontFamily="JetBrains Mono, monospace">
              CONTIGUOUS MEMORY · O(1) INDEX ACCESS
            </text>
            {[0, 1, 2, 3, 4].map((idx) => {
              const x = 115 + idx * 74;
              const isHighlighted = idx === 1 || idx === 3;
              return (
                <g key={idx}>
                  <rect
                    x={x}
                    y="190"
                    width="64"
                    height="68"
                    rx="12"
                    fill={isHighlighted ? '#F7DDE1' : '#FFF8EF'}
                    stroke={isHighlighted ? '#D9A5A5' : '#D9BFA9'}
                    strokeWidth="1.75"
                  />
                  <text
                    x={x + 32}
                    y="228"
                    textAnchor="middle"
                    fill="#594438"
                    fontSize="16"
                    fontWeight="600"
                    fontFamily="Playfair Display, serif"
                  >
                    {(idx + 1) * 14}
                  </text>
                  <text
                    x={x + 32}
                    y="278"
                    textAnchor="middle"
                    fill="#887467"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    [{idx}]
                  </text>
                </g>
              );
            })}
            <path d="M 221 182 Q 295 142 369 182" fill="none" stroke="#D9A5A5" strokeWidth="2" className="svg-flow-line" />
          </svg>
        );

      case 'editorial:oop':
      case 'project:compiler':
        return (
          <svg viewBox="0 0 600 450" className="w-full h-full" aria-hidden="true">
            <defs>
              <linearGradient id="oopBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF8EF" />
                <stop offset="50%" stopColor="#F7DDE1" />
                <stop offset="100%" stopColor="#F9EFE8" />
              </linearGradient>
            </defs>
            <rect width="600" height="450" fill="url(#oopBg)" />
            <rect x="205" y="75" width="190" height="82" rx="18" fill="#FFFFFF" stroke="#D9A5A5" strokeWidth="2" />
            <text x="300" y="112" textAnchor="middle" fill="#594438" fontSize="14" fontWeight="600" fontFamily="Playfair Display, serif">
              Abstract Blueprint
            </text>
            <text x="300" y="134" textAnchor="middle" fill="#887467" fontSize="11" fontFamily="JetBrains Mono, monospace">
              + execute()
            </text>
            <path d="M 300 157 L 300 198 M 175 198 L 425 198 M 175 198 L 175 232 M 425 198 L 425 232" stroke="#594438" strokeWidth="1.75" fill="none" opacity="0.45" className="svg-flow-line" />
            <rect x="90" y="232" width="170" height="110" rx="18" fill="#FFFFFF" stroke="#EDE0D5" strokeWidth="2" />
            <circle cx="130" cy="268" r="14" fill="#F7DDE1" className="svg-float-orb" />
            <text x="175" y="295" textAnchor="middle" fill="#594438" fontSize="13" fontWeight="600" fontFamily="Playfair Display, serif">
              Encapsulation
            </text>
            <text x="175" y="317" textAnchor="middle" fill="#887467" fontSize="10" fontFamily="DM Sans, sans-serif">
              Private State · Safe API
            </text>
            <rect x="340" y="232" width="170" height="110" rx="18" fill="#FFFFFF" stroke="#EDE0D5" strokeWidth="2" />
            <circle cx="380" cy="268" r="14" fill="#EADCCB" className="svg-float-orb" />
            <text x="425" y="295" textAnchor="middle" fill="#594438" fontSize="13" fontWeight="600" fontFamily="Playfair Display, serif">
              Polymorphism
            </text>
            <text x="425" y="317" textAnchor="middle" fill="#887467" fontSize="10" fontFamily="DM Sans, sans-serif">
              Dynamic Dispatch
            </text>
          </svg>
        );

      case 'editorial:dsa':
      case 'project:visualizer':
        return (
          <svg viewBox="0 0 600 450" className="w-full h-full" aria-hidden="true">
            <rect width="600" height="450" fill="#FFF8EF" />
            <circle cx="480" cy="110" r="120" fill="#EADCCB" opacity="0.5" className="svg-float-orb" />
            <circle cx="120" cy="340" r="110" fill="#F7DDE1" opacity="0.55" className="svg-float-orb" />
            <g stroke="#D9BFA9" strokeWidth="2.2" className="svg-flow-line">
              <line x1="300" y1="115" x2="195" y2="215" />
              <line x1="300" y1="115" x2="405" y2="215" />
              <line x1="195" y1="215" x2="135" y2="315" />
              <line x1="195" y1="215" x2="255" y2="315" />
              <line x1="405" y1="215" x2="345" y2="315" />
              <line x1="405" y1="215" x2="465" y2="315" />
            </g>
            {[
              { cx: 300, cy: 115, val: '50', active: true },
              { cx: 195, cy: 215, val: '25', active: false },
              { cx: 405, cy: 215, val: '75', active: true },
              { cx: 135, cy: 315, val: '12', active: false },
              { cx: 255, cy: 315, val: '38', active: false },
              { cx: 345, cy: 315, val: '64', active: true },
              { cx: 465, cy: 315, val: '90', active: false },
            ].map((node, i) => (
              <g key={i}>
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="30"
                  fill={node.active ? '#D9A5A5' : '#FFFFFF'}
                  stroke={node.active ? '#594438' : '#D9BFA9'}
                  strokeWidth="2"
                  className={node.active ? 'svg-float-orb' : undefined}
                />
                <text
                  x={node.cx}
                  y={node.cy + 5}
                  textAnchor="middle"
                  fill={node.active ? '#FFFFFF' : '#594438'}
                  fontSize="14"
                  fontWeight="600"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {node.val}
                </text>
              </g>
            ))}
            <rect x="215" y="375" width="170" height="32" rx="16" fill="#FFFFFF" stroke="#EDE0D5" />
            <text x="300" y="395" textAnchor="middle" fill="#594438" fontSize="11" fontFamily="JetBrains Mono, monospace">
              O(log n) Search Path
            </text>
          </svg>
        );

      case 'editorial:graphs':
      default:
        return (
          <svg viewBox="0 0 600 450" className="w-full h-full" aria-hidden="true">
            <defs>
              <linearGradient id="graphBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F9EFE8" />
                <stop offset="50%" stopColor="#FFF8EF" />
                <stop offset="100%" stopColor="#F7DDE1" />
              </linearGradient>
            </defs>
            <rect width="600" height="450" fill="url(#graphBg)" />
            <g stroke="#D9A5A5" strokeWidth="2.2" opacity="0.8" className="svg-flow-line">
              <line x1="160" y1="150" x2="310" y2="115" />
              <line x1="160" y1="150" x2="210" y2="295" />
              <line x1="310" y1="115" x2="450" y2="185" />
              <line x1="310" y1="115" x2="335" y2="265" />
              <line x1="210" y1="295" x2="335" y2="265" />
              <line x1="335" y1="265" x2="450" y2="185" />
              <line x1="335" y1="265" x2="435" y2="335" />
            </g>
            {[
              { x: 160, y: 150, label: 'A', fill: '#594438', text: '#FFFFFF' },
              { x: 310, y: 115, label: 'B', fill: '#D9A5A5', text: '#FFFFFF' },
              { x: 210, y: 295, label: 'C', fill: '#FFFFFF', text: '#594438' },
              { x: 335, y: 265, label: 'D', fill: '#F7DDE1', text: '#594438' },
              { x: 450, y: 185, label: 'E', fill: '#FFFFFF', text: '#594438' },
              { x: 435, y: 335, label: 'F', fill: '#EADCCB', text: '#594438' },
            ].map((n, idx) => (
              <g key={idx}>
                <circle cx={n.x} cy={n.y} r="28" fill={n.fill} stroke="#EDE0D5" strokeWidth="2" />
                <text
                  x={n.x}
                  y={n.y + 5}
                  textAnchor="middle"
                  fill={n.text}
                  fontSize="14"
                  fontWeight="600"
                  fontFamily="Playfair Display, serif"
                >
                  {n.label}
                </text>
              </g>
            ))}
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#F9EFE8] ${aspectClass} ${className}`}
    >
      {isCustomUrl && !imgError ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
          {renderSvgIllustration(src)}
        </div>
      )}

      {week !== undefined && (
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-[#FFF8EF]/90 backdrop-blur-xs border border-[#EDE0D5] text-[11px] font-mono tabular-nums text-[#594438]">
          Week {String(week).padStart(2, '0')} · {category}
        </div>
      )}
    </div>
  );
};
