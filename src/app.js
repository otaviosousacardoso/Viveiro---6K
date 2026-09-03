/* ============================================================
   VIVEIRO — lógica da página

   Os dados vêm de:
   dados/dados_K.js

   A variável DADOS NÃO é recriada aqui.
   O arquivo dados_K.js continua sendo a fonte dos dados.
   ============================================================ */


/* ============================================================
   ESTADO
   ============================================================ */

var estado = {
  pessoa: null,
  busca: "",
  tag: null,
  aba: "mural",
  pessoaPagina: null,
  ideiaPagina: null
};


/* ============================================================
   FUNÇÕES DE DADOS
   ============================================================ */

function pessoaPorId(id) {

  for (var i = 0; i < DADOS.pessoas.length; i++) {

    if (DADOS.pessoas[i].id === id) {
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

    if (DADOS.ideias[i].id === id) {
      return DADOS.ideias[i];
    }

  }

  return null;
}


/* ============================================================
   TEXTO PARA BUSCA
   ============================================================ */

function normalizarTexto(texto) {

  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

}


/* ============================================================
   TAGS
   ============================================================ */

function obterTags(ideia) {

  if (Array.isArray(ideia.tags)) {
    return ideia.tags;
  }

  return [];

}


/* ============================================================
   INTERESSES
   ============================================================ */

/*
   IMPORTANTE:

   O dados_K.js possui somente "apoios".
   Ele NÃO possui a lista de pessoas que apoiaram.

   Então criamos "interessados" somente em memória,
   sem alterar a estrutura original do arquivo.

   Isso permite:

   pessoa 1 -> clicar -> +1
   pessoa 1 -> clicar novamente -> -1

   e impede duas contagens da mesma pessoa.
*/

function prepararInteresses() {

  for (var i = 0; i < DADOS.ideias.length; i++) {

    var ideia = DADOS.ideias[i];

    if (!Array.isArray(ideia.interessados)) {
      ideia.interessados = [];
    }

    if (typeof ideia.apoios !== "number") {
      ideia.apoios = 0;
    }

  }

}


/* ============================================================
   IDEIAS VISÍVEIS
   ============================================================ */

function ideiasVisiveis() {

  var resultado = [];

  var busca =
    normalizarTexto(estado.busca.trim());


  for (var i = 0; i < DADOS.ideias.length; i++) {

    var ideia = DADOS.ideias[i];

    var titulo =
      normalizarTexto(ideia.titulo);

    var resumo =
      normalizarTexto(ideia.resumo);

    var tags =
      normalizarTexto(
        obterTags(ideia).join(" ")
      );


    var atendeBusca = true;

    if (busca !== "") {

      atendeBusca =
        titulo.indexOf(busca) !== -1 ||
        resumo.indexOf(busca) !== -1 ||
        tags.indexOf(busca) !== -1;

    }


    var atendeTag = true;

    if (estado.tag !== null) {

      atendeTag =
        obterTags(ideia).indexOf(estado.tag) !== -1;

    }


    if (atendeBusca && atendeTag) {

      resultado.push(ideia);

    }

  }


  return resultado;

}


/* ============================================================
   DESENHAR TUDO
   ============================================================ */

function desenhar() {

  desenharSeletorDePessoas();

  desenharMural();

  desenharGrupos();

  document.getElementById("base").textContent =
    "base " + DADOS.codigo;

}


/* ============================================================
   SELETOR DE PESSOAS
   ============================================================ */

function desenharSeletorDePessoas() {

  var seletor =
    document.getElementById("quem");


  /*
     Só cria as opções uma vez.
  */

  if (seletor.options.length === 0) {

    for (var i = 0; i < DADOS.pessoas.length; i++) {

      var pessoa =
        DADOS.pessoas[i];

      var opcao =
        document.createElement("option");

      opcao.value =
        pessoa.id;

      opcao.textContent =
        pessoa.nome +
        " (" +
        pessoa.curso +
        ")";

      seletor.appendChild(opcao);

    }

  }


  seletor.value =
    estado.pessoa;

}


/* ============================================================
   DESENHAR MURAL
   ============================================================ */

function desenharMural() {

  var lista =
    ideiasVisiveis();


  var cartoes =
    document.getElementById("cartoes");


  cartoes.innerHTML = "";


  for (var i = 0; i < lista.length; i++) {

    cartoes.appendChild(
      montarCartao(lista[i])
    );

  }


  document.getElementById("contagem").textContent =
    lista.length +
    " de " +
    DADOS.ideias.length +
    " ideias";


  var filtro =
    document.getElementById("filtro-ativo");


  if (estado.tag !== null) {

    filtro.textContent =
      "mostrando apenas ideias com a etiqueta: " +
      estado.tag;

  }

  else if (estado.busca !== "") {

    filtro.textContent =
      "buscando por: " +
      estado.busca;

  }

  else {

    filtro.textContent = "";

  }

}


/* ============================================================
   MONTAR CARTÃO
   ============================================================ */

function montarCartao(ideia) {

  var cartao =
    document.createElement("div");

  cartao.className =
    "cartao";


  /* ---------------- TÍTULO ---------------- */

  var titulo =
    document.createElement("h3");

  titulo.textContent =
    ideia.titulo;

  titulo.className =
    "titulo-clicavel";


  titulo.onclick = function () {

    abrirIdeia(ideia.id);

  };


  cartao.appendChild(titulo);


  /* ---------------- AUTOR ---------------- */

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


  autor.onclick = function () {

    abrirPessoa(ideia.autor);

  };


  autoria.appendChild(autor);


  var data =
    document.createElement("span");

  data.textContent =
    " · " + ideia.data;


  autoria.appendChild(data);

  cartao.appendChild(autoria);


  /* ---------------- RESUMO ---------------- */

  var resumo =
    document.createElement("p");

  resumo.className =
    "resumo";

  resumo.textContent =
    ideia.resumo;


  cartao.appendChild(resumo);


  /* ---------------- TAGS ---------------- */

  var tags =
    document.createElement("div");

  tags.className =
    "tags";


  var listaTags =
    obterTags(ideia);


  for (var i = 0; i < listaTags.length; i++) {

    var tag =
      document.createElement("button");

    tag.className =
      "etiqueta";

    tag.textContent =
      listaTags[i];


    tag.onclick =
      criarCliqueDeTag(listaTags[i]);


    tags.appendChild(tag);

  }


  cartao.appendChild(tags);


  /* ---------------- RODAPÉ ---------------- */

  var rodape =
    document.createElement("div");

  rodape.className =
    "rodape";


  /* ========================================================
     BOTÃO MOSTRAR INTERESSE
     ======================================================== */

  var botao =
    document.createElement("button");

  botao.className =
    "apoiar";


  var jaInteressado =
    ideia.interessados.indexOf(
      estado.pessoa
    ) !== -1;


  if (jaInteressado) {

    botao.textContent =
      "retirar interesse";

    botao.classList.add(
      "interessado"
    );

  }

  else {

    botao.textContent =
      "mostrar interesse";

  }


  botao.onclick =
    criarCliqueDeInteresse(
      ideia.id
    );


  rodape.appendChild(botao);


  /* ---------------- CONTADOR ---------------- */

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


/* ============================================================
   MOSTRAR / RETIRAR INTERESSE
   ============================================================ */

function criarCliqueDeInteresse(idIdeia) {

  return function () {

    var ideia =
      ideiaPorId(idIdeia);


    if (!ideia) {
      return;
    }


    /*
       Garante que a lista existe.
    */

    if (!Array.isArray(ideia.interessados)) {

      ideia.interessados = [];

    }


    /*
       Procura o ID da pessoa atual.
    */

    var indice =
      ideia.interessados.indexOf(
        estado.pessoa
      );


    /* ======================================================
       A PESSOA JÁ DEMONSTROU INTERESSE

       Então retiramos.
       ====================================================== */

    if (indice !== -1) {

      ideia.interessados.splice(
        indice,
        1
      );


      if (ideia.apoios > 0) {

        ideia.apoios--;

      }

    }


    /* ======================================================
       A PESSOA AINDA NÃO DEMONSTROU INTERESSE

       Então adicionamos.
       ====================================================== */

    else {

      ideia.interessados.push(
        estado.pessoa
      );


      ideia.apoios++;

    }


    /*
       Redesenha o mural.

       Assim o botão muda imediatamente.
    */

    desenharMural();

  };

}


/* ============================================================
   FILTRO POR TAG
   ============================================================ */

function criarCliqueDeTag(tag) {

  return function () {

    estado.tag = tag;

    estado.busca = "";

    document.getElementById("busca").value = "";

    trocarAba("mural");

    desenharMural();

  };

}


/* ============================================================
   GRUPOS
   ============================================================ */

function desenharGrupos() {

  var alvo =
    document.getElementById("lista-grupos");


  alvo.innerHTML = "";


  for (var i = 0; i < DADOS.grupos.length; i++) {

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


    var membros =
      document.createElement("span");

    membros.className =
      "quantos";

    membros.textContent =
      grupo.membros.length +
      " membros";


    item.appendChild(membros);


    var descricao =
      document.createElement("p");

    descricao.className =
      "descricao";

    descricao.textContent =
      grupo.descricao;


    item.appendChild(descricao);


    alvo.appendChild(item);

  }

}


/* ============================================================
   PÁGINA DA PESSOA
   ============================================================ */

function abrirPessoa(id) {

  estado.pessoaPagina = id;


  esconderTudo();


  document
    .getElementById("pagina-pessoa")
    .classList.remove("escondido");


  var pessoa =
    pessoaPorId(id);


  var alvo =
    document.getElementById(
      "conteudo-pessoa"
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

  tipo.innerHTML =
    "<strong>Tipo:</strong> " +
    pessoa.tipo;


  alvo.appendChild(tipo);


  var curso =
    document.createElement("p");

  curso.innerHTML =
    "<strong>Curso:</strong> " +
    pessoa.curso;


  alvo.appendChild(curso);


  /* ---------------- INTERESSES ---------------- */

  var tituloInteresses =
    document.createElement("h3");

  tituloInteresses.textContent =
    "Interesses";


  alvo.appendChild(tituloInteresses);


  var listaInteresses =
    document.createElement("ul");


  for (
    var i = 0;
    i < pessoa.interesses.length;
    i++
  ) {

    var item =
      document.createElement("li");

    item.textContent =
      pessoa.interesses[i];


    listaInteresses.appendChild(item);

  }


  alvo.appendChild(listaInteresses);


  /* ---------------- IDEIAS ---------------- */

  var tituloIdeias =
    document.createElement("h3");

  tituloIdeias.textContent =
    "Ideias publicadas";


  alvo.appendChild(tituloIdeias);


  var ideiasPessoa =
    DADOS.ideias.filter(
      function (ideia) {

        return ideia.autor === pessoa.id;

      }
    );


  if (ideiasPessoa.length === 0) {

    var vazio =
      document.createElement("p");

    vazio.textContent =
      "ainda não publicou ideias";


    alvo.appendChild(vazio);

  }

  else {

    var lista =
      document.createElement("div");

    lista.className =
      "lista-ideias";


    for (
      var j = 0;
      j < ideiasPessoa.length;
      j++
    ) {

      var ideiaBotao =
        document.createElement("button");

      ideiaBotao.className =
        "ideia-link";

      ideiaBotao.textContent =
        ideiasPessoa[j].titulo;


      ideiaBotao.onclick =
        criarCliqueDeIdeia(
          ideiasPessoa[j].id
        );


      lista.appendChild(
        ideiaBotao
      );

    }


    alvo.appendChild(lista);

  }

}


/* ============================================================
   ABRIR IDEIA
   ============================================================ */

function abrirIdeia(id) {

  estado.ideiaPagina = id;


  esconderTudo();


  document
    .getElementById("pagina-ideia")
    .classList.remove("escondido");


  var ideia =
    ideiaPorId(id);


  var alvo =
    document.getElementById(
      "conteudo-ideia"
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


  autor.innerHTML =
    "<strong>Publicado por:</strong> ";


  var autorBotao =
    document.createElement("button");

  autorBotao.className =
    "autor-link";

  autorBotao.textContent =
    nomeDe(ideia.autor);


  autorBotao.onclick = function () {

    abrirPessoa(ideia.autor);

  };


  autor.appendChild(autorBotao);

  alvo.appendChild(autor);


  var data =
    document.createElement("p");

  data.innerHTML =
    "<strong>Data:</strong> " +
    ideia.data;


  alvo.appendChild(data);


  var resumo =
    document.createElement("p");

  resumo.className =
    "resumo-grande";

  resumo.textContent =
    ideia.resumo;


  alvo.appendChild(resumo);


  /* ---------------- TAGS ---------------- */

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


  /* ---------------- INTERESSE ---------------- */

  var botao =
    document.createElement("button");

  botao.className =
    "apoiar";


  var jaInteressado =
    ideia.interessados.indexOf(
      estado.pessoa
    ) !== -1;


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
    function () {

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


/* ============================================================
   CLICAR EM IDEIA
   ============================================================ */

function criarCliqueDeIdeia(id) {

  return function () {

    abrirIdeia(id);

  };

}


/* ============================================================
   ESCONDER TUDO
   ============================================================ */

function esconderTudo() {

  var secoes = [
    "mural",
    "grupos",
    "pagina-pessoa",
    "pagina-ideia"
  ];


  for (var i = 0; i < secoes.length; i++) {

    var elemento =
      document.getElementById(
        secoes[i]
      );


    elemento.classList.add(
      "escondido"
    );

  }

}


/* ============================================================
   TROCAR ABA
   ============================================================ */

function trocarAba(qual) {

  estado.aba = qual;


  esconderTudo();


  if (qual === "mural") {

    document
      .getElementById("mural")
      .classList.remove("escondido");

  }


  if (qual === "grupos") {

    document
      .getElementById("grupos")
      .classList.remove("escondido");

  }


  document
    .getElementById("aba-mural")
    .classList.remove("ativa");


  document
    .getElementById("aba-grupos")
    .classList.remove("ativa");


  if (qual === "mural") {

    document
      .getElementById("aba-mural")
      .classList.add("ativa");

  }


  if (qual === "grupos") {

    document
      .getElementById("aba-grupos")
      .classList.add("ativa");

  }

}


/* ============================================================
   INICIAR
   ============================================================ */

function iniciar() {

  /*
     Verificação importante.
     Se aparecer no console, o dados_K.js não foi carregado.
  */

  if (
    typeof DADOS === "undefined"
  ) {

    document.body.innerHTML =
      "<h1>Erro: dados_K.js não foi carregado.</h1>" +
      "<p>Verifique se o arquivo está dentro da pasta dados.</p>";

    return;

  }


  /*
     Primeira pessoa.
  */

  if (DADOS.pessoas.length > 0) {

    estado.pessoa =
      DADOS.pessoas[0].id;

  }


  prepararInteresses();


  /* ---------------- BUSCA ---------------- */

  document
    .getElementById("busca")
    .oninput = function (evento) {

      estado.busca =
        evento.target.value;

      desenharMural();

    };


  /* ---------------- PESSOA ---------------- */

  document
    .getElementById("quem")
    .onchange = function (evento) {

      estado.pessoa =
        Number(evento.target.value);

      /*
         Ao trocar de pessoa,
         atualizamos os botões de interesse.
      */

      desenharMural();

    };


  /* ---------------- MURAL ---------------- */

  document
    .getElementById("aba-mural")
    .onclick = function () {

      trocarAba("mural");

    };


  /* ---------------- GRUPOS ---------------- */

  document
    .getElementById("aba-grupos")
    .onclick = function () {

      trocarAba("grupos");

    };


  /* ---------------- VOLTAR PESSOA ---------------- */

  document
    .getElementById("voltar-pessoa")
    .onclick = function () {

      trocarAba("mural");

    };


  /* ---------------- VOLTAR IDEIA ---------------- */

  document
    .getElementById("voltar-ideia")
    .onclick = function () {

      trocarAba("mural");

    };


  /*
     Primeiro desenho da página.
  */

  desenhar();


  trocarAba("mural");

}


/* ============================================================
   COMEÇAR
   ============================================================ */

iniciar();
