$('.generate-palette-btn').click(() => generateNewPalette());
$('.color-box-lock-btn').click((event) => lockColor(event));
$('.project-palette-delete-btn').click((event) => removePalette(event));
$('.save-project-btn').click((event) => createProject(event));
$('.save-palette-btn').click((event) => savePalette(event));
$(document).ready(() => {
  generateNewPalette();
  loadProjects();
});
$('#project-dropdown').ready(async () => {
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

const createProject = async (event) => {
  event.preventDefault();
  const projectName = $(event.target).siblings().find('input').val();
  const project = Object.assign({ project_name: projectName });
  const savedProject = await postProjectToDb(project);

  prependProject(savedProject);
  clearProjectInput();
};

const postProjectToDb = async (project) => {
  const url = '/api/v1/projects';

  return await postAndParse(url, project);
};

const savePalette = async (event) => {
  event.preventDefault();
  const paletteName = $('.palette-name').val();
  const projectName = $('#project-dropdown').val();
  const colorBoxes = $('.palette').children('article');

  if (paletteName === '') {
    console.log('Give your palette a name you lettuce');
    return;
  }

  const colors = Array.from(colorBoxes).map(box => box.innerText);
  const colorObj = colors.reduce((colorObj, color, index) => {
    colorObj[`color${index+1}`] = color;

    return colorObj;
  }, {});
  const palette = Object.assign({ palette_name: paletteName, project_id: projectName ,...colorObj });
  const savedPalette = await postPaletteToDb(palette);

  prependPalette(projectName, savedPalette);
  clearPaletteNameInput();
};

const postPaletteToDb = async (palette) => {
  const url = '/api/v1/palettes';

  return await postAndParse(url, palette);
};

const prependPalette = (projectId, palette) => {
  const {
    palette_name,
    color1,
    color2,
    color3,
    color4,
    color5
  } = palette;
  const projectPalettes = $(`#${projectId}`);
  const appendedPaletteName = $(`<span><p class="project-palette-name">${palette_name}</p></span>`);
  const appendedPalette = $(`<span class="project-palette-colors"><span>`);
  const appendedPalDeleteBtn = $(`<button class="project-palette-delete-btn"></button>`);

  //change this to Object.keys to accomodate flat structure of paletteObj
  // const paletteColors = colors.map(color => {
  //   return (
  //     `<article class="project-palette-color"
  //       style="background-color: ${color1}">
  //     </article>`
  //   )
  // });

  const paletteColors = `
    <article class="project-palette-color" style="background-color: ${color1}"></article>
    <article class="project-palette-color" style="background-color: ${color2}"></article>
    <article class="project-palette-color" style="background-color: ${color3}"></article>
    <article class="project-palette-color" style="background-color: ${color4}"></article>
    <article class="project-palette-color" style="background-color: ${color5}"></article>`

  appendedPalette.append(appendedPaletteName, paletteColors, appendedPalDeleteBtn);
  projectPalettes.append(appendedPalette);
};

const prependProject = (project) => {
  const { project_name, id }  = project;
  const projectTemplate =
    `<article class="project">
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

  await projects.forEach(project => {
    prependProject(project);
    loadPalettes(project.id);
  });
};

const loadPalettes = async (projectId) => {
  const palettes = await getPalettesWithProjectId(projectId);

  await palettes.forEach(palette => {
    prependPalette(projectId, palette);
  });
};

const fetchAndParse = async (url) => {
  const intialFetch = await fetch(url);

  return await intialFetch.json();
};

const postAndParse = async (url, data) => {
  const initialFetch = await fetch(url, {
    body: JSON.stringify(data),
    cache: 'no-cache',
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST'
  });

  return await initialFetch.json();
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

const getPalettesWithProjectId = async (projectId) => {
  const url = `/api/v1/projects/${projectId}/palettes`;

  return await fetchAndParse(url);
};