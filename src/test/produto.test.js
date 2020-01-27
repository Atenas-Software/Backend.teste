
let mongoose = require("mongoose")
let chai = require('chai')
let expect = chai.expect
let chaiHttp = require('chai-http')
let server = require('../app')
let should = chai.should()
const repository = require('../repositories/produto-repository')

const baseUrl = 'produtos'

chai.use(chaiHttp)

let listaProduto = [
{
  descricao: '',
  preco: 10,
},
{
  descricao: 'Produto B',
  preco: 15.50,
},
{
  descricao: 'Produto C',
  preco: 21.99,
}]

let idProduto = []

describe('Produto', () => {

  describe('Criar', () => {
    it('Descrição Produto é obrigatório', (done) => {

      var result = chai.request(server)
        .post('/'+baseUrl)
        .send(listaProduto[0])

      Promise.resolve(result).then((res) => {
        res.should.have.status(400)
        res.body.should.have.property('message')
          .eql('Descrição Produto é obrigatório')
        done()
      }).catch(done)
    })

    it('Produto B criado com sucesso', (done) => {

      var result = chai.request(server)
        .post('/'+baseUrl)
        .send(listaProduto[1])

      Promise.resolve(result).then((res) => {
        res.should.have.status(201)
        res.body.should.be.a('object')
        res.body.retorno.should.have.property('descricao').eql('Produto B')
        res.body.retorno.should.have.property('preco').eql(listaProduto[1].preco)
        expect(res.body.retorno.dataCadastro).to.not.eql('')
        idProduto.push(res.body.retorno._id)
        done()
      }).catch(done)
    })

    it('Produto C criado com sucesso', (done) => {

      var result = chai.request(server)
        .post('/'+baseUrl)
        .send(listaProduto[2])

      Promise.resolve(result).then((res) => {
        res.should.have.status(201)
        res.body.should.be.a('object')
        res.body.retorno.should.have.property('descricao').eql('Produto C')
        res.body.retorno.should.have.property('preco').eql(listaProduto[2].preco)
        expect(res.body.retorno.dataCadastro).to.not.eql('')
        idProduto.push(res.body.retorno._id)
        done()
      }).catch(done)
    })
  })

  describe('Alterar', () => {
    it('Id não foi informado para alteracção', (done) => {

      var result = chai.request(server)
        .put('/'+baseUrl)
        .send(listaProduto[2])

      Promise.resolve(result).then((res) => {
        res.should.have.status(401)
        res.body.should.have.property('message')
          .eql('Id não foi informado')
        done()
      }).catch(done)
    })

    it('Produto B alterado com sucesso', (done) => {

      let produto = listaProduto[1]
      produto['_id'] = idProduto[1]
      produto['descricao'] = 'descricao alterado'

      var result = chai.request(server)
        .put('/'+baseUrl)
        .send(produto)
      
      Promise.resolve(result).then((res) => {
        res.should.have.status(200)
        res.body.retorno.should.have.property('descricao').eql('descricao alterado')
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

    it('Pesquisar por descricao', (done) => {

      var result = chai.request(server)
      .get('/'+baseUrl+'/getByDescricao')
      .query({
        descricao: 'descricao alterado'
      })

      Promise.resolve(result).then((res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('descricao').eql('descricao alterado')
        done()
      }).catch(done)
    })
  })

  describe('Remover', () => {
    it('remove produtos', async () => {
      for (let i in idProduto) {
        const res = await repository.delete(String(idProduto[i]))
      }
    })
  })

})
