// audio.js — synthesized WebAudio sounds. No audio files, nothing fetched.
const AudioFX = (function () {
  let ctx = null;
  let enabled = true;

  function ensure() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
      } catch (e) {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, delay) {
    const c = ensure();
    if (!c || !enabled) return;
    const t0 = c.currentTime + (delay || 0);
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  const patterns = {
    start: function () { tone(523, 0.12, 'triangle', 0.1); tone(784, 0.18, 'triangle', 0.1, 0.08); },
    click: function () { tone(660, 0.08, 'triangle', 0.08); },
    play: function () { tone(392, 0.12, 'triangle', 0.12); tone(523, 0.14, 'triangle', 0.1, 0.07); },
    win: function () { tone(523, 0.14, 'triangle', 0.12); tone(659, 0.14, 'triangle', 0.12, 0.09); tone(784, 0.22, 'triangle', 0.14, 0.18); },
    lose: function () { tone(392, 0.2, 'sawtooth', 0.06); tone(311, 0.26, 'sawtooth', 0.06, 0.14); },
    tie: function () { tone(440, 0.12, 'sine', 0.1); },
    combo: function () { tone(880, 0.1, 'triangle', 0.1); tone(1174, 0.16, 'triangle', 0.1, 0.06); },
  };

  return {
    play: function (name) { try { if (patterns[name]) patterns[name](); } catch (e) { /* silent */ } },
    toggle: function () { enabled = !enabled; return enabled; },
    isEnabled: function () { return enabled; },
  };
})();
