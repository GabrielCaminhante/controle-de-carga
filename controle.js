// 🔃 Variáveis globais
let linhasAgendamentoControle = [];
const tabelaCarregamento = document.getElementById("tabela-carregamento");

//
// 📦 Geração da Tabela de Controle de Cargas
//
function gerarTabelaControleDeCargas() {
  tabelaCarregamento.innerHTML = "";

  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal")) || {};
  const dados = estadoGlobal.cargas || [];
  const controleSalvo = Array.isArray(estadoGlobal.controle) ? estadoGlobal.controle : [];

  estadoGlobal.controle = dados.map((item, i) => {
    const existente = controleSalvo[i] || {};
    return {
      numero: i + 1,
      transportadora: item.transportadora || "",
      nome: existente.nome || "",
      horario: existente.horario || "",
      status: existente.status || "",
      data: existente.data || ""
    };
  });

  dados.forEach((item, i) => {
    const linha = document.createElement("tr");
    linha.dataset.numero = i + 1;

    const existente = estadoGlobal.controle[i];
    const datalistId = `motoristas-${i}`;

    linha.innerHTML = `
      <td><input type="date" value="${existente.data || ""}"></td>
      <td><input type="text" value="${item.transportadora}" disabled></td>
      <td>
        <input type="text" list="${datalistId}" placeholder="Nome Motorista" value="${existente.nome || ""}">
        <datalist id="${datalistId}"></datalist>
      </td>
      <td><input type="time" value="${existente.horario || ""}"></td>
      <td class="numero-carga">${i + 1}</td>
      <td>
        <button onclick="marcarSaida(this)">Saiu</button>
        <button onclick="pularCarga(this)">Pular</button>
      </td>
    `;

    const datalistMotoristas = linha.querySelector(`#${datalistId}`);
    preencherListaMotoristasPorTransportadora(item.transportadora, datalistMotoristas);

    tabelaCarregamento.appendChild(linha);
  });

  localStorage.setItem("estadoGlobal", JSON.stringify(estadoGlobal));
}

//
// 👥 Preenche motoristas vinculados à transportadora
//
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

//
// ✅ Marcar saída da carga
//
function marcarSaida(botao) {
  const linha = botao.closest("tr");
  const numero = parseInt(linha.dataset.numero);
  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal"));

  if (!linha.classList.contains("carga-atual") && !linha.classList.contains("pulou-vez")) return;
  if (!confirm("⚠ Confirmar saída da carga?")) return;

  const campoData = linha.querySelector('input[type="date"]');
  const campoNome = linha.querySelectorAll('input[type="text"]')[1];
  const campoHorario = linha.querySelector('input[type="time"]');

  const data = campoData?.value?.trim();
  const nome = campoNome?.value?.trim();
  const horario = campoHorario?.value?.trim();

  if (!data || !nome || !horario) {
    alert("⚠ Para marcar como 'Saiu', é obrigatório preencher: Data, Nome do Motorista e Horário de Saída.");
    return;
  }

  salvarAcao(linha, botao);

  linha.classList.add("saida-realizada");
  linha.classList.remove("carga-atual", "pulou-vez");
  desativarLinha(linha);
  adicionarAlerta(linha, "✅ Carga OK");

  estadoGlobal.controle[numero - 1] = {
    ...estadoGlobal.controle[numero - 1],
    status: "saiu",
    nome,
    horario,
    data
  };

  localStorage.setItem("estadoGlobal", JSON.stringify(estadoGlobal));

  const pendente = estadoGlobal.controle.find(item =>
    item.status === "pulou" &&
    !document.querySelector(`tr[data-numero="${item.numero}"]`).classList.contains("saida-realizada")
  );

  const destino = pendente ? pendente.numero : numero + 1;
  atualizarCargaAtual(destino);
  rolarParaCargaAtual();
}

//
// ⏭ Pular carga atual
//
function pularCarga(botao) {
  const linha = botao.closest("tr");
  const numero = parseInt(linha.dataset.numero);
  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal"));

  if (!linha.classList.contains("carga-atual")) return;
  if (!confirm("⚠ Marcar carga como pendente?")) return;

  salvarAcao(linha);

  linha.classList.add("pulou-vez");
  linha.classList.remove("carga-atual", "saida-realizada");
  adicionarAlerta(linha, "⚠ Carga com Pendência");

  estadoGlobal.controle[numero - 1].status = "pulou";
  localStorage.setItem("estadoGlobal", JSON.stringify(estadoGlobal));

  atualizarCargaAtual(numero + 1);
  rolarParaCargaAtual();
}

