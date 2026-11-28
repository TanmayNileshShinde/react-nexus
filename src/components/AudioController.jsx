import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, SlidersHorizontal } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { SPRING_SHEET, emitFeedback } from '../utils/fluidMotion';

export default function AudioController() {
  const { isMuted, toggleMute, volume, setVolume } = useSound();
  const [showSlider, setShowSlider] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSlider(false);
      }
    };
    window.addEventListener('pointerdown', handleOutside);
    return () => window.removeEventListener('pointerdown', handleOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="arcade-audio-controller"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button
        type="button"
        className={`arcade-audio-btn ${isMuted ? 'muted' : ''}`}
        onClick={() => {
          toggleMute();
          emitFeedback('tap');
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowSlider((s) => !s);
        }}
        title={isMuted ? 'Unmute Sound (Press M)' : 'Mute Sound (Press M)'}
        aria-label="Toggle Sound Effects"
      >
        {isMuted ? (
          <VolumeX size={15} strokeWidth={1.75} color="#f87171" />
        ) : (
          <Volume2 size={15} strokeWidth={1.75} color="#38bdf8" />
        )}
        <span>{isMuted ? 'Muted' : 'Sound'}</span>
        <kbd className="audio-key-hint">M</kbd>
      </button>

      <button
        type="button"
        className="arcade-audio-btn"
        style={{ padding: '0 8px', marginLeft: '4px' }}
        onClick={(e) => {
          e.stopPropagation();
          setShowSlider((s) => !s);
        }}
        title="Adjust Sound Volume"
        aria-label="Adjust Sound Volume"
      >
        <SlidersHorizontal size={13} strokeWidth={1.75} />
      </button>

      <AnimatePresence>
        {showSlider && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={SPRING_SHEET}
            className="arcade-volume-popover"
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="arcade-volume-slider"
              aria-label="Master Sound Volume"
            />
            <span className="arcade-volume-percent">
              {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
