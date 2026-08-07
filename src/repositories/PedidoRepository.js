const pool = require("../config/database");

class PedidoRepository {
  async findAll() {
    const query = `
            SELECT 
                id,
                cliente,
                status,
                total,
                criado_em
            FROM pedido
            ORDER BY criado_em DESC
        `;

    const [pedidos] = await pool.query(query);

    return pedidos;
  }

  async findById(id) {
    const [pedidoRows] = await pool.query(
      `
            SELECT 
                id,
                cliente,
                status,
                total,
                criado_em
            FROM pedido
            WHERE id = ?
            `,
      [id],
    );

    if (pedidoRows.length === 0) {
      return null;
    }

    const pedido = pedidoRows[0];

    const [itensPedido] = await pool.query(
      `
            SELECT 
                ip.id,
                ip.quantidade,
                ip.preco_unitario,

                p.id AS produto_id,
                p.nome AS produto_nome,
                p.descricao AS produto_descricao

            FROM item_pedido ip

            INNER JOIN produto p
                ON p.id = ip.produto_id

            WHERE ip.pedido_id = ?
            `,
      [id],
    );

    pedido.itens = itensPedido;

    return pedido;
  }

  async create(dadosPedido, itensPedido = []) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { cliente, status, total } = dadosPedido;

      const [pedidoCriado] = await connection.query(
        `
                INSERT INTO pedido (
                    cliente,
                    status,
                    total
                )
                VALUES (?, ?, ?)
                `,
        [cliente || null, status || "pendente", total],
      );

      const pedidoId = pedidoCriado.insertId;

      if (itensPedido.length > 0) {
        for (const item of itensPedido) {
          await connection.query(
            `
                        INSERT INTO item_pedido (
                            pedido_id,
                            produto_id,
                            quantidade,
                            preco_unitario
                        )
                        VALUES (?, ?, ?, ?)
                        `,
            [pedidoId, item.produto_id, item.quantidade, item.preco_unitario],
          );
        }
      }

      await connection.commit();

      return {
        id: pedidoId,
        ...dadosPedido,
        itens: itensPedido,
      };
    } catch (error) {
      await connection.rollback();

      throw new Error(`Erro ao criar pedido: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  async update(id, dadosAtualizacao) {
    const campos = [];
    const valores = [];

    for (const campo in dadosAtualizacao) {
      if (dadosAtualizacao[campo] !== undefined) {
        campos.push(`${campo} = ?`);
        valores.push(dadosAtualizacao[campo]);
      }
    }

    if (campos.length === 0) {
      return false;
    }

    valores.push(id);

    const query = `
            UPDATE pedido
            SET ${campos.join(", ")}
            WHERE id = ?
        `;

    const [resultado] = await pool.query(query, valores);

    return resultado.affectedRows > 0;
  }

  async delete(id) {
    const [resultado] = await pool.query("DELETE FROM pedido WHERE id = ?", [
      id,
    ]);

    return resultado.affectedRows > 0;
  }
}

module.exports = new PedidoRepository();
