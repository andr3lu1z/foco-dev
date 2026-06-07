// ===== Elementos da tela =====
const formulario = document.getElementById("form-metas");
const inputNovaMeta = document.getElementById("input-nova-meta");
const selectCategoria = document.getElementById("select-categoria");
const formCategoria = document.getElementById("form-categoria");
const inputNovaCategoria = document.getElementById("input-nova-categoria");
const inputCorCategoria = document.getElementById("input-cor-categoria");
const filtroCategoria = document.getElementById("filtro-categoria");
const listaMetas = document.getElementById("lista-metas");

// ===== Endereços do back-end =====
const urlMetas = "http://localhost:3000/metas";
const urlCategorias = "http://localhost:3000/categorias";

// Guarda as metas em memória para o filtro não precisar bater no servidor toda vez
let metasAtuais = [];

// Busca as categorias e preenche os dois selects (cadastro e filtro)
async function carregarCategorias() {
  try {
    const resposta = await fetch(urlCategorias);
    const categorias = await resposta.json();

    selectCategoria.innerHTML = '<option value="">Sem categoria</option>';
    filtroCategoria.innerHTML = '<option value="todas">Todas</option>';

    categorias.forEach((cat) => {
      selectCategoria.innerHTML += `<option value="${cat.id}">${cat.nome}</option>`;
      filtroCategoria.innerHTML += `<option value="${cat.id}">${cat.nome}</option>`;
    });
  } catch (erro) {
    console.error("Erro ao buscar categorias:", erro);
  }
}

// Busca as metas, atualiza o dashboard e manda desenhar a lista
async function carregarMetas() {
  try {
    const resposta = await fetch(urlMetas);
    metasAtuais = await resposta.json();

    const total = metasAtuais.length;
    const concluidas = metasAtuais.filter((m) => m.status === "Concluída").length;
    const pendentes = metasAtuais.filter((m) => m.status === "Pendente").length;

    document.getElementById("stat-total").textContent = total;
    document.getElementById("stat-concluidas").textContent = concluidas;
    document.getElementById("stat-pendentes").textContent = pendentes;

    aplicarFiltro();
  } catch (erro) {
    console.error("Erro ao buscar as metas:", erro);
  }
}

// Decide QUAIS metas mostrar com base no filtro selecionado
function aplicarFiltro() {
  const valor = filtroCategoria.value;

  let listaParaMostrar = metasAtuais;
  if (valor !== "todas") {
    listaParaMostrar = metasAtuais.filter((m) => String(m.categoria_id) === valor);
  }

  desenharLista(listaParaMostrar);
}

// Recebe uma lista de metas e monta os <li> na tela
function desenharLista(metas) {
  listaMetas.innerHTML = "";

  metas.forEach((meta) => {
    const itemLista = document.createElement("li");
    itemLista.dataset.id = meta.id;

    const cor = meta.categoria_cor || "#b0b0b0";
    const nomeCategoria = meta.categoria_nome || "Sem categoria";

    itemLista.style.borderLeftColor = cor;

    itemLista.innerHTML = `
      <div class="meta-esquerda">
        <span class="meta-descricao">${meta.descricao}</span>
        <span class="categoria-badge" style="background-color:${cor}">${nomeCategoria}</span>
      </div>
      <div class="meta-direita">
        <span class="status-badge">${meta.status}</span>
        <div class="acoes">
          <button class="btn-concluir" onclick="concluirMeta(${meta.id})" ${meta.status === "Concluída" ? "disabled" : ""}>Concluir</button>
          <button class="btn-excluir" onclick="excluirMeta(${meta.id})">Excluir</button>
        </div>
      </div>
    `;
    listaMetas.appendChild(itemLista);
  });
}

// Cadastrar nova meta (enviando a categoria escolhida)
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const textoMeta = inputNovaMeta.value;
  const categoriaEscolhida = selectCategoria.value; // "" = sem categoria

  try {
    await fetch(urlMetas, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descricao: textoMeta,
        categoria_id: categoriaEscolhida || null,
      }),
    });

    inputNovaMeta.value = "";
    selectCategoria.value = "";
    carregarMetas();
  } catch (erro) {
    console.error("Erro ao salvar:", erro);
    alert("Erro ao salvar. Verifique se o servidor Node.js está rodando no terminal.");
  }
});

// Criar nova categoria
formCategoria.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const nome = inputNovaCategoria.value;
  const cor = inputCorCategoria.value;

  try {
    await fetch(urlCategorias, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, cor }),
    });

    inputNovaCategoria.value = "";
    await carregarCategorias(); // atualiza os selects com a categoria recém-criada
  } catch (erro) {
    console.error("Erro ao criar categoria:", erro);
    alert("Erro ao criar categoria. Verifique se o servidor está rodando.");
  }
});

// Quando trocar o filtro, redesenha a lista (sem ir ao servidor)
filtroCategoria.addEventListener("change", aplicarFiltro);

// Marca a meta como concluída
async function concluirMeta(id) {
  try {
    await fetch(`${urlMetas}/${id}`, { method: "PUT" });
    carregarMetas();
  } catch (erro) {
    console.error("Erro ao concluir a meta:", erro);
    alert("Erro ao concluir. Verifique se o servidor está rodando.");
  }
}

// Exclui a meta
async function excluirMeta(id) {
  if (!confirm("Tem certeza que deseja excluir esta meta?")) return;

  try {
    await fetch(`${urlMetas}/${id}`, { method: "DELETE" });
    carregarMetas();
  } catch (erro) {
    console.error("Erro ao excluir a meta:", erro);
    alert("Erro ao excluir. Verifique se o servidor está rodando.");
  }
}

// ===== Inicialização: categorias primeiro (pros selects), depois as metas =====
carregarCategorias();
carregarMetas();
