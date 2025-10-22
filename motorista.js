// 🔧 Utilitários
function limparSePadrao(input) {
  if (input.value === "" || input.value === "Marcar nome") {
    input.value = "";
  }
}

// 🔄 Espelha motoristas cadastrados por transportadora
function preencherListaMotoristasPorTransportadora(transportadora, datalistElement) {
  const dados = JSON.parse(localStorage.getItem("cadastrosTransportadoras")) || {};
  datalistElement.innerHTML = "";

  const lista = dados[transportadora];
  if (!lista) return;

  lista.forEach(m => {
    const option = document.createElement("option");
    option.value = m.motorista;
    datalistElement.appendChild(option);
  });
}

// 📋 Gera tabela principal do painel do motorista
function gerarTabelaMotorista() {
  const tabelaMotorista = document.querySelector("#tabela-motorista tbody");
  tabelaMotorista.innerHTML = "";

  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal")) || {};
  const controle = estadoGlobal.controle || [];

  controle.forEach((item, i) => {
    const linha = document.createElement("tr");
    linha.dataset.numero = item.numero;

    // Estilo por status
    if (item.status === "atual") linha.classList.add("carga-atual");
    else if (item.status === "saiu") linha.classList.add("saida-realizada");
    else if (item.status === "pulou") linha.classList.add("pulou-vez");

    const textoCarga = item.numero +
      (item.status === "saiu" ? " - Carga OK" :
       item.status === "pulou" ? " - Carga Pendente" : "");

    const datalistId = `motoristas-${i}`;

    linha.innerHTML = `
      <td>${item.transportadora}</td>
      <td>
        <input type="text"
          value="${item.nome || ""}"
          list="${datalistId}"
          data-numero="${item.numero}"
          class="campo-nome"
          placeholder="Marcar nome"
          onclick="limparSePadrao(this)"
          ${item.nome ? "disabled" : ""}>
        <datalist id="${datalistId}"></datalist>
      </td>
      <td>
        <input type="time"
          value="${item.horario || ""}"
          data-numero="${item.numero}"
          class="campo-horario"
          disabled>
      </td>
      <td>${textoCarga}</td>
      <td>
        <button onclick="salvarDadosMotorista(this)" ${item.status === "saiu" ? "disabled" : ""}>
          Marcar a Vez
        </button>
        <div class="alerta-status">${item.nome ? "✅ Marcado!" : ""}</div>
      </td>
    `;

    const datalistMotoristas = linha.querySelector(`#${datalistId}`);
    preencherListaMotoristasPorTransportadora(item.transportadora, datalistMotoristas);

    tabelaMotorista.appendChild(linha);
  });
}

// ✅ Salva nome e horário no estadoGlobal
function salvarDadosMotorista(botao) {
  const linha = botao.closest("tr");
  const campoNome = linha.querySelector(".campo-nome");
  const campoHorario = linha.querySelector(".campo-horario");
  const alertaDiv = linha.querySelector(".alerta-status");
  const numero = parseInt(campoNome.dataset.numero);

  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal"));
  const item = estadoGlobal.controle.find(e => parseInt(e.numero) === numero);
  if (!item) return;

  // Desmarcar
  if (campoNome.disabled) {
    campoNome.disabled = false;
    campoNome.value = "";
    campoHorario.value = "";
    alertaDiv.textContent = "";
    item.nome = "";
    item.horario = "";
    localStorage.setItem("estadoGlobal", JSON.stringify(estadoGlobal));
    return;
  }

  // Marcar
  const nomeDigitado = campoNome.value.trim();
  if (nomeDigitado === "") {
    alert("⚠ Por favor, digite o nome do motorista.");
    return;
  }

  const horarioAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  campoNome.disabled = true;
  campoHorario.value = horarioAtual;
  item.nome = nomeDigitado;
  item.horario = horarioAtual;
  alertaDiv.textContent = "✅ Marcado!";
  localStorage.setItem("estadoGlobal", JSON.stringify(estadoGlobal));
}

// 🎨 Atualiza estilos visuais por status
function aplicarEstiloPorStatus() {
  const linhas = document.querySelectorAll("#tabela-motorista tbody tr");
  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal")) || {};

  linhas.forEach(linha => {
    linha.classList.remove("saida-realizada", "pulou-vez", "carga-atual");

    const numero = parseInt(linha.dataset.numero);
    const item = estadoGlobal.controle?.find(e => parseInt(e.numero) === numero);
    if (!item) return;

    if (item.status === "saiu") linha.classList.add("saida-realizada");
    else if (item.status === "pulou") linha.classList.add("pulou-vez");
    else if (item.status === "atual") linha.classList.add("carga-atual");
  });
}

// 📢 Exibe alertas de agendamentos do dia
function exibirAlertaCarretas() {
  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal")) || {};
  const agendamentos = estadoGlobal.agendamento || [];

  const alertaDiv = document.getElementById("alerta-carretas");
  alertaDiv.innerHTML = "";

  const hoje = new Date();
  let diaSemana = (hoje.getDay() + 6) % 7;
  const diasNomes = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
  const nomeDia = diasNomes[diaSemana];

  let encontrou = false;

  agendamentos.forEach(item => {
    const horarioHoje = item.dias?.[diaSemana];
    if (horarioHoje) {
      const alertaItem = document.createElement("div");
      alertaItem.classList.add("alerta-carreta-item");
      alertaItem.innerHTML = `
        <strong>Agendamento para transportadora:</strong> ${item.transportadora}<br>
        <strong>Hoje:</strong> ${nomeDia} às ${horarioHoje}
      `;
      alertaDiv.appendChild(alertaItem);
      encontrou = true;
    }
  });

  if (!encontrou) {
    const vazioItem = document.createElement("div");
    vazioItem.classList.add("alerta-carreta-item");
    vazioItem.textContent = "📭 Nenhuma Carga agendada para hoje.";
    alertaDiv.appendChild(vazioItem);
  }
}

// 🚀 Inicialização
document.addEventListener("DOMContentLoaded", () => {
  gerarTabelaMotorista();
  aplicarEstiloPorStatus();
  exibirAlertaCarretas();
  rolarParaCargaAtual(); // Presumo que essa função já exista
});

// 🔁 Atualiza ao voltar para a aba
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    gerarTabelaMotorista();
    aplicarEstiloPorStatus();
  }
});
