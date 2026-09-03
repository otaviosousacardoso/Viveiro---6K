/* Viveiro — lógica da página */

var estado = {
  pessoa: null,
  busca: "",
  tag: null,
  aba: "mural"
};

function pessoaPorId(id) {
  for (var i = 0; i < DADOS.pessoas.length; i++) {
    if (String(DADOS.pessoas[i].id) === String(id)) {
      return DADOS.pessoas[i];
    }
  }

  return null;
}

function nomeDe(id) {
  var p = pessoaPorId(id);

  return p ? p.nome : "(desconhecido)";
}

function ideiaPorId(id) {
  for (var i = 0; i < DADOS.ideias.length; i++) {
    if (String(DADOS.ideias[i].id) === String(id)) {
      return DADOS.ideias[i];
    }
  }

  return null;
}

function obterTags(ideia) {
  return Array.isArray(ideia.tags) ? ideia.tags : [];
}

function normalizar(texto) {
  return String(texto || "").toLowerCase();
}

function prepararInteresses() {

  for (var i = 0; i < DADOS.ideias.length; i++) {

    if (!Array.isArray(DADOS.ideias[i].interessados)) {
      DADOS.ideias[i].interessados = [];
    }

    if (typeof DADOS.ideias[i].apoios !== "number") {
      DADOS.ideias[i].apoios = 0;
    }
  }
}

function ideiasVisiveis() {

  var resultado = [];

  var busca = normalizar(
    estado.busca.trim()
  );

  for (var i = 0; i < DADOS.ideias.length; i++) {

    var ideia = DADOS.ideias[i];

    var texto = normalizar(
      (ideia.titulo || "") +
      " " +
      (ideia.resumo || "") +
      " " +
      obterTags(ideia).join(" ")
    );

    var atendeBusca =
      busca === "" ||
      texto.indexOf(busca) !== -1;

    var atendeTag =
      estado.tag === null ||
      obterTags(ideia).indexOf(estado.tag) !== -1;

    if (atendeBusca && atendeTag) {
      resultado.push(ideia);
    }
  }

  return resultado;
}

function desenhar() {

  desenharSeletorDePessoas();
  desenharMural();
  desenharGrupos();

  var base = document.getElementById("base");

  if (base) {
    base.textContent =
      "base " + (DADOS.codigo || "K");
  }
}

function desenharSeletorDePessoas() {

  var alvo = document.getElementById("quem");

  if (!alvo) return;

  if (alvo.options.length === 0) {

    for (var i = 0; i < DADOS.pessoas.length; i++) {

      var p = DADOS.pessoas[i];

      var opcao =
        document.createElement("option");

      opcao.value = p.id;

      opcao.textContent =
        p.nome +
        (p.curso ? " (" + p.curso + ")" : "");

      alvo.appendChild(opcao);
    }
  }

  if (estado.pessoa !== null) {
    alvo.value = estado.pessoa;
  }
}

function desenharMural() {

  var alvo =
    document.getElementById("cartoes");

  if (!alvo) return;

  var lista = ideiasVisiveis();

  alvo.innerHTML = "";

  for (var i = 0; i < lista.length; i++) {

    alvo.appendChild(
      montarCartao(lista[i])
    );
  }

  document.getElementById("contagem").textContent =
    lista.length +
    " de " +
    DADOS.ideias.length +
    " ideias";

  var aviso =
    document.getElementById("filtro-ativo");

  if (estado.tag !== null) {

    aviso.textContent =
      "mostrando apenas ideias com a etiqueta: " +
      estado.tag;

  } else if (estado.busca !== "") {

    aviso.textContent =
      "buscando por: " +
      estado.busca;

  } else {

    aviso.textContent = "";
  }
}

