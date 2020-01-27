
let mongoose = require("mongoose")
let chai = require('chai')
let expect = chai.expect
let chaiHttp = require('chai-http')
let server = require('../app')
let should = chai.should()
const repository = require('../repositories/cliente-repository')

const baseUrl = 'clientes'

chai.use(chaiHttp)

let listaCliente = [
{
  nome: '',
  dataNascimento: '1986-12-14T00:00:00.000Z',
},
{
  nome: 'Cliente B',
  dataNascimento: '1983-12-15T00:00:00.000Z',
},
{
  nome: 'Cliente C',
  dataNascimento: '1980-12-16T00:00:00.000Z',
}]

let idCliente = []

describe('Cliente', () => {

  describe('Criar', () => {
    it('Nome Cliente é obrigatório', (done) => {

      var result = chai.request(server)
        .post('/'+baseUrl)
        .send(listaCliente[0])

      Promise.resolve(result).then((res) => {
        res.should.have.status(400)
        res.body.should.have.property('message')
          .eql('Nome Cliente é obrigatório')
        done()
      }).catch(done)
    })

    it('Cliente B criado com sucesso', (done) => {

      var result = chai.request(server)
        .post('/'+baseUrl)
        .send(listaCliente[1])

      Promise.resolve(result).then((res) => {
        res.should.have.status(201)
        res.body.should.be.a('object')
        res.body.retorno.should.have.property('nome')
          .eql('Cliente B')
        res.body.retorno.should.have.property('dataNascimento')
          .eql(listaCliente[1].dataNascimento)
        expect(res.body.retorno.dataCadastro).to.not.eql('')
        idCliente.push(res.body.retorno._id)
        done()
      }).catch(done)
    })

    it('Cliente C criado com sucesso', (done) => {

      var result = chai.request(server)
        .post('/'+baseUrl)
        .send(listaCliente[2])

      Promise.resolve(result).then((res) => {
        res.should.have.status(201)
        res.body.should.be.a('object')
        res.body.retorno.should.have.property('nome')
          .eql('Cliente C')
        res.body.retorno.should.have.property('dataNascimento')
          .eql(listaCliente[2].dataNascimento)
        expect(res.body.retorno.dataCadastro).to.not.eql('')
        idCliente.push(res.body.retorno._id)
        done()
      }).catch(done)
    })

  })
    
  describe('Alterar', () => {
    it('Id não foi informado para alteracção', (done) => {

      var result = chai.request(server)
        .put('/'+baseUrl)
        .send(listaCliente[1])

      Promise.resolve(result).then((res) => {
        res.should.have.status(401)
        res.body.should.have.property('message')
          .eql('Id não foi informado')
        done()
      }).catch(done)
    })

    it('Cliente B alterado com sucesso', (done) => {

      let cliente = listaCliente[1]
      cliente['_id'] = idCliente[1]
      cliente['nome'] = 'nome alterado'

      var result = chai.request(server)
        .put('/'+baseUrl)
        .send(cliente)
      
      Promise.resolve(result).then((res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.retorno.should.have.property('nome').eql('nome alterado')
        expect(res.body.retorno.dataAtualizacao).to.not.eql('')
        done()
      }).catch(done)
    })
  })

  describe('Pesquisar', () => {
    it('Pesquisar todos', (done) => {

      var result = chai.request(server)
      .get('/'+baseUrl+'/getAll')
      .send()
  
      Promise.resolve(result).then((res) => {
        res.should.have.status(200)
        res.body.should.be.a('array')
        expect(res.body).to.have.lengthOf(2)
        done()
      }).catch(done)
    })

    it('Pesquisar por nome', (done) => {

      var result = chai.request(server)
      .get('/'+baseUrl+'/getByName')
      .query({
        nome: 'nome alterado'
      })

      Promise.resolve(result).then((res) => {
        res.should.have.status(200)
        res.body.should.have.property('nome').eql('nome alterado')
        res.body.should.be.a('object')
        done()
      }).catch(done)
    })

  })

  describe('Remover', () => {
    it('remove clientes', async () => {
      for (let i in idCliente) {
        const res = await repository.delete(String(idCliente[i]))
      }
    })
  })

})
