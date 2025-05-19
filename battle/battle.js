let allSongs = []; // enthält alle Spotify-Embed-Links
let round = 1;
let currentIndex = 0;
let nextRound = [];
let timerInterval;

window.onload = async () => {
  try {
    const response = await fetch("http://localhost:8000/getcur");
    if (!response.ok) throw new Error("Songs konnten nicht geladen werden.");

    const songIds = await response.json(); // ["f759060d84744845", "2765818cf77b4312"]
    console.log("Erhaltene IDs:", songIds);

    // IDs direkt in Embed-URLs einfügen
    allSongs = songIds.map(id => `https://open.spotify.com/embed/track/${id}`);

    document.getElementById("battle-container").style.display = "block";
    showNextBattle(); // Songs anzeigen und Countdown starten
  } catch (err) {
    alert("Fehler beim Laden der Songs!");
    console.error(err);
  }
};


function startTimer(duration, displayEl) {
  clearInterval(timerInterval); // Vorherigen Timer stoppen

  let time = duration;
  displayEl.textContent = `⏳ ${time}s`;

  timerInterval = setInterval(() => {
    time--;
    displayEl.textContent = `⏳ ${time}s`;

    if (time <= 0) {
      clearInterval(timerInterval);
      displayEl.textContent = "🛑 Zeit abgelaufen!";
      disableVoting();
    }
  }, 1000);
}

function disableVoting() {
  const buttons = document.querySelectorAll("button.glow-on-hover");
  buttons.forEach(btn => btn.disabled = true);
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function showNextBattle() {
  document.getElementById("round-label").textContent = `Runde ${round}`;

  if (currentIndex >= allSongs.length) {
    if (nextRound.length === 1) {
      showWinner(nextRound[0]);
      return;
    }
    allSongs = nextRound;
    nextRound = [];
    currentIndex = 0;
    round++;
    showNextBattle();
    return;
  }

  const song1 = allSongs[currentIndex];
  const song2 = allSongs[currentIndex + 1];

  document.getElementById("iframe1").src = song1;
  document.getElementById("iframe2").src = song2;

  enableVoting(); // Neue Runde → Buttons wieder aktivieren
  startTimer(60, document.getElementById("timer")); // Countdown starten
}

function enableVoting() {
  const buttons = document.querySelectorAll("button.glow-on-hover");
  buttons.forEach(btn => btn.disabled = false);
}

function vote(index) {
  const chosen = index === 0 ? allSongs[currentIndex] : allSongs[currentIndex + 1];
  nextRound.push(chosen);
  currentIndex += 2;
  showNextBattle();
}

function showWinner(song) {
  document.querySelector(".battle-container").style.display = "none";
  document.getElementById("round-label").style.display = "none";
  document.getElementById("winner-section").style.display = "block";
  document.getElementById("winner-iframe").src = song;
}
