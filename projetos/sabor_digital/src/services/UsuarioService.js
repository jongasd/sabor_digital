const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const UsuarioRepository = require("../repositories/UsuarioRepository");
const AppError = require("../middlewares/appError");

const CAMPOS_OBRIGATORIOS_CRIACAO = ["nome", "email", "senha"];
const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = "8h";

const validarCamposObrigatorios = (dados) => {
  const faltando = CAMPOS_OBRIGATORIOS_CRIACAO.filter(
    (campo) =>
      dados[campo] === undefined ||
      dados[campo] === null ||
      dados[campo] === "",
  );

  if (faltando.length > 0) {
    throw new AppError(
      `Campos obrigatórios ausentes: ${faltando.join(", ")}`,
      400,
    );
  }
};

const gerarToken = (usuario) =>
  jwt.sign(
    { id: usuario.id, nome: usuario.nome, papel: usuario.papel },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

const UsuarioService = {
  listarTodos: () => UsuarioRepository.findAll(),

  buscarPorId: async (id) => {
    const idValido = Number(id);
    if (!Number.isInteger(idValido) || idValido <= 0) {
      throw new AppError("ID inválido", 400);
    }

    const usuario = await UsuarioRepository.findById(idValido);
    if (!usuario) {
      throw new AppError("Usuário não encontrado", 404);
    }
    return usuario;
  },

  registrarUsuario: async (body, { permitirAdmin = false } = {}) => {
    validarCamposObrigatorios(body);

    const existente = await UsuarioRepository.findByEmail(body.email);
    if (existente) {
      throw new AppError("Já existe um usuário com esse email", 409);
    }

    const senhaHash = await bcrypt.hash(String(body.senha), SALT_ROUNDS);

    // Registro público NUNCA cria admin, mesmo que body.papel diga "admin" —
    // só a rota protegida (/auth/registrar-admin, com token de admin) pode
    // passar permitirAdmin: true. Esconder a opção no front não basta:
    // quem manda a requisição direto (curl/Postman) ignora o HTML.
    const papel = permitirAdmin && body.papel === "admin" ? "admin" : "cliente";

    const usuario = await UsuarioRepository.create({
      nome: String(body.nome).trim(),
      email: String(body.email).trim().toLowerCase(),
      senhaHash,
      papel,
    });

    return { usuario, token: gerarToken(usuario) };
  },

  login: async (email, senha) => {
    if (!email || !senha) {
      throw new AppError("Email e senha são obrigatórios", 400);
    }

    const usuario = await UsuarioRepository.findByEmail(
      String(email).trim().toLowerCase(),
    );
    if (!usuario) {
      throw new AppError("Email ou senha inválidos", 401);
    }

    const senhaConfere = await bcrypt.compare(String(senha), usuario.senha);
    if (!senhaConfere) {
      throw new AppError("Email ou senha inválidos", 401);
    }

    const { senha: _descartada, ...usuarioSemSenha } = usuario;
    return { usuario: usuarioSemSenha, token: gerarToken(usuario) };
  },
};

module.exports = UsuarioService;
