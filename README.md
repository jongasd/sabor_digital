# Como o JWT funciona no Sabor Digital — explicação linha por linha

Este documento cobre só as partes do código que fazem autenticação/autorização.
A ordem segue o fluxo real de uma requisição: registro → login → token → rota
protegida → autorização por papel.

---

## 1. Registro (`src/services/UsuarioService.js` → `registrarUsuario`)

```js
registrarUsuario: async (body) => {
  validarCamposObrigatorios(body);
```

Confere se `nome`, `email` e `senha` vieram no corpo da requisição. Se faltar
algo, lança `AppError` com status 400 e a função para aqui — nada abaixo
executa.

```js
const existente = await UsuarioRepository.findByEmail(body.email);
if (existente) {
  throw new AppError("Já existe um usuário com esse email", 409);
}
```

Consulta o banco para ver se o email já está cadastrado. Sem essa checagem,
duas contas poderiam nascer com o mesmo email (a coluna `email` tem
`UNIQUE` no banco, mas é melhor barrar antes e devolver uma mensagem clara
em vez de deixar o MySQL estourar um erro de constraint).

```js
const senhaHash = await bcrypt.hash(String(body.senha), SALT_ROUNDS);
```

**Este é o ponto mais importante do arquivo inteiro.** A senha que o usuário
digitou nunca é salva como veio. `bcrypt.hash` passa a senha por um algoritmo
de hash com "salt" (dado aleatório misturado antes de aplicar o hash),
`SALT_ROUNDS = 10` vezes. O resultado (`senhaHash`) é uma string de ~60
caracteres que:

- **Não pode ser revertida** para a senha original (não é criptografia, é hash).
- É **diferente toda vez**, mesmo para a mesma senha, porque o salt muda.
- É o que vai para a coluna `senha` do banco — nunca a senha em texto puro.

```js
const usuario = await UsuarioRepository.create({
  nome: String(body.nome).trim(),
  email: String(body.email).trim().toLowerCase(),
  senhaHash,
  papel: body.papel === "admin" ? "admin" : "cliente",
});
```

Grava o usuário no banco com o hash (não a senha). O `papel` só vira
`"admin"` se o corpo da requisição pedir explicitamente isso — qualquer
outro valor cai em `"cliente"`. (Vale notar: como essa rota já exige
`autorizar("admin")`, só um admin logado consegue criar outro admin.)

```js
  return { usuario, token: gerarToken(usuario) };
},
```

Depois de criar o usuário, já devolve um token — a pessoa recém-cadastrada
sai logada, sem precisar fazer login em seguida.

---

## 2. Gerando o token (`gerarToken`, mesmo arquivo)

```js
const gerarToken = (usuario) =>
  jwt.sign(
    { id: usuario.id, nome: usuario.nome, papel: usuario.papel },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
```

`jwt.sign(payload, segredo, opções)` faz três coisas:

1. Pega o **payload** — aqui, só `id`, `nome` e `papel`. Propositalmente
   **não** inclui a senha nem o hash: o payload do JWT não é secreto (ver
   seção 6), então nada sensível deve entrar nele.
2. Assina esse payload com `JWT_SECRET` (a chave que só o servidor conhece,
   vinda do `.env`). É essa assinatura que garante que ninguém consiga
   forjar um token sem saber a chave.
3. Aplica `expiresIn: "8h"` — o token carrega uma data de expiração
   (`exp`) embutida; passado esse prazo, `jwt.verify` vai rejeitá-lo mesmo
   que a assinatura esteja correta.

O retorno é uma string no formato `header.payload.assinatura`, todos os
três em Base64.

---

## 3. Login (`login`, mesmo arquivo)

```js
login: async (email, senha) => {
  if (!email || !senha) {
    throw new AppError("Email e senha são obrigatórios", 400);
  }
```

Validação simples de entrada.

```js
const usuario = await UsuarioRepository.findByEmail(
  String(email).trim().toLowerCase(),
);
if (!usuario) {
  throw new AppError("Email ou senha inválidos", 401);
}
```

Busca o usuário pelo email. Repare na mensagem: é **"Email ou senha
inválidos"**, não "email não encontrado". Isso é proposital — se a
mensagem de erro dissesse qual dos dois está errado, alguém tentando
adivinhar credenciais saberia se já acertou o email, o que facilita
ataque de força bruta.

```js
const senhaConfere = await bcrypt.compare(String(senha), usuario.senha);
if (!senhaConfere) {
  throw new AppError("Email ou senha inválidos", 401);
}
```

