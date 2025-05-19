const submitBtn = document.getElementById("submit-btn");
const readyBtn = document.getElementById("ready-btn");

submitBtn.onclick = async () => {
  const song = document.getElementById("song-input").value.trim();
  if (!song) return alert("Bitte einen Spotify-Link eingeben.");

  const response = await fetch("http://localhost:8000/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ song })
  });

  const data = await response.json();
  localStorage.setItem("player_id", data.player_id);

  document.getElementById("submit-section").style.display = "none";
  document.getElementById("ready-section").style.display = "block";
};

readyBtn.onclick = async () => {
  const player_id = localStorage.getItem("player_id");
  if (!player_id) return alert("Kein Spieler-ID gefunden!");

  const response = await fetch("http://localhost:8000/ready", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id })
  });

  const data = await response.json();
  if (data.status === "start") {
    alert("🎮 Das Spiel beginnt!");
    console.log(data.songs); // z.B. speichern oder zur nächsten Seite navigieren
  } else {
    alert("Warte auf weitere Spieler...");
  }
};

setInterval(fetchStatus, 5000);

async function fetchStatus() {
  try {
    const res = await fetch("http://localhost:8000/status");
    const data = await res.json();

    document.getElementById("num-submitted").textContent = data.num_submitted;
    document.getElementById("num-ready").textContent = data.num_ready;
    document.getElementById("game-ready").textContent = data.game_ready ? "Ja" : "Nein";
  } catch (err) {
    console.error("Fehler beim Status abrufen:", err);
  }
}
