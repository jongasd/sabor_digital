# Como o JWT funciona no Sabor Digital (versão `sabor_digital-main`) — explicação detalhada

Esta versão é estruturalmente diferente da anterior: usa `authMiddleware.js`
(com duas funções, `verificarToken` e `verificarAdmin`, em vez de um par
`auth.js`/`autorizar.js`), tem `multer` para upload de imagem, e trata
erro dentro de cada controller em vez de um error handler central. O fluxo
de JWT em si é parecido, mas os detalhes de implementação mudam bastante —
por isso vou linha por linha de novo, com mais profundidade desta vez.

---

## 0. Os três pedaços de um JWT, na prática

Antes de entrar no código, veja um token real gerado por este projeto
(`jwt.sign({ id: 7, email: '...', papel: 'admin' }, SECRET, { expiresIn: '8h' })`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZW1haWwiOiJhbmFAc2Fib3JkaWdpdGFsLmNvbSIsInBhcGVsIjoiYWRtaW4iLCJpYXQiOjE3ODgyOTQ2MjcsImV4cCI6MTc4ODMyMzQyN30.Bf988f1vPgTolectKPZtoU_59dW3cBRBdUrxW1MgHr0
```

Separado pelos dois pontos (`.`), são três blocos em Base64URL:

**1. Header** — `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
Decodificado: `{"alg":"HS256","typ":"JWT"}`
Diz qual algoritmo assinou o token (HMAC-SHA256) e que é um JWT. `jsonwebtoken`
gera isso sozinho — não tem linha de código correspondente no projeto.

**2. Payload** — `eyJpZCI6NywiZW1haWwiOiJhbmFAc2Fib3JkaWdpdGFsLmNvbSIsInBhcGVsIjoiYWRtaW4iLCJpYXQiOjE3ODgyOTQ2MjcsImV4cCI6MTc4ODMyMzQyN30`
Decodificado: `{"id":7,"email":"ana@sabordigital.com","papel":"admin","iat":1788294627,"exp":1788323427}`
Isso é exatamente o objeto que `UsuarioService.login` passou pro `jwt.sign`,
mais `iat` (issued at — quando foi criado) e `exp` (expiration — quando
expira), que a biblioteca adiciona sozinha a partir do `expiresIn: '8h'`.

**3. Signature** — `Bf988f1vPgTolectKPZtoU_59dW3cBRBdUrxW1MgHr0`
O resultado de `HMAC-SHA256(base64url(header) + "." + base64url(payload), JWT_SECRET)`.
É essa assinatura — não o conteúdo do payload — que impede alguém de
forjar ou alterar o token sem saber a `JWT_SECRET`.

**Ponto que costuma confundir**: header e payload são só Base64, **não
criptografia**. Qualquer pessoa com o token consegue colar essas duas
primeiras partes em qualquer decodificador Base64 e ler `{"id":7,"papel":"admin",...}`
sem precisar de senha nenhuma. O segredo só entra para gerar/conferir a
terceira parte (a assinatura). É por isso que dado sensível nunca deveria
entrar no payload de um JWT.

---

## 1. `src/services/UsuarioService.js` — registro

```js
const JWT_SECRET =
  process.env.JWT_SECRET || "chave_super_secreta_sabor_digital_123";
```

Isso roda uma vez, quando o módulo é carregado (não a cada requisição).
Se `.env` tiver `JWT_SECRET`, usa ele; senão, cai no valor fixo depois do
`||`. **Esse fallback é o problema de segurança que apontei acima** — ele
faz o app "funcionar" mesmo sem configuração nenhuma, o que é conveniente
pra rodar localmente mas perigoso se for parar em produção sem alguém
notar que o `.env` está faltando.

```js
async registrarUsuario(dados) {
    const { nome, email, senha, papel } = dados;

    if (!nome || !email || !senha) {
        throw { status: 400, mensagem: "Nome, e-mail e senha são obrigatórios" };
    }
```

Desestrutura o corpo da requisição. Note que `throw { status, mensagem }`
lança um **objeto literal**, não uma instância de `Error` — funciona em
JavaScript (você pode lançar qualquer valor), mas você perde `.stack` de
verdade e ferramentas de log tratam isso de forma diferente de um erro de
verdade. Repare mais abaixo, no controller, que `erro.stack` é lido — para
esses erros lançados como objeto literal, `erro.stack` é `undefined`, então
cai em `|| erro`, que serializa o objeto inteiro `{status, mensagem}` de
volta pro cliente.

```js
const usuarioExistente = await UsuarioRepository.findByEmail(email);
if (usuarioExistente) {
  throw { status: 409, mensagem: "E-mail já está em uso" };
}
```

Consulta prévia pra não deixar dois cadastros com o mesmo email — mesmo
raciocínio da versão anterior.

```js
const salt = await bcrypt.genSalt(10);
const senhaHash = await bcrypt.hash(senha, salt);
```

Aqui o "salt" é gerado **explicitamente** em duas etapas, diferente da
versão anterior que fazia `bcrypt.hash(senha, 10)` direto (que gera o
salt internamente com o mesmo custo). O resultado final é equivalente —
`genSalt(10)` gera um salt com fator de custo 10 (2^10 iterações), e
`hash(senha, salt)` aplica esse salt. As duas formas são criptograficamente
idênticas em resultado; essa versão só deixa o passo do salt visível.

```js
    const role = (papel === 'admin') ? 'admin' : 'cliente';

    const novoId = await UsuarioRepository.create({
        nome, email, senha: senhaHash, papel: role
    });

    return {
        sucesso: true,
        mensagem: "Usuário registrado com sucesso",
        id: novoId
    };
}
```

Grava o hash (nunca a senha em texto puro) e devolve só o `id` — **esta
versão não devolve token no registro**, diferente da anterior. Quem se
cadastra precisa fazer login separadamente depois.

**Detalhe de segurança que vale notar**: `registrarUsuario` aceita
`papel` vindo direto do `req.body`, e a rota `POST /auth/registrar` não
passa por `verificarToken` nem `verificarAdmin` (veja seção 4). Isso
significa que **qualquer pessoa, sem estar logada, pode se auto-registrar
como `admin`** — é só mandar `{"papel": "admin"}` no corpo da requisição
de cadastro. Na versão anterior que corrigi, essa rota exigia token de
admin; aqui, não exige nada.

---

## 2. `src/services/UsuarioService.js` — login

```js
async login(email, senha) {
    if (!email || !senha) {
        throw { status: 400, mensagem: "E-mail e senha são obrigatórios" };
    }

    const usuario = await UsuarioRepository.findByEmail(email);
    if (!usuario) {
        throw { status: 401, mensagem: "Credenciais inválidas" };
    }
```

Mesma lógica da versão anterior: mensagem genérica ("Credenciais
inválidas") tanto para email inexistente quanto para senha errada, para
não revelar qual dos dois está errado.

```js
const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
if (!senhaCorreta) {
  throw { status: 401, mensagem: "Credenciais inválidas" };
}
```

`bcrypt.compare` recalcula o hash da senha digitada usando o mesmo salt
já embutido em `usuario.senha` (o salt fica gravado dentro da própria
string do hash, nos primeiros caracteres — por isso não precisa ser
passado separadamente aqui) e compara os dois hashes.

```js
const token = jwt.sign(
  { id: usuario.id, email: usuario.email, papel: usuario.papel },
  JWT_SECRET,
  { expiresIn: "8h" },
);
```

Aqui está a emissão do token. Repare que o payload desta versão inclui
`email` (a anterior incluía `nome`) — escolha de implementação, sem
impacto de segurança, já que nem um nem outro é sensível o bastante para
justificar preocupação (mas, tecnicamente, quanto menos dado no payload,
menor a superfície exposta a quem decodificar o token).

```js
    return {
        sucesso: true,
        mensagem: "Login realizado com sucesso",
        token,
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            papel: usuario.papel
        }
    };
}
```

Monta manualmente um objeto `usuario` só com os campos que podem sair
(sem `senha`), em vez de desestruturar e descartar como a versão anterior
fazia com `const { senha, ...resto } = usuario`. Mesmo efeito, escrito de
outro jeito — mas mais seguro contra erro futuro: se alguém adicionar uma
nova coluna sensível na tabela `usuario` amanhã, essa versão não a expõe
sem querer; a versão anterior (que usa spread) exporia automaticamente
qualquer coluna nova, a não ser que alguém lembre de excluir de novo.

---

## 3. `src/repositories/UsuarioRepository.js`

```js
async create(usuarioData) {
    const { nome, email, senha, papel } = usuarioData;
    const [result] = await pool.query(
        'INSERT INTO usuario (nome, email, senha, papel) VALUES (?, ?, ?, ?)',
        [nome, email, senha, papel || 'cliente']
    );
    return result.insertId;
}
```

`pool.query` com `?` como placeholders é **prepared statement** — o
`mysql2` escapa os valores antes de montar a query final, o que evita
SQL injection (diferente de concatenar string direto). `result.insertId`
é o ID que o MySQL gerou pro `AUTO_INCREMENT`. Essa versão está correta —
a versão anterior tinha um bug de vírgula faltando bem aqui.

```js
async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
    return rows[0];
}
```

`pool.query` sempre devolve um array de duas posições: `[linhas, metadados]`.
`const [rows] = ...` já desestrutura pegando só as linhas. `rows[0]` pega
o primeiro resultado ou `undefined` se não achou nada (que vira `falsy`
no `if (!usuario)` do login/registro). Isso está certo — a versão anterior
tinha um bug aqui também (retornava o array inteiro sem desestruturar).

---

## 4. `src/middlewares/authMiddleware.js` — `verificarToken`

```js
const authHeader = req.headers.authorization;

if (!authHeader) {
  return res
    .status(401)
    .json({ sucesso: false, mensagem: "Token de autenticação não fornecido" });
}
```

Diferente da versão anterior (que usava `next(new AppError(...))`, um
erro central), aqui o middleware **responde direto** com `res.status().json()`
e dá `return` — não existe uma classe `AppError` nem error handler global
nesta versão. Funciona, mas mistura formato de erro: se o middleware
responde num formato e o controller responde erro em outro formato (ver
seção 1, o `throw {status, mensagem}`), o cliente da API recebe respostas
de erro com formas diferentes dependendo de onde o erro aconteceu.

```js
const parts = authHeader.split(" ");

if (parts.length !== 2 || parts[0] !== "Bearer") {
  return res
    .status(401)
    .json({
      sucesso: false,
      mensagem: "Token inválido (Formato esperado: Bearer <token>)",
    });
}

const token = parts[1];
```

Abordagem diferente da versão anterior (que fazia `cabecalho.startsWith("Bearer ")`
e cortava com `.slice`). Aqui, quebra a string inteira em partes separadas
por espaço e exige exatamente 2 pedaços, sendo o primeiro literalmente
`"Bearer"`. Mais rígido: rejeita, por exemplo, `"Bearer  token"` (dois
espaços) ou `"Bearer token extra"` (três partes), casos em que o
`.startsWith` da outra versão deixaria passar (e o token ficaria com lixo
junto, quebrando o `jwt.verify` de um jeito menos claro).

```js
try {
  const decodificado = jwt.verify(token, JWT_SECRET);
  req.usuarioId = decodificado.id;
  req.usuarioPapel = decodificado.papel;
  return next();
} catch (err) {
  return res
    .status(401)
    .json({ sucesso: false, mensagem: "Token inválido ou expirado" });
}
```

Mesma verificação de sempre — mas note que essa versão **não distingue**
token expirado de token inválido (a anterior checava `erro.name === "TokenExpiredError"`
para dar mensagem diferente). Aqui as duas situações caem na mesma mensagem
genérica.

Outra diferença importante: em vez de guardar o payload inteiro em
`req.usuario` (como a versão anterior fazia), aqui só dois campos vão
para `req`: `req.usuarioId` e `req.usuarioPapel`. Rastreei o uso deles no
resto do código — **`req.usuarioId` nunca é lido em lugar nenhum** (dá pra
confirmar com `grep -rn "usuarioId" src/`); só `req.usuarioPapel` é
consultado, e só dentro de `verificarAdmin`, abaixo. Não é um bug, só uma
variável guardada e nunca aproveitada — ficaria útil, por exemplo, se um
controller quisesse registrar "pedido criado pelo usuário X", mas hoje
isso não acontece em nenhum controller.

---

## 5. `src/middlewares/authMiddleware.js` — `verificarAdmin`

```js
const verificarAdmin = (req, res, next) => {
  // Esse middleware deve ser chamado DEPOIS de verificarToken
  if (req.usuarioPapel !== "admin") {
    return res
      .status(403)
      .json({
        sucesso: false,
        mensagem:
          "Acesso negado. Apenas administradores podem realizar esta ação.",
      });
  }
  return next();
};
```

Papel único (`'admin'`), sem lista de papéis permitidos como a
`autorizar(...papeis)` que fiz na versão anterior — aqui não dá pra
reaproveisar esse middleware para, digamos, "admin ou funcionário", sem
duplicar a função ou reescrevê-la. Funciona para este projeto porque só
existem dois papéis (`admin`/`cliente`) e só admin precisa de checagem
extra.

O comentário `// deve ser chamado DEPOIS de verificarToken` é a
documentação da dependência de ordem — se alguém colocar `verificarAdmin`
antes de `verificarToken` numa rota nova, `req.usuarioPapel` vai ser
`undefined`, e a condição `undefined !== 'admin'` é sempre verdadeira, ou
seja, **bloqueia todo mundo**, incluindo admins de verdade. É um erro
"seguro" (nega acesso em vez de liberar por engano), mas ainda seria bom
ter uma checagem explícita tipo `if (!req.usuarioPapel) throw ...` para
dar um erro mais claro do que "acesso negado" quando na verdade é erro de
configuração de rota.

---

## 6. Onde os middlewares são (e não são) aplicados

```js
// src/routes/produtoRoutes.js
router.post(
  "/",
  verificarToken,
  verificarAdmin,
  upload.single("imagem"),
  ProdutoController.cadastrar,
);
router.put(
  "/:id",
  verificarToken,
  verificarAdmin,
  upload.single("imagem"),
  ProdutoController.atualizar,
);
router.delete(
  "/:id",
  verificarToken,
  verificarAdmin,
  ProdutoController.deletar,
);
```

Cadeia de middlewares do Express roda na ordem escrita: primeiro confere
se tem token válido (`verificarToken`), depois se o papel é admin
(`verificarAdmin`), só então processa o upload de imagem (`upload.single`),
e só então chega no controller. Se qualquer um dos três primeiros chamar
`res.status(...).json(...)` (em vez de `next()`), a cadeia para ali — o
controller nunca roda.

```js
// src/routes/cardapioRoutes.js
router.post("/", CardapioController.cadastrar);
router.delete("/:id", CardapioController.deletar);

// src/routes/pedidoRoutes.js
router.post("/", PedidoController.create);
router.patch("/:id/status", PedidoController.updateStatus);
router.delete("/:id", PedidoController.delete);
```

Nenhuma dessas rotas passa por `verificarToken`. Isso é o gap de segurança
que mencionei antes de começar o documento — está no código, funcionando
"normalmente", só que sem exigir login nenhum.

```js
// src/routes/authRoutes.js
router.post("/registrar", UsuarioController.registrar);
router.post("/login", UsuarioController.login);
```

As duas únicas rotas que **precisam** ficar públicas (você não pode exigir
token para logar — ainda não tem token nesse momento). O problema, como
descrito na seção 1, é que `/registrar` deixa qualquer um se cadastrar
como admin, quando o ideal seria essa rota ser pública só para criar
`cliente`, e criar `admin` exigir estar logado como admin (foi o que fiz
na versão anterior).

---

## 7. Fluxo completo desta versão, ponta a ponta

```
1. POST /auth/registrar  { nome, email, senha, papel? }
   → sem checagem de token (rota pública)
   → bcrypt.genSalt(10) + bcrypt.hash → grava hash no banco
   → devolve { sucesso, mensagem, id }  (SEM token — precisa logar depois)

2. POST /auth/login  { email, senha }
   → busca usuário por email
   → bcrypt.compare(senha, hash)
   → jwt.sign({id, email, papel}, JWT_SECRET, 8h)
   → devolve { sucesso, token, usuario: {id, nome, email, papel} }

3. Cliente guarda o token e manda em requisições futuras:
   Authorization: Bearer <token>

4. Em POST/PUT/DELETE de /produtos:
   → verificarToken: jwt.verify → seta req.usuarioId, req.usuarioPapel
   → verificarAdmin: confere req.usuarioPapel === 'admin'
   → upload.single('imagem'): processa arquivo (multer), se houver
   → controller roda

5. Em /cardapios e /pedidos: nenhuma checagem — controller roda direto,
   com ou sem token, para qualquer papel.
```

---

## 8. Comparando as duas versões que você me mandou (resumo)

| Aspecto                              | Versão 1 (`sabor_digital.rar`, original) | Versão 2 (`sabor_digital-main.zip`)                       |
| ------------------------------------ | ---------------------------------------- | --------------------------------------------------------- |
| `jwt.sign` existe?                   | Não (por isso corrigi)                   | Sim, funcional                                            |
| Nomes dos middlewares                | `auth.js` + `autorizar.js`               | `authMiddleware.js` (`verificarToken` + `verificarAdmin`) |
| O que fica em `req`                  | `req.usuario` (payload inteiro)          | `req.usuarioId` + `req.usuarioPapel` (campos soltos)      |
| Erro tratado onde                    | `AppError` + error handler central       | `throw {status, mensagem}` + try/catch em cada controller |
| `/auth/registrar` protegida?         | Sim, corrigi para exigir admin           | Não — qualquer um pode virar admin                        |
| `/produtos` protegida?               | Sim (corrigi)                            | Sim (já vinha protegida)                                  |
| `/cardapios`, `/pedidos` protegidas? | Sim (corrigi)                            | **Não**                                                   |
| `JWT_SECRET` sem `.env`              | Quebra (correto — força configurar)      | Usa fallback hardcoded no código                          |
| Erro devolvido ao cliente            | Mensagem genérica                        | `erro.stack` incluído na resposta                         |
