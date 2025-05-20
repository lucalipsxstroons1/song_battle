const submitBtn = document.getElementById("submit-btn");
const readyBtn = document.getElementById("ready-btn");

// 🆕 Funktion: Track-ID aus Spotify-URL extrahieren
function extractSpotifyTrackId(url) {
  const match = url.match(/track\/([a-zA-Z0-9]+)(\?|$)/);
  if (!match) {
    throw new Error("Ungültiger Spotify-Link");
  }
  return match[1];
}

// Song einreichen
submitBtn.onclick = async () => {
  const input = document.getElementById("song-input").value.trim();
  if (!input) return alert("Bitte einen Spotify-Link eingeben.");

  let trackId;
  try {
    trackId = extractSpotifyTrackId(input);
  } catch (e) {
    return alert("❌ Ungültiger Spotify-Track-Link.");
  }

  try {
    const response = await fetch(`http://${window.location.hostname}:8000/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ song: trackId }) // ⬅️ Nur die Track-ID senden
    });

    if (!response.ok) {
      const err = await response.json();
      return alert(`Fehler: ${err.detail}`);
    }

    const data = await response.json();
    localStorage.setItem("player_id", data.player_id);

    document.getElementById("submit-section").style.display = "none";
    document.getElementById("ready-section").style.display = "block";
  } catch (err) {
    alert("Fehler beim Einreichen des Songs");
    console.error(err);
  }
  updateLobbyStatus();
};

// Als bereit markieren
readyBtn.onclick = async () => {
  const player_id = localStorage.getItem("player_id");
  if (!player_id) return alert("❗ Kein Spieler-ID gefunden!");

  try {
    const response = await fetch(`http://${window.location.hostname}:8000/ready?id=${player_id}`);
    const data = await response.json();

    if (!response.ok) {
      return alert(`Fehler: ${data.detail}`);
    }

    if (data.status === "start") {
      alert("🎮 Das Spiel beginnt!");
      window.location.href = "/battle/countdown.html";
    } else {
      alert("✅ Du bist bereit – warte auf andere Spieler...");
      startPollingForStart();
    }
  } catch (err) {
    alert("⚠️ Fehler beim Ready-Melden");
    console.error(err);
  }
  updateLobbyStatus();
};

async function updateLobbyStatus() {
  try {
    const res = await fetch(`http://${window.location.hostname}:8000/lobby-status`);
    if (!res.ok) return;

    const data = await res.json();

    document.getElementById("num-submitted").textContent = data.submitted;
    document.getElementById("num-ready").textContent = data.ready;
    document.getElementById("game-ready").textContent = data.game_ready ? "Ja" : "Nein";
  } catch (err) {
    console.error("Fehler beim Abrufen des Lobby-Status:", err);
  }
}


function startPollingForStart() {
  const intervalId = setInterval(async () => {
    try {
      const response = await fetch(`http://${window.location.hostname}:8000/status`);
      const data = await response.json();

      if (data.status === 1) {
        clearInterval(intervalId); // Stop polling
        alert("🎮 Das Spiel beginnt!");
        window.location.href = "/battle/countdown.html";
      }
    } catch (err) {
      console.error("Polling-Fehler:", err);
    }
  }, 2000); // Alle 2 Sekunden prüfen
}

async function fetchStatus() {
  try {
    const res = await fetch(`http://${window.location.hostname}:8000/status`);
    const data = await res.json();

    const statusText = data.status === 1 ? "Spiel läuft" : "Warten auf Start";
    document.getElementById("game-status").textContent = statusText;
  } catch (err) {
    console.error("Fehler beim Status abrufen:", err);
  }
}
