const BASE_URL = 'http://localhost:3000';
const API_PRODUCTS = `${BASE_URL}/produtos`;
const tbody = document.querySelector('#produtosTable tbody');
const btnNovo = document.getElementById('btnNovo');
const produtoModal = new bootstrap.Modal(document.getElementById('produtoModal'));
const produtoForm = document.getElementById('produtoForm');

function extractField(obj, ...keys) {
  for (let key of keys) {
    if (obj[key] !== undefined) return obj[key];
  }
  return undefined;
}

function showAlert(message, type='success') {
  const placeholder = document.getElementById('alertPlaceholder');
  placeholder.innerHTML = `
    <div class="alert alert-${type} alert-dismissible" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
  setTimeout(() => { placeholder.innerHTML = '' }, 4000);
}

async function fetchProdutos() {
  try {
    const res = await fetch(API_PRODUCTS);
    if (!res.ok) throw new Error();
    const produtos = await res.json();
    renderTabela(produtos);
  } catch {
    showAlert('Erro ao carregar produtos', 'danger');
  }
}

function renderTabela(produtos) {
  tbody.innerHTML = '';
  if (!Array.isArray(produtos)) produtos = [];
  produtos.forEach(p => {
    const id = extractField(p, 'id', '_id', 'produtoId');
    const nome = extractField(p, 'nome', 'name', 'titulo');
    const preco = extractField(p, 'preco', 'price', 'valor') || 0;
    const quantidade = extractField(p, 'quantidade', 'stock', 'qtde') || 0;
    const descricao = extractField(p, 'descricao', 'description', 'desc') || '';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${id}</td>
      <td>${nome}</td>
      <td>R$ ${Number(preco).toFixed(2)}</td>
      <td>${quantidade}</td>
      <td>${descricao}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-editar">Editar</button>
        <button class="btn btn-sm btn-outline-danger btn-excluir ms-1">Excluir</button>
      </td>`;
    tr.querySelector('.btn-editar').addEventListener('click', () => openEdit(p));
    tr.querySelector('.btn-excluir').addEventListener('click', () => excluirProduto(p));
    tbody.appendChild(tr);
  });
}

function openEdit(produto) {
  document.getElementById('modalTitle').textContent = 'Editar Produto';
  document.getElementById('produtoId').value = extractField(produto, 'id', '_id', 'produtoId') || '';
  document.getElementById('nome').value = extractField(produto, 'nome', 'name', 'titulo') || '';
  document.getElementById('preco').value = extractField(produto, 'preco', 'price', 'valor') || 0;
  document.getElementById('quantidade').value = extractField(produto, 'quantidade', 'stock', 'qtde') || 0;
  document.getElementById('descricao').value = extractField(produto, 'descricao', 'description', 'desc') || '';
  produtoModal.show();
}

function openCreate() {
  document.getElementById('modalTitle').textContent = 'Novo Produto';
  produtoForm.reset();
  document.getElementById('produtoId').value = '';
  produtoModal.show();
}

produtoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('produtoId').value.trim();
  const payload = {
    nome: document.getElementById('nome').value.trim(),
    preco: Number(document.getElementById('preco').value) || 0,
    quantidade: Number(document.getElementById('quantidade').value) || 0,
    descricao: document.getElementById('descricao').value.trim(),
  };
  try {
    if (id) {
      const res = await fetch(`${API_PRODUCTS}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      showAlert('Produto atualizado');
    } else {
      const res = await fetch(API_PRODUCTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      showAlert('Produto criado');
    }
    produtoModal.hide();
    fetchProdutos();
  } catch {
    showAlert('Erro ao salvar produto', 'danger');
  }
});

async function excluirProduto(produto) {
  const id = extractField(produto, 'id', '_id', 'produtoId') || '';
  if (!confirm('Deseja realmente excluir este produto?')) return;
  try {
    const res = await fetch(`${API_PRODUCTS}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    showAlert('Produto excluído');
    fetchProdutos();
  } catch {
    showAlert('Erro ao excluir produto', 'danger');
  }
}

btnNovo.addEventListener('click', openCreate);
fetchProdutos();
