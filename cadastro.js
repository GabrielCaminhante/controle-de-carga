// Salvar dados no localStorage ao enviar o formulário
document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();

  const transportadora = document.getElementById("transportadora").value.trim();
  const motorista = document.getElementById("motorista").value.trim();
  const contato = document.getElementById("contato").value.trim();

  if (!transportadora || !motorista || !contato) return;

  const dados = JSON.parse(localStorage.getItem("cadastrosTransportadoras")) || {};

  if (!dados[transportadora]) {
    dados[transportadora] = [];
  }

  dados[transportadora].push({ motorista, contato });

  localStorage.setItem("cadastrosTransportadoras", JSON.stringify(dados));

  document.querySelector("form").reset();
  atualizarTabela();
});

// Função para exibir os dados na tabela
function atualizarTabela() {
  const dados = JSON.parse(localStorage.getItem("cadastrosTransportadoras")) || {};
  const container = document.getElementById("tabela-dinamica");
  container.innerHTML = "";

  for (const [transportadora, motoristas] of Object.entries(dados)) {
    const titulo = `<h3>🚚 ${transportadora}</h3>`;
    const tabela = `
      <table>
        <thead>
          <tr>
            <th>Motorista</th>
            <th>Contato</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${motoristas.map((m, index) => `
            <tr>
              <td>${m.motorista}</td>
              <td>${m.contato}</td>
              <td>
                <button onclick="removerCadastro('${transportadora}', ${index})">🗑️ Remover</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    container.innerHTML += titulo + tabela;
  }
}

function removerCadastro(transportadora, index) {
  const dados = JSON.parse(localStorage.getItem("cadastrosTransportadoras")) || {};
  if (!dados[transportadora]) return;

  dados[transportadora].splice(index, 1); // remove o motorista da lista

  // Se a transportadora ficar sem motoristas, remove ela também
  if (dados[transportadora].length === 0) {
    delete dados[transportadora];
  }

  localStorage.setItem("cadastrosTransportadoras", JSON.stringify(dados));
  atualizarTabela();
}

// Atualiza a tabela ao carregar a página
atualizarTabela();