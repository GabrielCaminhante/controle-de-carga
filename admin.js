let linhasCargas = [];
let linhasAgendamento = [];
const porLote = 38;

// 🔄 Tabela de Cargas
function redistribuirLinhas() {
  const grid = document.getElementById("gridCargas");
  grid.innerHTML = "";

  const total = linhasCargas.length;
  const numLotes = Math.ceil(total / porLote);
  const linhas = [document.createElement("div"), document.createElement("div")];

  linhas.forEach(linha => {
    linha.classList.add("linha-lotes");
    grid.appendChild(linha);
  });

  for (let l = 0; l < numLotes; l++) {
    const bloco = document.createElement("div");
    bloco.classList.add("tabela-bloco-carga")
;
    const tabela = document.createElement("table");
    tabela.innerHTML = `<thead><tr><th>Nº</th><th>Transportadora</th></tr></thead>`;
    const tbody = document.createElement("tbody");

    for (let i = l * porLote; i < Math.min((l + 1) * porLote, total); i++) {
      const linha = linhasCargas[i];
      const tr = document.createElement("tr");
      const inputId = `transportadora-${i}`;

      const input = document.createElement("input");
      input.type = "text";
      input.id = inputId;
      input.value = linha.transportadora;
      input.setAttribute("list", "lista-transportadoras");
      input.oninput = () => atualizarLinha(i, "transportadora", input.value);
      input.onkeydown = (event) => navegarComTeclas(event, i);

      tr.innerHTML = `<td><input type="number" value="${i + 1}" disabled></td>`;
      const td = document.createElement("td");
      td.appendChild(input);
      tr.appendChild(td);
      tbody.appendChild(tr);
    }

    tabela.appendChild(tbody);
    bloco.innerHTML = `<h2>Seguimento ${l + 1}</h2>`;
    bloco.appendChild(tabela);
    linhas[l < 3 ? 0 : 1].appendChild(bloco);
  }

  atualizarListaTransportadoras();
}

function atualizarLinha(i, campo, valor) {
  linhasCargas[i][campo] = valor;

  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal")) || {};
  estadoGlobal.cargas = linhasCargas;

  // Espelha no controle
  if (estadoGlobal.controle && estadoGlobal.controle[i]) {
    estadoGlobal.controle[i].transportadora = linhasCargas[i].transportadora;
  }

  localStorage.setItem("estadoGlobal", JSON.stringify(estadoGlobal));
}

function navegarComTeclas(event, index) {
  const tecla = event.key;
  if (tecla === "Enter" || tecla === "ArrowDown") {
    event.preventDefault();
    const proximo = document.getElementById(`transportadora-${index + 1}`);
    if (proximo) {
      proximo.focus();
      proximo.select();
    }
  }
  if (tecla === "ArrowUp") {
    event.preventDefault();
    const anterior = document.getElementById(`transportadora-${index - 1}`);
    if (anterior) {
      anterior.focus();
      anterior.select();
    }
  }
}

function adicionarLinha() {
  const qtd = parseInt(document.getElementById("quantidade-linhas").value);
  if (isNaN(qtd) || qtd <= 0) {
    alert("⚠ Informe um número válido de linhas para adicionar.");
    return;
  }

  for (let i = 0; i < qtd; i++) {
    linhasCargas.push({ transportadora: "" });
  }

  redistribuirLinhas();
  salvarConfiguracao();
}

function removerUltimaLinha() {
  const qtd = parseInt(document.getElementById("quantidade-linhas").value);
  if (isNaN(qtd) || qtd <= 0) {
    alert("⚠ Informe um número válido de linhas para remover.");
    return;
  }

  if (qtd > linhasCargas.length) {
    alert("⚠ Não há tantas linhas para remover.");
    return;
  }

  for (let i = 0; i < qtd; i++) {
    linhasCargas.pop();
  }

  redistribuirLinhas();
  salvarConfiguracao();
}

function salvarConfiguracao() {
  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal")) || {};
  estadoGlobal.cargas = linhasCargas;
  estadoGlobal.agendamento = linhasAgendamento;
  localStorage.setItem("estadoGlobal", JSON.stringify(estadoGlobal));
}


function restaurarTabelaDeCargas() {
  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal")) || {};
  const dados = Array.isArray(estadoGlobal.cargas) ? estadoGlobal.cargas : [];

  linhasCargas = dados;
  redistribuirLinhas();
}