//
// 💾 Salva dados da linha
//
function salvarAcao(linha, botao) {
  const numero = parseInt(linha.dataset.numero);
  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal"));
  const item = estadoGlobal.controle[numero - 1];

  const campoData = linha.querySelector('input[type="date"]');
  const campoNome = linha.querySelectorAll('input[type="text"]')[1];
  const campoHorario = linha.querySelector('input[type="time"]');

  const data = campoData?.value?.trim();
  const nome = campoNome?.value?.trim();
  const horario = campoHorario?.value?.trim();

  if (botao && botao.textContent === "Saiu") {
    if (!data || !nome || !horario) {
      alert("⚠ Para marcar como 'Saiu', é obrigatório preencher: Data, Nome do Motorista e Horário de Saída.");
      return;
    }
  }

  item.data = data;
  item.nome = nome;
  item.horario = horario;

  localStorage.setItem("estadoGlobal", JSON.stringify(estadoGlobal));
}

//
// 🔄 Atualiza carga atual
//
function atualizarCargaAtual(numero) {
  document.querySelectorAll(".carga-atual").forEach(el => el.classList.remove("carga-atual"));

  const linhas = [...tabelaCarregamento.rows];
  let proxima = numero;

  while (proxima <= linhas.length) {
    const linha = linhas.find(row => parseInt(row.dataset.numero) === proxima);
    if (linha && !linha.classList.contains("saida-realizada")) {
      linha.classList.add("carga-atual");
      aplicarRegrasDeBloqueio(proxima);
      atualizarStatusGlobal(proxima, "atual");
      return;
    }
    proxima++;
  }

  alert("✅ Todas as cargas finalizadas.");
}

function aplicarRegrasDeBloqueio(numeroAtual) {
  const linhas = [...tabelaCarregamento.rows];
  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal"));

  linhas.forEach(linha => {
    const numeroLinha = parseInt(linha.dataset.numero);
    const botoes = linha.querySelectorAll("button");
    const inputs = linha.querySelectorAll("input:not([disabled])");

    const item = estadoGlobal.controle[numeroLinha - 1];
    const ativa = numeroLinha === numeroAtual || item.status === "pulou";

    botoes.forEach(btn => btn.disabled = !ativa);
    inputs.forEach(input => input.disabled = !ativa);
  });
}

function atualizarStatusGlobal(numero, status) {
  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal"));
  estadoGlobal.controle.forEach(item => {
    item.status = item.numero === numero ? status : item.status === "atual" ? "" : item.status;
  });
  localStorage.setItem("estadoGlobal", JSON.stringify(estadoGlobal));
}

function abrirPainelMotorista() {
  window.open("motorista.html", "painelMotorista");
}

function abrirPainelCadastro() {
  window.open("cadastro.html", "PainelCadastro");
}

function desativarLinha(linha) {
  linha.querySelectorAll("button").forEach(btn => btn.disabled = true);
  linha.querySelectorAll("input").forEach(input => input.disabled = true);
}

function adicionarAlerta(linha, texto) {
  removerAlerta(linha);
  const celula = linha.querySelector("td:last-child");
  const alerta = document.createElement("div");
  alerta.className = "alerta-status";
  alerta.textContent = texto;
  celula.appendChild(alerta);
}

function removerAlerta(linha) {
  const alerta = linha.querySelector(".alerta-status");
  if (alerta) alerta.remove();
}

