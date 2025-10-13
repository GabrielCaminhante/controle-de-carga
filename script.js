const tabelaCarregamento = document.getElementById("tabela-carregamento"); // Seleciona o corpo da tabela de cargas

// 🔁 Gera 109 linhas na tabela de carregamento
for (let i = 1; i <= 109; i++) {
  const linha = document.createElement("tr"); // Cria uma nova linha
  linha.dataset.numero = i; // Atribui número da carga como atributo personalizado

  linha.innerHTML = `
    <td><input type="date"></td> <!-- Campo de data -->
    <td><input type="text" value="Transportadora" class="campo-transportadora" disabled></td> <!-- Nome da transportadora (bloqueado) -->
    <td><input type="text" value="Nome"></td> <!-- Nome do motorista -->
    <td><input type="time"></td> <!-- Horário de saída -->
    <td class="numero-carga">${i}</td> <!-- Número da carga -->
    <td>
      <button onclick="marcarSaida(this)">Saiu</button> <!-- Botão para marcar saída -->
      <button onclick="pularCarga(this)">Pular</button> <!-- Botão para pular carga -->
    </td>
  `;

  tabelaCarregamento.appendChild(linha); // Adiciona a linha à tabela
}

// 🔁 Restaura estado salvo da tabela de cargas
restaurarEstadoTabela();

// 🔁 Restaura transportadoras salvas
restaurarTransportadoras();

// 🔄 Define a primeira carga como atual
atualizarCargaAtual(1);

// ✏️ Libera edição dos campos de transportadora
function habilitarEdicaoTransportadoras() {
  document.querySelectorAll(".campo-transportadora").forEach(input => {
    input.disabled = false; // Habilita campo para edição
  });
}

// 💾 Salva os nomes das transportadoras
function salvarTransportadoras() {
  const nomes = []; // Array para armazenar os nomes

  document.querySelectorAll(".campo-transportadora").forEach(input => {
    input.disabled = true; // Bloqueia campo após salvar
    nomes.push(input.value); // Adiciona valor ao array
  });

  localStorage.setItem("transportadorasSalvas", JSON.stringify(nomes)); // Salva no localStorage
  alert("✅ Transportadoras salvas com sucesso!"); // Mensagem de confirmação
}

// 🔁 Restaura os nomes das transportadoras salvos
function restaurarTransportadoras() {
  const nomesSalvos = JSON.parse(localStorage.getItem("transportadorasSalvas")); // Recupera do localStorage
  if (!nomesSalvos) return; // Se não houver dados, encerra

  const campos = document.querySelectorAll(".campo-transportadora"); // Seleciona todos os campos
  nomesSalvos.forEach((nome, index) => {
    if (campos[index]) {
      campos[index].value = nome; // Preenche campo
      campos[index].disabled = true; // Mantém bloqueado
    }
  });
}

// 📦 Salva os dados da tabela de agendamento semanal
function agendarCarregamentoCarretas() {
  const estado = []; // Array para armazenar os dados

  document.querySelectorAll("#tabela-agendamento-semanal tbody tr").forEach(linha => {
    const transportadora = linha.querySelector('.campo-transportadora').value; // Nome da transportadora
    const horarios = Array.from(linha.querySelectorAll('input[type="time"]')).map(input => input.value); // Horários da semana

    estado.push({ transportadora, horarios }); // Adiciona ao array
  });

  localStorage.setItem("estadoAgendamentoSemanal", JSON.stringify(estado)); // Salva no localStorage
  alert("✅ Carregamento das carretas agendado com sucesso!"); // Mensagem de confirmação
}

// 🔁 Restaura os dados da tabela de agendamento semanal
function restaurarEstadoAgendamentoSemanal() {
  const estadoSalvo = JSON.parse(localStorage.getItem("estadoAgendamentoSemanal")); // Recupera do localStorage
  if (!estadoSalvo) return; // Se não houver dados, encerra

  const linhas = document.querySelectorAll("#tabela-agendamento-semanal tbody tr"); // Seleciona todas as linhas

  estadoSalvo.forEach((item, index) => {
    const linha = linhas[index];
    if (!linha) return;

    linha.querySelector('.campo-transportadora').value = item.transportadora; // Preenche nome
    const horarios = linha.querySelectorAll('input[type="time"]'); // Seleciona campos de horário

    item.horarios.forEach((hora, i) => {
      if (horarios[i]) horarios[i].value = hora; // Preenche horário
    });
  });
}

