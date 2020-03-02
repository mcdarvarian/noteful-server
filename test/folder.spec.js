require('dotenv').config();
const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeFolders, makeMaliciousFolder } = require('./fixtures');

describe('Notes Endpoints', function () {
  let db;

  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: process.env.DATABASE_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'))

  describe(`GET /api/folders`, () => {
    context(`Given no folders`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/folders')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, [])
      })
    })

    context('Given there are folders in the database', () => {
      const testFolders = makeFolders();

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
      })

      it('responds with 200 and all of the ', () => {
        return supertest(app)
          .get('/api/folders')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testFolders)
      })
    })

  })

  describe(`GET /api/folders/:folder_id`, () => {
    context(`Given no `, () => {
      it(`responds with 404`, () => {
        const folderId = 123456
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
      })
    })

    context('Given there are folders in the database', () => {
      const testFolders = [
        {
          id: 1,
          name: 'First Folder'
        },
        {
          id: 2,
          name: 'Second Folder'
        }
      ];

      beforeEach('insert ', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders);
      })

      it('responds with 200 and the specified Folder', () => {
        const folderId = 2
        const expectedFolder = testFolders[folderId - 1]
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedFolder)
      })

    })

    context(`Given an XSS attack Folder`, () => {
      const maliciousFolder = makeMaliciousFolder();
      const expectedFolder = {
        id: 9,
        name: 'Malice malice malice &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
      };


      beforeEach('insert malicious Folder', () => {
        return db
          .into('noteful_folders')
          .insert([maliciousFolder])
      })
      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/folders/${maliciousFolder.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.eql(expectedFolder.name)
          })
      })
    })
  })

  describe(`POST /api/folders`, () => {
    const testFolders = makeFolders();
    beforeEach('insert malicious folder', () => {
      return db
        .into('noteful_folders')
        .insert(testFolders)
    })
    it(`creates a Folder, responding with 201 and the new folder`, () => {
      const newFolder = {
        id: 2,
        name: 'Test new Folder'
      };


      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newFolder.name)
          expect(res.body).to.have.property('id')
          expect(res.body.id).to.eql(newFolder.id)
          expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`);

        })
        .then(res => {
          supertest(app)
            .get(`/api/${res.body.id}`)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(res.body)
        })
    })

    const requiredFields = ['name']

    requiredFields.forEach(field => {
      const newFolder = {
        id: 9,
        name: 'Test new Folder'
      };

      it(`responds with 400 and an error message when the ${field} is missing`, () => {
        delete newFolder[field]

        return supertest(app)
          .post('/api/folders')
          .send(newFolder)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(400, {
            error: { message: `Missing ${field} in request body` }
          })
      })
    })

    it('removes XSS attack content from response', () => {
      const maliciousFolder = makeMaliciousFolder();
      const expectedFolder = {
        id: 9,
        name: 'Malice malice malice &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
      };

      return supertest(app)
        .post(`/api/folders`)
        .send(maliciousFolder)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(expectedFolder.name)
        })
    })
  })

  describe(`DELETE /api/:folder_id`, () => {
    context(`Given no folder`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456
        return supertest(app)
          .delete(`/api/folders/${folderId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
      })
    })


  })


})