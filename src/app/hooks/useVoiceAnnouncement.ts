export const useVoiceAnnouncement = () => {
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    // Cancel any current speech
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;
    // Pick a clearer voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google'))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  };

  const announceTicket = (ticketNumber: string, counterName: string) => {
    // Spell out letter + digits for clarity, e.g. "A 0 0 1"
    const spelled = ticketNumber
      .replace(/⚡/g, 'Priority ')
      .split('')
      .join(' ');
    speak(`Now calling number ${spelled}. Please proceed to ${counterName}.`);
  };

  return { speak, announceTicket };
};
