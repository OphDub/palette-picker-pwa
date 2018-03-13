const express = require('express');
const app = express();
const bodyParser = require('body-parser');

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
    "colors": [ "#81946A", "#F8CE9D", "#7AC2E3", "#43ADC4", "#6E498B" ]
  },
  {
    "id": "1",
    "name": "Not Fun",
    "project-key": "1",
    "colors": [ "#68DE43", "#78177A", "#AC7CD6", "#7871AB", "#B9DF4C" ]
  },
  {
    "id": "1",
    "name": "Cool Colors",
    "project-key": "2",
    "colors": [ "#148ACC", "#42D1F1", "#9F39CD", "#4DFAFC", "#1CC9F2" ]
  },
];

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (request, response) => {
});

app.get('/api/v1/projects', (request, response) => {
  const { projects } = app.locals;

  response.json({ projects });
});

app.get('/api/v1/palettes', (request, response) => {
  const { palettes }  = app.locals;

  response.json({ palettes });
})

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} running on PORT ${app.get('port')}.`);
});