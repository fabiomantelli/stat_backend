/**
 * Arquivo: server.js
 * Descrição: arquivo responsável por toda a configuração da aplicação (Back-End)
 * Data: 20/06/2020
 * Author: Fábio Matheus Mantelli
 */

require('dotenv/config')

const app = require('./app')

const port = process.env.PORT || 3333

app.listen(port, () => {
  console.log(`Aplicacao rodando na porta ${port}`)
})
