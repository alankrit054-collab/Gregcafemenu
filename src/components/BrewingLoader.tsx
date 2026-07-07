import React from 'react';

interface BrewingLoaderProps {
  message?: string;
  subMessage?: string;
}

export const BrewingLoader: React.FC<BrewingLoaderProps> = ({
  message = "Brewing Your Experience...",
  subMessage = "Aligning live cafe parameters"
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center select-none" id="brewing-loader-container">
      {/* CSS Keyframes injected inline for precise control and cross-browser smoothness */}
      <style>{`
        @keyframes drip {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            transform: translateY(22px) scale(0.9);
            opacity: 1;
          }
          100% {
            transform: translateY(24px) scale(0);
            opacity: 0;
          }
        }
        @keyframes fillUp {
          0% {
            transform: translateY(18px);
          }
          100% {
            transform: translateY(-2px);
          }
        }
        @keyframes steam {
          0% {
            transform: translateY(0) scaleX(1);
            opacity: 0;
          }
          15% {
            opacity: 0.6;
          }
          50% {
            transform: translateY(-8px) scaleX(1.1);
            opacity: 0.3;
          }
          100% {
            transform: translateY(-16px) scaleX(0.9);
            opacity: 0;
          }
        }
        @keyframes sway {
          0%, 100% {
            transform: rotate(-0.5deg);
          }
          50% {
            transform: rotate(0.5deg);
          }
        }
        .anim-drip {
          animation: drip 1.4s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }
        .anim-fill {
          animation: fillUp 6s infinite alternate ease-in-out;
        }
        .anim-steam-1 {
          animation: steam 2.5s infinite ease-out;
        }
        .anim-steam-2 {
          animation: steam 2.5s infinite ease-out 0.8s;
        }
        .anim-steam-3 {
          animation: steam 2.5s infinite ease-out 1.6s;
        }
        .anim-sway {
          animation: sway 4s infinite ease-in-out;
        }
      `}</style>

      {/* SVG Dripper & Cup Container */}
      <div className="relative w-36 h-36 flex items-center justify-center anim-sway" id="brewing-loader-svg">
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Steam rising from cup */}
          <path
            className="anim-steam-1"
            d="M 44,38 Q 42,30 46,24"
            stroke="#D97C7A"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="anim-steam-2"
            d="M 50,37 Q 48,28 52,21"
            stroke="#D97C7A"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="anim-steam-3"
            d="M 56,38 Q 54,31 58,25"
            stroke="#D97C7A"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Dripper / Filter cone at the top */}
          <path
            d="M 28,15 L 72,15 L 60,32 L 40,32 Z"
            fill="#080504"
            stroke="#D97C7A"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Dripper Base Ring */}
          <path
            d="M 24,15 L 76,15"
            stroke="#D97C7A"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Coffee Grounds Layer inside filter */}
          <path
            d="M 33,20 L 67,20 L 63,27 L 37,27 Z"
            fill="#675A58"
            opacity="0.9"
          />

          {/* Coffee Droplet falling */}
          <circle
            className="anim-drip"
            cx="50"
            cy="33"
            r="2.5"
            fill="#B13818"
          />

          {/* Modern Double-walled Cup at the bottom */}
          {/* Cup Outer Wall */}
          <path
            d="M 35,54 C 35,68 40,78 50,78 C 60,78 65,68 65,54"
            stroke="#080504"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Cup Handle */}
          <path
            d="M 65,57 C 71,57 73,61 71,65 C 69,69 65,68 65,68"
            stroke="#080504"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Inner Cup & Filling Liquid */}
          <g>
            {/* Mask to clip coffee inside cup inner boundary */}
            <clipPath id="innerCupClip">
              <path d="M 38,55 C 38,65 42,74 50,74 C 58,74 62,65 62,55 Z" />
            </clipPath>
            {/* Liquid Group with mask */}
            <g clipPath="url(#innerCupClip)">
              {/* Background of inner cup */}
              <rect x="30" y="50" width="40" height="30" fill="#FEF6F6" />
              {/* Coffee Liquid level */}
              <g className="anim-fill">
                {/* Wavy top layer of the coffee filling up */}
                <path
                  d="M 30,68 C 34,66 38,70 42,68 C 46,66 50,70 54,68 C 58,66 62,70 66,68 L 66,90 L 30,90 Z"
                  fill="#B13818"
                />
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* Modern High-End Typography */}
      <h2 className="text-lg font-serif font-bold text-[#B13818] tracking-tight mt-4">
        {message}
      </h2>
      <p className="text-xs text-[#675A58] mt-1.5 font-medium tracking-wider uppercase">
        {subMessage}
      </p>
    </div>
  );
};
