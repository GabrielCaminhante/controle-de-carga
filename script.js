// TABELA DE CONTROLE DE CARGAS
const tabelaCarregamento = document.getElementById("tabela-carregamento");

for (let i = 1; i <= 109; i++) {
  const linha = document.createElement("tr");

  // Se for a primeira linha (Carga 1), adiciona classe "linha-fixa"
  if (i === 1) {
    linha.classList.add("linha-fixa");
  }

  linha.innerHTML = `
    <td><input type="date" value="2025-10-07"></td>
    <td><input type="text" value="Cliente ${i}"></td>
    <td><input type="text" value="Motorista ${i}"></td>
    <td><input type="time" value="08:00"></td>
    <td class="numero-carga">${i}</td>
    <td>
      <button onclick="marcarSaida(this)">Saiu</button>
      <button onclick="pularVez(this)">Pulou</button>
    </td>
  `;

  tabelaCarregamento.appendChild(linha);
}

function marcarSaida(botao) {
  const linha = botao.closest("tr");
  linha.classList.remove("pulou-vez");
  linha.classList.toggle("saida-realizada");
}

function pularVez(botao) {
  const linha = botao.closest("tr");
  linha.classList.remove("saida-realizada");
  linha.classList.toggle("pulou-vez");
}

// TABELA SEMANAL POR DIAS DA SEMANA
const tabelaSemanal = document.getElementById("tabela-semanal");

for (let i = 1; i <= 10; i++) {
  const linha = document.createElement("tr");

  linha.innerHTML = `
    <td><input type="text" placeholder="Segunda"></td>
    <td><input type="text" placeholder="Terça"></td>
    <td><input type="text" placeholder="Quarta"></td>
    <td><input type="text" placeholder="Quinta"></td>
    <td><input type="text" placeholder="Sexta"></td>
    <td><input type="text" placeholder="Sábado"></td>
    <td><input type="text" placeholder="Domingo"></td>
  `;

  tabelaSemanal.appendChild(linha);
}