function montarCartao(ideia) {

  var cartao =
    document.createElement("div");

  cartao.className = "cartao";

  var titulo =
    document.createElement("h3");

  titulo.textContent =
    ideia.titulo || "(sem título)";

  titulo.className =
    "titulo-clicavel";

  titulo.onclick = function() {
    abrirIdeia(ideia.id);
  };

  cartao.appendChild(titulo);

  var autoria =
    document.createElement("div");

  autoria.className =
    "autoria";

  var autor =
    document.createElement("button");

  autor.className =
    "autor-link";

  autor.textContent =
    nomeDe(ideia.autor);

  autor.onclick = function() {
    abrirPessoa(ideia.autor);
  };

  autoria.appendChild(autor);

  if (ideia.data) {

    var data =
      document.createElement("span");

    data.textContent =
      " · " + ideia.data;

    autoria.appendChild(data);
  }

  cartao.appendChild(autoria);

  var resumo =
    document.createElement("p");

  resumo.className =
    "resumo";

  resumo.textContent =
    ideia.resumo || "";

  cartao.appendChild(resumo);

  var tags =
    document.createElement("div");

  tags.className =
    "tags";

  var listaTags =
    obterTags(ideia);

  for (var i = 0; i < listaTags.length; i++) {

    var etiqueta =
      document.createElement("button");

    etiqueta.className =
      "etiqueta";

    etiqueta.textContent =
      listaTags[i];

    etiqueta.onclick =
      criarCliqueDeTag(listaTags[i]);

    tags.appendChild(etiqueta);
  }

  cartao.appendChild(tags);

  var rodape =
    document.createElement("div");

  rodape.className =
    "rodape";

  var botao =
    document.createElement("button");

  botao.className =
    "apoiar";

  var jaInteressado =
    ideia.interessados.some(
      function(id) {
        return String(id) ===
          String(estado.pessoa);
      }
    );

  botao.textContent =
    jaInteressado
      ? "retirar interesse"
      : "mostrar interesse";

  if (jaInteressado) {
    botao.classList.add("interessado");
  }

  botao.onclick =
    criarCliqueDeInteresse(ideia.id);

  rodape.appendChild(botao);

  var contador =
    document.createElement("span");

  contador.className =
    "apoios";

  contador.textContent =
    ideia.apoios +
    (ideia.apoios === 1
      ? " interessado"
      : " interessados");

  rodape.appendChild(contador);

  cartao.appendChild(rodape);

  return cartao;
}

function criarCliqueDeInteresse(idIdeia) {

  return function() {

    var ideia =
      ideiaPorId(idIdeia);

    if (!ideia ||
        estado.pessoa === null) {
      return;
    }

    var indice = -1;

    for (
      var i = 0;
      i < ideia.interessados.length;
      i++
    ) {

      if (
        String(ideia.interessados[i]) ===
        String(estado.pessoa)
      ) {

        indice = i;
        break;
      }
    }

    if (indice !== -1) {

      ideia.interessados.splice(
        indice,
        1
      );

      if (ideia.apoios > 0) {
        ideia.apoios--;
      }

    } else {

      ideia.interessados.push(
        estado.pessoa
      );

      ideia.apoios++;
    }

    desenharMural();
  };
}

function criarCliqueDeTag(tag) {

  return function() {

    estado.tag = tag;
    estado.busca = "";

    document.getElementById(
      "busca"
    ).value = "";

    trocarAba("mural");

    desenharMural();
  };
}

function desenharGrupos() {

  var alvo =
    document.getElementById(
      "lista-grupos"
    );

  if (
    !alvo ||
    !Array.isArray(DADOS.grupos)
  ) {
    return;
  }

  alvo.innerHTML = "";

  for (
    var i = 0;
    i < DADOS.grupos.length;
    i++
  ) {

    var g =
      DADOS.grupos[i];

    var item =
      document.createElement("li");

    var nome =
      document.createElement("span");

    nome.className =
      "nome";

    nome.textContent =
      g.nome || "(sem nome)";

    item.appendChild(nome);

    var quantos =
      document.createElement("span");

    quantos.className =
      "quantos";

    quantos.textContent =
      (
        Array.isArray(g.membros)
          ? g.membros.length
          : 0
      ) + " membros";

    item.appendChild(quantos);

    var descricao =
      document.createElement("p");

    descricao.className =
      "descricao";

    descricao.textContent =
      g.descricao || "";

    item.appendChild(descricao);

    alvo.appendChild(item);
  }
}

function esconderTudo() {

  var ids = [
    "mural",
    "grupos",
    "publicar",
    "pagina-pessoa",
    "pagina-ideia"
  ];

  for (var i = 0; i < ids.length; i++) {

    var elemento =
      document.getElementById(ids[i]);

    if (elemento) {
      elemento.classList.add(
        "escondido"
      );
    }
  }
}

function trocarAba(qual) {

  estado.aba = qual;

  esconderTudo();

  var alvo =
    document.getElementById(qual);

  if (alvo) {
    alvo.classList.remove(
      "escondido"
    );
  }

  var botoes = {

    mural:
      document.getElementById(
        "aba-mural"
      ),

    grupos:
      document.getElementById(
        "aba-grupos"
      ),

    publicar:
      document.getElementById(
        "aba-publicar"
      )
  };

  for (var chave in botoes) {

    if (botoes[chave]) {

      botoes[chave].classList.toggle(
        "ativa",
        chave === qual
      );
    }
  }
}

