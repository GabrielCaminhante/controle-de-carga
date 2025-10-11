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

restaurarEstadoTabela();
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

  adicionarAlertaSaida(linha);
  desativarLinha(linha);
  atualizarCargaAtual(numeroLinha + 1);
  salvarEstadoTabela();
}

// Função para pular carga
function pularCarga(botao) {
  const linha = botao.closest("tr");
  const numeroLinha = parseInt(linha.dataset.numero);

  if (!linha.classList.contains("carga-atual")) return;

  const confirmar = confirm("⚠ Atenção!\nEsta carga será marcada como PENDENTE.\nDeseja continuar?");
  if (!confirmar) return;

  linha.classList.add("pulou-vez");
  linha.classList.remove("carga-atual", "saida-realizada");

  adicionarAlerta(linha);
  atualizarCargaAtual(numeroLinha + 1);
  salvarEstadoTabela();
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
      salvarEstadoTabela();
      return;
    }
    proxima++;
  }

  const primeiraDisponivel = linhas.find(row => !row.classList.contains("saida-realizada"));
  if (primeiraDisponivel) {
    const numeroInicial = parseInt(primeiraDisponivel.dataset.numero);
    primeiraDisponivel.classList.add("carga-atual");
    aplicarRegrasDeBloqueio(numeroInicial);
    salvarEstadoTabela();
  } else {
    aplicarRegrasDeBloqueio(-1);
    alert("✅ Todas as cargas foram finalizadas. Reiniciando do início...");
    atualizarCargaAtual(1);
  }
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
        botoes.forEach(btn => btn.disabled = true);
        inputs.forEach(input => input.disabled = true);
      } else if (linha.classList.contains("pulou-vez")) {
        botoes.forEach(btn => btn.disabled = false);
        inputs.forEach(input => input.disabled = false);
      }
    } else if (numeroLinha === numeroAtual) {
      botoes.forEach(btn => btn.disabled = false);
      inputs.forEach(input => input.disabled = false);
    } else {
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

// Adiciona alerta visual para carga pulada
function adicionarAlerta(linha) {
  removerAlerta(linha);
  const celulas = linha.querySelectorAll("td");
  const aviso = document.createElement("div");
  aviso.className = "alerta-pulou";
  aviso.textContent = "⚠ Carga com Pendência";
  celulas[celulas.length - 1].appendChild(aviso);
}

// Adiciona alerta visual para carga finalizada
function adicionarAlertaSaida(linha) {
  removerAlerta(linha);
  const celulas = linha.querySelectorAll("td");
  const aviso = document.createElement("div");
  aviso.className = "alerta-saida";
  aviso.textContent = "✅ Carga OK";
  celulas[celulas.length - 1].appendChild(aviso);
}

// Remove qualquer alerta visual
function removerAlerta(linha) {
  const alertaPulou = linha.querySelector(".alerta-pulou");
  const alertaSaida = linha.querySelector(".alerta-saida");
  if (alertaPulou) alertaPulou.remove();
  if (alertaSaida) alertaSaida.remove();
}

// Salva o estado da tabela no localStorage
function salvarEstadoTabela() {
  const estado = [];

  tabelaCarregamento.querySelectorAll("tr").forEach(linha => {
    const numero = linha.dataset.numero;
    const data = linha.querySelector('input[type="date"]').value;
    const transportadora = linha.querySelectorAll('input[type="text"]')[0].value;
    const nome = linha.querySelectorAll('input[type="text"]')[1].value;
    const horario = linha.querySelector('input[type="time"]').value;
    const status = linha.classList.contains("saida-realizada") ? "saiu" :
                   linha.classList.contains("pulou-vez") ? "pulou" :
                   linha.classList.contains("carga-atual") ? "atual" : "";

    estado.push({ numero, data, transportadora, nome, horario, status });
  });

  localStorage.setItem("estadoTabela", JSON.stringify(estado));
}

// Restaura o estado salvo da tabela
function restaurarEstadoTabela() {
  const estadoSalvo = JSON.parse(localStorage.getItem("estadoTabela"));
  if (!estadoSalvo) return;

  estadoSalvo.forEach(item => {
    const linha = tabelaCarregamento.querySelector(`tr[data-numero="${item.numero}"]`);
    if (!linha) return;

    linha.querySelector('input[type="date"]').value = item.data;
    linha.querySelectorAll('input[type="text"]')[0].value = item.transportadora;
    linha.querySelectorAll('input[type="text"]')[1].value = item.nome;
    linha.querySelector('input[type="time"]').value = item.horario;

    linha.classList.remove("saida-realizada", "pulou-vez", "carga-atual");
    removerAlerta(linha);

    if (item.status === "saiu") {
      linha.classList.add("saida-realizada");
      adicionarAlertaSaida(linha);
      desativarLinha(linha);
    } else if (item.status === "pulou") {
      linha.classList.add("pulou-vez");
      adicionarAlerta(linha);
    } else if (item.status === "atual") {
      linha.classList.add("carga-atual");
    }
  });

  const atual = estadoSalvo.find(e => e.status === "atual");
  aplicarRegrasDeBloqueio(atual ? parseInt(atual.numero) : -1);
}

// Botão de reset manual
function resetarTabela() {
  const confirmar = confirm("⚠ Isso irá limpar todos os dados preenchidos e reiniciar a tabela.\nDeseja continuar?");
  if (!confirmar) return;

  tabelaCarregamento.querySelectorAll("tr").forEach(linha => {
    // Remove classes de status
    linha.classList.remove("saida-realizada", "pulou-vez", "carga-atual");

    // Remove alertas visuais
    removerAlerta(linha);

    // Restaura valores padrão
    linha.querySelector('input[type="date"]').value = "";
    linha.querySelectorAll('input[type="text"]')[0].value = "Transportadora";
    linha.querySelectorAll('input[type="text"]')[1].value = "Nome";
    linha.querySelector('input[type="time"]').value = "";

    // Reativa inputs e botões
    linha.querySelectorAll("input").forEach(input => input.disabled = false);
    linha.querySelectorAll("button").forEach(btn => btn.disabled = false);
  });

  // Limpa o armazenamento local
  localStorage.removeItem("estadoTabela");

  // Reinicia a carga atual
  atualizarCargaAtual(1);
}
