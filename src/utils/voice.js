export function speak(text, lang = "en-IN") {

  if (!("speechSynthesis" in window)) {
    console.warn("Speech not supported");
    return;
  }

  window.speechSynthesis.cancel();

  const msg = new SpeechSynthesisUtterance(text);

  msg.lang = lang;
  msg.rate = 0.95;
  msg.pitch = 1;

  window.speechSynthesis.speak(msg);
}
