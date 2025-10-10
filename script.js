const tabelaCarregamento = document.getElementById("tabela-carregamento");

// Gera as linhas da tabela
for (let i = 1; i <= 109; i++) {
  const linha = document.createElement("tr");
  linha.dataset.numero = i;

  linha.innerHTML = `
    <td><input type="date"></td>
    <td><input type="text" value="Transportadora"></td>
    <td><input type="text" value="Nome"></td>
    <td><input type="time"></td>
    <td class="numero-carga">${i}</td>
    <td>
      <button onclick="marcarSaida(this)">Saiu</button>
      <button onclick="pularCarga(this)">Pular</button>
    </td>
  `;

  tabelaCarregamento.appendChild(linha);
}

// Inicia com a carga 1 como atual
atualizarCargaAtual(1);

// Função para marcar saída
function marcarSaida(botao) {
  const linha = botao.closest("tr");
  const numeroLinha = parseInt(linha.dataset.numero);

  if (!linha.classList.contains("carga-atual") && !linha.classList.contains("pulou-vez")) return;

  const confirmar = confirm("⚠ Atenção!\nAo confirmar, esta linha será travada e não poderá ser editada até o reset da lista.\nDeseja continuar?");
  if (!confirmar) return;

  linha.classList.add("saida-realizada");
  linha.classList.remove("carga-atual", "pulou-vez");
  removerAlerta(linha);
  desativarLinha(linha);

  atualizarCargaAtual(numeroLinha + 1);
}

// Função para pular carga
function pularCarga(botao) {
  const linha = botao.closest("tr");
  const numeroLinha = parseInt(linha.dataset.numero);

  if (!linha.classList.contains("carga-atual")) return;

  const confirmar = confirm("⚠ Atenção!\nEsta carga será marcada como PENDENTE.\nDeseja continuar?");
  if (!confirmar) return; // Se cancelar, nada acontece

  linha.classList.add("pulou-vez");
  linha.classList.remove("carga-atual", "saida-realizada");
  adicionarAlerta(linha);

  atualizarCargaAtual(numeroLinha + 1);
}

// Atualiza o marcador de carga atual
function atualizarCargaAtual(numero) {
  document.querySelectorAll(".carga-atual").forEach(el => el.classList.remove("carga-atual"));

  const linhas = [...tabelaCarregamento.rows];
  let proxima = numero;

  while (proxima <= linhas.length) {
    const linha = linhas.find(row => parseInt(row.dataset.numero) === proxima);
    if (linha && !linha.classList.contains("saida-realizada")) {
      linha.classList.add("carga-atual");
      aplicarRegrasDeBloqueio(proxima);
      return;
    }
    proxima++;
  }

  // Se não encontrar nenhuma linha válida, remove marcador
  aplicarRegrasDeBloqueio(-1);
}

// Aplica regras de bloqueio e ativação de botões
function aplicarRegrasDeBloqueio(numeroAtual) {
  const linhas = [...tabelaCarregamento.rows];

  linhas.forEach(linha => {
    const numeroLinha = parseInt(linha.dataset.numero);
    const botoes = linha.querySelectorAll("button");
    const inputs = linha.querySelectorAll("input");

    if (numeroLinha < numeroAtual) {
      if (linha.classList.contains("saida-realizada")) {
        // Linha verde: bloqueada
        botoes.forEach(btn => btn.disabled = true);
        inputs.forEach(input => input.disabled = true);
      } else if (linha.classList.contains("pulou-vez")) {
        // Linha vermelha: ainda pode ser editada
        botoes.forEach(btn => btn.disabled = false);
        inputs.forEach(input => input.disabled = false);
      }
    } else if (numeroLinha === numeroAtual) {
      // Linha atual: ativa
      botoes.forEach(btn => btn.disabled = false);
      inputs.forEach(input => input.disabled = false);
    } else {
      // Linhas abaixo do marcador: bloqueadas
      botoes.forEach(btn => btn.disabled = true);
      inputs.forEach(input => input.disabled = true);
    }
  });
}

// Desativa botões e inputs da linha
function desativarLinha(linha) {
  linha.querySelectorAll("button").forEach(btn => btn.disabled = true);
  linha.querySelectorAll("input").forEach(input => input.disabled = true);
}

// Adiciona alerta visual
function adicionarAlerta(linha) {
  removerAlerta(linha);
  const celulas = linha.querySelectorAll("td");
  const aviso = document.createElement("div");
  aviso.className = "alerta-pulou";
  aviso.textContent = "⚠ Pendência";
  celulas[celulas.length - 1].appendChild(aviso);
}

// Remove alerta visual
function removerAlerta(linha) {
  const alerta = linha.querySelector(".alerta-pulou");
  if (alerta) alerta.remove();
}
