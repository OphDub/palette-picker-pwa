$(document).ready(generateNewPalette());
$(".generate-palette-btn").click(generateNewPalette);

function generateNewPalette () {
  for (let i = 1; i < 6; i++) {
    const randomHexColor = generateRandomHex();

    $(`#color-${i}`).css('background-color', randomHexColor)
    $(`#color-${i}`).text(randomHexColor.toUpperCase());
  }
};

function generateRandomHex () {
  return '#'+Math.random().toString(16).slice(-6)
};

