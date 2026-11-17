(() => {
  const initial = document.getElementById('mp-launch');
  if (!initial) return;
  const template = initial.cloneNode(true);
  let current = initial;
  let fallback;
  function play(launch) {
    clearTimeout(fallback);
    current = launch;
    const dismiss = () => {
      if (current !== launch) return;
      clearTimeout(fallback);
      launch.remove();
      current = null;
    };
    launch.addEventListener('animationend', event => {
      if (event.target === launch) dismiss();
    });
    // Fail open even if animations are disabled by the host.
    fallback = setTimeout(dismiss, 2300);
  }
  play(initial);
  // Sent only after a real background/foreground transition, not interruptions.
  window.addEventListener('money-playground-foreground', () => {
    current?.remove();
    const launch = template.cloneNode(true);
    document.body.appendChild(launch);
    play(launch);
  });
})();
