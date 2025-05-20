// Konstanten für den Timer
const NEXT_PAGE = 'battle.html'; // Weiterleitung zur battle.html

// Timer-Funktionalität
function startCountdown() {
  let seconds = 3; // Start bei 3
  const timerElement = document.getElementById('timer');
  
  // Initial anzeigen
  timerElement.textContent = seconds;
  
  // Interval für den Countdown
  const countdownInterval = setInterval(function() {
    // Sekunden reduzieren
    seconds--;
    
    // Anzeige aktualisieren
    if (seconds > 0) {
      timerElement.innerHTML = seconds;
    } else if (seconds === 0) { // Genau bei 0
      // "GO" anzeigen
      timerElement.textContent = "GO";
      timerElement.classList.add('go');
    } else { // Bei -1 (nach GO)
      // Interval stoppen
      clearInterval(countdownInterval);
      
      // Zur Battle-Seite weiterleiten
      window.location.href = NEXT_PAGE;
    }
  }, 1000);
}

// Starte den Countdown, sobald das Dokument geladen ist
document.addEventListener('DOMContentLoaded', startCountdown);