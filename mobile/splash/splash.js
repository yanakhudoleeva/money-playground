(() => {
  const launch = document.getElementById('mp-launch');
  if (!launch) return;
  const dismiss = () => launch.remove();
  launch.addEventListener('animationend', event => {
    if (event.target === launch) dismiss();
  });
  // Fail open even if animations are disabled by the host.
  setTimeout(dismiss, 2300);
})();