function publicarIdeia() {

  var titulo =
    document.getElementById(
      "titulo-ideia"
    ).value.trim();

  var resumo =
    document.getElementById(
      "resumo-ideia"
    ).value.trim();

  var tagsTexto =
    document.getElementById(
      "tags-ideia"
    ).value.trim();

  var erro =
    document.getElementById(
      "erro-publicar"
    );

  if (titulo === "") {

    erro.textContent =
      "Digite um título para publicar a ideia.";

    return;
  }

  var tags = [];

  if (tagsTexto !== "") {

    var partes =
      tagsTexto.split(",");

    for (
      var i = 0;
      i < partes.length;
      i++
    ) {

      var tag =
        partes[i].trim();

      if (tag !== "") {
        tags.push(tag);
      }
    }
  }

  var novoId = 1;

  for (
    var j = 0;
    j < DADOS.ideias.length;
    j++
  ) {

    var idAtual =
      Number(DADOS.ideias[j].id) || 0;

    if (idAtual >= novoId) {
      novoId = idAtual + 1;
    }
  }

  var hoje =
    new Date();

  var data =
    String(
      hoje.getDate()
    ).padStart(2, "0") +
    "/" +
    String(
      hoje.getMonth() + 1
    ).padStart(2, "0") +
    "/" +
    hoje.getFullYear();

  var novaIdeia = {

    id: novoId,

    titulo: titulo,

    resumo: resumo,

    autor: estado.pessoa,

    data: data,

    tags: tags,

    apoios: 0,

    interessados: []
  };

  DADOS.ideias.unshift(
    novaIdeia
  );

  document.getElementById(
    "form-publicar"
  ).reset();

  erro.textContent =
    "Ideia publicada com sucesso!";

  estado.busca = "";
  estado.tag = null;

  document.getElementById(
    "busca"
  ).value = "";

  desenhar();

  trocarAba("mural");
}

function abrirPessoa(id) {

  var pessoa =
    pessoaPorId(id);

  var alvo =
    document.getElementById(
      "conteudo-pessoa"
    );

  if (!alvo) return;

  esconderTudo();

  document.getElementById(
    "pagina-pessoa"
  ).classList.remove(
    "escondido"
  );

  alvo.innerHTML = "";

  if (!pessoa) {

    alvo.textContent =
      "Pessoa não encontrada.";

    return;
  }

  var titulo =
    document.createElement("h2");

  titulo.textContent =
    pessoa.nome;

  alvo.appendChild(titulo);

  var tipo =
    document.createElement("p");

  tipo.textContent =
    "Tipo: " +
    (pessoa.tipo || "");

  alvo.appendChild(tipo);

  var curso =
    document.createElement("p");

  curso.textContent =
    "Curso: " +
    (pessoa.curso || "");

  alvo.appendChild(curso);

  if (
    Array.isArray(
      pessoa.interesses
    )
  ) {

    var h3 =
      document.createElement("h3");

    h3.textContent =
      "Interesses";

    alvo.appendChild(h3);

    var ul =
      document.createElement("ul");

    for (
      var i = 0;
      i < pessoa.interesses.length;
      i++
    ) {

      var li =
        document.createElement("li");

      li.textContent =
        pessoa.interesses[i];

      ul.appendChild(li);
    }

    alvo.appendChild(ul);
  }

  var hIdeias =
    document.createElement("h3");

  hIdeias.textContent =
    "Ideias publicadas";

  alvo.appendChild(hIdeias);

  var ideias = [];

  for (
    var j = 0;
    j < DADOS.ideias.length;
    j++
  ) {

    if (
      String(DADOS.ideias[j].autor) ===
      String(pessoa.id)
    ) {

      ideias.push(
        DADOS.ideias[j]
      );
    }
  }

  if (ideias.length === 0) {

    var vazio =
      document.createElement("p");

    vazio.textContent =
      "ainda não publicou ideias";

    alvo.appendChild(vazio);

  } else {

    var lista =
      document.createElement("div");

    lista.className =
      "lista-ideias";

    for (
      var k = 0;
      k < ideias.length;
      k++
    ) {

      var link =
        document.createElement("button");

      link.className =
        "ideia-link";

      link.textContent =
        ideias[k].titulo;

      link.onclick =
        criarCliqueDeIdeia(
          ideias[k].id
        );

      lista.appendChild(link);
    }

    alvo.appendChild(lista);
  }
}

function criarCliqueDeIdeia(id) {

  return function() {
    abrirIdeia(id);
  };
}

