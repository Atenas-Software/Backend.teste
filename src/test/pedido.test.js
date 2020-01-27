
let mongoose = require("mongoose")
let chai = require('chai')
let expect = chai.expect
let chaiHttp = require('chai-http')
let server = require('../app')
let should = chai.should()
const repository = require('../repositories/pedido-repository')
const repository_cliente = require('../repositories/cliente-repository')
const repository_produto = require('../repositories/produto-repository')
const repository_pedido = require('../repositories/pedido-repository')

const baseUrl = 'pedidos'

chai.use(chaiHttp)

let listaCliente = [
  {
    nome: 'Cliente A',
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

let listaProduto = [
  {
    descricao: 'Produto A',
    preco: 10,
  },
  {
    descricao: 'Produto B',
    preco: 15.50,
  },
  {
    descricao: 'Produto C',
    preco: 21.99,
  }
]

let listaProdutoApi = []
let listaClienteApi = []
let idPedido = []

describe('Pedido', () => {
  describe('Preparar Teste', () => {
    it('Cadastrar Clientes', async () => {      
      for (let i in listaCliente) {
        const res = await repository_cliente.create(listaCliente[i])
        listaClienteApi.push(res)
      }
    })
  
    it('Cadastrar Produtos', async () => {      
      for (let i in listaProduto) {
        const res = await repository_produto.create(listaProduto[i])
        listaProdutoApi.push(res)
      }
    })
  })


  describe('Criar Pedido', () => {
    it('Cliente é obrigatório', (done) => {

      pedidoSemCliente = {
        produtos: [{
          produto: listaProdutoApi[0]._id,
          descricao: listaProdutoApi[0].descricao,
          quantidade: 2,
          preco: listaProdutoApi[0].preco
        }]  
      }

      var result = chai.request(server)
        .post('/'+baseUrl)
        .send(pedidoSemCliente)

      Promise.resolve(result).then((res) => {
        res.should.have.status(401)
        res.body.should.have.property('message')
          .eql('Cliente é obrigatório')
        done()
      }).catch(done)
    })
    
    it('Pedido com um produto criado com sucesso', (done) => {
      let pedido = {
        cliente: listaClienteApi[0]._id,
        produtos: [{
          produto: listaProdutoApi[0]._id,
          descricao: listaProdutoApi[0].descricao,
          quantidade: 2,
          preco: listaProdutoApi[0].preco
        }]  
      }

      var result = chai.request(server)
        .post('/'+baseUrl)
        .send(pedido)

      Promise.resolve(result).then((res) => {
        res.should.have.status(201)
        expect(res.body.retorno.dataCadastro).to.not.eql('')
        expect(res.body.retorno.produtos).to.have.lengthOf(1)
        idPedido.push(res.body.retorno._id)
        done()
      }).catch(done)
    })

    it('Pedido com dois produto criado com sucesso', (done) => {
      let pedido = {
        cliente: listaClienteApi[1]._id,
        produtos: [{
          produto: listaProdutoApi[0]._id,
          descricao: listaProdutoApi[0].descricao,
          quantidade: 2,
          preco: listaProdutoApi[0].preco
        },{
          produto: listaProdutoApi[1]._id,
          descricao: listaProdutoApi[1].descricao,
          quantidade: 3,
          preco: listaProdutoApi[1].preco
        }]  
      }

      var result = chai.request(server)
        .post('/'+baseUrl)
        .send(pedido)

      Promise.resolve(result).then((res) => {
        res.should.have.status(201)
        expect(res.body.retorno.dataCadastro).to.not.eql('')
        expect(res.body.retorno.produtos).to.have.lengthOf(2)
        idPedido.push(res.body.retorno._id)
        done()
      }).catch(done)
    })    
  })
  
  describe('Alterar', () => {
    it('Pedido alterado com sucesso', (done) => {
      let pedido = {
        _id: idPedido[1],
        cliente: String(listaClienteApi[2]._id),
        produtos: [{
          produto: listaProdutoApi[0]._id,
          descricao: listaProdutoApi[0].descricao,
          quantidade: 2,
          preco: listaProdutoApi[0].preco
        },{
          produto: listaProdutoApi[1]._id,
          descricao: listaProdutoApi[1].descricao,
          quantidade: 3,
          preco: listaProdutoApi[1].preco
        }]  
      }

      var result = chai.request(server)
        .put('/'+baseUrl)
        .send(pedido)
      
      Promise.resolve(result).then((res) => {
        res.should.have.status(200)
        expect(res.body.retorno.dataAtualizacao).to.not.eql('')
        expect(String(res.body.retorno.cliente)).to.eql(pedido.cliente)
        done()
      }).catch(done)
    })
  })

  describe('Pesquisar', () => {
    it('Pesquisar todos', (done) => {

      var result = chai.request(server)
      .get('/'+baseUrl)
      .send()
  
      Promise.resolve(result).then((res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('message').eql('Sucesso')
        res.body.should.have.property('lista')
        res.body.lista.should.be.a('array')
        expect(res.body.lista).to.have.lengthOf(2)
        done()
      }).catch(done)
    })
  })

  describe('Remover', () => {
    it('remove clientes', async () => {
      for (let i in listaClienteApi) {
        const res = await repository_cliente.delete(String(listaClienteApi[i]._id))
      }
    })

    it('remove produtos', async () => {
      for (let i in listaProdutoApi) {
        const res = await repository_produto.delete(String(listaProdutoApi[i]._id))
      }
    })

    it('remove pedido', async () => {
      for (let i in idPedido) {
        const res = await repository_pedido.delete(String(idPedido[i]))
      }
    })
  })
})
