const submitBtn = document.getElementById("submit-btn");
const readyBtn = document.getElementById("ready-btn");

// Song einreichen
submitBtn.onclick = async () => {
  const song = document.getElementById("song-input").value.trim();
  if (!song) return alert("Bitte einen Spotify-Link eingeben.");

  try {
    const response = await fetch("http://localhost:8000/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ song })
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
};

// Als bereit markieren
readyBtn.onclick = async () => {
  const player_id = localStorage.getItem("player_id");
  if (!player_id) return alert("Kein Spieler-ID gefunden!");

  try {
    const response = await fetch(`http://localhost:8000/ready?id=${player_id}`);
    if (!response.ok) {
      const err = await response.json();
      return alert(`Fehler: ${err.detail}`);
    }

    const data = await response.json();
    if (data.status === "start") {
      alert("🎮 Das Spiel beginnt!");
      window.location.href = "battle/battle.html";
    } else {
      alert("Du bist bereit – warte auf andere Spieler...");
    }
  } catch (err) {
    alert("Fehler beim Ready-Melden");
    console.error(err);
  }
};

// Spielstatus regelmäßig abfragen
setInterval(fetchStatus, 3000);

async function fetchStatus() {
  try {
    const res = await fetch("http://localhost:8000/status");
    const data = await res.json();

    const statusText = data.status === 1 ? "Spiel läuft" : "Warten auf Start";
    document.getElementById("game-status").textContent = statusText;
  } catch (err) {
    console.error("Fehler beim Status abrufen:", err);
  }
}