// 📊 Contador
function contarCargasPorTransportadora() {
  const contagem = {};
  linhasCargas.forEach(linha => {
    const nome = linha.transportadora.trim();
    if (nome) contagem[nome] = (contagem[nome] || 0) + 1;
  });
  return contagem;
}

function mostrarContador() {
  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal")) || { controle: [], agendamento: [] };
  const cargas = estadoGlobal.controle || [];
  const agendamento = estadoGlobal.agendamento || [];

  // 📦 Totais por status
  const total = cargas.length;
  const statusContagem = {
    atual: 0,
    saiu: 0,
    pulou: 0,
    pendente: 0
  };

  // 🚚 Contagem por transportadora e status
  const porTransportadora = {};
  cargas.forEach(item => {
    const nome = item.transportadora?.trim() || "Sem nome";
    const status = item.status || "pendente";

    statusContagem[status] = (statusContagem[status] || 0) + 1;

    if (!porTransportadora[nome]) {
      porTransportadora[nome] = { total: 0, atual: 0, saiu: 0, pulou: 0, pendente: 0 };
    }

    porTransportadora[nome].total++;
    porTransportadora[nome][status]++;
  });

  const textoTransportadoras = Object.entries(porTransportadora)
    .map(([nome, dados]) => {
      return `${nome}: ${dados.total} carga${dados.total > 1 ? "s" : ""} ` +
             `(✅ ${dados.saiu || 0}, ⏭ ${dados.pulou || 0}, 🔄 ${dados.atual || 0}, 📥 ${dados.pendente || 0})`;
    })
    .join("\n");

  // 🔁 Verificar sequência de mesma transportadora
  const sequenciasEncontradas = [];
  for (let i = 1; i < cargas.length; i++) {
    const atual = cargas[i].transportadora?.trim();
    const anterior = cargas[i - 1].transportadora?.trim();
    if (atual && atual === anterior) {
      sequenciasEncontradas.push({ nome: atual, linhas: [i - 1, i] });
    }
  }

  let textoSequencia = "";
  if (sequenciasEncontradas.length > 0) {
    const agrupadas = {};
    sequenciasEncontradas.forEach(({ nome, linhas }) => {
      if (!agrupadas[nome]) agrupadas[nome] = new Set();
      linhas.forEach(i => agrupadas[nome].add(i));
    });

    const detalhes = Object.entries(agrupadas)
      .map(([nome, linhas]) => {
        const lista = [...linhas].map(i => `#${i + 1}`).join(", ");
        return `🔁 ${nome} em sequência nas linhas: ${lista}`;
      })
      .join("\n");

    textoSequencia = `🔁 Sequências detectadas:\n${detalhes}`;
  } else {
    textoSequencia = "✅ Nenhuma sequência repetida de transportadora.";
  }

  // 📅 Agendamentos do dia
  const hoje = new Date();
  const diaSemana = (hoje.getDay() + 6) % 7;
  const nomeDia = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][diaSemana];

  const agendamentosHoje = agendamento
    .map(item => ({
      transportadora: item.transportadora,
      horario: item.dias?.[diaSemana] || ""
    }))
    .filter(item => item.horario);

  const textoAgendamento = agendamentosHoje.length > 0
    ? agendamentosHoje.map(a => `📅 ${a.transportadora}: ${a.horario}`).join("\n")
    : "📭 Nenhuma transportadora agendada para hoje.";

  // 📊 Exibir tudo
  alert(
    `📊 Estatísticas de Cargas (tempo real):\n\n` +
    `Total: ${total}\n` +
    `✅ Finalizadas: ${statusContagem.saiu || 0}\n` +
    `🔄 Em andamento: ${statusContagem.atual || 0}\n` +
    `⏭ Puladas: ${statusContagem.pulou || 0}\n` +
    `📥 Pendentes: ${statusContagem.pendente || 0}\n\n` +
    `📦 Por transportadora:\n${textoTransportadoras}\n\n` +
    `${textoSequencia}\n\n` +
    `📅 Agendamentos para ${nomeDia}:\n${textoAgendamento}`
  );
}

