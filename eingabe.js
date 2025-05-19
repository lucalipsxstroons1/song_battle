const form = document.getElementById('song-form');
const inputsDiv = document.getElementById('inputs');

for (let i = 0; i < 16; i++) {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = `Song ${i + 1} (URL oder Titel)`;
  input.required = true;
  inputsDiv.appendChild(input);
}
