import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../context/SoundContext';

export default function AudioController() {
  const { isMuted, toggleMute, volume, setVolume } = useSound();
  const [showSlider, setShowSlider] = useState(false);

  return (
    <div
      className="arcade-audio-controller"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
      title={isMuted ? 'Unmute Sound (Press M)' : 'Mute Sound (Press M)'}
    >
      <button
        type="button"
        className={`arcade-audio-btn ${isMuted ? 'muted' : 'active'}`}
        onClick={toggleMute}
        aria-label="Toggle Sound Effects"
      >
        {isMuted ? <VolumeX size={15} color="#ff4757" /> : <Volume2 size={15} color="#00f3ff" />}
        <span className="audio-label">{isMuted ? 'Muted' : 'SFX'}</span>
        <kbd className="audio-key-hint">M</kbd>
      </button>

      {showSlider && (
        <div className="arcade-volume-popover">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="arcade-volume-slider"
            aria-label="Master SFX Volume"
          />
          <span className="arcade-volume-percent">
            {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
          </span>
        </div>
      )}
    </div>
  );
}
