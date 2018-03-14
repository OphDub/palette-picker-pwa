$(document).ready(generateNewPalette);
$('.generate-palette-btn').click(generateNewPalette);
$('.color-box-lock-btn').click(lockColor);
$('.project-palette-delete-btn').click(removePalette);
$('.save-project-btn').click(createProject);
$('.save-palette-btn').click(savePalette);

$(document).keydown((event) => {
  if (event.keyCode === 32 && document.activeElement.tagName !== "INPUT") {
    event.preventDefault();
    generateNewPalette();
  }
});

const colorBoxes = (() => {
  let boxes = [
    'color-1',
    'color-2',
    'color-3',
    'color-4',
    'color-5',
  ];

  return {
    getBoxes: () => {
      return boxes;
    },
    lock: (id) => {
      boxes = boxes.filter(lock => lock !== id);
    },
    unlock: (id) => {
      boxes = [...boxes, id];
    }
  }
})();

function generateNewPalette () {
  colorBoxes.getBoxes().forEach(box => {
    const randomHexColor = generateRandomHex();

    $(`#${box}`).css('background-color', randomHexColor)
    $(`#${box}-text`).text(randomHexColor.toUpperCase());
  });
};

function generateRandomHex () {
  return '#'+Math.random().toString(16).slice(-6)
};

function lockColor (event) {
  const { id }  = event.target.parentElement;

  $(event.target).toggleClass('lock-closed');

  if(colorBoxes.getBoxes().includes(id)) {
    colorBoxes.lock(id)
  } else {
    colorBoxes.unlock(id)
  }
};

function removePalette (event) {
  const { id } = event.target.parentElement;

  $(event.target.parentElement).remove();
};

function createProject (event) {
  event.preventDefault();
  const projectName = $(event.target).siblings().find('input').val();
  const project = Object.assign({ project_name: projectName });

  //pass project to backend
};

function savePalette (event) {
  event.preventDefault();
  const colorBoxes = $('.palette').children('article');
  const hexCodes = Array.from(colorBoxes).map(box => box.innerText);
  const palette = Object.assign({ palette: [{hexCodes}]});

  //pass palette to backend
}

