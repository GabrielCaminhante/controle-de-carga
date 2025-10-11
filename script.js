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
