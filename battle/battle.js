let allSongs = []; // enthält alle Spotify-Embed-Links
let round = 1;
let currentIndex = 0;
let nextRound = [];

window.onload = async () => {
  // Hol dir Songs vom Server oder aus localStorage
  const response = await fetch("http://localhost:8000/getcur");
  const songIds = await response.json();

  // Umwandeln in embed-Links
  allSongs = songIds.map(id => `https://open.spotify.com/embed/track/${id}`);

  // Mischen
  allSongs = shuffle(allSongs);

  showNextBattle();
};

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
