const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.set('port', process.env.PORT || 3000);
app.locals.title = "Palette Picker";
app.locals.projects = [
  {
    "name": "Project 1",
    "id": "1",
  },
  {
    "name": "Project 2",
    "id": "2",
  },
];
app.locals.palettes = [
  {
    "id": "1",
    "name": "Palette 1",
    "project-key": "1",
    "color1": "#81946A",
    "color2": "#F8CE9D",
    "color3": "#7AC2E3",
    "color4": "#43ADC4",
    "color5": "#6E498B"
  },
  {
    "id": "1",
    "name": "Not Fun",
    "project-key": "1",
    "color1": "#68DE43",
    "color2": "#78177A",
    "color3": "#AC7CD6",
    "color4": "#7871AB",
    "color5": "#B9DF4C"
  },
  {
    "id": "1",
    "name": "Cool Colors",
    "project-key": "2",
    "color1": "#148ACC",
    "color2": "#42D1F1",
    "color3": "#9F39CD",
    "color4": "#4DFAFC",
    "color5": "#1CC9F2"
  },
];

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (request, response) => {
});

app.get('/api/v1/projects', (request, response) => {
  database('projects').select()
    .then((projects) => {
      response.status(200).json(projects);
    })
    .catch((error) => {
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

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} running on PORT ${app.get('port')}.`);
});