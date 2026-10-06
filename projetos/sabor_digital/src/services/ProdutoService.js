const fs = require("fs").promises;
const path = require("path");
const ProdutoRepository = require("../repositories/ProdutoRepository");

// Converte "false", "0", false e 0 em false; qualquer outro valor vira true
function converterDisponivel(valor) {
  return !(valor === false || valor === "false" || valor === 0 || valor === "0");
}

// Apaga um arquivo de imagem da pasta public, sem quebrar se ele não existir
async function apagarImagem(imagem) {
  if (!imagem) return;
  const caminho = path.join(__dirname, "..", "..", "public", imagem);
  try {
    await fs.unlink(caminho);
  } catch (err) {
    console.error("Erro ao apagar imagem:", err.message);
  }
}

const caminhoDaImagem = (file) => `uploads/produtos/${file.filename}`;

class ProdutoService {
  async listarProdutos() {
    const produtos = await ProdutoRepository.findAll();
    const produtosFormatados = produtos.map((p) => ({
      ...p,
      imagem: p.imagem ? `/public/${p.imagem}` : null,
    }));
    return { sucesso: true, dados: produtosFormatados, total: produtosFormatados.length };
  }

  async buscarProdutoPorId(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: "ID inválido" };
    }

    const produto = await ProdutoRepository.findById(id);
    if (!produto) {
      throw { status: 404, mensagem: "Produto não encontrado" };
    }

    return {
      sucesso: true,
      dados: { ...produto, imagem: produto.imagem ? `/public/${produto.imagem}` : null },
    };
  }

  async cadastrarProduto(dados) {
    let { nome, descricao, preco, categoria, disponivel, file } = dados;

    try {
      if (typeof preco === "string") {
        preco = parseFloat(preco);
      }

      if (!nome || !descricao || preco === undefined || isNaN(preco)) {
        throw {
          status: 400,
          mensagem: "Nome, descrição e preço são obrigatórios e devem ser válidos",
        };
      }

      if (preco <= 0) {
        throw { status: 400, mensagem: "Preço deve ser um número positivo" };
      }

      const id = await ProdutoRepository.create({
        nome: nome.trim(),
        descricao: descricao.trim(),
        preco,
        categoria: categoria || null,
        imagem: file ? caminhoDaImagem(file) : null,
        disponivel: converterDisponivel(disponivel),
      });

      return { sucesso: true, mensagem: "Produto cadastrado com sucesso", id };
    } catch (erro) {
      // Se falhou, a imagem que o multer já salvou ficaria órfã no disco
      if (file) await apagarImagem(caminhoDaImagem(file));
      throw erro;
    }
  }

  async atualizarProduto(id, dados) {
    const { nome, descricao, preco, categoria, disponivel, file } = dados;

    try {
      if (!id || isNaN(id)) {
        throw { status: 400, mensagem: "ID inválido" };
      }

      const existe = await ProdutoRepository.findById(id);
      if (!existe) {
        throw { status: 404, mensagem: "Produto não encontrado" };
      }

      const atualizado = {};

      if (nome !== undefined) atualizado.nome = nome.trim();
      if (descricao !== undefined) atualizado.descricao = descricao.trim();

      if (preco !== undefined) {
        // Em multipart/form-data o preço chega como string
        const precoNumero = typeof preco === "string" ? parseFloat(preco) : preco;
        if (typeof precoNumero !== "number" || isNaN(precoNumero) || precoNumero <= 0) {
          throw { status: 400, mensagem: "Preço deve ser um número positivo" };
        }
        atualizado.preco = precoNumero;
      }

      if (categoria !== undefined) atualizado.categoria = categoria;
      if (disponivel !== undefined) atualizado.disponivel = converterDisponivel(disponivel);
      if (file) atualizado.imagem = caminhoDaImagem(file);

      if (Object.keys(atualizado).length === 0) {
        throw { status: 400, mensagem: "Nenhum dado válido enviado para atualização" };
      }

      await ProdutoRepository.update(id, atualizado);

      // Só apaga a imagem antiga depois que o banco foi atualizado
      if (file) await apagarImagem(existe.imagem);

      return { sucesso: true, mensagem: "Produto atualizado com sucesso" };
    } catch (erro) {
      if (file) await apagarImagem(caminhoDaImagem(file));
      throw erro;
    }
  }

  async deletarProduto(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: "ID inválido" };
    }

    const existe = await ProdutoRepository.findById(id);
    if (!existe) {
      throw { status: 404, mensagem: "Produto não encontrado" };
    }

    // Banco primeiro: se o produto estiver em algum pedido o MySQL recusa (409)
    // e a imagem continua no disco. Só apaga o arquivo depois que o registro saiu.
    await ProdutoRepository.delete(id);
    await apagarImagem(existe.imagem);

    return { sucesso: true, mensagem: "Produto removido com sucesso" };
  }
}

module.exports = new ProdutoService();
