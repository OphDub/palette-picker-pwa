$('.generate-palette-btn').click(() => generateNewPalette());
$('.color-box-lock-btn').click((event) => lockColor(event));
$('.save-project-btn').click((event) => createProject(event));
$('.save-palette-btn').click((event) => savePalette(event));
$(document).on('click', '.project-palette-delete-btn', (event) => removePalette(event));
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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      }).catch(err => {
        console.log(`ServiceWorker registration failed: ${err}`);
      });
  });
};

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
  return (
    '#' + Math.random().toString(16).slice(-6)
  );
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
  deletePaletteFromDb(id);
};

const prependPalette = (projectId, palette) => {
  const { palette_name, id } = palette;
  const colorKeys = Object.keys(palette).filter(key => {
    if (key.includes('color')) {
      return key
    }
  });
  const paletteColors = colorKeys.map(color => {
    return (
      `<article class="project-palette-color"
        style="background-color: ${palette[color]}">
      </article>`
    );
  });
  const appendedPalette = $(
    `<article class="project-palette-colors" id=${id}>
      <span class="project-pal-name-span">
        <p class="project-palette-name">${palette_name}</p>
      </span>
      ${paletteColors.join('')}
      <button class="project-palette-delete-btn"></button>
    <article>`
  );

  $(`#${projectId}`).append(appendedPalette);
};

const clearPaletteNameInput = () => {
  $('.palette-name').val('');
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
  const palette = Object.assign({
    palette_name: paletteName,
    project_id: projectName,
    ...colorObj
  });
  const savedPalette = await postPaletteToDb(palette);

  prependPalette(projectName, savedPalette);
  clearPaletteNameInput();
};

const loadPalettes = async (projectId) => {
  const palettes = await getPalettesWithProjectId(projectId);

  if (palettes.length) {
    await palettes.forEach(palette => {
      prependPalette(projectId, palette);
    });
  }
};

const getPalettesWithProjectId = async (projectId) => {
  const url = `/api/v1/projects/${projectId}/palettes`;

  return await fetchAndParse(url);
};

const deletePaletteFromDb = async (paletteId) => {
  const url = `/api/v1/palettes/${paletteId}/`;
  const data = { palette_id: paletteId }

  await deleteFromDb(url, data);
};

const postPaletteToDb = async (palette) => {
  const url = '/api/v1/palettes';

  return await postAndParse(url, palette);
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

const validateProjectName = (projectName) => {
  const existingProjects = $('.project-name').toArray();

  const dupeName = Array.from(existingProjects).find(project => {
    return project.innerText.toUpperCase() === projectName.toUpperCase()
  });

  if(projectName === '') {
    const errorMsg = `<h3>Hey lettuce, your project needs a name</h3>`;

    $('.project-error').append(errorMsg);
    return true;
  } else if (dupeName) {
    const errorMsg = `<h3>Hey lettuce, project named "${dupeName.innerText}" already exists</h3>`

    $('.project-error').append(errorMsg);
    return true;
  }

  return false;
};

const createProject = async (event) => {
  event.preventDefault();
  $('.project-error').empty();
  const projectName = $(event.target).siblings().find('input').val();

  if(validateProjectName(projectName)) {
    return;
  }

  const project = Object.assign({ project_name: projectName });
  const savedProject = await postProjectToDb(project);

  prependProject(savedProject);

  const savedProjects = await getProjects();
  appendProjectsToDropdown(savedProjects);

  clearProjectInput();
};

const loadProjects = async () => {
  const projects = await getProjects();

  await projects.forEach(project => {
    prependProject(project);
    loadPalettes(project.id);
  });
};

const getProjects = async () => {
  const url = '/api/v1/projects';

  return await fetchAndParse(url);
};

const postProjectToDb = async (project) => {
  const url = '/api/v1/projects';

  return await postAndParse(url, project);
};

const appendProjectsToDropdown = async (projects) => {
  const selectValues = await projects;

  $('#project-dropdown').empty();

  selectValues.forEach((selection) => {
    const option = $(`<option>${selection.project_name}</option>`)
      .val(`${selection.id}`);

    $('#project-dropdown').append(option);
  });
};

const fetchAndParse = async (url) => {
  try {
    const intialFetch = await fetch(url);

    return await intialFetch.json();
  } catch (error) {
    console.log(error);
  }
};

const postAndParse = async (url, data) => {
  try {
    const initialFetch = await fetch(url, {
      body: JSON.stringify(data),
      cache: 'no-cache',
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    });

    return await initialFetch.json();
  } catch (error) {
    console.log(error);
  }
};

const deleteFromDb = async (url, data) => {
  try {
    await fetch(url, {
      body: JSON.stringify(data),
      cache: 'no-cache',
      headers: {
        'content-type': 'application/json'
      },
      method: 'DELETE'
    })
  } catch (error) {
    console.log(error);
  }
};
