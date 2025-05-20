let ws;
let playerId = localStorage.getItem("player_id");

window.onload = async () => {
  await connectWebSocket(); // ← auf Fertigstellung warten
  await loadNextBattle();   // ← erst danach starten
};

function connectWebSocket() {
  return new Promise((resolve) => {
    ws = new WebSocket(`ws://${window.location.hostname}:8000/ws/timer`);

    ws.onopen = () => {
      console.log("WebSocket verbunden");
      resolve(); // ← Promise erfüllen
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.timer !== undefined) {
        updateTimerDisplay(data.timer);
        updateVote(data.votes, data.total_players)

        if (data.timer === 0) {
          disableVoting();
          document.getElementById("timer").textContent = "🛑 Zeit abgelaufen!";
          setTimeout(() => loadNextBattle(), 1500);
        }
      }

    };

    ws.onclose = () => {
      console.warn("WebSocket getrennt – reconnect in 2s");
      setTimeout(connectWebSocket, 2000);
    };
  });
}


function updateTimerDisplay(seconds) {
  const el = document.getElementById("timer");
  el.textContent = `⏳ ${seconds}s`;
}

updateVoteProgress()

async function updateVoteProgress() {
  try {
    const res = await fetch(`http://${window.location.hostname}:8000/votes`);
    if (!res.ok) return;

    const data = await res.json();
    const totalVotes = Object.values(data.votes).reduce((a, b) => a + b, 0);
    const totalPlayers = data.total;

    updateVote(totalVotes, totalPlayers);
  } catch (err) {
    console.error("Fehler beim Abrufen der Stimmen:", err);
  }
}

function updateVote(votes, totalPlayers) {
    const percent = (votes / totalPlayers) * 100;

    document.getElementById("vote-status-text").textContent =
      `🗳 ${votes} von ${totalPlayers} Stimmen`;

    document.getElementById("vote-bar").style.width = `${percent}%`;
}

function disableVoting() {
  document.querySelectorAll("button.glow-on-hover").forEach(btn => {
    btn.disabled = true;
  });
}

function enableVoting() {
  document.querySelectorAll("button.glow-on-hover").forEach(btn => {
    btn.disabled = false;
    btn.textContent = "Vote for this Song!";
    btn.style.backgroundColor = "";
  });
}

async function loadNextBattle() {
  try {
    const response = await fetch(`http://${window.location.hostname}:8000/getcur`);
    if (!response.ok) throw new Error("Keine Songs verfügbar");

    const [song1, song2] = await response.json();
    document.getElementById("iframe1").src = `https://open.spotify.com/embed/track/${song1}`;
    document.getElementById("iframe2").src = `https://open.spotify.com/embed/track/${song2}`;

    enableVoting();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send("start");
      console.log("🛰️ start gesendet");
    } else {
      console.warn("❗ WebSocket nicht bereit!");
    }     
  } catch (err) {
    console.warn("Turnier vorbei oder Fehler:", err);
    const winnerRes = await fetch(`http://${window.location.hostname}:8000/winner`);
    if (winnerRes.ok) {
      const data = await winnerRes.json();
      showWinner(`https://open.spotify.com/embed/track/${data}`);
    } else {
      alert("Das Spiel ist vorbei oder kein Gewinner vorhanden.");
    }
  }
}

// 🟢 Jetzt: Progress anzeigen NACH erfolgreichem Vote
// setInterval(updateVoteProgress, 500); // Optional leichter Delay

async function vote(index) {
  const iframe1 = document.getElementById("iframe1").src;
  const iframe2 = document.getElementById("iframe2").src;

  const trackId1 = extractTrackIdFromEmbed(iframe1);
  const trackId2 = extractTrackIdFromEmbed(iframe2);
  const trackId = index === 0 ? trackId1 : trackId2;

  if (!playerId) {
    alert("Deine Spieler-ID fehlt.");
    return;
  }

  try {
    const res = await fetch(`http://${window.location.hostname}:8000/vote?player_uuid=${playerId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ song: trackId }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(`Fehler beim Voten: ${err.detail}`);
      return;
    }

    console.log("Vote erfolgreich:", trackId);
    disableVoting();

    document.querySelectorAll("button.glow-on-hover").forEach((btn, i) => {
      btn.textContent = i === index ? "✅ Deine Stimme" : "❌";
      btn.style.backgroundColor = i === index ? "#4CAF50" : "#ccc";
    });


  } catch (err) {
    console.error("Fehler beim Voten:", err);
    alert("Netzwerkfehler beim Voten.");
  }
}


function extractTrackIdFromEmbed(embedUrl) {
  const parts = embedUrl.split("/track/");
  return parts[1]?.split("?")[0];
}

function showWinner(embedUrl) {
  document.querySelector(".battle-container").style.display = "none";
  document.getElementById("round-label").style.display = "none";
  document.getElementById("winner-section").style.display = "block";
  document.getElementById("winner-iframe").src = embedUrl;
}

function goToStart() {
  window.location.href = "/../index.html";
}

function restartGame() {
  // Spieler-ID beibehalten, aber Spielstatus zurücksetzen
  fetch(`http://${window.location.hostname}:8000/reset`, {
    method: "POST"
  }).then(res => {
    if (res.ok) {
      alert("🔁 Spiel wurde zurückgesetzt.");
      window.location.href = "/battle/battle.html";
    } else {
      alert("⚠️ Fehler beim Zurücksetzen des Spiels.");
    }
  }).catch(err => {
    console.error("Fehler beim Reset:", err);
    alert("⚠️ Netzwerkfehler beim Zurücksetzen.");
  });
}
