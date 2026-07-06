import React, { useState, useEffect } from 'react';
import { Lock, Unlock, X, Delete, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState<boolean>(false);

  // Clear pin & error on open
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setShake(false);
    }
  }, [isOpen]);

  const handleKeyPress = (digit: string) => {
    if (error) setError(null);
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
    }
  };

  const handleBackspace = () => {
    if (error) setError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  // Submit/Verify PIN logic
  const handleVerify = () => {
    if (pin === '0000') {
      onSuccess();
    } else {
      setError('ACCESS DENIED: INVALID SECURITY KEY');
      setShake(true);
      setPin('');
      // Reset shake after animation completes
      setTimeout(() => setShake(false), 500);
    }
  };

  // Auto-verify when 4 digits are completed
  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(() => {
        handleVerify();
      }, 150); // Small delay to let user see last filled bubble
      return () => clearTimeout(timer);
    }
  }, [pin]);

  // Support hardware keyboard entry
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        if (pin.length === 4) {
          handleVerify();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, error]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark blurred backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Keypad Container Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            x: shake ? [-10, 10, -10, 10, -5, 5, 0] : 0
          }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="bg-[#080504] border-2 border-[#B13818] rounded-3xl p-6 sm:p-8 max-w-[360px] w-full text-[#FEF6F6] shadow-[0_25px_60px_-15px_rgba(177,56,24,0.3)] relative z-10 flex flex-col items-center"
        >
          {/* Close trigger button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#675A58] hover:text-[#FEF6F6] p-1.5 rounded-full hover:bg-white/5 transition-colors"
            title="Dismiss security gate"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Secure Header Info */}
          <div className="flex flex-col items-center text-center mb-6 mt-2">
            <div className="w-12 h-12 rounded-full bg-[#B13818]/10 border border-[#B13818]/40 flex items-center justify-center text-[#FDB2B2] mb-3">
              <Lock className="w-5 h-5 stroke-[2px]" />
            </div>
            <h2 className="text-sm font-bold tracking-widest text-[#FDB2B2] uppercase font-sans">
              Greg's Cafe
            </h2>
            <p className="text-xl font-serif font-black tracking-tight text-white mt-1">
              Admin Access Keypad
            </p>
            <p className="text-[10px] text-[#675A58] font-mono mt-1 uppercase tracking-wider">
              Enter 4-Digit Security PIN Code
            </p>
          </div>

          {/* Pin Dots Display */}
          <div className="flex gap-4 justify-center items-center h-10 mb-5">
            {[0, 1, 2, 3].map((index) => {
              const isActive = pin.length > index;
              return (
                <motion.div
                  key={index}
                  animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                  className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#FDB2B2] border-[#FDB2B2] shadow-[0_0_8px_rgba(253,178,178,0.6)]' 
                      : 'bg-[#15100E] border-[#B13818]/40'
                  }`}
                />
              );
            })}
          </div>

          {/* Subtle Warning Flag / Error Banner */}
          <div className="h-6 mb-5 w-full text-center">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/40 border border-red-900 rounded-full text-[10px] text-red-400 font-bold tracking-wider font-sans uppercase shadow-sm"
                >
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Keypad Buttons Grid (3x4) */}
          <div className="grid grid-cols-3 gap-3 w-full mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleKeyPress(digit)}
                className="h-14 rounded-2xl bg-[#15100E] hover:bg-[#B13818]/20 active:bg-[#B13818]/30 border border-[#B13818]/20 hover:border-[#D97C7A]/40 text-xl font-bold font-mono transition-all active:scale-95 text-[#FEF6F6] select-none"
              >
                {digit}
              </button>
            ))}

            {/* Clear button */}
            <button
              onClick={handleClear}
              className="h-14 rounded-2xl bg-[#15100E]/40 hover:bg-[#B13818]/10 active:bg-[#B13818]/20 border border-[#B13818]/10 text-xs font-bold font-sans tracking-wider uppercase transition-all text-[#675A58] hover:text-[#FEF6F6] select-none"
            >
              Clear
            </button>

            {/* Zero */}
            <button
              onClick={() => handleKeyPress('0')}
              className="h-14 rounded-2xl bg-[#15100E] hover:bg-[#B13818]/20 active:bg-[#B13818]/30 border border-[#B13818]/20 hover:border-[#D97C7A]/40 text-xl font-bold font-mono transition-all active:scale-95 text-[#FEF6F6] select-none"
            >
              0
            </button>

            {/* Backspace */}
            <button
              onClick={handleBackspace}
              className="h-14 rounded-2xl bg-[#15100E]/40 hover:bg-[#B13818]/10 active:bg-[#B13818]/20 border border-[#B13818]/10 flex items-center justify-center transition-all text-[#675A58] hover:text-[#FEF6F6] select-none"
              title="Delete last digit"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[10px] text-[#675A58] font-mono mt-2 tracking-wide">
            DEFAULT ACCESS CODE: <span className="text-[#FDB2B2] font-bold">0000</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
