const form = document.getElementById('song-form');
const inputsDiv = document.getElementById('inputs');

for (let i = 0; i < 16; i++) {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = `Song ${i + 1} (YouTube-Link)`;
  input.required = true;
  inputsDiv.appendChild(input);
}

let allSongs = [];
let currentPairs = [];
let nextRound = [];
let round = 1;
let currentIndex = 0;

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const inputs = document.querySelectorAll('#inputs input');
  allSongs = Array.from(inputs)
    .map((i) => convertYouTubeLink(i.value))
    .filter(Boolean);

  if (allSongs.length !== 16) {
    alert("Bitte 16 gültige YouTube-Links eingeben.");
    return;
  }

  allSongs = shuffle(allSongs);
  startBattle();
});

function convertYouTubeLink(url) {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function startBattle() {
  form.style.display = 'none';
  document.getElementById('battle').style.display = 'block';
  currentPairs = allSongs;
  round = 1;
  currentIndex = 0;
  nextRound = [];
  document.getElementById('round-number').textContent = round;
  showNextBattle();
}

function showNextBattle() {
  if (currentIndex >= currentPairs.length) {
    if (nextRound.length === 1) {
      document.querySelector('#battle').innerHTML = `
        <h2>🏆 Der Gewinner ist:</h2>
        <iframe width="560" height="315" src="${nextRound[0]}" frameborder="0" allowfullscreen></iframe>
      `;
      return;
    }
    currentPairs = nextRound;
    nextRound = [];
    currentIndex = 0;
    round++;
    document.getElementById('round-number').textContent = round;
  }

  const song1 = currentPairs[currentIndex];
  const song2 = currentPairs[currentIndex + 1];

  document.querySelector('#song1 iframe').src = song1;
  document.querySelector('#song2 iframe').src = song2;

  document.querySelectorAll('.vote').forEach((btn, idx) => {
    btn.onclick = () => {
      nextRound.push(idx === 0 ? song1 : song2);
      currentIndex += 2;
      showNextBattle();
    };
  });
}
