import React, { useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useSound } from '../context/SoundContext';

/**
 * MobileDPad - On-Screen Cyber Touch Controller
 * Provides haptic vibration and responsive thumb controls for mobile gameplay.
 */
export default function MobileDPad({
  onUp,
  onDown,
  onLeft,
  onRight,
  disabled = false,
  className = '',
}) {
  const { sound } = useSound();

  const handleAction = useCallback(
    (actionFn, e) => {
      if (e && e.cancelable) {
        e.preventDefault();
      }
      if (disabled || typeof actionFn !== 'function') return;

      // Haptic Vibration feedback (short 15ms pulse)
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(15);
        } catch {
          // Vibration API might be restricted or unsupported on some browsers
        }
      }

      // Audio feedback
      if (sound && typeof sound.playMove === 'function') {
        sound.playMove();
      }

      actionFn();
    },
    [disabled, sound],
  );

  return (
    <div className={`arcade-dpad-container ${className}`} role="region" aria-label="Virtual Game Controller">
      <div className="arcade-dpad-grid">
        {/* Up Button */}
        <button
          type="button"
          className="dpad-btn dpad-up"
          onTouchStart={(e) => handleAction(onUp, e)}
          onClick={(e) => handleAction(onUp, e)}
          disabled={disabled}
          aria-label="Move Up"
        >
          <ArrowUp size={24} />
        </button>

        {/* Left Button */}
        <button
          type="button"
          className="dpad-btn dpad-left"
          onTouchStart={(e) => handleAction(onLeft, e)}
          onClick={(e) => handleAction(onLeft, e)}
          disabled={disabled}
          aria-label="Move Left"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Center Hub Indicator */}
        <div className="dpad-center-hub" aria-hidden="true">
          <div className="dpad-hub-core" />
        </div>

        {/* Right Button */}
        <button
          type="button"
          className="dpad-btn dpad-right"
          onTouchStart={(e) => handleAction(onRight, e)}
          onClick={(e) => handleAction(onRight, e)}
          disabled={disabled}
          aria-label="Move Right"
        >
          <ArrowRight size={24} />
        </button>

        {/* Down Button */}
        <button
          type="button"
          className="dpad-btn dpad-down"
          onTouchStart={(e) => handleAction(onDown, e)}
          onClick={(e) => handleAction(onDown, e)}
          disabled={disabled}
          aria-label="Move Down"
        >
          <ArrowDown size={24} />
        </button>
      </div>
    </div>
  );
}
