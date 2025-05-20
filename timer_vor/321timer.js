const TIMER_KEY = 'round_timer_start';
const COUNTDOWN_DURATION = 3 * 1000; // 3 Sekunden
const GO_DISPLAY_DURATION = 1 * 1000; // 1 Sekunde GO
const NEXT_PAGE = 'sequenzB.html'; // <-- Hier URL der nächsten Seite rein

function getStartTime() {
  return localStorage.getItem(TIMER_KEY);
}

function setStartTime() {
  const now = Date.now();
  localStorage.setItem(TIMER_KEY, now);
  return now;
}

function updateTimer() {
  const startTime = getStartTime();
  if (!startTime) {
    setStartTime();
    return;
  }

  const now = Date.now();
  const elapsed = now - parseInt(startTime, 10);

  if (elapsed < COUNTDOWN_DURATION) {
    const remaining = 3 - Math.floor(elapsed / 1000);
    document.getElementById('timer').textContent = remaining;
  } else if (elapsed < COUNTDOWN_DURATION + GO_DISPLAY_DURATION) {
    document.getElementById('timer').textContent = 'GO';
  } else {
    // Timer fertig → weiterleiten
    window.location.href = NEXT_PAGE;
  }
}

let timerInterval;
window.addEventListener('load', () => {
  if (!getStartTime()) {
    setStartTime();
  }
  timerInterval = setInterval(updateTimer, 200);
  updateTimer();
});

// Sync zwischen Tabs
window.addEventListener('storage', (e) => {
  if (e.key === TIMER_KEY) {
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 200);
    updateTimer();
  }
});