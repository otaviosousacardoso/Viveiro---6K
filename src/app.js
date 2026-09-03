/* ============================================================
   VIVEIRO
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
   PESSOAS
   ============================================================ */

function pessoaPorId(id){

  for(var i = 0; i < DADOS.pessoas.length; i++){

    if(String(DADOS.pessoas[i].id) === String(id)){
      return DADOS.pessoas[i];
    }

  }

  return null;
}


function nomeDe(id){

  var pessoa = pessoaPorId(id);

  if(pessoa){
    return pessoa.nome;
  }

  return "(desconhecido)";
}


/* ============================================================
   IDEIAS
   ============================================================ */

function ideiaPorId(id){

  for(var i = 0; i < DADOS.ideias.length; i++){

    if(String(DADOS.ideias[i].id) === String(id)){
      return DADOS.ideias[i];
    }

  }

  return null;
}


/* ============================================================
   TAGS
   ============================================================ */

function obterTags(ideia){

  if(Array.isArray(ideia.tags)){
    return ideia.tags;
  }

  return [];

}


/* ============================================================
   NORMALIZAR TEXTO
   ============================================================ */

function normalizar(texto){

  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"");

}


/* ============================================================
   INTERESSES
   ============================================================ */

function prepararInteresses(){

  for(var i = 0; i < DADOS.ideias.length; i++){

    var ideia = DADOS.ideias[i];

    if(!Array.isArray(ideia.interessados)){
      ideia.interessados = [];
    }

    if(typeof ideia.apoios !== "number"){
      ideia.apoios = 0;
    }

  }

}


/* ============================================================
   IDEIAS VISÍVEIS
   ============================================================ */

function ideiasVisiveis(){

  var resultado = [];

  var busca = normalizar(
    estado.busca.trim()
  );


  for(var i = 0; i < DADOS.ideias.length; i++){

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


    if(atendeBusca && atendeTag){
      resultado.push(ideia);
    }

  }


  return resultado;

}


/* ============================================================
   DESENHAR
   ============================================================ */

function desenhar(){

  desenharSeletorDePessoas();

  desenharMural();

  desenharGrupos();


  var base =
    document.getElementById("base");


  if(base){

    base.textContent =
      "base " + (DADOS.codigo || "K");

  }

}


/* ============================================================
   SELETOR DE PESSOAS
   ============================================================ */

function desenharSeletorDePessoas(){

  var alvo =
    document.getElementById("quem");


  if(!alvo){
    return;
  }


  if(alvo.options.length === 0){

    for(var i = 0; i < DADOS.pessoas.length; i++){

      var pessoa =
        DADOS.pessoas[i];


      var opcao =
        document.createElement("option");


      opcao.value =
        pessoa.id;


      opcao.textContent =
        pessoa.nome +
        (pessoa.curso
          ? " (" + pessoa.curso + ")"
          : "");


      alvo.appendChild(opcao);

    }

  }


  if(estado.pessoa !== null){

    alvo.value =
      estado.pessoa;

  }

}


/* ============================================================
   DESENHAR MURAL
   ============================================================ */

function desenharMural(){

  var alvo =
    document.getElementById("cartoes");


  if(!alvo){
    return;
  }


  var lista =
    ideiasVisiveis();


  alvo.innerHTML = "";


  for(var i = 0; i < lista.length; i++){

    alvo.appendChild(
      montarCartao(lista[i])
    );

  }


  var contagem =
    document.getElementById("contagem");


  if(contagem){

    contagem.textContent =
      lista.length +
      " de " +
      DADOS.ideias.length +
      " ideias";

  }


  var filtro =
    document.getElementById("filtro-ativo");


  if(filtro){

    if(estado.tag !== null){

      filtro.textContent =
        "mostrando apenas ideias com a etiqueta: " +
        estado.tag;

    }

    else if(estado.busca !== ""){

      filtro.textContent =
        "buscando por: " +
        estado.busca;

    }

    else{

      filtro.textContent = "";

    }

  }

}


/* ============================================================
   CARTÃO DA IDEIA
   ============================================================ */

