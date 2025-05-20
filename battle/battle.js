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

function showWinner(song) {
  document.querySelector(".battle-container").style.display = "none";
  document.getElementById("round-label").style.display = "none";
  document.getElementById("winner-section").style.display = "block";
  document.getElementById("winner-iframe").src = song;
}

async function vote(index) {
  const chosen = allSongs[index + currentIndex]; // embed URL
  const trackId = extractTrackIdFromEmbed(chosen);
  const playerId = localStorage.getItem("player_id");

  if (!playerId) {
    alert("Spieler-ID fehlt!");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8000/vote?player_uuid=${playerId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ song: trackId })
    });

    if (!response.ok) {
      const err = await response.json();
      return alert(`Fehler beim Voten: ${err.detail}`);
    }

    console.log("Vote erfolgreich für:", trackId);

    // Feedback sichtbar machen
    disableVoting();
    document.querySelectorAll("button.glow-on-hover").forEach((btn, i) => {
      btn.textContent = i === index ? "✅ Deine Stimme" : "❌";
      btn.style.backgroundColor = i === index ? "#4CAF50" : "#ccc";
    });

    // Automatisch nach 2s nächste Runde starten
    setTimeout(() => {
      nextRound.push(chosen);
      currentIndex += 2;
      showNextBattle();
    }, 2000);

  } catch (err) {
    console.error("Vote-Fehler:", err);
    alert("Fehler beim Senden deiner Stimme.");
  }
}

function extractTrackIdFromEmbed(embedUrl) {
  const parts = embedUrl.split("/track/");
  if (parts.length < 2) return null;
  return parts[1].split("?")[0];
}