function abrirIdeia(id) {

  var ideia =
    ideiaPorId(id);

  var alvo =
    document.getElementById(
      "conteudo-ideia"
    );

  if (!alvo) return;

  esconderTudo();

  document.getElementById(
    "pagina-ideia"
  ).classList.remove(
    "escondido"
  );

  alvo.innerHTML = "";

  if (!ideia) {

    alvo.textContent =
      "Ideia não encontrada.";

    return;
  }

  var titulo =
    document.createElement("h2");

  titulo.textContent =
    ideia.titulo;

  alvo.appendChild(titulo);

  var autor =
    document.createElement("p");

  autor.textContent =
    "Publicado por: ";

  var autorBotao =
    document.createElement("button");

  autorBotao.className =
    "autor-link";

  autorBotao.textContent =
    nomeDe(ideia.autor);

  autorBotao.onclick =
    function() {
      abrirPessoa(ideia.autor);
    };

  autor.appendChild(
    autorBotao
  );

  alvo.appendChild(autor);

  if (ideia.data) {

    var data =
      document.createElement("p");

    data.textContent =
      "Data: " + ideia.data;

    alvo.appendChild(data);
  }

  var resumo =
    document.createElement("p");

  resumo.className =
    "resumo-grande";

  resumo.textContent =
    ideia.resumo || "";

  alvo.appendChild(resumo);

  var tags =
    document.createElement("div");

  tags.className =
    "tags";

  var listaTags =
    obterTags(ideia);

  for (
    var i = 0;
    i < listaTags.length;
    i++
  ) {

    var tag =
      document.createElement("span");

    tag.className =
      "etiqueta";

    tag.textContent =
      listaTags[i];

    tags.appendChild(tag);
  }

  alvo.appendChild(tags);

  var botao =
    document.createElement("button");

  botao.className =
    "apoiar";

  var jaInteressado =
    ideia.interessados.some(
      function(idPessoa) {
        return String(idPessoa) ===
          String(estado.pessoa);
      }
    );

  botao.textContent =
    jaInteressado
      ? "retirar interesse"
      : "mostrar interesse";

  if (jaInteressado) {
    botao.classList.add(
      "interessado"
    );
  }

  botao.onclick =
    function() {

      criarCliqueDeInteresse(
        ideia.id
      )();

      abrirIdeia(
        ideia.id
      );
    };

  alvo.appendChild(botao);

  var contador =
    document.createElement("p");

  contador.className =
    "contador-grande";

  contador.textContent =
    ideia.apoios +
    (
      ideia.apoios === 1
        ? " interessado"
        : " interessados"
    );

  alvo.appendChild(contador);
}

function iniciar() {

  if (typeof DADOS === "undefined") {

    document.body.innerHTML =
      "<main>" +
      "<h1>Erro ao carregar os dados</h1>" +
      "<p>Verifique se dados/dados_K.js está no lugar correto.</p>" +
      "</main>";

    return;
  }

  if (
    !Array.isArray(DADOS.pessoas) ||
    !Array.isArray(DADOS.ideias)
  ) {

    document.body.innerHTML =
      "<main>" +
      "<h1>Erro na estrutura dos dados</h1>" +
      "<p>O dados_K.js precisa possuir DADOS.pessoas e DADOS.ideias.</p>" +
      "</main>";

    return;
  }

  if (DADOS.pessoas.length > 0) {

    estado.pessoa =
      DADOS.pessoas[0].id;
  }

  prepararInteresses();

  document.getElementById(
    "busca"
  ).oninput = function(e) {

    estado.busca =
      e.target.value;

    desenharMural();
  };

  document.getElementById(
    "quem"
  ).onchange = function(e) {

    estado.pessoa =
      e.target.value;

    desenharMural();
  };

  document.getElementById(
    "aba-mural"
  ).onclick = function() {

    estado.tag = null;

    trocarAba("mural");

    desenharMural();
  };

  document.getElementById(
    "aba-grupos"
  ).onclick = function() {

    trocarAba("grupos");
  };

  document.getElementById(
    "aba-publicar"
  ).onclick = function() {

    trocarAba("publicar");
  };

  document.getElementById(
    "form-publicar"
  ).onsubmit = function(e) {

    e.preventDefault();

    publicarIdeia();
  };

  document.getElementById(
    "voltar-pessoa"
  ).onclick = function() {

    trocarAba("mural");

    desenharMural();
  };

  document.getElementById(
    "voltar-ideia"
  ).onclick = function() {

    trocarAba("mural");

    desenharMural();
  };

  desenhar();

  trocarAba("mural");
}

iniciar();