`bcrypt.compare(senhaDigitada, hashSalvo)` pega a senha que a pessoa
digitou agora, aplica o mesmo processo de hash (usando o salt que já está
embutido no hash salvo) e compara os resultados. Não existe "descriptografar
a senha salva" — é sempre comparação de hashes.

```js
  const { senha: _descartada, ...usuarioSemSenha } = usuario;
  return { usuario: usuarioSemSenha, token: gerarToken(usuario) };
},
```

Antes de devolver o usuário na resposta HTTP, remove o campo `senha` (o
hash) do objeto — ele nunca deveria viajar pela rede de volta ao cliente,
mesmo sendo "só" um hash. Só então gera e devolve o token.

---

## 4. Verificando o token em cada requisição (`src/middlewares/auth.js`)

```js
const cabecalho = req.headers.authorization;

if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
  return next(new AppError("Token não informado", 401));
}
```

Toda requisição para uma rota protegida precisa mandar o header
`Authorization: Bearer <token>`. Sem esse header, ou sem o prefixo
`"Bearer "`, a requisição é rejeitada antes de chegar em qualquer lógica
de negócio.

```js
const token = cabecalho.slice("Bearer ".length);
```

Corta o texto `"Bearer "` (7 caracteres) do início, sobrando só o token.

```js
try {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  req.usuario = payload; // { id, nome, papel, iat, exp }
  next();
```

`jwt.verify` refaz a assinatura do token usando `JWT_SECRET` e compara com
a assinatura que veio dentro do token. Se baterem (e o token não estiver
expirado), devolve o payload decodificado. Esse payload é colocado em
`req.usuario`, disponível para qualquer middleware/controller que rodar
depois — é assim que o resto da aplicação sabe "quem está fazendo essa
requisição" sem consultar o banco de novo.

```js
} catch (erro) {
  if (erro.name === "TokenExpiredError") {
    return next(new AppError("Sessão expirada, faça login novamente", 401));
  }
  return next(new AppError("Token inválido", 401));
}
```

`jwt.verify` lança exceção se: a assinatura não bater (token forjado ou
assinado com outra chave), o token estiver corrompido/malformado, ou tiver
expirado. O código distingue só o caso de expiração (mensagem mais
amigável) dos demais (mensagem genérica "Token inválido" — de novo, por
segurança, não vale a pena detalhar _por que_ o token é inválido).

---

## 5. Autorização por papel (`src/middlewares/autorizar.js`)

```js
const autorizar =
  (...papeisPermitidos) =>
  (req, res, next) => {
    const papel = req.usuario?.papel;

    if (!papel || !papeisPermitidos.includes(papel)) {
      return next(
        new AppError("Você não tem permissão para realizar esta ação", 403),
      );
    }

    next();
  };
```

Isso é uma **factory de middleware**: `autorizar("admin")` retorna uma
função `(req, res, next) => {...}`, que é o que o Express de fato executa.
`req.usuario` só existe se o middleware `auth` já rodou antes (por isso
`auth` sempre vem antes de `autorizar(...)` nas rotas). Ele lê o `papel`
que estava dentro do token (`admin` ou `cliente`) e só deixa passar se
esse papel estiver na lista permitida. Note a diferença entre os dois
middlewares: `auth` responde "você é _alguém_ válido?"; `autorizar`
responde "você tem permissão _para isso especificamente_?".

---

## 6. O que o token protege — e o que ele NÃO esconde

O JWT não é criptografado, é **assinado**. Qualquer um que pegue o token
consegue decodificar o payload (é só Base64 — dá pra colar em jwt.io e ler).
O que ninguém sem o `JWT_SECRET` consegue fazer é **alterar o payload e
gerar uma assinatura nova que ainda seja válida**. É por isso que:

- Só dados não-sensíveis entram no payload (`id`, `nome`, `papel`).
- O `JWT_SECRET` no `.env` precisa ser uma string longa e imprevisível —
  se vazar, qualquer pessoa consegue forjar um token de admin.

---

## 7. O fluxo completo, de ponta a ponta

```
1. POST /auth/registrar (com token de admin) ou usuário já existe no banco
2. POST /auth/login  { email, senha }
   → UsuarioService.login compara a senha com bcrypt
   → gera token com jwt.sign( {id, nome, papel}, JWT_SECRET, 8h )
   → devolve { usuario, token } pro cliente

3. Cliente guarda o token (localStorage, cookie, etc. — fora do
   escopo deste backend) e passa a mandar em toda requisição protegida:
   Authorization: Bearer <token>

4. Em rotas como POST /produtos:
   → middleware auth verifica assinatura + validade → seta req.usuario
   → middleware autorizar("admin") confere req.usuario.papel === "admin"
   → só então o controller/service realmente roda
```
