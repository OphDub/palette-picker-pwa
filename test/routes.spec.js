const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require('../server');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

chai.use(chaiHttp);

describe('Client Routes', () => {
  beforeEach((done) => {
    database.migrate.rollback()
    .then(() => {
      database.migrate.latest()
      .then(() => {
        return database.seed.run()
        .then(() => {
          done();
        });
      });
    });
  });

  it('should return the home page', () => {
    return chai.request(server)
    .get('/')
    .then(response => {
      expect(response.status).to.equal(200);
    });
  });

  it('should return a 404 for a route that does not exist', () => {
    return chai.request(server)
    .get('/sad')
    .then(response => {
      expect(response.status).to.equal(404);
    })
    .catch(error => {
      throw error;
    });
  });
});

describe('API Routes', () => {
  beforeEach((done) => {
    database.migrate.rollback()
    .then(() => {
      database.migrate.latest()
      .then(() => {
        return database.seed.run()
        .then(() => {
          done();
        });
      });
    });
  });

  describe('PROJECT Endpoints', () => {
    describe('GET /api/v1/projects', () => {
      it('should return all the projects', () => {
        return chai.request(server)
        .get('/api/v1/projects')
        .then(response => {
          expect(response.status).to.equal(200);
          expect(response).to.be.json;
          expect(response.body).to.be.an('array');
          expect(response.body.length).to.equal(1);
          expect(response.body[0]).to.have.property('id');
          expect(response.body[0].id).to.equal(1);
          expect(response.body[0]).to.have.property('project_name');
          expect(response.body[0].project_name).to.equal('Foo');
        })
        .catch(error => {
          throw error;
        });
      });
    });

    describe('POST /api/v1/projects', () => {
      it('should create a new project', () => {
        return chai.request(server)
        .post('/api/v1/projects')
        .send({
          project_name: 'Anotha one'
        })
        .then(response => {
          expect(response.status).to.equal(201);
          expect(response).to.be.an('object');
          expect(response.body).to.have.property('id');
          expect(response.body.id).to.equal(2);
          expect(response.body).to.have.property('project_name');
          expect(response.body.project_name).to.equal('Anotha one');
        })
        .catch(error => {
          throw error;
        });
      });

      it('should not create a new project with missing data', () => {
        return chai.request(server)
        .post('/api/v1/projects')
        .send({
          not_project_name: 'Not legit'
        })
        .then(response => {
          expect(response.status).to.equal(422);
          expect(response.body.error).to.equal(`Expected format: { project_name: <String> }. You are missing a "project_name" property.`)
        })
        .catch(error => {
          throw error;
        });
      });
    });

    describe('GET /api/v1/projects/:id/', () => {
      it('should return a project when the id matches', () => {
        const projectId = 1;
  
        return chai.request(server)
        .get(`/api/v1/projects/${projectId}/`)
        .send({
          id: projectId
        })
        .then(response => {
          expect(response.status).to.equal(200);
          expect(response).to.be.an('object');
          expect(response.body[0]).to.have.property('id');
          expect(response.body[0].id).to.equal(1);
          expect(response.body[0]).to.have.property('project_name');
          expect(response.body[0].project_name).to.equal('Foo');
        })
        .catch(error => {
          throw error;
        });
      });

      it('should return 404 if no project id matches', () => {
        const projectId = 20;
  
        return chai.request(server)
        .get(`/api/v1/projects/${projectId}/`)
        .send({
          id: projectId
        })
        .then(response => {
          expect(response.status).to.equal(404);
          expect(response.body.error).to.equal(
            `Could not find project with id ${projectId}`
          );
        })
        .catch(error => {
          throw error;
        });
      });
    });
  });

  describe('PALETTE Endpoints', () => {
    describe('GET /api/v1/palettes', () => {
      it('should return all the palettes', () => {
        return chai.request(server)
        .get('/api/v1/palettes')
        .then(response => {
          expect(response.status).to.equal(200);
          expect(response).to.be.json;
          expect(response.body).to.be.an('array');
          expect(response.body.length).to.equal(2);

          expect(response.body[0]).to.have.property('id');
          expect(response.body[0].id).to.equal(1);
          expect(response.body[0]).to.have.property('palette_name');
          expect(response.body[0].palette_name).to.equal('Palette 1');
          expect(response.body[0]).to.have.property('color1');
          expect(response.body[0].color1).to.equal('#81946A');
          expect(response.body[0]).to.have.property('color2');
          expect(response.body[0].color2).to.equal('#F8CE9D');
          expect(response.body[0]).to.have.property('color3');
          expect(response.body[0].color3).to.equal('#7AC2E3');
          expect(response.body[0]).to.have.property('color4');
          expect(response.body[0].color4).to.equal('#43ADC4');
          expect(response.body[0]).to.have.property('color5');
          expect(response.body[0].color5).to.equal('#6E498B');

          expect(response.body[1]).to.have.property('id');
          expect(response.body[1].id).to.equal(2);
          expect(response.body[1]).to.have.property('palette_name');
          expect(response.body[1].palette_name).to.equal('Not Fun');
          expect(response.body[1]).to.have.property('color1');
          expect(response.body[1].color1).to.equal('#68DE43');
          expect(response.body[1]).to.have.property('color2');
          expect(response.body[1].color2).to.equal('#78177A');
          expect(response.body[1]).to.have.property('color3');
          expect(response.body[1].color3).to.equal('#AC7CD6');
          expect(response.body[1]).to.have.property('color4');
          expect(response.body[1].color4).to.equal('#7871AB');
          expect(response.body[1]).to.have.property('color5');
          expect(response.body[1].color5).to.equal('#B9DF4C');
        })
        .catch(error => {
          throw error;
        });
      });
    });

    describe('POST /api/v1/palettes', () => {
      it('should create a new palette', () => {
        return chai.request(server)
        .post('/api/v1/palettes')
        .send({
          palette_name: 'Anotha one',
          color1: '#68DE43',
          color2: '#78177A',
          color3: '#AC7CD6',
          color4: '#7871AB',
          color5: '#B9DF4C',
        })
        .then(response => {
          expect(response.status).to.equal(201);
          expect(response).to.be.json;
          expect(response.body).to.be.an('object');
          expect(response.body).to.have.property('id');
          expect(response.body.id).to.equal(3);
          expect(response.body).to.have.property('color1');
          expect(response.body.color1).to.equal('#68DE43');
          expect(response.body).to.have.property('color2');
          expect(response.body.color2).to.equal('#78177A');
          expect(response.body).to.have.property('color3');
          expect(response.body.color3).to.equal('#AC7CD6');
          expect(response.body).to.have.property('color4');
          expect(response.body.color4).to.equal('#7871AB');
          expect(response.body).to.have.property('color5');
          expect(response.body.color5).to.equal('#B9DF4C');
        })
        .catch(error => {
          throw error;
        });
      });

      it('should not create a new palette with missing data', () => {
        return chai.request(server)
        .post('/api/v1/palettes')
        .send({
          palette_name: 'Some otha one'
        })
        .then(response => {
          const requiredParameter = 'color1';
  
          expect(response.status).to.equal(422);
          expect(response.body.error).to.equal(
            `Expected format: { palette_name: <String>, color1: <String>, color2: <String>, color3: <String>, color4: <String>, color5: <String>}. You are missing a "${requiredParameter}" property.`
          )
        })
        .catch(error => {
          throw error;
        });
      });
    });

    describe('DELETE /api/v1/palettes/:id/', () => {
      it('should delete a palette when the id matches', () => {
        const paletteId = 1;
  
        return chai.request(server)
        .delete(`/api/v1/palettes/${paletteId}/`)
        .send({
          palette_id: paletteId
        })
        .then(response => {
          expect(response.status).to.equal(204);
        })
        .catch(error => {
          throw error;
        });
      });

      it('should return 404 if there is no palette to delete', () => {
        const paletteId = 5;
  
        return chai.request(server)
        .delete(`/api/v1/palettes/${paletteId}`)
        .send({
          palette_id: paletteId
        })
        .then(response => {
          expect(response.status).to.equal(404);
          expect(response.body.error).to.equal(`Could not find palette with id ${paletteId}`);
        })
        .catch(error => {
          throw error;
        });
      });
    });

    describe('GET /api/v1/projects/:id/palettes', () => {
      it('should return all the palettes when given a correct project id', () => {
        const projectId = 1;

        return chai.request(server)
        .get(`/api/v1/projects/${projectId}/palettes`)
        .then(response => {
          expect(response.status).to.equal(200);
          expect(response).to.be.json;
          expect(response.body).to.be.an('array');
          expect(response.body.length).to.equal(2);

          expect(response.body[0]).to.have.property('id');
          expect(response.body[0].id).to.equal(1);
          expect(response.body[0]).to.have.property('palette_name');
          expect(response.body[0].palette_name).to.equal('Palette 1');
          expect(response.body[0]).to.have.property('color1');
          expect(response.body[0].color1).to.equal('#81946A');
          expect(response.body[0]).to.have.property('color2');
          expect(response.body[0].color2).to.equal('#F8CE9D');
          expect(response.body[0]).to.have.property('color3');
          expect(response.body[0].color3).to.equal('#7AC2E3');
          expect(response.body[0]).to.have.property('color4');
          expect(response.body[0].color4).to.equal('#43ADC4');
          expect(response.body[0]).to.have.property('color5');
          expect(response.body[0].color5).to.equal('#6E498B');

          expect(response.body[1]).to.have.property('id');
          expect(response.body[1].id).to.equal(2);
          expect(response.body[1]).to.have.property('palette_name');
          expect(response.body[1].palette_name).to.equal('Not Fun');
          expect(response.body[1]).to.have.property('color1');
          expect(response.body[1].color1).to.equal('#68DE43');
          expect(response.body[1]).to.have.property('color2');
          expect(response.body[1].color2).to.equal('#78177A');
          expect(response.body[1]).to.have.property('color3');
          expect(response.body[1].color3).to.equal('#AC7CD6');
          expect(response.body[1]).to.have.property('color4');
          expect(response.body[1].color4).to.equal('#7871AB');
          expect(response.body[1]).to.have.property('color5');
          expect(response.body[1].color5).to.equal('#B9DF4C');
        })
        .catch(error => {
          throw error;
        });
      });

      it('should return 404 if no project id matches', () => {
        const incorrectProjId = 5;

        return chai.request(server)
        .get(`/api/v1/projects/${incorrectProjId}/palettes`)
        .then(response => {
          expect(response.status).to.equal(404);
          expect(response.body.error).to.equal(
            `Could not find palette with id ${incorrectProjId}`
          );
        })
        .catch(error => {
          throw error;
        });
      });
    });
  });
});
