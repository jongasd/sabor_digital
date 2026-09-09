const API_URL = 'http://localhost:3000';
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const adminSection = document.getElementById('admin-section');
const formLogin = document.getElementById('form-login');
const formRegistro = document.getElementById('form-registro');
const btnTabLogin = document.getElementById('btn-tab-login');
const btnTabRegistro = document.getElementById('btn-tab-registro');
const authMessage = document.getElementById('auth-message');
const btnLogout = document.getElementById('btn-logout');
const btnLogoutAdmin = document.getElementById('btn-logout-admin');
const formTarefa = document.getElementById('form-tarefa');
const listaTarefas = document.getElementById('lista-tarefas');
const formDeleteUser = document.getElementById('form-delete-user');
const selectUsuarios = document.getElementById('select-usuarios');
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        mostrarApp();
    }
});
btnTabLogin.addEventListener('click', () => {
    formLogin.classList.remove('hidden');
    formRegistro.classList.add('hidden');
    btnTabLogin.classList.add('active');
    btnTabRegistro.classList.remove('active');
    authMessage.textContent = '';
});
btnTabRegistro.addEventListener('click', () => {
    formRegistro.classList.remove('hidden');
    formLogin.classList.add('hidden');
    btnTabRegistro.classList.add('active');
    btnTabLogin.classList.remove('active');
    authMessage.textContent = '';
});
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    try {
        const res = await fetch(`${API_URL}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('jwt_token', data.token);
            localStorage.setItem('user_name', data.usuario.nome);
            mostrarApp();
        } else {
            authMessage.textContent = data.error || 'Erro ao fazer login';
        }
    } catch (error) {
        authMessage.textContent = 'Erro de conexão com a API';
    }
});
formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const senha = document.getElementById('reg-senha').value;
    try {
        const res = await fetch(`${API_URL}/usuarios/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });
        const data = await res.json();
        if (res.ok) {
            authMessage.style.color = 'green';
            authMessage.textContent = 'Registro concluído! Faça o login.';
            btnTabLogin.click();
        } else {
            authMessage.style.color = '#dc3545';
            authMessage.textContent = data.error || 'Erro ao registrar';
        }
    } catch (error) {
        authMessage.textContent = 'Erro de conexão com a API';
    }
});
function deslogar() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_name');
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    adminSection.classList.add('hidden');
    document.getElementById('login-senha').value = '';
}
btnLogout.addEventListener('click', deslogar);
btnLogoutAdmin.addEventListener('click', deslogar);
function mostrarApp() {
    authSection.classList.add('hidden');
    const token = localStorage.getItem('jwt_token');
    const userName = localStorage.getItem('user_name');
    const payload = token ? parseJwt(token) : null;
    if (payload && payload.papel === 'admin') {
        adminSection.classList.remove('hidden');
        appSection.classList.add('hidden');
        if (userName) document.getElementById('admin-greeting').textContent = `Olá, ${userName}`;
        carregarUsuarios();
    } else {
        appSection.classList.remove('hidden');
        adminSection.classList.add('hidden');
        if (userName) document.getElementById('user-greeting').textContent = `Olá, ${userName}`;
        carregarTarefas();
    }
}
async function fetchComToken(url, options = {}) {
    const token = localStorage.getItem('jwt_token');
    if (!token) return deslogar();
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    const res = await fetch(`${API_URL}${url}`, { ...options, headers });
    if (res.status === 401 || res.status === 409) {
        deslogar();
        alert('Sua sessão expirou ou você não tem permissão. Faça login novamente.');
        throw new Error('Sessão expirada/sem permissão');
    }
    return res;
}
async function carregarTarefas() {
    try {
        const res = await fetchComToken('/tarefas');
        const tarefas = await res.json();
        listaTarefas.innerHTML = '';
        tarefas.forEach(tarefa => {
            const li = document.createElement('li');
            if(tarefa.status === 'concluida') li.classList.add('concluida');
            li.innerHTML = `
                <strong>${tarefa.titulo}</strong>
                <span>${tarefa.descricao || ''}</span>
                <div class="tarefa-acoes">
                    <select onchange="atualizarStatus(${tarefa.id}, this.value)">
                        <option value="pendente" ${tarefa.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="em_andamento" ${tarefa.status === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
                        <option value="concluida" ${tarefa.status === 'concluida' ? 'selected' : ''}>Concluída</option>
                    </select>
                    <button class="btn-danger" onclick="deletarTarefa(${tarefa.id})">Excluir</button>
                </div>
            `;
            listaTarefas.appendChild(li);
        });
    } catch (error) {
        console.error(error);
    }
}
formTarefa.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('nova-tarefa-titulo').value;
    const descricao = document.getElementById('nova-tarefa-desc').value;
    try {
        await fetchComToken('/tarefas', {
            method: 'POST',
            body: JSON.stringify({ titulo, descricao })
        });
        document.getElementById('nova-tarefa-titulo').value = '';
        document.getElementById('nova-tarefa-desc').value = '';
        carregarTarefas();
    } catch (error) {
        console.error(error);
    }
});
window.atualizarStatus = async function(id, status) {
    try {
        await fetchComToken(`/tarefas/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        carregarTarefas();
    } catch (error) {
        console.error(error);
    }
}
window.deletarTarefa = async function(id) {
    if(!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
        await fetchComToken(`/tarefas/${id}`, {
            method: 'DELETE'
        });
        carregarTarefas();
    } catch (error) {
        console.error(error);
    }
}
async function carregarUsuarios() {
    try {
        const res = await fetchComToken('/usuarios');
        const usuarios = await res.json();
        selectUsuarios.innerHTML = '<option value="" disabled selected>Selecione um usuário para excluir</option>';
        usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id;
            option.textContent = `${usuario.nome} (${usuario.email})`;
            selectUsuarios.appendChild(option);
        });
    } catch (error) {
        console.error(error);
    }
}
formDeleteUser.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = selectUsuarios.value;
    if (!id) return alert('Selecione um usuário');
    if(!confirm('Tem certeza que deseja excluir este usuário definitivamente?')) return;
    try {
        const res = await fetchComToken('/usuarios/' + id, { method: 'DELETE' });
        if (res.ok) {
            alert('Usuário excluído com sucesso!');
            carregarUsuarios();
        } else {
            const data = await res.json();
            alert(data.error || 'Erro ao excluir usuário');
        }
    } catch (error) {
        console.error(error);
    }
});