function rolarParaCargaAtual() {
  const linhaAtual = document.querySelector(".carga-atual");
  if (linhaAtual) {
    linhaAtual.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function restaurarEstadoControleDeCargas() {
  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal")) || {};
  const controle = estadoGlobal.controle || [];

  controle.forEach(item => {
    const linha = tabelaCarregamento.querySelector(`tr[data-numero="${item.numero}"]`);
    if (!linha) return;

    linha.querySelector('input[type="date"]').value = item.data || "";
    linha.querySelectorAll('input[type="text"]')[1].value = item.nome || "";
    linha.querySelector('input[type="time"]').value = item.horario || "";

    linha.classList.remove("saida-realizada", "pulou-vez", "carga-atual");
    removerAlerta(linha);

    if (item.status === "saiu") {
      linha.classList.add("saida-realizada");
      adicionarAlerta(linha, "✅ Carga OK");
      desativarLinha(linha);
    } else if (item.status === "pulou") {
      linha.classList.add("pulou-vez");
      adicionarAlerta(linha, "⚠ Carga com Pendência");
    }
  });

  const atual = controle.find(e => e.status === "atual");
  if (atual) {
    atualizarCargaAtual(atual.numero);
  }
}
async function resetarTabelaControleDeCargas() {
  const senhaCorreta = "portaria03";

  const confirmacao = confirm("⚠ Tem certeza que deseja resetar a tabela?\nIsso vai reiniciar a lista e limpar os dados dos motoristas.");
  if (!confirmacao) return;

  const senhaDigitada = prompt("🔐 Digite a senha para confirmar o reset:");
  if (senhaDigitada !== senhaCorreta) {
    alert("❌ Senha incorreta. O reset foi cancelado.");
    return;
  }

  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal")) || {};
  const controle = estadoGlobal.controle || [];

  controle.forEach((item, index) => {
    item.status = index === 0 ? "atual" : "";
    item.nome = "";
    item.horario = "";
    item.data = "";
  });

  localStorage.setItem("estadoGlobal", JSON.stringify(estadoGlobal));
  restaurarEstadoControleDeCargas();
  rolarParaCargaAtual();

  alert("✅ Tabela e painel do motorista foram resetados com sucesso.");
}
function preencherTabelaAgendamentoSemanal() {
  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal")) || {};
  const agendamento = Array.isArray(estadoGlobal.agendamento) ? estadoGlobal.agendamento : [];

  linhasAgendamentoControle = agendamento.map(item => ({
    transportadora: item.transportadora || "",
    dias: Array.isArray(item.dias) && item.dias.length === 7 ? item.dias : Array(7).fill("")
  }));

  const tbody = document.querySelector("#tabela-agendamento-semanal tbody");
  tbody.innerHTML = "";

  linhasAgendamentoControle.forEach((linha) => {
    const tr = document.createElement("tr");

    const tdTransportadora = document.createElement("td");
    const inputTransportadora = document.createElement("input");
    inputTransportadora.type = "text";
    inputTransportadora.value = linha.transportadora;
    inputTransportadora.disabled = true;
    tdTransportadora.appendChild(inputTransportadora);
    tr.appendChild(tdTransportadora);

    for (let i = 0; i < 7; i++) {
      const tdDia = document.createElement("td");
      const inputHora = document.createElement("input");
      inputHora.type = "time";
      inputHora.value = linha.dias[i] || "";
      inputHora.disabled = false;
      tdDia.appendChild(inputHora);
      tr.appendChild(tdDia);
    }

    tbody.appendChild(tr);
  });

}
function confirmarAgendamentoDoDia() {
  const hoje = new Date();
  let diaSemana = (hoje.getDay() + 6) % 7;

  const agendamentosDoDia = linhasAgendamentoControle
    .map(linha => ({
      transportadora: linha.transportadora,
      horario: linha.dias[diaSemana] || ""
    }))
    .filter(item => item.horario !== "");

  if (agendamentosDoDia.length === 0) {
    alert("Nenhum agendamento encontrado para hoje.");
    return;
  }

  console.log("Agendamentos enviados para o painel do motorista:");
  console.table(agendamentosDoDia);

  alert("Agendamentos de hoje confirmados e enviados com sucesso!");
}
async function gerarPDFCargas() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const tabela = document.getElementById("tabela-cargas");
  const corpo = document.getElementById("tabela-carregamento");
  if (!tabela || !corpo) {
    alert("Tabela não encontrada.");
    return;
  }

  const linhas = Array.from(corpo.querySelectorAll("tr"));
  const dados = [["#", "Data", "Cliente", "Motorista", "Horário"]];

  linhas.forEach((tr, index) => {
    const tds = tr.querySelectorAll("td");
    if (tds.length >= 4) {
      const linha = [
        (index + 1).toString(),
        tds[0].querySelector("input")?.value || "",
        tds[1].querySelector("input")?.value || "",
        tds[2].querySelector("input")?.value || "",
        tds[3].querySelector("input")?.value || ""
      ];
      dados.push(linha);
    }
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const colWidths = [10, 35, 50, 50, 30];
  const rowHeight = 8;
  let y = 30;

  const agora = new Date();
  const dataFormatada = agora.toLocaleDateString("pt-BR").replace(/\//g, "-");
  const horaFormatada = agora.toLocaleTimeString("pt-BR").replace(/:/g, "-");

  doc.setFontSize(12);
  doc.text("Relatório de Cargas Braspolpa Versão 1.0", pageWidth / 2, 10, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Gerado em: ${dataFormatada} às ${horaFormatada}`, pageWidth / 2, 16, { align: "center" });

  dados.forEach((linha, i) => {
    let x = 10;
    linha.forEach((texto, j) => {
      doc.setDrawColor(0);
      doc.setLineWidth(0.2);
      doc.rect(x, y, colWidths[j], rowHeight);

      doc.setFont(undefined, i === 0 ? "bold" : "normal");
      doc.setFontSize(9);
      doc.text(texto.toString(), x + 2, y + 5);

      x += colWidths[j];
    });
    y += rowHeight;

    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  });

  // 📁 Nome do arquivo com data e hora
  const nomeArquivo = `Relatorio_Carregamento_Braspolpa_${dataFormatada}_${horaFormatada}.pdf`;
  doc.save(nomeArquivo);

  document.getElementById("botao-resetar").disabled = false;
}

document.addEventListener("DOMContentLoaded", () => {
  gerarTabelaControleDeCargas();
  restaurarEstadoControleDeCargas();
  preencherTabelaAgendamentoSemanal();
  rolarParaCargaAtual();
});



