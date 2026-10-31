import React, { createContext, useContext, useState, useEffect } from 'react';
import sound from '../utils/audioFX';

const SoundContext = createContext({
  isMuted: false,
  volume: 0.35,
  toggleMute: () => {},
  setVolume: () => {},
  sound,
});

export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(sound.muted);
  const [volume, setVolumeState] = useState(sound.volume);

  useEffect(() => {
    const unsubscribe = sound.subscribe(({ muted, volume: newVol }) => {
      setIsMuted(muted);
      setVolumeState(newVol);
    });

    const handleKeyDown = (e) => {
      // input check
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        sound.toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleMute = () => sound.toggleMute();
  const setVolume = (val) => sound.setVolume(val);

  return (
    <SoundContext.Provider value={{ isMuted, volume, toggleMute, setVolume, sound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
export default SoundContext;
