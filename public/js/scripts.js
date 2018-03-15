$('.generate-palette-btn').click(() => generateNewPalette());
$('.color-box-lock-btn').click((event) => lockColor(event));
$('.project-palette-delete-btn').click((event) => removePalette(event));
$('.save-project-btn').click((event) => createProject(event));
$('.save-palette-btn').click((event) => savePalette(event));
$(document).ready(() => {
  generateNewPalette();
  loadProjects();
});
$('#project-dropdown').ready( async () => {
  const projects = await getProjects();
  appendProjectsToDropdown(projects);
});

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

const generateNewPalette = () => {
  colorBoxes.getBoxes().forEach(box => {
    const randomHexColor = generateRandomHex();

    $(`#${box}`).css('background-color', randomHexColor)
    $(`#${box}-text`).text(randomHexColor.toUpperCase());
  });
};

const generateRandomHex = () => {
  return '#'+Math.random().toString(16).slice(-6)
};

const lockColor = (event) => {
  const { id }  = event.target.parentElement;

  $(event.target).toggleClass('lock-closed');

  if(colorBoxes.getBoxes().includes(id)) {
    colorBoxes.lock(id)
  } else {
    colorBoxes.unlock(id)
  }
};

const removePalette = (event) => {
  const { id } = event.target.parentElement;

  $(event.target.parentElement).remove();
};

const createProject = (event) => {
  event.preventDefault();
  const projectName = $(event.target).siblings().find('input').val();
  const project = Object.assign({ project_name: projectName });

  prependProject(project);
  //pass project to backend
  clearProjectInput();
};

const savePalette = (event) => {
  event.preventDefault();
  const paletteName = $('.palette-name').val();
  const projectName = $('#project-dropdown').val();
  const colorBoxes = $('.palette').children('article');
  const colors = Array.from(colorBoxes).map(box => box.innerText);
  const palette = Object.assign({ palette_name: paletteName, colors });

  if (paletteName === '') {
    console.log('Give your palette a name you lettuce');
    return;
  }

  prependPalette(projectName, palette);
  //pass palette to backend
  clearPaletteNameInput();
};

const prependPalette = (projectName, palette) => {
  palette.colors.forEach(color => {
    const colorBlock =
      `<article class="project-palette-color" style="background-color: ${color}">
      </article>`;
    const projectDiv = $(`${projectName}`);
    console.log(projectDiv);

    projectDiv.append(colorBlock);
  });
};

const prependProject = (project) => {
  const { project_name, id }  = project;
  const projectTemplate =
    `<article class="project" id=${id}>
      <h1 class="project-name">${project_name}</h1>
      <div class="project-palettes" id=${id}>
      </div>
    </article>`;

  $('.project-container').prepend(projectTemplate);
};

const clearProjectInput = () => {
  $('#project-name-input').val('');
};

const clearPaletteNameInput = () => {
  $('.palette-name').val('');
};

const loadProjects = async () => {
  const projects = await getProjects();

  await projects.forEach(project => prependProject(project));
};

const fetchAndParse = async (url) => {
  const intialFetch = await fetch(url);
  return await intialFetch.json();
};

const appendProjectsToDropdown = async (projects) => {
  const selectValues = await projects;

  selectValues.forEach((selection) => {
    const option = $(`<option>${selection.project_name}</option>`)
      .val(`${selection.id}`);

    $('#project-dropdown').append(option);
  });
};

const getProjects = async () => {
  const url = '/api/v1/projects';
  return await fetchAndParse(url);
};