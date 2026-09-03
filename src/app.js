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
  var pessoa = pessoaPorId(id);

  if (pessoa) {
    return pessoa.nome;
  }

  return "(desconhecido)";
}

function ideiaPorId(id) {
  for (var i = 0; i < DADOS.ideias.length; i++) {
    if (String(DADOS.ideias[i].id) === String(id)) {
      return DADOS.ideias[i];
    }
  }

  return null;
}

function normalizar(texto) {
  return String(texto || "").toLowerCase();
}

function obterTags(ideia) {
  if (Array.isArray(ideia.tags)) {
    return ideia.tags;
  }

  return [];
}

function prepararDados() {
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

    var texto =
      normalizar(ideia.titulo) +
      " " +
      normalizar(ideia.resumo) +
      " " +
      normalizar(obterTags(ideia).join(" "));

    var buscaOK =
      busca === "" ||
      texto.indexOf(busca) !== -1;

    var tagOK =
      estado.tag === null ||
      obterTags(ideia).indexOf(estado.tag) !== -1;

    if (buscaOK && tagOK) {
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

  var select =
    document.getElementById("quem");

  if (!select) {
    return;
  }

  select.innerHTML = "";

  for (
    var i = 0;
    i < DADOS.pessoas.length;
    i++
  ) {

    var pessoa =
      DADOS.pessoas[i];

    var option =
      document.createElement("option");

    option.value =
      pessoa.id;

    option.textContent =
      pessoa.nome +
      (
        pessoa.curso
          ? " (" + pessoa.curso + ")"
          : ""
      );

    select.appendChild(option);
  }

  if (estado.pessoa !== null) {
    select.value =
      estado.pessoa;
  }
}

function desenharMural() {

  var cartoes =
    document.getElementById("cartoes");

  if (!cartoes) {
    return;
  }

  var lista =
    ideiasVisiveis();

  cartoes.innerHTML = "";

  for (
    var i = 0;
    i < lista.length;
    i++
  ) {

    cartoes.appendChild(
      montarCartao(lista[i])
    );
  }

  document.getElementById(
    "contagem"
  ).textContent =
    lista.length +
    " de " +
    DADOS.ideias.length +
    " ideias";

  var filtro =
    document.getElementById(
      "filtro-ativo"
    );

  if (estado.tag !== null) {

    filtro.textContent =
      "mostrando apenas ideias com a etiqueta: " +
      estado.tag;

  } else if (estado.busca !== "") {

    filtro.textContent =
      "buscando por: " +
      estado.busca;

  } else {

    filtro.textContent = "";
  }
}

function montarCartao(ideia) {

  var cartao =
    document.createElement("div");

  cartao.className =
    "cartao";

  var titulo =
    document.createElement("h3");

  titulo.textContent =
    ideia.titulo;

  titulo.className =
    "titulo-clicavel";

  titulo.onclick =
    function() {
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

  autor.onclick =
    function() {
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

  for (
    var i = 0;
    i < listaTags.length;
    i++
  ) {

    var etiqueta =
      document.createElement("button");

    etiqueta.className =
      "etiqueta";

    etiqueta.textContent =
      listaTags[i];

    etiqueta.onclick =
      criarCliqueDeTag(
        listaTags[i]
      );

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

  var interessado = false;

  for (
    var j = 0;
    j < ideia.interessados.length;
    j++
  ) {

    if (
      String(ideia.interessados[j]) ===
      String(estado.pessoa)
    ) {

      interessado = true;
      break;
    }
  }

  botao.textContent =
    interessado
      ? "retirar interesse"
      : "mostrar interesse";

  if (interessado) {
    botao.classList.add(
      "interessado"
    );
  }

  botao.onclick =
    criarCliqueDeInteresse(
      ideia.id
    );

  rodape.appendChild(botao);

  var contador =
    document.createElement("span");

  contador.className =
    "apoios";

  contador.textContent =
    ideia.apoios +
    (
      ideia.apoios === 1
        ? " interessado"
        : " interessados"
    );

  rodape.appendChild(contador);

  cartao.appendChild(rodape);

  return cartao;
}

function criarCliqueDeInteresse(id) {

  return function() {

    var ideia =
      ideiaPorId(id);

    if (!ideia) {
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

    if (indice >= 0) {

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

  var lista =
    document.getElementById(
      "lista-grupos"
    );

  if (!lista) {
    return;
  }

  lista.innerHTML = "";

  if (!Array.isArray(DADOS.grupos)) {
    return;
  }

  for (
    var i = 0;
    i < DADOS.grupos.length;
    i++
  ) {

    var grupo =
      DADOS.grupos[i];

    var item =
      document.createElement("li");

    var nome =
      document.createElement("span");

    nome.className =
      "nome";

    nome.textContent =
      grupo.nome;

    item.appendChild(nome);

    var quantidade =
      document.createElement("span");

    quantidade.className =
      "quantos";

    quantidade.textContent =
      (
        Array.isArray(grupo.membros)
          ? grupo.membros.length
          : 0
      ) +
      " membros";

    item.appendChild(quantidade);

    var descricao =
      document.createElement("p");

    descricao.className =
      "descricao";

    descricao.textContent =
      grupo.descricao || "";

    item.appendChild(descricao);

    lista.appendChild(item);
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

  for (
    var i = 0;
    i < ids.length;
    i++
  ) {

    var elemento =
      document.getElementById(
        ids[i]
      );

    if (elemento) {
      elemento.classList.add(
        "escondido"
      );
    }
  }
}

function trocarAba(qual) {

  estado.aba =
    qual;

  esconderTudo();

  var secao =
    document.getElementById(
      qual
    );

  if (secao) {

    secao.classList.remove(
      "escondido"
    );
  }

  var botoes = [
    "aba-mural",
    "aba-grupos",
    "aba-publicar"
  ];

  for (
    var i = 0;
    i < botoes.length;
    i++
  ) {

    var botao =
      document.getElementById(
        botoes[i]
      );

    if (!botao) {
      continue;
    }

    botao.classList.remove(
      "ativa"
    );
  }

  if (qual === "mural") {

    document.getElementById(
      "aba-mural"
    ).classList.add(
      "ativa"
    );

  } else if (qual === "grupos") {

    document.getElementById(
      "aba-grupos"
    ).classList.add(
      "ativa"
    );

  } else if (qual === "publicar") {

    document.getElementById(
      "aba-publicar"
    ).classList.add(
      "ativa"
    );
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

  var mensagem =
    document.getElementById(
      "erro-publicar"
    );

  /*
    O título é obrigatório.
  */

  if (titulo === "") {

    mensagem.textContent =
      "Digite um título para publicar a ideia.";

    return;
  }

  /*
    Monta as tags.
    Exemplo:
    tecnologia, escola, programação
  */

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

  /*
    Cria um ID novo.
    */

  var maiorId = 0;

  for (
    var j = 0;
    j < DADOS.ideias.length;
    j++
  ) {

    var numero =
      parseInt(
        DADOS.ideias[j].id
      );

    if (
      !isNaN(numero) &&
      numero > maiorId
    ) {

      maiorId =
        numero;
    }
  }

  var novoId =
    maiorId + 1;

  /*
    Data atual.
  */

  var agora =
    new Date();

  var dia =
    String(
      agora.getDate()
    ).padStart(2, "0");

  var mes =
    String(
      agora.getMonth() + 1
    ).padStart(2, "0");

  var ano =
    agora.getFullYear();

  var data =
    dia +
    "/" +
    mes +
    "/" +
    ano;

  /*
    Cria a nova ideia.
  */

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

  /*
    Coloca a ideia no começo
    da lista.
  */

  DADOS.ideias.unshift(
    novaIdeia
  );

  /*
    Limpa o formulário.
  */

  document.getElementById(
    "form-publicar"
  ).reset();

  /*
    Limpa os filtros.
  */

  estado.busca = "";
  estado.tag = null;

  document.getElementById(
    "busca"
  ).value = "";

  /*
    Atualiza tudo.
  */

  desenhar();

  /*
    Volta automaticamente
    para o mural.
  */

  trocarAba("mural");

  /*
    Mostra a mensagem no mural.
  */

  document.getElementById(
    "filtro-ativo"
  ).textContent =
    "Ideia publicada com sucesso!";
}

function abrirPessoa(id) {

  var pessoa =
    pessoaPorId(id);

  var tela =
    document.getElementById(
      "conteudo-pessoa"
    );

  esconderTudo();

  document.getElementById(
    "pagina-pessoa"
  ).classList.remove(
    "escondido"
  );

  tela.innerHTML = "";

  if (!pessoa) {

    tela.textContent =
      "Pessoa não encontrada.";

    return;
  }

  var titulo =
    document.createElement("h2");

  titulo.textContent =
    pessoa.nome;

  tela.appendChild(titulo);

  var tipo =
    document.createElement("p");

  tipo.textContent =
    "Tipo: " +
    (pessoa.tipo || "");

  tela.appendChild(tipo);

  var curso =
    document.createElement("p");

  curso.textContent =
    "Curso: " +
    (pessoa.curso || "");

  tela.appendChild(curso);

  var h3 =
    document.createElement("h3");

  h3.textContent =
    "Ideias publicadas";

  tela.appendChild(h3);

  var ideias = [];

  for (
    var i = 0;
    i < DADOS.ideias.length;
    i++
  ) {

    if (
      String(DADOS.ideias[i].autor) ===
      String(pessoa.id)
    ) {

      ideias.push(
        DADOS.ideias[i]
      );
    }
  }

  if (ideias.length === 0) {

    var vazio =
      document.createElement("p");

    vazio.textContent =
      "ainda não publicou ideias";

    tela.appendChild(vazio);

  } else {

    var lista =
      document.createElement("div");

    lista.className =
      "lista-ideias";

    for (
      var j = 0;
      j < ideias.length;
      j++
    ) {

      var botao =
        document.createElement("button");

      botao.className =
        "ideia-link";

      botao.textContent =
        ideias[j].titulo;

      botao.onclick =
        criarCliqueDeIdeia(
          ideias[j].id
        );

      lista.appendChild(
        botao
      );
    }

    tela.appendChild(lista);
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

  var tela =
    document.getElementById(
      "conteudo-ideia"
    );

  esconderTudo();

  document.getElementById(
    "pagina-ideia"
  ).classList.remove(
    "escondido"
  );

  tela.innerHTML = "";

  if (!ideia) {

    tela.textContent =
      "Ideia não encontrada.";

    return;
  }

  var titulo =
    document.createElement("h2");

  titulo.textContent =
    ideia.titulo;

  tela.appendChild(titulo);

  var autor =
    document.createElement("p");

  autor.textContent =
    "Publicado por: " +
    nomeDe(ideia.autor);

  tela.appendChild(autor);

  if (ideia.data) {

    var data =
      document.createElement("p");

    data.textContent =
      "Data: " +
      ideia.data;

    tela.appendChild(data);
  }

  var resumo =
    document.createElement("p");

  resumo.className =
    "resumo-grande";

  resumo.textContent =
    ideia.resumo || "";

  tela.appendChild(resumo);

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

  tela.appendChild(tags);

  var botao =
    document.createElement("button");

  botao.className =
    "apoiar";

  var interessado = false;

  for (
    var j = 0;
    j < ideia.interessados.length;
    j++
  ) {

    if (
      String(ideia.interessados[j]) ===
      String(estado.pessoa)
    ) {

      interessado = true;
      break;
    }
  }

  botao.textContent =
    interessado
      ? "retirar interesse"
      : "mostrar interesse";

  if (interessado) {
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

  tela.appendChild(botao);

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

  tela.appendChild(contador);
}

function iniciar() {

  if (
    typeof DADOS ===
    "undefined"
  ) {

    document.body.innerHTML =
      "<main>" +
      "<h1>Erro ao carregar os dados</h1>" +
      "<p>Verifique se o arquivo dados/dados_K.js existe.</p>" +
      "</main>";

    return;
  }

  if (
    !Array.isArray(DADOS.pessoas) ||
    !Array.isArray(DADOS.ideias)
  ) {

    document.body.innerHTML =
      "<main>" +
      "<h1>Erro nos dados</h1>" +
      "<p>Verifique o conteúdo de dados_K.js.</p>" +
      "</main>";

    return;
  }

  if (
    DADOS.pessoas.length > 0
  ) {

    estado.pessoa =
      DADOS.pessoas[0].id;
  }

  prepararDados();

  document.getElementById(
    "busca"
  ).oninput =
    function(e) {

      estado.busca =
        e.target.value;

      desenharMural();
    };

  document.getElementById(
    "quem"
  ).onchange =
    function(e) {

      estado.pessoa =
        e.target.value;

      desenharMural();
    };

  document.getElementById(
    "aba-mural"
  ).onclick =
    function() {

      estado.tag = null;

      trocarAba(
        "mural"
      );

      desenharMural();
    };

  document.getElementById(
    "aba-grupos"
  ).onclick =
    function() {

      trocarAba(
        "grupos"
      );
    };

  document.getElementById(
    "aba-publicar"
  ).onclick =
    function() {

      trocarAba(
        "publicar"
      );
    };

  document.getElementById(
    "form-publicar"
  ).onsubmit =
    function(e) {

      e.preventDefault();

      publicarIdeia();
    };

  document.getElementById(
    "voltar-pessoa"
  ).onclick =
    function() {

      trocarAba(
        "mural"
      );

      desenharMural();
    };

  document.getElementById(
    "voltar-ideia"
  ).onclick =
    function() {

      trocarAba(
        "mural"
      );

      desenharMural();
    };

  desenhar();

  trocarAba(
    "mural"
  );
}

iniciar();