function montarCartao(ideia){

  var cartao =
    document.createElement("div");

  cartao.className =
    "cartao";


  /* TÍTULO */

  var titulo =
    document.createElement("h3");


  titulo.textContent =
    ideia.titulo || "(sem título)";


  titulo.className =
    "titulo-clicavel";


  titulo.onclick = function(){

    abrirIdeia(ideia.id);

  };


  cartao.appendChild(titulo);


  /* AUTOR */

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


  autor.onclick = function(){

    abrirPessoa(ideia.autor);

  };


  autoria.appendChild(autor);


  if(ideia.data){

    var data =
      document.createElement("span");


    data.textContent =
      " · " + ideia.data;


    autoria.appendChild(data);

  }


  cartao.appendChild(autoria);


  /* RESUMO */

  var resumo =
    document.createElement("p");


  resumo.className =
    "resumo";


  resumo.textContent =
    ideia.resumo || "";


  cartao.appendChild(resumo);


  /* TAGS */

  var tags =
    document.createElement("div");


  tags.className =
    "tags";


  var listaTags =
    obterTags(ideia);


  for(var i = 0; i < listaTags.length; i++){

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


  /* RODAPÉ */

  var rodape =
    document.createElement("div");


  rodape.className =
    "rodape";


  /* BOTÃO DE INTERESSE */

  var botao =
    document.createElement("button");


  botao.className =
    "apoiar";


  var jaInteressado =
    ideia.interessados.indexOf(
      estado.pessoa
    ) !== -1;


  if(jaInteressado){

    botao.textContent =
      "retirar interesse";


    botao.classList.add(
      "interessado"
    );

  }

  else{

    botao.textContent =
      "mostrar interesse";

  }


  botao.onclick =
    criarCliqueDeInteresse(
      ideia.id
    );


  rodape.appendChild(botao);


  /* CONTADOR */

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

function criarCliqueDeInteresse(idIdeia){

  return function(){

    var ideia =
      ideiaPorId(idIdeia);


    if(!ideia || estado.pessoa === null){
      return;
    }


    if(!Array.isArray(ideia.interessados)){

      ideia.interessados = [];

    }


    var indice =
      ideia.interessados.indexOf(
        estado.pessoa
      );


    /* JÁ TEM INTERESSE → RETIRA */

    if(indice !== -1){

      ideia.interessados.splice(
        indice,
        1
      );


      if(ideia.apoios > 0){

        ideia.apoios--;

      }

    }


    /* NÃO TEM → ADICIONA */

    else{

      ideia.interessados.push(
        estado.pessoa
      );


      ideia.apoios++;

    }


    desenharMural();

  };

}


/* ============================================================
   FILTRO DE TAG
   ============================================================ */

function criarCliqueDeTag(tag){

  return function(){

    estado.tag = tag;

    estado.busca = "";


    var busca =
      document.getElementById("busca");


    if(busca){
      busca.value = "";
    }


    trocarAba("mural");

    desenharMural();

  };

}


/* ============================================================
   GRUPOS
   ============================================================ */

function desenharGrupos(){

  var alvo =
    document.getElementById("lista-grupos");


  if(!alvo){
    return;
  }


  alvo.innerHTML = "";


  for(var i = 0; i < DADOS.grupos.length; i++){

    var grupo =
      DADOS.grupos[i];


    var item =
      document.createElement("li");


    var nome =
      document.createElement("span");


    nome.className =
      "nome";


    nome.textContent =
      grupo.nome || "(sem nome)";


    item.appendChild(nome);


    var membros =
      document.createElement("span");


    membros.className =
      "quantos";


    membros.textContent =
      (
        Array.isArray(grupo.membros)
          ? grupo.membros.length
          : 0
      ) +
      " membros";


    item.appendChild(membros);


    var descricao =
      document.createElement("p");


    descricao.className =
      "descricao";


    descricao.textContent =
      grupo.descricao || "";


    item.appendChild(descricao);


    alvo.appendChild(item);

  }

}


/* ============================================================
   ESCONDER PÁGINAS
   ============================================================ */

function esconderTudo(){

  var ids = [
    "mural",
    "grupos",
    "pagina-pessoa",
    "pagina-ideia"
  ];


  for(var i = 0; i < ids.length; i++){

    var elemento =
      document.getElementById(ids[i]);


    if(elemento){

      elemento.classList.add(
        "escondido"
      );

    }

  }

}


/* ============================================================
   TROCAR ABA
   ============================================================ */

function trocarAba(qual){

  estado.aba = qual;

  esconderTudo();


  var alvo =
    document.getElementById(qual);


  if(alvo){

    alvo.classList.remove(
      "escondido"
    );

  }


  var mural =
    document.getElementById("aba-mural");


  var grupos =
    document.getElementById("aba-grupos");


  if(mural){

    mural.classList.toggle(
      "ativa",
      qual === "mural"
    );

  }


  if(grupos){

    grupos.classList.toggle(
      "ativa",
      qual === "grupos"
    );

  }

}


/* ============================================================
   PÁGINA DA PESSOA
   ============================================================ */

function abrirPessoa(id){

  var pessoa =
    pessoaPorId(id);


  var alvo =
    document.getElementById(
      "conteudo-pessoa"
    );


  if(!alvo){
    return;
  }


  esconderTudo();


  document
    .getElementById("pagina-pessoa")
    .classList.remove("escondido");


  alvo.innerHTML = "";


  if(!pessoa){

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
    (pessoa.tipo || "");


  alvo.appendChild(tipo);


  var curso =
    document.createElement("p");


  curso.innerHTML =
    "<strong>Curso:</strong> " +
    (pessoa.curso || "");


  alvo.appendChild(curso);


  /* INTERESSES */

  if(Array.isArray(pessoa.interesses)){

    var h3 =
      document.createElement("h3");


    h3.textContent =
      "Interesses";


    alvo.appendChild(h3);


    var ul =
      document.createElement("ul");


    for(var i = 0; i < pessoa.interesses.length; i++){

      var li =
        document.createElement("li");


      li.textContent =
        pessoa.interesses[i];


      ul.appendChild(li);

    }


    alvo.appendChild(ul);

  }


  /* IDEIAS */

  var hIdeias =
    document.createElement("h3");


  hIdeias.textContent =
    "Ideias publicadas";


  alvo.appendChild(hIdeias);


  var ideias =
    DADOS.ideias.filter(function(ideia){

      return String(ideia.autor) ===
             String(pessoa.id);

    });


  if(ideias.length === 0){

    var vazio =
      document.createElement("p");


    vazio.textContent =
      "ainda não publicou ideias";


    alvo.appendChild(vazio);

  }

  else{

    var lista =
      document.createElement("div");


    lista.className =
      "lista-ideias";


    for(var j = 0; j < ideias.length; j++){

      var link =
        document.createElement("button");


      link.className =
        "ideia-link";


      link.textContent =
        ideias[j].titulo;


      link.onclick =
        criarCliqueDeIdeia(
          ideias[j].id
        );


      lista.appendChild(link);

    }


    alvo.appendChild(lista);

  }

}


/* ============================================================
   PÁGINA DA IDEIA
   ============================================================ */

function abrirIdeia(id){

  var ideia =
    ideiaPorId(id);


  var alvo =
    document.getElementById(
      "conteudo-ideia"
    );


  if(!alvo){
    return;
  }


  esconderTudo();


  document
    .getElementById("pagina-ideia")
    .classList.remove("escondido");


  alvo.innerHTML = "";


  if(!ideia){

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


  autorBotao.onclick = function(){

    abrirPessoa(ideia.autor);

  };


  autor.appendChild(autorBotao);

  alvo.appendChild(autor);


  if(ideia.data){

    var data =
      document.createElement("p");


    data.innerHTML =
      "<strong>Data:</strong> " +
      ideia.data;


    alvo.appendChild(data);

  }


  var resumo =
    document.createElement("p");


  resumo.className =
    "resumo-grande";


  resumo.textContent =
    ideia.resumo || "";


  alvo.appendChild(resumo);


  /* TAGS */

  var tags =
    document.createElement("div");


  tags.className =
    "tags";


  var listaTags =
    obterTags(ideia);


  for(var i = 0; i < listaTags.length; i++){

    var tag =
      document.createElement("span");


    tag.className =
      "etiqueta";


    tag.textContent =
      listaTags[i];


    tags.appendChild(tag);

  }


  alvo.appendChild(tags);


  /* INTERESSE */

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


  if(jaInteressado){

    botao.classList.add(
      "interessado"
    );

  }


  botao.onclick = function(){

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
   INICIAR
   ============================================================ */

function iniciar(){

  if(typeof DADOS === "undefined"){

    document.body.innerHTML =
      "<main>" +
      "<h1>Erro ao carregar os dados</h1>" +
      "<p>Verifique se dados/dados_K.js está no lugar correto.</p>" +
      "</main>";

    return;

  }


  if(
    !Array.isArray(DADOS.pessoas) ||
    !Array.isArray(DADOS.ideias)
  ){

    document.body.innerHTML =
      "<main>" +
      "<h1>Erro na estrutura dos dados</h1>" +
      "<p>Verifique o arquivo dados_K.js.</p>" +
      "</main>";

    return;

  }


  if(DADOS.pessoas.length > 0){

    estado.pessoa =
      DADOS.pessoas[0].id;

  }


  prepararInteresses();


  /* BUSCA */

  document
    .getElementById("busca")
    .oninput = function(e){

      estado.busca =
        e.target.value;

      desenharMural();

    };


  /* PESSOA */

  document
    .getElementById("quem")
    .onchange = function(e){

      estado.pessoa =
        e.target.value;

      desenharMural();

    };


  /* MURAL */

  document
    .getElementById("aba-mural")
    .onclick = function(){

      estado.tag = null;

      trocarAba("mural");

      desenharMural();

    };


  /* GRUPOS */

  document
    .getElementById("aba-grupos")
    .onclick = function(){

      trocarAba("grupos");

    };


  /* VOLTAR PESSOA */

  document
    .getElementById("voltar-pessoa")
    .onclick = function(){

      trocarAba("mural");

      desenharMural();

    };


  /* VOLTAR IDEIA */

  document
    .getElementById("voltar-ideia")
    .onclick = function(){

      trocarAba("mural");

      desenharMural();

    };


  /* PRIMEIRO DESENHO */

  desenhar();


  trocarAba("mural");

}


/* ============================================================
   EXECUTAR
   ============================================================ */

iniciar();
