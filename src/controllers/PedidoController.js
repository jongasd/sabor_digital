const PedidoService = require("../services/PedidoService");

class PedidoController {
  async create(req, res) {
    const dadosPedido = req.body;

    try {
      const novoPedido = await PedidoService.criarPedido(dadosPedido);

      return res.status(201).json({
        sucesso: true,
        mensagem: "Pedido criado com sucesso.",
        dados: novoPedido,
      });
    } catch (error) {
      return res.status(400).json({
        sucesso: false,
        erro: error.message,
      });
    }
  }

  async getAll(req, res) {
    try {
      const listaPedidos = await PedidoService.listarPedidos();

      if (listaPedidos.length === 0) {
        return res.status(200).json({
          mensagem: "Nenhum pedido encontrado.",
          pedidos: [],
        });
      }

      return res.status(200).json({
        total: listaPedidos.length,
        pedidos: listaPedidos,
      });
    } catch (error) {
      return res.status(500).json({
        erro: "Erro interno ao listar pedidos.",
        detalhe: error.message,
      });
    }
  }

  async getById(req, res) {
    const { id } = req.params;

    try {
      const pedido = await PedidoService.obterPedidoPorId(id);

      return res.status(200).json({
        pedido,
      });
    } catch (error) {
      return res.status(404).json({
        erro: error.message,
      });
    }
  }

  async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const statusPermitidos = [
        "pendente",
        "em andamento",
        "finalizado",
        "cancelado",
      ];

      if (!status) {
        return res.status(400).json({
          erro: "Status não informado.",
        });
      }

      if (!statusPermitidos.includes(status.toLowerCase())) {
        return res.status(400).json({
          erro: "Status inválido.",
        });
      }

      const pedidoAtualizado = await PedidoService.atualizarStatus(id, status);

      return res.status(200).json({
        mensagem: "Pedido atualizado com sucesso.",
        pedido: pedidoAtualizado,
      });
    } catch (error) {
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;

      return res.status(statusCode).json({
        erro: error.message,
      });
    }
  }

  async delete(req, res) {
    const { id } = req.params;

    try {
      const pedidoRemovido = await PedidoService.excluirPedido(id);

      return res.status(200).json({
        mensagem: "Pedido removido com sucesso.",
        pedido: pedidoRemovido,
      });
    } catch (error) {
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;

      return res.status(statusCode).json({
        erro: error.message,
      });
    }
  }
}

module.exports = new PedidoController();
