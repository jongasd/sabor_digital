const ProdutoService = require("../services/ProdutoService");

class ProdutoController {
  async listar(req, res, next) {
    try {
      res.json(await ProdutoService.listarProdutos());
    } catch (erro) {
      next(erro);
    }
  }

  async buscarPorId(req, res, next) {
    try {
      res.json(await ProdutoService.buscarProdutoPorId(req.params.id));
    } catch (erro) {
      next(erro);
    }
  }

  async cadastrar(req, res, next) {
    /*  #swagger.consumes = ['multipart/form-data']
        #swagger.security = [{ "bearerAuth": [] }]
        #swagger.parameters['nome'] = { in: 'formData', type: 'string', required: true, description: 'Nome do produto' }
        #swagger.parameters['descricao'] = { in: 'formData', type: 'string', required: true, description: 'Descrição do produto' }
        #swagger.parameters['preco'] = { in: 'formData', type: 'number', required: true, description: 'Preço do produto (Ex: 35.50)' }
        #swagger.parameters['categoria'] = { in: 'formData', type: 'string', required: false, description: 'Categoria (Ex: Massa, Bebida)' }
        #swagger.parameters['disponivel'] = { in: 'formData', type: 'boolean', required: false, description: 'Disponível (true/false)' }
        #swagger.parameters['imagem'] = { in: 'formData', type: 'file', required: false, description: 'Imagem do produto (JPEG, PNG)' }
    */
    try {
      const dados = { ...req.body, file: req.file };
      res.status(201).json(await ProdutoService.cadastrarProduto(dados));
    } catch (erro) {
      next(erro);
    }
  }

  async atualizar(req, res, next) {
    /*  #swagger.consumes = ['multipart/form-data']
        #swagger.security = [{ "bearerAuth": [] }]
        #swagger.parameters['nome'] = { in: 'formData', type: 'string', required: false }
        #swagger.parameters['descricao'] = { in: 'formData', type: 'string', required: false }
        #swagger.parameters['preco'] = { in: 'formData', type: 'number', required: false }
        #swagger.parameters['categoria'] = { in: 'formData', type: 'string', required: false }
        #swagger.parameters['disponivel'] = { in: 'formData', type: 'boolean', required: false }
        #swagger.parameters['imagem'] = { in: 'formData', type: 'file', required: false }
    */
    try {
      const dados = { ...req.body, file: req.file };
      res.json(await ProdutoService.atualizarProduto(req.params.id, dados));
    } catch (erro) {
      next(erro);
    }
  }

  async deletar(req, res, next) {
    // #swagger.security = [{ "bearerAuth": [] }]
    try {
      res.json(await ProdutoService.deletarProduto(req.params.id));
    } catch (erro) {
      next(erro);
    }
  }
}

module.exports = new ProdutoController();
