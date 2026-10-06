const CardapioService = require("../services/CardapioService");

class CardapioController {
  async listar(req, res, next) {
    try {
      res.json(await CardapioService.listarCardapios());
    } catch (erro) {
      next(erro);
    }
  }

  async buscarPorId(req, res, next) {
    try {
      res.json(await CardapioService.buscarCardapioPorId(req.params.id));
    } catch (erro) {
      next(erro);
    }
  }

  async cadastrar(req, res, next) {
    // #swagger.security = [{ "bearerAuth": [] }]
    try {
      res.status(201).json(await CardapioService.cadastrarCardapio(req.body));
    } catch (erro) {
      next(erro);
    }
  }

  async deletar(req, res, next) {
    // #swagger.security = [{ "bearerAuth": [] }]
    try {
      res.json(await CardapioService.deletarCardapio(req.params.id));
    } catch (erro) {
      next(erro);
    }
  }
}

module.exports = new CardapioController();
