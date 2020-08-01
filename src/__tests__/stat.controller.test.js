import request from 'supertest'
import router from '../routes'

let statApi

beforeEach(() => {
  statApi = {
    success: 'true',
    message: 'Welcome to Statistic API',
    version: '1.0.0'
  }
})

test('Deve ser possível conectar na API', async () => {
  const response = await request(router)
    .get('/api')
    .send(statApi)

  expect(response.body).toMatchObject({
    statApi
  })
})
