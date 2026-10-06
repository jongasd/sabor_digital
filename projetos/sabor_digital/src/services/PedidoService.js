const PedidoRepository = require("../repositories/PedidoRepository");
const ProdutoRepository = require("../repositories/ProdutoRepository");
const AppError = require("../middlewares/appError");

const STATUS_VALIDOS = ["pendente", "preparo", "pronto", "entregue"];

const validarId = (id) => {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) {
    throw new AppError("ID inválido", 400);
  }
  return n;
};

class PedidoService {
  async criarPedido(pedidoData, usuarioId) {
    const { cliente, itens } = pedidoData || {};

    if (!Array.isArray(itens) || itens.length === 0) {
      throw new AppError("O pedido deve conter ao menos um item.", 400);
    }

    let totalEmCentavos = 0;
    const itensCompletos = [];

    for (const item of itens) {
      const produtoId = Number(item.produto_id);
      const quantidade = Number(item.quantidade);

      if (!Number.isInteger(produtoId) || produtoId <= 0 || !Number.isInteger(quantidade) || quantidade <= 0) {
        throw new AppError("Cada item deve ter produto_id e quantidade (número inteiro maior que zero).", 400);
      }

      const produto = await ProdutoRepository.findById(produtoId);
      if (!produto) {
        throw new AppError(`Produto com ID ${produtoId} não encontrado.`, 404);
      }

      if (!produto.disponivel) {
        throw new AppError(`O produto ${produto.nome} está indisponível para pedidos.`, 400);
      }

      // Soma em centavos para evitar erro de arredondamento do JavaScript (ex.: 0.1 + 0.2)
      totalEmCentavos += Math.round(Number(produto.preco) * 100) * quantidade;

      itensCompletos.push({
        produto_id: produto.id,
        quantidade,
        preco_unitario: Number(produto.preco),
      });
    }

    const novoPedido = {
      usuario_id: usuarioId,
      cliente: cliente ? String(cliente).trim() : null,
      status: "pendente",
      total: totalEmCentavos / 100,
    };

    const pedidoId = await PedidoRepository.create(novoPedido, itensCompletos);
    return await PedidoRepository.findById(pedidoId);
  }

  async listarPedidos() {
    return await PedidoRepository.findAll();
  }

  // usuario = { id, papel }: cliente só enxerga os próprios pedidos; admin vê todos.
  async obterPedidoPorId(id, usuario) {
    const pedido = await PedidoRepository.findById(validarId(id));

    if (!pedido || (usuario.papel !== "admin" && pedido.usuario_id !== usuario.id)) {
      throw new AppError("Pedido não encontrado.", 404);
    }
    return pedido;
  }

  async atualizarStatus(id, novoStatus) {
    const pedidoId = validarId(id);

    if (!STATUS_VALIDOS.includes(novoStatus)) {
      throw new AppError(`Status inválido. Permitidos: ${STATUS_VALIDOS.join(", ")}`, 400);
    }

    const pedidoExistente = await PedidoRepository.findById(pedidoId);
    if (!pedidoExistente) {
      throw new AppError("Pedido não encontrado.", 404);
    }

    await PedidoRepository.update(pedidoId, { status: novoStatus });
    return await PedidoRepository.findById(pedidoId);
  }

  async excluirPedido(id) {
    const pedidoId = validarId(id);

    const pedidoExistente = await PedidoRepository.findById(pedidoId);
    if (!pedidoExistente) {
      throw new AppError("Pedido não encontrado.", 404);
    }

    await PedidoRepository.delete(pedidoId);
  }
}

module.exports = new PedidoService();
