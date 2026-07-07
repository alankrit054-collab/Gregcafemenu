import React from 'react';

interface MenuByteLogoProps {
  className?: string;
}

export const MenuByteLogo: React.FC<MenuByteLogoProps> = ({ className = "w-8 h-8" }) => {
  return (
    <div className={`inline-block select-none ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Outer concentric rings to replicate the border structure of the logo */}
        <circle
          cx="50"
          cy="50"
          r="41"
          fill="#15100E"
        />
        
        {/* White gap ring */}
        <circle
          cx="50"
          cy="50"
          r="39"
          fill="#FFFFFF"
        />

        {/* Main orange solid circle background */}
        <circle
          cx="50"
          cy="50"
          r="37"
          fill="#F58220"
        />

        {/* Central golden-yellow circle dot */}
        <circle
          cx="50"
          cy="50"
          r="13.5"
          fill="#FFD000"
        />

        {/* QR Code Card in the background, slightly tilted counter-clockwise */}
        <g transform="rotate(-8 50 40)">
          {/* Card Base */}
          <rect
            x="36"
            y="20"
            width="28"
            height="32"
            rx="3"
            fill="#FFFFFF"
            stroke="#15100E"
            strokeWidth="2.5"
          />
          
          {/* Top-Left QR Marker */}
          <rect x="39" y="23" width="6" height="6" fill="none" stroke="#15100E" strokeWidth="1.5" />
          <rect x="41" y="25" width="2" height="2" fill="#15100E" />

          {/* Top-Right QR Marker */}
          <rect x="55" y="23" width="6" height="6" fill="none" stroke="#15100E" strokeWidth="1.5" />
          <rect x="57" y="25" width="2" height="2" fill="#15100E" />

          {/* Bottom-Left QR Marker */}
          <rect x="39" y="43" width="6" height="6" fill="none" stroke="#15100E" strokeWidth="1.5" />
          <rect x="41" y="45" width="2" height="2" fill="#15100E" />

          {/* Stylized QR Pixels */}
          <rect x="47" y="23" width="2" height="2" fill="#15100E" />
          <rect x="50" y="26" width="3" height="1.5" fill="#15100E" />
          <rect x="47" y="29" width="5" height="2" fill="#15100E" />
          <rect x="55" y="31" width="3" height="5" fill="#15100E" />
          <rect x="47" y="35" width="5" height="2" fill="#15100E" />
          <rect x="40" y="31" width="4" height="2" fill="#15100E" />
          <rect x="40" y="35" width="5" height="1.5" fill="#15100E" />
          <rect x="48" y="39" width="3" height="3" fill="#15100E" />
          <rect x="54" y="39" width="4" height="2" fill="#15100E" />
          <rect x="54" y="43" width="6" height="6" fill="none" stroke="#15100E" strokeWidth="1.5" />
          <rect x="56" y="45" width="2" height="2" fill="#15100E" />
        </g>

        {/* Polished Golden Cloche (Serving Dome Platter Cover) */}
        <g>
          {/* Knob / Handle on top */}
          <circle
            cx="50"
            cy="36"
            r="2.5"
            fill="#F5A623"
            stroke="#15100E"
            strokeWidth="2.5"
          />
          
          {/* Main Dome Body */}
          <path
            d="M 34 50 A 16 16 0 0 1 66 50 Z"
            fill="#F5A623"
            stroke="#15100E"
            strokeWidth="2.5"
          />

          {/* Shine / Highlight on Left side of dome */}
          <path
            d="M 39 46 A 11 11 0 0 1 48 39"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Platter / Rim line below dome */}
          <path
            d="M 31 50 C 43.6 52.5 56.4 52.5 69 50"
            fill="none"
            stroke="#15100E"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>

        {/* Cursive "menubyte" text script on the bottom overlapping the circles */}
        <g transform="rotate(-3 50 78)">
          {/* Thick black background stroke for sticker/cartoon outline effect */}
          <text
            x="50"
            y="78"
            fontFamily="'Pacifico', 'Brush Script MT', 'Caveat', 'Comic Sans MS', cursive, sans-serif"
            fontSize="18"
            fontWeight="900"
            fill="#15100E"
            stroke="#15100E"
            strokeWidth="5"
            strokeLinejoin="round"
            textAnchor="middle"
          >
            menubyte
          </text>
          
          {/* Crisp, golden-yellow foreground fill text */}
          <text
            x="50"
            y="78"
            fontFamily="'Pacifico', 'Brush Script MT', 'Caveat', 'Comic Sans MS', cursive, sans-serif"
            fontSize="18"
            fontWeight="900"
            fill="#FEF6F6"
            textAnchor="middle"
          >
            menubyte
          </text>
        </g>
      </svg>
    </div>
  );
};
