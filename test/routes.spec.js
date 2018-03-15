const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);

describe('Client Routes', () => {

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
      })
      .catch(error => {
        throw error;
      })
    });
  });
});
