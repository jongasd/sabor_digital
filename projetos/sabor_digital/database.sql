-- Sabor Digital - criação das tabelas
-- Requer MySQL 8.0.16+ (por causa dos CHECK). Funciona no Aiven (banco "defaultdb").
--
-- Local: descomente as 2 linhas abaixo.
-- CREATE DATABASE IF NOT EXISTS sabordigital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE sabordigital;
--
-- Aiven: conecte já no banco defaultdb (ou rode: USE defaultdb;)

-- 1. Usuário (precisa existir antes de pedido)
CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    papel ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Produto (prato/bebida)
CREATE TABLE IF NOT EXISTS produto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    preco DECIMAL(10, 2) NOT NULL CHECK (preco > 0),
    categoria VARCHAR(50) DEFAULT NULL,
    imagem VARCHAR(255) DEFAULT NULL,
    disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_produto_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Cardápio
CREATE TABLE IF NOT EXISTS cardapio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Cardápio <-> Produto (N:M)
CREATE TABLE IF NOT EXISTS cardapio_produto (
    cardapio_id INT NOT NULL,
    produto_id INT NOT NULL,
    PRIMARY KEY (cardapio_id, produto_id),
    FOREIGN KEY (cardapio_id) REFERENCES cardapio(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Pedido (usuario_id = quem fez o pedido; serve para o cliente ver só os dele)
CREATE TABLE IF NOT EXISTS pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT DEFAULT NULL,
    cliente VARCHAR(100) DEFAULT NULL,
    status ENUM('pendente', 'preparo', 'pronto', 'entregue') NOT NULL DEFAULT 'pendente',
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pedido_status (status),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Itens do pedido
CREATE TABLE IF NOT EXISTS item_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_unitario DECIMAL(10, 2) NOT NULL CHECK (preco_unitario > 0),
    FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dados iniciais (só insere se a tabela produto estiver vazia, então pode rodar o script de novo)
INSERT INTO produto (nome, descricao, preco, categoria, disponivel)
SELECT * FROM (
    SELECT 'Espaguete à Bolonhesa' AS nome, 'Massa com molho de tomate e carne moída' AS descricao, 35.50 AS preco, 'Massa' AS categoria, 1 AS disponivel
    UNION ALL SELECT 'Lasanha de Frango', 'Lasanha com frango desfiado e queijo', 42.00, 'Massa', 1
    UNION ALL SELECT 'Pizza Margherita', 'Pizza de mussarela, tomate e manjericão', 50.00, 'Pizza', 1
    UNION ALL SELECT 'Suco de Laranja', 'Suco natural 500ml', 12.00, 'Bebida', 1
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM produto);

-- O primeiro administrador NÃO é criado aqui (a senha precisa de hash bcrypt).
-- Depois de subir o projeto, rode: npm run criar-admin -- "Seu Nome" seu@email.com SuaSenha

-- Se o banco já existia ANTES desta versão (pedido sem usuario_id), rode só isto:
-- ALTER TABLE pedido
--   ADD COLUMN usuario_id INT NULL AFTER id,
--   ADD CONSTRAINT fk_pedido_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL;
