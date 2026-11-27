/**
 * Apple Fluid Interfaces motion, gesture, and multimodal feedback utilities.
 * Translates WWDC spring curves, rubber-banding, momentum projection, and
 * synchronized audio-haptic feedback to the web platform.
 */

import sound from './audioFX';

// Critically damped default UI spring (damping ratio 1.0, response ~0.35s)
export const SPRING_DEFAULT = { type: 'spring', bounce: 0, duration: 0.35 };

// Slightly crisper spring for floating popovers, sheets, and segmented controls
export const SPRING_SHEET = { type: 'spring', bounce: 0.08, duration: 0.3 };

// Under-damped spring reserved for gesture release, flicks, and physical tiles
export const SPRING_MOMENTUM = { type: 'spring', bounce: 0.2, duration: 0.38 };

// Pointer-down instant tap press detent
export const TAP_DETENT = { scale: 0.97 };

/**
 * Progressive rubber-band resistance past a boundary (WWDC 2018 formula).
 */
export function rubberband(overshoot, dimension = 240, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/**
 * Exponential decay projection for gesture velocity at release (px/s).
 */
export function projectMomentum(initialVelocity, decelerationRate = 0.998) {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/**
 * Trigger subtle hardware vibration on supported devices synced with visual/audio frame.
 */
export function triggerHaptic(kind = 'tap') {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    if (kind === 'tap') navigator.vibrate(8);
    else if (kind === 'merge') navigator.vibrate(12);
    else if (kind === 'success') navigator.vibrate([12, 36, 18]);
    else if (kind === 'foul') navigator.vibrate([28, 30, 28]);
  } catch {
    // Ignore when blocked before user activation
  }
}

/**
 * Fire audio + haptic feedback in the exact same frame as the causal visual change.
 */
export function emitFeedback(kind = 'tap') {
  triggerHaptic(kind);
  if (kind === 'tap') sound.playClick();
  else if (kind === 'move') sound.playMove();
  else if (kind === 'merge') sound.playMerge();
  else if (kind === 'success') sound.playScore();
  else if (kind === 'foul') sound.playFoul();
}
