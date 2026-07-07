import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, SkipForward, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface QRIntroSplashProps {
  onComplete: () => void;
  restaurantName?: string;
}

export const QRIntroSplash: React.FC<QRIntroSplashProps> = ({ 
  onComplete,
  restaurantName = "Greg's Cafe",
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stage, setStage] = useState<number>(0);

  // Play synthesized retro cafe chimes using the Web Audio API
  const playChime = (type: 'pop' | 'drop' | 'slide' | 'whoosh' | 'success') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'pop') {
        // High soft bubble pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'drop') {
        // Metallic cloche drop spring sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'slide') {
        // QR Code slide chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.25);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'whoosh') {
        // Text slide brush whoosh
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'success') {
        // Perfect rich cafe acoustic success chord
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(392.00, now); // G4
        osc2.frequency.setValueAtTime(523.25, now + 0.1); // C5

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        gain2.gain.setValueAtTime(0.12, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.6);
        osc2.stop(now + 0.6);
      }
    } catch (e) {
      console.warn("Audio Context blocked or unsupported:", e);
    }
  };

  useEffect(() => {
    // 0.2s: Pop circle
    const t1 = setTimeout(() => {
      setStage(1);
      playChime('pop');
    }, 400);

    // 1.2s: Drop cloche
    const t2 = setTimeout(() => {
      setStage(2);
      playChime('drop');
    }, 1400);

    // 2.3s: Slide QR Card
    const t3 = setTimeout(() => {
      setStage(3);
      playChime('slide');
    }, 2500);

    // 3.4s: Whoosh text
    const t4 = setTimeout(() => {
      setStage(4);
      playChime('whoosh');
    }, 3600);

    // 4.6s: Complete chord & scale bloom
    const t5 = setTimeout(() => {
      setStage(5);
      playChime('success');
    }, 4600);

    // 5.8s: Automatically proceed
    const t6 = setTimeout(() => {
      onComplete();
    }, 6200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [soundEnabled]);

  return (
    <div className="fixed inset-0 bg-[#FEF6F6] flex flex-col items-center justify-center overflow-hidden z-[999] select-none">
      {/* Dynamic Background Rays to recreate the premium video intro depth */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_#B13818_1px,_transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Decorative floating warm particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#F5A623] rounded-full blur-[100px] opacity-10 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#B13818] rounded-full blur-[120px] opacity-10 animate-pulse delay-1000" />
      </div>

      {/* Intro Toolbar */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#15100E]/5 hover:bg-[#15100E]/10 border border-[#15100E]/10 text-[#675A58] hover:text-[#15100E] transition-all text-xs font-semibold cursor-pointer"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Chimes On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Muted</span>
            </>
          )}
        </button>

        <button
          onClick={onComplete}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#15100E] text-[#FEF6F6] hover:bg-[#B13818] transition-all text-xs font-bold shadow-md active:scale-95 cursor-pointer"
        >
          <span>Skip</span>
          <SkipForward className="w-3 h-3" />
        </button>
      </div>

      {/* Main Animated Canvas */}
      <div className="relative w-[340px] h-[340px] md:w-[420px] md:h-[420px] flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-2xl"
        >
          {/* STAGE 1: Concentric Circle Bases */}
          <AnimatePresence>
            {stage >= 1 && (
              <motion.g
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 14, stiffness: 90 }}
              >
                {/* Thin outer boundary border */}
                <circle
                  cx="50"
                  cy="50"
                  r="41"
                  fill="#15100E"
                />
                
                {/* Outer white concentric trim */}
                <circle
                  cx="50"
                  cy="50"
                  r="39"
                  fill="#FFFFFF"
                />

                {/* Rich Orange Ring Disc */}
                <circle
                  cx="50"
                  cy="50"
                  r="37"
                  fill="#F58220"
                />

                {/* Central Lighter Yellow Circle (perfectly matching the video) */}
                <circle
                  cx="50"
                  cy="50"
                  r="13.5"
                  fill="#FFD000"
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* STAGE 3: QR Code Card (appears behind the cloche, slides up from bottom-left) */}
          <AnimatePresence>
            {stage >= 3 && (
              <motion.g
                initial={{ x: -25, y: 25, scale: 0.2, opacity: 0, rotate: -25 }}
                animate={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: -8 }}
                transition={{ type: 'spring', damping: 10, stiffness: 70 }}
                style={{ originX: "50px", originY: "40px" }}
              >
                {/* QR Code White Card */}
                <rect
                  x="36"
                  y="20"
                  width="28"
                  height="32"
                  rx="3.5"
                  fill="#FFFFFF"
                  stroke="#15100E"
                  strokeWidth="2.5"
                />

                {/* QR Markers (Top-Left, Top-Right, Bottom-Left) */}
                <rect x="39" y="23" width="6" height="6" fill="none" stroke="#15100E" strokeWidth="1.5" />
                <rect x="41" y="25" width="2" height="2" fill="#15100E" />

                <rect x="55" y="23" width="6" height="6" fill="none" stroke="#15100E" strokeWidth="1.5" />
                <rect x="57" y="25" width="2" height="2" fill="#15100E" />

                <rect x="39" y="43" width="6" height="6" fill="none" stroke="#15100E" strokeWidth="1.5" />
                <rect x="41" y="45" width="2" height="2" fill="#15100E" />

                {/* Stylized high-detail QR pixels */}
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
              </motion.g>
            )}
          </AnimatePresence>

          {/* STAGE 2: Cloche (Drops from top and bounces beautifully) */}
          <AnimatePresence>
            {stage >= 2 && (
              <motion.g
                initial={{ y: -65, opacity: 0, scaleY: 1.4 }}
                animate={{ y: 0, opacity: 1, scaleY: 1 }}
                transition={{ 
                  type: 'spring', 
                  bounce: 0.45, 
                  duration: 1.0, 
                  stiffness: 110,
                  damping: 10
                }}
              >
                {/* Knob/Handle */}
                <circle
                  cx="50"
                  cy="36"
                  r="2.5"
                  fill="#F5A623"
                  stroke="#15100E"
                  strokeWidth="2.5"
                />

                {/* Serving Dome Cover */}
                <path
                  d="M 34 50 A 16 16 0 0 1 66 50 Z"
                  fill="#F5A623"
                  stroke="#15100E"
                  strokeWidth="2.5"
                />

                {/* Specular light highlight reflection */}
                <path
                  d="M 39 46 A 11 11 0 0 1 48 39"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Platter platter line base */}
                <path
                  d="M 31 50 C 43.6 52.5 56.4 52.5 69 50"
                  fill="none"
                  stroke="#15100E"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* STAGE 4: Elegant brush cursive "menubyte" text assembly */}
          <AnimatePresence>
            {stage >= 4 && (
              <motion.g
                initial={{ x: 60, opacity: 0, scale: 0.6, rotate: 10 }}
                animate={{ x: 0, opacity: 1, scale: 1, rotate: -3 }}
                transition={{ 
                  type: 'spring', 
                  damping: 11, 
                  stiffness: 100 
                }}
                style={{ originX: "50px", originY: "78px" }}
              >
                {/* Thick sticker stroke backdrop */}
                <text
                  x="50"
                  y="78"
                  fontFamily="'Pacifico', 'Brush Script MT', 'Caveat', 'Comic Sans MS', cursive, sans-serif"
                  fontSize="18"
                  fontWeight="900"
                  fill="#15100E"
                  stroke="#15100E"
                  strokeWidth="5.5"
                  strokeLinejoin="round"
                  textAnchor="middle"
                >
                  menubyte
                </text>
                
                {/* White core letter text */}
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
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* Ambient Bloom Sparkle overlays when fully assembled */}
        {stage >= 5 && (
          <>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="absolute top-[28%] left-[28%] text-amber-400"
            >
              <Sparkles className="w-6 h-6 fill-amber-400 animate-pulse" />
            </motion.div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute bottom-[35%] right-[25%] text-amber-300"
            >
              <Sparkles className="w-5 h-5 fill-amber-300 animate-bounce" />
            </motion.div>
          </>
        )}
      </div>

      {/* Actionable Greeting Text & Status */}
      <div className="mt-8 text-center px-6 max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <h3 className="text-xl font-serif font-black text-[#15100E] tracking-tight">
            {restaurantName}
          </h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="mt-2.5 flex flex-col items-center gap-1"
        >
          {stage < 5 ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B13818] animate-ping" />
              <p className="text-[10px] uppercase font-extrabold tracking-widest text-[#675A58]">
                {stage === 1 && "Verifying Cafe Parameters..."}
                {stage === 2 && "Syncing Menu Database..."}
                {stage === 3 && "Connecting QR Table Session..."}
                {stage === 4 && "Preparing Digital Experience..."}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <p className="text-xs font-bold text-[#B13818] uppercase tracking-wider flex items-center gap-1.5 bg-[#B13818]/10 px-3.5 py-1 rounded-full border border-[#B13818]/25">
                <Sparkles className="w-3.5 h-3.5 fill-[#B13818] text-[#B13818]" />
                <span>QR Scanned Successfully</span>
              </p>
              <span className="text-[10px] text-[#675A58] uppercase tracking-widest font-bold mt-1">
                Welcome • Click anywhere to enter
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Giant Invisible Touch Handler to enter the app faster once complete */}
      {stage >= 4 && (
        <div
          onClick={onComplete}
          className="absolute inset-0 z-[5] cursor-pointer"
          title="Click to enter Cafe"
        />
      )}

      {/* Styled Footer */}
      <div className="absolute bottom-8 text-[10px] uppercase font-black tracking-[0.2em] text-[#675A58]/60">
        Powered by MenuByte
      </div>
    </div>
  );
};
