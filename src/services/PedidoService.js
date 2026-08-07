const PedidoRepository = require("../repositories/PedidoRepository");
const ProdutoRepository = require("../repositories/ProdutoRepository");

class PedidoService {
  async criarPedido(dadosPedido) {
    const { cliente, itens } = dadosPedido;

    if (!Array.isArray(itens) || itens.length === 0) {
      throw new Error("O pedido precisa possuir itens.");
    }

    let valorTotal = 0;

    const itensProcessados = [];

    for (const item of itens) {
      const { produto_id, quantidade } = item;

      if (!produto_id) {
        throw new Error("Produto não informado.");
      }

      if (!quantidade || quantidade <= 0) {
        throw new Error("Quantidade inválida.");
      }

      const produto = await ProdutoRepository.findById(produto_id);

      if (!produto) {
        throw new Error(`Produto ID ${produto_id} não encontrado.`);
      }

      if (!produto.disponivel) {
        throw new Error(`Produto ${produto.nome} indisponível.`);
      }

      const subtotal = Number(produto.preco) * quantidade;

      valorTotal += subtotal;

      itensProcessados.push({
        produto_id: produto.id,
        quantidade,
        preco_unitario: produto.preco,
        subtotal,
      });
    }

    const pedido = {
      cliente: cliente || "Cliente não informado",
      status: "pendente",
      total: valorTotal,
    };

    const novoPedido = await PedidoRepository.create(pedido, itensProcessados);

    return novoPedido;
  }

  async listarPedidos() {
    const pedidos = await PedidoRepository.findAll();

    return pedidos;
  }

  async obterPedidoPorId(id) {
    if (!id) {
      throw new Error("ID do pedido não informado.");
    }

    const pedido = await PedidoRepository.findById(id);

    if (!pedido) {
      throw new Error("Pedido não encontrado.");
    }

    return pedido;
  }

  async atualizarStatus(id, novoStatus) {
    const statusPermitidos = [
      "pendente",
      "preparo",
      "pronto",
      "entregue",
      "cancelado",
    ];

    if (!statusPermitidos.includes(novoStatus)) {
      throw new Error(
        `Status inválido. Permitidos: ${statusPermitidos.join(", ")}`,
      );
    }

    const pedidoExistente = await PedidoRepository.findById(id);

    if (!pedidoExistente) {
      throw new Error("Pedido não encontrado.");
    }

    const atualizado = await PedidoRepository.update(id, {
      status: novoStatus,
    });

    if (!atualizado) {
      throw new Error("Erro ao atualizar pedido.");
    }

    return await PedidoRepository.findById(id);
  }

  async excluirPedido(id) {
    const pedido = await PedidoRepository.findById(id);

    if (!pedido) {
      throw new Error("Pedido não encontrado.");
    }

    const removido = await PedidoRepository.delete(id);

    if (!removido) {
      throw new Error("Não foi possível excluir o pedido.");
    }

    return {
      mensagem: "Pedido removido com sucesso.",
    };
  }
}

module.exports = new PedidoService();
