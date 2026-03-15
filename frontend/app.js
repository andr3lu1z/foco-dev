// Selecionando os elementos da tela
const formulario = document.getElementById('form-metas');
const inputNovaMeta = document.getElementById('input-nova-meta');
const listaMetas = document.getElementById('lista-metas');

// Endereço do servidor Node.js 
const urlBackend = 'http://localhost:3000/metas';

// Buscar as metas no Banco de Dados
async function carregarMetas() {
    try {
        const resposta = await fetch(urlBackend);
        const metas = await resposta.json();
        
        // Limpa a tela antes de desenhar as metas
        listaMetas.innerHTML = '';
        
        // Percorre cada meta recebida do banco e cria um item na lista
        metas.forEach(meta => {
            const itemLista = document.createElement('li');
            itemLista.innerHTML = `
                <span>${meta.descricao}</span>
                <span class="status-badge">${meta.status}</span>
            `;
            listaMetas.appendChild(itemLista);
        });
    } catch (erro) {
        console.error('Erro ao buscar as metas:', erro);
    }
}

// Dispara quando clicado em "Salvar Meta"
formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault(); // Impede a página de recarregar 
    
    const textoMeta = inputNovaMeta.value;
    
    try {
        // Dispara o dado para o Back-end via método POST
        await fetch(urlBackend, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ descricao: textoMeta })
        });
        
        inputNovaMeta.value = ''; // Limpa o campo de texto
        carregarMetas(); // Atualiza a lista na tela automaticamente
        
    } catch (erro) {
        console.error('Erro ao salvar:', erro);
        alert('Erro ao salvar. Verifique se o servidor Node.js está rodando no terminal.');
    }
});

// Assim que a tela carrega, busca as metas salvas
carregarMetas();