const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Pool } = require('pg')
require('dotenv').config()

const app = express()
app.use(cors({
  origin: [
    'https://manoeldearaujofilho2025-creator.github.io',
    'http://127.0.0.1:5500',
    'https://pg-cred-2-0-ivhq.vercel.app',
    'http://localhost:5500',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  credentials: true
}))
app.use(express.json())

// =====================
// CONEXÃO COM O BANCO
// =====================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // necessário para o Supabase
})

// Testa a conexão ao iniciar
pool.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar com o banco:', err.message)
  } else {
    console.log('✅ Conectado ao banco de dados PostgreSQL!')
  }
})

// =====================
// ROTA RAIZ
// =====================
app.get('/', (req, res) => {
  res.send('Servidor PgCred rodando 🚀')
})

// =====================
// ROTA DE CADASTRO
// =====================
app.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body

  // Validação básica
  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: "Preencha todos os campos" })
  }

  if (senha.length < 6) {
    return res.status(400).json({ mensagem: "A senha deve ter pelo menos 6 caracteres" })
  }

  try {
    // Verifica se o email já existe
    const usuarioExistente = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    )

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ mensagem: "Este email já está cadastrado" })
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10)

    // Insere o usuário no banco
    await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)',
      [nome, email, senhaCriptografada]
    )

    res.status(201).json({ mensagem: "Conta criada com sucesso!" })

  } catch (erro) {
    console.error('Erro no cadastro:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})

// =====================
// ROTA DE LOGIN
// =====================
app.post('/login', async (req, res) => {
  const { email, senha } = req.body

  // Validação básica
  if (!email || !senha) {
    return res.status(400).json({ mensagem: "Preencha todos os campos" })
  }

  try {
    // Busca o usuário pelo email
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    )

    if (resultado.rows.length === 0) {
      return res.status(401).json({ mensagem: "Email ou senha inválidos" })
    }

    const usuario = resultado.rows[0]

    // Compara a senha com a criptografada no banco
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha)

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: "Email ou senha inválidos" })
    }

    // Gera o token JWT válido por 1 dia
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nome: usuario.nome },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    })

  } catch (erro) {
    console.error('Erro no login:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})

// =====================
// MIDDLEWARE DE AUTENTICAÇÃO
// =====================
function autenticar(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ mensagem: "Acesso negado. Token não fornecido." })
  }

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = dados
    next()
  } catch (erro) {
    return res.status(403).json({ mensagem: "Token inválido ou expirado." })
  }
}