// 📅 Tabela de Agendamento Semanal
function redistribuirAgendamento() {
  const tabela = document.querySelector("#tabela-semanal tbody");
  tabela.innerHTML = "";

  linhasAgendamento.forEach((linha, index) => {
    const tr = document.createElement("tr");

    const tdTransportadora = document.createElement("td");
    const inputTransportadora = document.createElement("input");
    inputTransportadora.type = "text";
    inputTransportadora.value = linha.transportadora;
    inputTransportadora.setAttribute("list", "lista-transportadoras");
    inputTransportadora.oninput = () => {
      linhasAgendamento[index].transportadora = inputTransportadora.value;
        atualizarListaTransportadoras();
        salvarAgendamento(); // ✅ salva imediatamente
    };

    tdTransportadora.appendChild(inputTransportadora);
    tr.appendChild(tdTransportadora);

    for (let diaIndex = 0; diaIndex < 7; diaIndex++) {
      const tdDia = document.createElement("td");
      const inputHora = document.createElement("input");
      inputHora.type = "time";
      inputHora.value = linha.dias[diaIndex] || "";
      inputHora.oninput = () => {
        linhasAgendamento[index].dias[diaIndex] = inputHora.value;
        salvarAgendamento();
      };
      tdDia.appendChild(inputHora);
      tr.appendChild(tdDia);
    }

    tabela.appendChild(tr);
  });

  atualizarListaTransportadoras();
}

function adicionarLinhaAgendamento() {
  linhasAgendamento.push({ transportadora: "", dias: Array(7).fill("") });

  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal")) || {};
  estadoGlobal.agendamento = linhasAgendamento;
  localStorage.setItem("estadoGlobal", JSON.stringify(estadoGlobal));
  redistribuirAgendamento();
}

function removerUltimaLinhaAgendamento() {
  if (linhasAgendamento.length > 0) {
    linhasAgendamento.pop();

    const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal")) || {};
    estadoGlobal.agendamento = linhasAgendamento;
    localStorage.setItem("estadoGlobal", JSON.stringify(estadoGlobal));

    redistribuirAgendamento();
  }
}

function salvarAgendamento() {
  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal")) || {};
  estadoGlobal.agendamento = linhasAgendamento;
  localStorage.setItem("estadoGlobal", JSON.stringify(estadoGlobal));
}

function restaurarAgendamentoSemanal() {
  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal")) || {};
  const dados = Array.isArray(estadoGlobal.agendamento) ? estadoGlobal.agendamento : [];

  linhasAgendamento = dados.map(item => ({
    transportadora: typeof item.transportadora === "string" ? item.transportadora : "",
    dias: Array.isArray(item.dias) && item.dias.length === 7
      ? item.dias.map(h => typeof h === "string" ? h : "")
      : Array(7).fill("")
  }));

  redistribuirAgendamento();
}


// ✅ Preenchimento automático apenas para transportadoras
function atualizarListaTransportadoras() {
  const nomesCargas = linhasCargas.map(l => l.transportadora.trim());
  const nomesAgendamento = linhasAgendamento.map(l => l.transportadora.trim());

  // 🔄 Transportadoras cadastradas no painel de cadastro
  const dadosCadastro = JSON.parse(localStorage.getItem("cadastrosTransportadoras")) || {};
  const nomesCadastro = Object.keys(dadosCadastro);

  // 🔁 Unificar e remover duplicados
  const todos = [...nomesCargas, ...nomesAgendamento, ...nomesCadastro]
    .filter(n => n.length > 0);
  const unicos = [...new Set(todos)];

  // 🧾 Atualizar datalist
  const datalist = document.getElementById("lista-transportadoras");
  if (!datalist) return;

  datalist.innerHTML = "";
  unicos.forEach(nome => {
    const option = document.createElement("option");
    option.value = nome;
    datalist.appendChild(option);
  });
}

// 🔘 Botões principais

function abrirControleDeCargas() {
  window.open("controle.html", "controleDeCargas");
}

function abrirPainelMotorista() {
  window.open("motorista.html", "painelMotorista");
}

function abrirPainelCadastro() {
  window.open("cadastro.html", "PainelCadastro");
}

function zerarTransportadoras() {
  if (!confirm("⚠ Isso irá apagar todos os nomes das transportadoras. Deseja continuar?")) return;

  // Zera os nomes no array principal
  linhasCargas = linhasCargas.map(linha => ({ ...linha, transportadora: "" }));

  // Atualiza visualmente
  redistribuirLinhas();

  // Atualiza estadoGlobal
  const estadoGlobal = JSON.parse(localStorage.getItem("estadoGlobal")) || {};
  estadoGlobal.cargas = linhasCargas;
  localStorage.setItem("estadoGlobal", JSON.stringify(estadoGlobal));

  alert("✅ Nomes das transportadoras zerados com sucesso.");
}

// 🚀 Inicialização
document.addEventListener("DOMContentLoaded", () => {
  restaurarTabelaDeCargas();
  restaurarAgendamentoSemanal();
});
