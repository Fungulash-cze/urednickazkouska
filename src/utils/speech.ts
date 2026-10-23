/**
 * Text-to-speech helper for Czech language studying
 */

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function speakCzech(text: string, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  // Cancel any current ongoing speech
  stopCzechSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'cs-CZ';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Try to find a Czech voice if available
  const voices = window.speechSynthesis.getVoices();
  const czechVoice = voices.find(v => v.lang.startsWith('cs') || v.lang.includes('CZ'));
  if (czechVoice) {
    utterance.voice = czechVoice;
  }

  utterance.onend = () => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopCzechSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function isSpeechSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