// ✅ Marca a carga como saída realizada
function marcarSaida(botao) {
  const linha = botao.closest("tr"); // Encontra a linha do botão
  const numeroLinha = parseInt(linha.dataset.numero); // Número da carga

  if (!linha.classList.contains("carga-atual") && !linha.classList.contains("pulou-vez")) return; // Só permite se for atual ou pendente

  const confirmar = confirm("⚠ Atenção!\nAo confirmar, esta linha será travada e não poderá ser editada até o reset da lista.\nDeseja continuar?");
  if (!confirmar) return;

  linha.classList.add("saida-realizada"); // Aplica estilo de saída
  linha.classList.remove("carga-atual", "pulou-vez"); // Remove outros estilos

  adicionarAlertaSaida(linha); // Adiciona alerta visual
  desativarLinha(linha); // Bloqueia campos e botões
  atualizarCargaAtual(numeroLinha + 1); // Avança para próxima carga
  salvarEstadoTabela(); // Salva estado atualizado
}

// ⚠ Marca a carga como pendente (pulou vez)
function pularCarga(botao) {
  const linha = botao.closest("tr"); // Encontra a linha do botão
  const numeroLinha = parseInt(linha.dataset.numero); // Número da carga

  if (!linha.classList.contains("carga-atual")) return; // Só permite se for carga atual

  const confirmar = confirm("⚠ Atenção!\nEsta carga será marcada como PENDENTE.\nDeseja continuar?");
  if (!confirmar) return;

  linha.classList.add("pulou-vez"); // Aplica estilo de pendência
  linha.classList.remove("carga-atual", "saida-realizada"); // Remove outros estilos

  adicionarAlerta(linha); // Adiciona alerta visual
  atualizarCargaAtual(numeroLinha + 1); // Avança para próxima carga
  salvarEstadoTabela(); // Salva estado atualizado
}

