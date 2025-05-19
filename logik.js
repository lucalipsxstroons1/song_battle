let allSongs = [];
let currentPairs = [];
let nextRound = [];
let round = 1;
let currentIndex = 0;

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const inputs = document.querySelectorAll('#inputs input');
  allSongs = Array.from(inputs).map(i => i.value);
  allSongs = shuffle(allSongs);
  startBattle();
});

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
      alert("Der Gewinner ist: " + nextRound[0]);
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
  document.querySelector('#song1 audio').src = song1;
  document.querySelector('#song2 audio').src = song2;

  document.querySelectorAll('.vote').forEach((btn, idx) => {
    btn.onclick = () => {
      nextRound.push(idx === 0 ? song1 : song2);
      currentIndex += 2;
      showNextBattle();
    };
  });
}
