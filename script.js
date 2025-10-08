// TABELA DE CONTROLE DE CARGAS
const tabelaCarregamento = document.getElementById("tabela-carregamento");

for (let i = 1; i <= 109; i++) {
  const linha = document.createElement("tr");

  // Se for a primeira linha (Carga 1), adiciona classe "linha-fixa"
  if (i === 1) {
    linha.classList.add("linha-fixa");
  }

  linha.innerHTML = `
    <td><input type="date" value="00-00-0000"></td>
    <td><input type="text" value="Transportadora"></td>
    <td><input type="text" value="Nome"></td>
    <td><input type="time" value="00:00"></td>
    <td class="numero-carga">${i}</td>
    <td>
      <button onclick="marcarSaida(this)">Saiu</button>
    </td>
  `;

  tabelaCarregamento.appendChild(linha);
}

function marcarSaida(botao) {
  const linhaAtual = botao.closest("tr");
  linhaAtual.classList.remove("pulou-vez", "carga-atual");
  linhaAtual.classList.add("saida-realizada");

  // Remove marcador anterior
  document.querySelectorAll(".carga-atual").forEach(el => {
    el.classList.remove("carga-atual");
  });

  // Remove alerta se existia
  const alertaExistente = linhaAtual.querySelector(".alerta-pulou");
  if (alertaExistente) alertaExistente.remove();

  // Identifica a próxima linha não marcada
  let proxima = linhaAtual.nextElementSibling;
  while (proxima && proxima.classList.contains("saida-realizada")) {
    proxima = proxima.nextElementSibling;
  }

  // Marca a próxima como carga atual
  if (proxima) {
    proxima.classList.add("carga-atual");

    // Verifica todas as linhas acima da nova carga atual
    let anterior = proxima.previousElementSibling;
    while (anterior) {
      if (!anterior.classList.contains("saida-realizada")) {
        anterior.classList.add("pulou-vez");

        // Remove alerta antigo se houver
        const alertaAntigo = anterior.querySelector(".alerta-pulou");
        if (alertaAntigo) alertaAntigo.remove();

        // Adiciona alerta visual
        const celulas = anterior.querySelectorAll("td");
        if (celulas.length > 0) {
          const aviso = document.createElement("div");
          aviso.className = "alerta-pulou";
          aviso.textContent = "⚠ Pulou a vez";
          celulas[celulas.length - 1].appendChild(aviso);
        }
      }
      anterior = anterior.previousElementSibling;
    }
  }
}



