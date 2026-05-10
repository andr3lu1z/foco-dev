// Selecionando os elementos da tela
const formulario = document.getElementById("form-metas");
const inputNovaMeta = document.getElementById("input-nova-meta");
const listaMetas = document.getElementById("lista-metas");

// Endereço do servidor Node.js
const urlBackend = "http://localhost:3000/metas";

// Buscar as metas no Banco de Dados
async function carregarMetas() {
  try {
    const resposta = await fetch(urlBackend);
    const metas = await resposta.json();

    const total = metas.length;
    const concluidas = metas.filter((m) => m.status === "Concluída").length;
    const pendentes = metas.filter((m) => m.status === "Pendente").length;

    document.getElementById("stat-total").textContent = total;
    document.getElementById("stat-concluidas").textContent = concluidas;
    document.getElementById("stat-pendentes").textContent = pendentes;

    listaMetas.innerHTML = "";

    // Percorre cada meta recebida do banco e cria um item na lista
    metas.forEach((meta) => {
      const itemLista = document.createElement("li");

      itemLista.dataset.id = meta.id;
      itemLista.innerHTML = `
                <span>${meta.descricao}</span>
                <span class="status-badge">${meta.status}</span>
                <div class="acoes">
                    <button class="btn-concluir" onclick="concluirMeta(${meta.id})" ${meta.status === "Concluída" ? "disabled" : ""}>Concluir</button>
                    <button class="btn-excluir" onclick="excluirMeta(${meta.id})">Excluir</button>
                </div>
            `;
      listaMetas.appendChild(itemLista);
    });
  } catch (erro) {
    console.error("Erro ao buscar as metas:", erro);
  }
}

// Dispara quando clicado em "Salvar Meta"
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault(); // Impede a página de recarregar

  const textoMeta = inputNovaMeta.value;

  try {
    await fetch(urlBackend, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ descricao: textoMeta }),
    });

    inputNovaMeta.value = ""; // Limpa o campo de texto
    carregarMetas(); // Atualiza a lista na tela automaticamente
  } catch (erro) {
    console.error("Erro ao salvar:", erro);
    alert(
      "Erro ao salvar. Verifique se o servidor Node.js está rodando no terminal.",
    );
  }
});

// Envia PUT para o back-end marcando a meta como 'concluída'
async function concluirMeta(id) {
  try {
    await fetch(`${urlBackend}/${id}`, { method: "PUT" });
    carregarMetas();
  } catch (erro) {
    console.error("Erro ao concluir a meta:", erro);
    alert("Erro ao concluir. Verifique se o servidor está rodando.");
  }
}

// Envia DELETE para o back-end
async function excluirMeta(id) {
  // Confirmação evita exclusão acidental
  if (!confirm("Tem certeza que deseja excluir esta meta?")) return;

  try {
    await fetch(`${urlBackend}/${id}`, { method: "DELETE" });
    carregarMetas(); // Remove o item da tela após exclusão bem-sucedida
  } catch (erro) {
    console.error("Erro ao excluir a meta:", erro);
    alert("Erro ao excluir. Verifique se o servidor está rodando.");
  }
}

// Assim que a tela carrega, busca as metas salvas
carregarMetas();
