const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.set('port', process.env.PORT || 3000);
app.locals.title = "Palette Picker";

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/api/v1/projects', (request, response) => {
  database('projects').select()
    .then((projects) => {
      response.status(200).json(projects);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

app.post('/api/v1/projects', (request, response) => {
  const projectInfo = request.body;

  for (let requiredParameter of ['project_name']) {
    if(!projectInfo[requiredParameter]) {
      return response.status(422).send({
        error: `Expected format: { project_name: <String> }. You are missing a "${requiredParameter}" property.`
      });
    }
  }

  database('projects').insert(projectInfo, 'id')
    .then(project => {
      const { project_name } = projectInfo;
      response.status(201).json({ id: project[0], project_name });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/projects/:id/', (request, response) => {
  database('projects').where('id', request.params.id).select()
    .then((projects) => {
      if(projects.length) {
        response.status(200).json(projects);
      } else {
        response.status(404).json({
          error: `Could not find project with id ${request.params.id}`
        });
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/palettes', (request, response) => {
  database('palettes').select()
    .then((palettes) => {
      response.status(200).json(palettes);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

app.post('/api/v1/palettes', (request, response) => {
  const paletteInfo = request.body;
  const paletteParams = ['palette_name', 'color1', 'color2', 'color3', 'color4', 'color5'];

  for(let requiredParameter of paletteParams) {
    if(!paletteInfo[requiredParameter]) {
      return response.status(422).send({
        error: `Expected format: { palette_name: <String>, color1: <String>, color2: <String>, color3: <String>, color4: <String>, color5: <String>}. You are missing a "${requiredParameter}" property.`
      });
    }
  }

  database('palettes').insert(paletteInfo, 'id')
    .then(palette => {
      const {
        palette_name,
        color1,
        color2,
        color3,
        color4,
        color5
      } = paletteInfo;
      response.status(201).json({
        id: palette[0],
        palette_name,
        color1,
        color2,
        color3,
        color4,
        color5
      });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.delete('/api/v1/palettes/:id/', (request, response) => {
  const palette = request.body;

  for(let requiredParameter of ['palette_id']) {
    if(!palette[requiredParameter]) {
      return response.status(422).send({
        error: `Expected format: { palette_id: <Number> }. You are missing a "${requiredParameter}" property.`
      });
    }
  }

  database('palettes').where('id', request.params.id).del()
    .then(palette => {
      response.status(204);
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/projects/:id/palettes', (request, response) => {
  database('palettes').where('project_id', request.params.id).select()
    .then((palettes) => {
      if(palettes.length) {
        response.status(200).json(palettes);
      } else {
        response.status(404).json({
          error: `Could not find palette with id ${request.params.id}`
        });
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} running on PORT ${app.get('port')}.`);
});

module.exports = app;