const express = require("express");
const router = express.Router();
const ProdutoController = require("../controllers/ProdutoController");
const upload = require("../config/multer");
const {
  verificarToken,
  verificarAdmin,
} = require("../middlewares/authMiddleware");

router.get("/", /* #swagger.tags = ['Produtos'] */ ProdutoController.listar);

router.get(
  "/:id" /* #swagger.tags = ['Produtos']
    #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' } */,
  ProdutoController.buscarPorId,
);

router.post(
  "/" /* #swagger.tags = ['Produtos']
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.consumes = ['multipart/form-data']
    #swagger.parameters['nome'] = { in: 'formData', type: 'string', required: true }
    #swagger.parameters['descricao'] = { in: 'formData', type: 'string' }
    #swagger.parameters['preco'] = { in: 'formData', type: 'number', required: true }
    #swagger.parameters['categoria'] = { in: 'formData', type: 'string' }
    #swagger.parameters['disponivel'] = { in: 'formData', type: 'boolean' }
    #swagger.parameters['imagem'] = { in: 'formData', type: 'file' } */,
  verificarToken,
  verificarAdmin,
  upload.single("imagem"),
  ProdutoController.cadastrar,
);

router.put(
  "/:id" /* #swagger.tags = ['Produtos']
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.consumes = ['multipart/form-data']
    #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    #swagger.parameters['nome'] = { in: 'formData', type: 'string' }
    #swagger.parameters['descricao'] = { in: 'formData', type: 'string' }
    #swagger.parameters['preco'] = { in: 'formData', type: 'number' }
    #swagger.parameters['categoria'] = { in: 'formData', type: 'string' }
    #swagger.parameters['disponivel'] = { in: 'formData', type: 'boolean' }
    #swagger.parameters['imagem'] = { in: 'formData', type: 'file' } */,
  verificarToken,
  verificarAdmin,
  upload.single("imagem"),
  ProdutoController.atualizar,
);

router.delete(
  "/:id" /* #swagger.tags = ['Produtos']
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' } */,
  verificarToken,
  verificarAdmin,
  ProdutoController.deletar,
);

module.exports = router;