// 🔄 Atualiza a linha marcada como carga atual
function atualizarCargaAtual(numero) {
  document.querySelectorAll(".carga-atual").forEach(el => el.classList.remove("carga-atual")); // Remove marcação anterior

  const linhas = [...tabelaCarregamento.rows]; // Todas as linhas da tabela
  let proxima = numero;

  while (proxima <= linhas.length) {
    const linha = linhas.find(row => parseInt(row.dataset.numero) === proxima);
    if (linha && !linha.classList.contains("saida-realizada")) {
      linha.classList.add("carga-atual"); // Marca como atual
      aplicarRegrasDeBloqueio(proxima); // Aplica regras de edição
      salvarEstadoTabela(); // Salva estado
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
    aplicarRegrasDeBloqueio(-1); // Nenhuma disponível
    alert("✅ Todas as cargas foram finalizadas. Reiniciando do início...");
    atualizarCargaAtual(1); // Reinicia do começo
  }
}
// 🔒 Aplica regras de bloqueio para inputs e botões com base na carga atual
function aplicarRegrasDeBloqueio(numeroAtual) {
  const linhas = [...tabelaCarregamento.rows]; // Todas as linhas da tabela

  linhas.forEach(linha => {
    const numeroLinha = parseInt(linha.dataset.numero); // Número da linha
    const botoes = linha.querySelectorAll("button"); // Botões da linha
    const inputs = linha.querySelectorAll("input:not(.campo-transportadora)"); // Inputs editáveis

    if (numeroLinha < numeroAtual) {
      if (linha.classList.contains("saida-realizada")) {
        botoes.forEach(btn => btn.disabled = true); // Desativa botões
        inputs.forEach(input => input.disabled = true); // Desativa inputs
      } else if (linha.classList.contains("pulou-vez")) {
        botoes.forEach(btn => btn.disabled = false); // Permite edição
        inputs.forEach(input => input.disabled = false);
      }
    } else if (numeroLinha === numeroAtual) {
      botoes.forEach(btn => btn.disabled = false); // Linha atual: tudo liberado
      inputs.forEach(input => input.disabled = false);
    } else {
      botoes.forEach(btn => btn.disabled = true); // Futuras: bloqueadas
      inputs.forEach(input => input.disabled = true);
    }
  });
}

// 🚫 Desativa todos os campos e botões da linha
function desativarLinha(linha) {
  linha.querySelectorAll("button").forEach(btn => btn.disabled = true);
  linha.querySelectorAll("input:not(.campo-transportadora)").forEach(input => input.disabled = true);
}

// ⚠ Adiciona alerta visual de pendência
function adicionarAlerta(linha) {
  removerAlerta(linha); // Remove alertas anteriores
  const celulas = linha.querySelectorAll("td");
  const aviso = document.createElement("div");
  aviso.className = "alerta-pulou";
  aviso.textContent = "⚠ Carga com Pendência";
  celulas[celulas.length - 1].appendChild(aviso); // Insere no final da linha
}

// ✅ Adiciona alerta visual de saída realizada
function adicionarAlertaSaida(linha) {
  removerAlerta(linha); // Remove alertas anteriores
  const celulas = linha.querySelectorAll("td");
  const aviso = document.createElement("div");
  aviso.className = "alerta-saida";
  aviso.textContent = "✅ Carga OK";
  celulas[celulas.length - 1].appendChild(aviso); // Insere no final da linha
}

// 🧹 Remove alertas visuais da linha
function removerAlerta(linha) {
  const alertaPulou = linha.querySelector(".alerta-pulou");
  const alertaSaida = linha.querySelector(".alerta-saida");
  if (alertaPulou) alertaPulou.remove();
  if (alertaSaida) alertaSaida.remove();
}

// 💾 Salva o estado completo da tabela de carregamento no localStorage
function salvarEstadoTabela() {
  const estado = [];

  tabelaCarregamento.querySelectorAll("tr").forEach(linha => {
    const numero = linha.dataset.numero;
    const data = linha.querySelector('input[type="date"]').value;
    const transportadora = linha.querySelector('.campo-transportadora').value;
    const nome = linha.querySelectorAll('input[type="text"]')[1].value;
    const horario = linha.querySelector('input[type="time"]').value;

    const status = linha.classList.contains("saida-realizada") ? "saiu" :
                   linha.classList.contains("pulou-vez") ? "pulou" :
                   linha.classList.contains("carga-atual") ? "atual" : "";

    estado.push({ numero, data, transportadora, nome, horario, status });
  });

  localStorage.setItem("estadoTabela", JSON.stringify(estado)); // Salva no navegador
}

// 🔁 Restaura o estado completo da tabela de carregamento
function restaurarEstadoTabela() {
  const estadoSalvo = JSON.parse(localStorage.getItem("estadoTabela"));
  if (!estadoSalvo) return;

  estadoSalvo.forEach(item => {
    const linha = tabelaCarregamento.querySelector(`tr[data-numero="${item.numero}"]`);
    if (!linha) return;

    linha.querySelector('input[type="date"]').value = item.data;
    linha.querySelector('.campo-transportadora').value = item.transportadora;
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

// 🔄 Reset total da tabela de carregamento (mantém transportadoras salvas)
function resetarTabela() {
  const confirmar = confirm("⚠ Isso irá limpar todos os dados preenchidos e reiniciar a tabela.\nDeseja continuar?");
  if (!confirmar) return;

  tabelaCarregamento.querySelectorAll("tr").forEach((linha, index) => {
    linha.classList.remove("saida-realizada", "pulou-vez", "carga-atual");
    removerAlerta(linha);

    linha.querySelector('input[type="date"]').value = "";
    linha.querySelectorAll('input[type="text"]')[1].value = "Nome"; // campo nome
    linha.querySelector('input[type="time"]').value = "";

    linha.querySelectorAll("input").forEach(input => {
      if (!input.classList.contains("campo-transportadora")) {
        input.disabled = false;
      }
    });

    linha.querySelectorAll("button").forEach(btn => btn.disabled = false);
  });

  restaurarTransportadoras(); // Mantém transportadoras salvas
  localStorage.removeItem("estadoTabela"); // Limpa estado da tabela
  atualizarCargaAtual(1); // Reinicia a carga atual
}

// 🚀 Restaura agendamento semanal ao carregar a página
window.addEventListener("DOMContentLoaded", () => {
  restaurarEstadoAgendamentoSemanal(); // Restaura horários da segunda tabela
});
