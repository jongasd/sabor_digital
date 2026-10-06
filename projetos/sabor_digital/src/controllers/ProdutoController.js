const ProdutoService = require("../services/ProdutoService");

// Padroniza a resposta de erro de todos os métodos
function responderErro(res, erro) {
  const resposta = {
    sucesso: false,
    mensagem: erro.mensagem || erro.message || "Erro interno do servidor",
  };

  // Só expõe o stack trace fora de produção
  if (process.env.NODE_ENV !== "production") {
    resposta.erro = erro.stack || erro;
  }

  res.status(erro.status || 500).json(resposta);
}

class ProdutoController {
  async listar(req, res) {
    try {
      const resultado = await ProdutoService.listarProdutos();
      res.json(resultado);
    } catch (erro) {
      responderErro(res, erro);
    }
  }

  async buscarPorId(req, res) {
    try {
      const resultado = await ProdutoService.buscarProdutoPorId(req.params.id);
      res.json(resultado);
    } catch (erro) {
      responderErro(res, erro);
    }
  }

  async cadastrar(req, res) {
    /*  #swagger.consumes = ['multipart/form-data']
        #swagger.parameters['nome'] = { in: 'formData', type: 'string', required: true, description: 'Nome do produto' }
        #swagger.parameters['descricao'] = { in: 'formData', type: 'string', required: true, description: 'Descrição do produto' }
        #swagger.parameters['preco'] = { in: 'formData', type: 'number', required: true, description: 'Preço do produto (Ex: 35.50)' }
        #swagger.parameters['categoria'] = { in: 'formData', type: 'string', required: true, description: 'Categoria (Ex: Massa, Bebida)' }
        #swagger.parameters['disponivel'] = { in: 'formData', type: 'boolean', required: false, description: 'Status de disponibilidade (1 ou 0)' }
        #swagger.parameters['imagem'] = { in: 'formData', type: 'file', required: false, description: 'Imagem do produto (JPEG, PNG)' }
    */
    try {
      const dados = { ...req.body, file: req.file };
      const resultado = await ProdutoService.cadastrarProduto(dados);
      res.status(201).json(resultado);
    } catch (erro) {
      responderErro(res, erro);
    }
  }

  async atualizar(req, res) {
    /*  #swagger.consumes = ['multipart/form-data']
        #swagger.parameters['nome'] = { in: 'formData', type: 'string', required: false }
        #swagger.parameters['descricao'] = { in: 'formData', type: 'string', required: false }
        #swagger.parameters['preco'] = { in: 'formData', type: 'number', required: false }
        #swagger.parameters['categoria'] = { in: 'formData', type: 'string', required: false }
        #swagger.parameters['disponivel'] = { in: 'formData', type: 'boolean', required: false }
        #swagger.parameters['imagem'] = { in: 'formData', type: 'file', required: false }
    */
    try {
      const dados = { ...req.body, file: req.file };
      const resultado = await ProdutoService.atualizarProduto(req.params.id, dados);
      res.json(resultado);
    } catch (erro) {
      responderErro(res, erro);
    }
  }

  async deletar(req, res) {
    try {
      const resultado = await ProdutoService.deletarProduto(req.params.id);
      res.json(resultado);
    } catch (erro) {
      responderErro(res, erro);
    }
  }
}

module.exports = new ProdutoController();