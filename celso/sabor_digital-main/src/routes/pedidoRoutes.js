const express = require("express");
const router = express.Router();
const PedidoController = require("../controllers/PedidoController");

router.post(
  "/" /* #swagger.tags = ['Pedidos']
    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            cliente: "Nome do Cliente",
            itens: [
                { produto_id: 1, quantidade: 2 }
            ]
        }
    } */,
  PedidoController.create,
);

router.get("/", /* #swagger.tags = ['Pedidos'] */ PedidoController.getAll);

router.get(
  "/:id" /* #swagger.tags = ['Pedidos']
    #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' } */,
  PedidoController.getById,
);

router.patch(
  "/:id/status" /* #swagger.tags = ['Pedidos']
    #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { status: "em_preparo" }
    } */,
  PedidoController.updateStatus,
);

router.delete(
  "/:id" /* #swagger.tags = ['Pedidos']
    #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' } */,
  PedidoController.delete,
);

module.exports = router;
