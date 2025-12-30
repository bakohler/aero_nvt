function formatarDataAPI(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}${mes}${ano}`;
}

async function carregarVoos() {
  const dataInput = document.getElementById("dataReferencia").value;
  if (!dataInput) {
    alert("Selecione uma data");
    return;
  }

  const aeroporto = document.getElementById("filtroAeroporto").value;
  const empresaFiltro = document.getElementById("filtroEmpresa").value.toUpperCase();
  const horaInicio = document.getElementById("horaInicio").value;
  const horaFim = document.getElementById("horaFim").value;

  const dataAPI = formatarDataAPI(dataInput);
  const url = `https://sas.anac.gov.br/sas/siros_api/voos?dataReferencia=${dataAPI}`;

  document.getElementById("info").innerText = "Carregando dados…";

  try {
    const resposta = await fetch(url);
    let dados = await resposta.json();

    dados = dados.filter(v => {
      if (aeroporto !== "TODOS" &&
          v.sg_icao_origem !== aeroporto &&
          v.sg_icao_destino !== aeroporto) return false;

      if (empresaFiltro && v.sg_empresa_icao !== empresaFiltro) return false;

      if (horaInicio || horaFim) {
        const horaVoo = v.dt_partida_prevista_utc.substring(11, 16);
        if (horaInicio && horaVoo < horaInicio) return false;
        if (horaFim && horaVoo > horaFim) return false;
      }
      return true;
    });

    const tabela = document.getElementById("tabela");
    tabela.innerHTML = "";

    dados.forEach(v => {
      tabela.innerHTML += `
        <tr>
          <td>${v.sg_empresa_icao}</td>
          <td>${v.nr_voo}</td>
          <td>${v.sg_icao_origem}</td>
          <td>${v.sg_icao_destino}</td>
          <td>${v.dt_partida_prevista_utc}</td>
          <td>${v.dt_chegada_prevista_utc}</td>
          <td>${v.sg_equipamento_icao}</td>
          <td>${v.qt_assentos_previstos}</td>
          <td>${v.ds_tipo_servico}</td>
        </tr>`;
    });

    document.getElementById("info").innerText =
      `Resultados: ${dados.length} voos encontrados`;

  } catch (erro) {
    document.getElementById("info").innerText = "Erro ao consultar a ANAC";
    console.error(erro);
  }
}

const hoje = new Date().toISOString().split("T")[0];
document.getElementById("dataReferencia").value = hoje;

document.getElementById("btnConsultar")
  .addEventListener("click", carregarVoos);

setInterval(carregarVoos, 60 * 60 * 1000);
