const express = require('express');
const router = express.Router();
const usuarioRoutes = require('./usuarioRoutes');
const tarefaRoutes = require('./tarefaRoutes');
router.use('/usuarios', usuarioRoutes);
router.use('/tarefas', tarefaRoutes);
module.exports = router;
