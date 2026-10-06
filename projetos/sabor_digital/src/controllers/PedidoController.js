const PedidoService = require("../services/PedidoService");

class PedidoController {
  async create(req, res, next) {
    // #swagger.security = [{ "bearerAuth": [] }]
    try {
      const pedido = await PedidoService.criarPedido(req.body, req.usuarioId);
      res.status(201).json({ sucesso: true, mensagem: "Pedido criado com sucesso", pedido });
    } catch (erro) {
      next(erro);
    }
  }

  async getAll(req, res, next) {
    // #swagger.security = [{ "bearerAuth": [] }]
    try {
      const pedidos = await PedidoService.listarPedidos();
      res.json({ sucesso: true, dados: pedidos, total: pedidos.length });
    } catch (erro) {
      next(erro);
    }
  }

  async getById(req, res, next) {
    // #swagger.security = [{ "bearerAuth": [] }]
    try {
      const pedido = await PedidoService.obterPedidoPorId(req.params.id, {
        id: req.usuarioId,
        papel: req.usuarioPapel,
      });
      res.json({ sucesso: true, dados: pedido });
    } catch (erro) {
      next(erro);
    }
  }

  async updateStatus(req, res, next) {
    // #swagger.security = [{ "bearerAuth": [] }]
    try {
      const pedido = await PedidoService.atualizarStatus(req.params.id, req.body.status);
      res.json({ sucesso: true, mensagem: "Status atualizado com sucesso", pedido });
    } catch (erro) {
      next(erro);
    }
  }

  async delete(req, res, next) {
    // #swagger.security = [{ "bearerAuth": [] }]
    try {
      await PedidoService.excluirPedido(req.params.id);
      res.json({ sucesso: true, mensagem: "Pedido excluído com sucesso" });
    } catch (erro) {
      next(erro);
    }
  }
}

module.exports = new PedidoController();
