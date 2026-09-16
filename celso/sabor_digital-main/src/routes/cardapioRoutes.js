const express = require("express");
const router = express.Router();
const CardapioController = require("../controllers/CardapioController");

router.get("/", /* #swagger.tags = ['Cardápios'] */ CardapioController.listar);

router.get(
  "/:id" /* #swagger.tags = ['Cardápios']
    #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' } */,
  CardapioController.buscarPorId,
);

router.post(
  "/" /* #swagger.tags = ['Cardápios']
    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            nome: "Cardápio de Verão",
            descricao: "Pratos leves para o verão",
            disponivel: true,
            produtos: [1, 2, 3]
        }
    } */,
  CardapioController.cadastrar,
);

router.delete(
  "/:id" /* #swagger.tags = ['Cardápios']
    #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' } */,
  CardapioController.deletar,
);

module.exports = router;
