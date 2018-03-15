const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);

describe('Client Routes', () => {
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
  describe('GET /api/v1/projects', () => {
    it('should return all the projects', () => {
      return chai.request(server)
      .get('/api/v1/projects')
      .then(response => {
        expect(response.status).to.equal(200);
        expect(response).to.be.json;
        expect(response.body).to.be.an('array');
        console.log(response.body);
      })
      .catch(error => {
        throw error;
      });
    });
  });
});
