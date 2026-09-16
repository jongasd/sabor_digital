const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/UsuarioController");

router.post(
  "/registrar" /* #swagger.tags = ['Autenticação']
    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            nome: "Nome Completo",
            email: "usuario@email.com",
            senha: "senha123",
            papel: "cliente"
        }
    } */,
  UsuarioController.registrar,
);

router.post(
  "/login" /* #swagger.tags = ['Autenticação']
    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            email: "admin@sabordigital.com",
            senha: "123456"
        }
    } */,
  UsuarioController.login,
);

module.exports = router;