// =====================
// ROTA PROTEGIDA (exemplo)
// =====================
app.get('/perfil', autenticar, async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, nome, email, criado_em FROM usuarios WHERE id = $1',
      [req.usuario.id]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" })
    }

    res.json({ usuario: resultado.rows[0] })

  } catch (erro) {
    console.error('Erro ao buscar perfil:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})

// =====================
// ROTAS DE CLIENTES
// =====================

// Cadastrar cliente
app.post('/clientes', autenticar, async (req, res) => {
  const { nome, email, telefone, cpf } = req.body

  if (!nome || !cpf) {
    return res.status(400).json({ mensagem: "Nome e CPF são obrigatórios" })
  }

  try {
    const cpfExistente = await pool.query(
      'SELECT id FROM clientes WHERE cpf = $1 AND usuario_id = $2',
      [cpf, req.usuario.id]
    )

    if (cpfExistente.rows.length > 0) {
      return res.status(400).json({ mensagem: "CPF já cadastrado" })
    }

    const resultado = await pool.query(
      'INSERT INTO clientes (usuario_id, nome, email, telefone, cpf) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.usuario.id, nome, email, telefone, cpf]
    )

    res.status(201).json({ mensagem: "Cliente cadastrado com sucesso!", cliente: resultado.rows[0] })

  } catch (erro) {
    console.error('Erro ao cadastrar cliente:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})

// Listar clientes do usuário logado
app.get('/clientes', autenticar, async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM clientes WHERE usuario_id = $1 ORDER BY criado_em DESC',
      [req.usuario.id]
    )

    res.json({ clientes: resultado.rows })

  } catch (erro) {
    console.error('Erro ao listar clientes:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})

// Deletar cliente
app.delete('/clientes/:id', autenticar, async (req, res) => {
  const { id } = req.params

  try {
    await pool.query(
      'DELETE FROM clientes WHERE id = $1 AND usuario_id = $2',
      [id, req.usuario.id]
    )

    res.json({ mensagem: "Cliente removido com sucesso!" })

  } catch (erro) {
    console.error('Erro ao deletar cliente:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})


// Editar cliente
app.put('/clientes/:id', autenticar, async (req, res) => {
  const { id } = req.params
  const { nome, email, telefone, cpf } = req.body

  if (!nome || !cpf) {
    return res.status(400).json({ mensagem: "Nome e CPF são obrigatórios" })
  }

  try {
    const cpfExistente = await pool.query(
      'SELECT id FROM clientes WHERE cpf = $1 AND usuario_id = $2 AND id != $3',
      [cpf, req.usuario.id, id]
    )

    if (cpfExistente.rows.length > 0) {
      return res.status(400).json({ mensagem: "Este CPF já está cadastrado em outro cliente" })
    }

    const resultado = await pool.query(
      'UPDATE clientes SET nome = $1, email = $2, telefone = $3, cpf = $4 WHERE id = $5 AND usuario_id = $6 RETURNING *',
      [nome, email, telefone, cpf, id, req.usuario.id]
    )

    res.json({ mensagem: "Cliente atualizado com sucesso!", cliente: resultado.rows[0] })
  } catch (erro) {
    console.error('Erro ao editar cliente:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})

// =====================
// ROTAS DE EMPRESTIMOS
// =====================

// Cadastrar emprestimo
// Cadastrar empréstimo
app.post('/emprestimos', autenticar, async (req, res) => {
  const { cliente_id, valor, taxa_juros, tipo_juros, num_parcelas, data_emprestimo, observacoes } = req.body

  if (!cliente_id || !valor || !taxa_juros || !tipo_juros || !num_parcelas || !data_emprestimo) {
    return res.status(400).json({ mensagem: "Preencha todos os campos obrigatórios" })
  }

  const v = Number(valor)
  const t = Number(taxa_juros) / 100
  const n = Number(num_parcelas)

  let valor_parcela, valor_total

  if (tipo_juros === 'simples') {
    valor_total  = v * (1 + t * n)
    valor_parcela = valor_total / n
  } else if (tipo_juros === 'price') {
    // Fórmula Price (amortização)
    valor_parcela = v * (t * Math.pow(1 + t, n)) / (Math.pow(1 + t, n) - 1)
    valor_total   = valor_parcela * n
  }

  try {
    const resultado = await pool.query(
      'INSERT INTO emprestimos (usuario_id, cliente_id, valor, taxa_juros, tipo_juros, num_parcelas, valor_parcela, valor_total, data_emprestimo, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [req.usuario.id, cliente_id, valor, taxa_juros, tipo_juros, num_parcelas, valor_parcela.toFixed(2), valor_total.toFixed(2), data_emprestimo, observacoes || null]
    )
    res.status(201).json({ mensagem: "Empréstimo registrado com sucesso!", emprestimo: resultado.rows[0] })
  } catch (erro) {
    console.error('Erro ao cadastrar empréstimo:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})
// Listar emprestimos
app.get('/emprestimos', autenticar, async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT e.*, c.nome as cliente_nome FROM emprestimos e JOIN clientes c ON e.cliente_id = c.id WHERE e.usuario_id = $1 ORDER BY e.criado_em DESC',
      [req.usuario.id]
    )
    res.json({ emprestimos: resultado.rows })
  } catch (erro) {
    console.error('Erro ao listar emprestimos:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})

// Atualizar status
app.patch('/emprestimos/:id/status', autenticar, async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  try {
    await pool.query(
      'UPDATE emprestimos SET status = $1 WHERE id = $2 AND usuario_id = $3',
      [status, id, req.usuario.id]
    )
    res.json({ mensagem: "Status atualizado com sucesso!" })
  } catch (erro) {
    console.error('Erro ao atualizar status:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})

// Deletar emprestimo
app.delete('/emprestimos/:id', autenticar, async (req, res) => {
  const { id } = req.params
  try {
    await pool.query(
      'DELETE FROM emprestimos WHERE id = $1 AND usuario_id = $2',
      [id, req.usuario.id]
    )
    res.json({ mensagem: "Emprestimo removido com sucesso!" })
  } catch (erro) {
    console.error('Erro ao deletar emprestimo:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})


// =====================
// ROTA DE RELATÓRIOS
// =====================
app.get('/relatorios', autenticar, async (req, res) => {
  try {
    const [resumo, porStatus, porMes, topClientes] = await Promise.all([

      // Total emprestado e lucro
      pool.query(
        `SELECT 
          COALESCE(SUM(valor), 0) as total_emprestado,
          COALESCE(SUM(valor_total - valor), 0) as lucro_total,
          COALESCE(SUM(valor_total), 0) as total_a_receber,
          COUNT(*) as total_emprestimos
         FROM emprestimos WHERE usuario_id = $1`,
        [req.usuario.id]
      ),

      // Por status
      pool.query(
        `SELECT status, COUNT(*) as quantidade, COALESCE(SUM(valor), 0) as total
         FROM emprestimos WHERE usuario_id = $1
         GROUP BY status`,
        [req.usuario.id]
      ),

      // Evolução mensal (últimos 6 meses)
      pool.query(
        `SELECT 
          TO_CHAR(data_emprestimo, 'MM/YYYY') as mes,
          COUNT(*) as quantidade,
          COALESCE(SUM(valor), 0) as total_emprestado,
          COALESCE(SUM(valor_total - valor), 0) as lucro
         FROM emprestimos
         WHERE usuario_id = $1
           AND data_emprestimo >= NOW() - INTERVAL '6 months'
         GROUP BY TO_CHAR(data_emprestimo, 'MM/YYYY')
         ORDER BY MIN(data_emprestimo)`,
        [req.usuario.id]
      ),

      // Top clientes
      pool.query(
        `SELECT c.nome,
          COUNT(e.id) as total_emprestimos,
          COALESCE(SUM(e.valor), 0) as total_emprestado
         FROM clientes c
         LEFT JOIN emprestimos e ON e.cliente_id = c.id AND e.usuario_id = $1
         WHERE c.usuario_id = $1
         GROUP BY c.id, c.nome
         ORDER BY total_emprestado DESC
         LIMIT 5`,
        [req.usuario.id]
      )
    ])

    res.json({
      resumo: resumo.rows[0],
      porStatus: porStatus.rows,
      porMes: porMes.rows,
      topClientes: topClientes.rows
    })

  } catch (erro) {
    console.error('Erro ao gerar relatórios:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})

// =====================
// ROTAS DE CONFIGURAÇÕES
// =====================

// Atualizar perfil (nome e email)
app.put('/perfil', autenticar, async (req, res) => {
  const { nome, email } = req.body

  if (!nome || !email) {
    return res.status(400).json({ mensagem: "Nome e email são obrigatórios" })
  }

  try {
    const emailExistente = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
      [email, req.usuario.id]
    )

    if (emailExistente.rows.length > 0) {
      return res.status(400).json({ mensagem: "Este email já está em uso" })
    }

    const resultado = await pool.query(
      'UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3 RETURNING id, nome, email',
      [nome, email, req.usuario.id]
    )

    res.json({ mensagem: "Perfil atualizado com sucesso!", usuario: resultado.rows[0] })
  } catch (erro) {
    console.error('Erro ao atualizar perfil:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})

// Alterar senha
app.put('/perfil/senha', autenticar, async (req, res) => {
  const { senhaAtual, novaSenha } = req.body

  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ mensagem: "Preencha todos os campos" })
  }

  if (novaSenha.length < 6) {
    return res.status(400).json({ mensagem: "A nova senha deve ter pelo menos 6 caracteres" })
  }

  try {
    const resultado = await pool.query(
      'SELECT senha FROM usuarios WHERE id = $1',
      [req.usuario.id]
    )

    const senhaCorreta = await bcrypt.compare(senhaAtual, resultado.rows[0].senha)
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: "Senha atual incorreta" })
    }

    const novaSenhaCriptografada = await bcrypt.hash(novaSenha, 10)
    await pool.query(
      'UPDATE usuarios SET senha = $1 WHERE id = $2',
      [novaSenhaCriptografada, req.usuario.id]
    )

    res.json({ mensagem: "Senha alterada com sucesso!" })
  } catch (erro) {
    console.error('Erro ao alterar senha:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})

// Excluir conta
app.delete('/perfil', autenticar, async (req, res) => {
  const { senha } = req.body

  if (!senha) {
    return res.status(400).json({ mensagem: "Confirme sua senha para excluir a conta" })
  }

  try {
    const resultado = await pool.query(
      'SELECT senha FROM usuarios WHERE id = $1',
      [req.usuario.id]
    )

    const senhaCorreta = await bcrypt.compare(senha, resultado.rows[0].senha)
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: "Senha incorreta" })
    }

    await pool.query('DELETE FROM usuarios WHERE id = $1', [req.usuario.id])
    res.json({ mensagem: "Conta excluída com sucesso." })
  } catch (erro) {
    console.error('Erro ao excluir conta:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})

// =====================
// ROTA DE RESUMO (DASHBOARD)
// =====================
app.get('/resumo', autenticar, async (req, res) => {
  try {
    const [emprestimos, clientes] = await Promise.all([
      pool.query(
        `SELECT 
          COALESCE(SUM(valor), 0) as total_emprestado,
          COALESCE(SUM(valor_total - valor), 0) as lucro_total,
          COUNT(*) FILTER (WHERE status = 'atrasado') as total_inadimplentes,
          COUNT(*) as total_emprestimos
         FROM emprestimos WHERE usuario_id = $1`,
        [req.usuario.id]
      ),
      pool.query(
        'SELECT COUNT(*) as total_clientes FROM clientes WHERE usuario_id = $1',
        [req.usuario.id]
      )
    ])

    res.json({
      total_emprestado:    emprestimos.rows[0].total_emprestado,
      lucro_total:         emprestimos.rows[0].lucro_total,
      total_inadimplentes: emprestimos.rows[0].total_inadimplentes,
      total_emprestimos:   emprestimos.rows[0].total_emprestimos,
      total_clientes:      clientes.rows[0].total_clientes
    })

  } catch (erro) {
    console.error('Erro ao buscar resumo:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})

// Editar empréstimo
app.put('/emprestimos/:id', autenticar, async (req, res) => {
  const { id } = req.params
  const { cliente_id, valor, taxa_juros, tipo_juros, num_parcelas, data_emprestimo, observacoes } = req.body

  if (!cliente_id || !valor || !taxa_juros || !tipo_juros || !num_parcelas || !data_emprestimo) {
    return res.status(400).json({ mensagem: "Preencha todos os campos obrigatórios" })
  }

  const v = Number(valor)
  const t = Number(taxa_juros) / 100
  const n = Number(num_parcelas)

  let valor_parcela, valor_total

  if (tipo_juros === 'simples') {
    valor_total   = v * (1 + t * n)
    valor_parcela = valor_total / n
  } else if (tipo_juros === 'price') {
    valor_parcela = v * (t * Math.pow(1 + t, n)) / (Math.pow(1 + t, n) - 1)
    valor_total   = valor_parcela * n
  }

  try {
    const resultado = await pool.query(
      `UPDATE emprestimos SET cliente_id=$1, valor=$2, taxa_juros=$3, tipo_juros=$4,
       num_parcelas=$5, valor_parcela=$6, valor_total=$7, data_emprestimo=$8, observacoes=$9
       WHERE id=$10 AND usuario_id=$11 RETURNING *`,
      [cliente_id, valor, taxa_juros, tipo_juros, num_parcelas,
       valor_parcela.toFixed(2), valor_total.toFixed(2),
       data_emprestimo, observacoes || null, id, req.usuario.id]
    )
    res.json({ mensagem: "Empréstimo atualizado com sucesso!", emprestimo: resultado.rows[0] })
  } catch (erro) {
    console.error('Erro ao editar empréstimo:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})

// =====================
// ROTA DE LOGIN DEMO
// =====================
app.post('/demo', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      ['demo@pgcred.com']
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário demo não encontrado" })
    }

    const usuario = resultado.rows[0]

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nome: usuario.nome, demo: true },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    )

    res.json({
      mensagem: "Modo demo ativado!",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    })

  } catch (erro) {
    console.error('Erro ao ativar demo:', erro.message)
    res.status(500).json({ mensagem: "Erro interno no servidor" })
  }
})

// =====================
// SERVIDOR
// =====================
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})