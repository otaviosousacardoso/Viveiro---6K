/* ============================================================
   Viveiro — lógica da página

   Usa diretamente:
   dados/dados_K.js -> DADOS

   Funcionalidades:
   V-01 - Página da pessoa
   V-03 - Publicar uma ideia
   V-04 - Encontrar ideias
   V-09 - Notificações internas
   V-10 - Arquivar ideias
============================================================ */


/* ============================================================
   ESTADO
============================================================ */

var estado = {

  pessoa: null,

  busca: "",

  tag: null,

  aba: "mural",

  pagina: "mural",

  pessoaAberta: null,

  ideiaAberta: null

};


/* ============================================================
   FUNÇÕES DE DADOS
============================================================ */

function pessoaPorId(id) {

  for (var i = 0; i < DADOS.pessoas.length; i++) {

    if (
      Number(DADOS.pessoas[i].id) ===
      Number(id)
    ) {

      return DADOS.pessoas[i];

    }

  }

  return null;
}


function ideiaPorId(id) {

  for (var i = 0; i < DADOS.ideias.length; i++) {

    if (
      Number(DADOS.ideias[i].id) ===
      Number(id)
    ) {

      return DADOS.ideias[i];

    }

  }

  return null;
}


function nomeDe(id) {

  var pessoa = pessoaPorId(id);

  if (!pessoa) {
    return "(desconhecido)";
  }

  /*
    Se o dados_K possuir pseudônimo,
    ele será mostrado no mural.
    Caso contrário, usa o nome.
  */

  return pessoa.pseudonimo ||
         pessoa.apelido ||
         pessoa.nome ||
         "(desconhecido)";
}


function nomeCompletoDe(id) {

  var pessoa = pessoaPorId(id);

  if (!pessoa) {
    return "(desconhecido)";
  }

  return pessoa.nome ||
         pessoa.pseudonimo ||
         "(desconhecido)";
}


/* ============================================================
   LOCAL STORAGE
============================================================ */

function lerLista(chave) {

  var dados = localStorage.getItem(chave);

  if (!dados) {
    return [];
  }

  try {

    return JSON.parse(dados);

  } catch (erro) {

    return [];

  }

}


function salvarLista(chave, lista) {

  localStorage.setItem(
    chave,
    JSON.stringify(lista)
  );

}


/* ============================================================
   ARQUIVAMENTO — V-10
============================================================ */

function lerArquivadas() {

  return lerLista(
    "viveiro_arquivadas"
  );

}


function salvarArquivadas(lista) {

  salvarLista(
    "viveiro_arquivadas",
    lista
  );

}


function ideiaArquivada(id) {

  var lista = lerArquivadas();

  return lista.indexOf(Number(id)) !== -1;

}


function arquivarIdeia(id) {

  var lista = lerArquivadas();

  id = Number(id);

  if (lista.indexOf(id) === -1) {

    lista.push(id);

  }

  salvarArquivadas(lista);

  estado.pagina = "mural";

  estado.aba = "mural";

  desenhar();

}


function desarquivarIdeia(id) {

  var lista = lerArquivadas();

  id = Number(id);

  var novaLista = [];

  for (var i = 0; i < lista.length; i++) {

    if (Number(lista[i]) !== id) {

      novaLista.push(lista[i]);

    }

  }

  salvarArquivadas(novaLista);

  desenhar();

}


/* ============================================================
   NOTIFICAÇÕES — V-09
============================================================ */

function lerNotificacoes() {

  return lerLista(
    "viveiro_notificacoes"
  );

}


function salvarNotificacoes(lista) {

  salvarLista(
    "viveiro_notificacoes",
    lista
  );

}


function criarNotificacao(idIdeia, idInteressado) {

  var ideia = ideiaPorId(idIdeia);

  if (!ideia) {
    return;
  }


  /*
    A notificação fica associada ao autor
    da ideia.
  */

  var notificacoes =
    lerNotificacoes();


  var notificacao = {

    id: Date.now(),

    autor: Number(ideia.autor),

    interessado: Number(idInteressado),

    ideia: Number(idIdeia),

    lida: false,

    data: new Date().toLocaleString("pt-BR")

  };


  notificacoes.unshift(
    notificacao
  );


  salvarNotificacoes(
    notificacoes
  );


  atualizarContadorNotificacoes();

}


/* ============================================================
   BUSCA — V-04
============================================================ */

function ideiasVisiveis() {

  var resultado = [];

  var texto =
    estado.busca
      .trim()
      .toLowerCase();


  for (
    var i = 0;
    i < DADOS.ideias.length;
    i++
  ) {

    var ideia = DADOS.ideias[i];


    /*
      Ideias arquivadas não aparecem
      no mural público.
    */

    if (
      ideiaArquivada(ideia.id)
    ) {

      continue;

    }


    /*
      Busca.
    */

    var casaTexto = true;


    if (texto !== "") {

      var titulo =
        String(
          ideia.titulo || ""
        ).toLowerCase();


      var resumo =
        String(
          ideia.resumo || ""
        ).toLowerCase();


      /*
        Também considera tags na busca.
        Isso ajuda a tornar o resultado
        mais relevante.
      */

      var tags =
        (ideia.tags || [])
          .join(" ")
          .toLowerCase();


      casaTexto =
        titulo.indexOf(texto) !== -1 ||
        resumo.indexOf(texto) !== -1 ||
        tags.indexOf(texto) !== -1;

    }


    /*
      Tag clicada.
    */

    var casaTag = true;


    if (estado.tag !== null) {

      var listaTags =
        ideia.tags || [];


      casaTag =
        listaTags.indexOf(
          estado.tag
        ) !== -1;

    }


    if (
      casaTexto &&
      casaTag
    ) {

      resultado.push(ideia);

    }

  }


  /*
    Ideias mais novas primeiro.
  */

  resultado.sort(
    function (a, b) {

      return Number(b.id) -
             Number(a.id);

    }
  );


  return resultado;

}


/* ============================================================
   DESENHAR TUDO
============================================================ */

function desenhar() {

  desenharSeletorDePessoas();

  desenharMural();

  desenharGrupos();

  desenharArquivo();

  desenharNotificacoes();

  atualizarContadorNotificacoes();

  document.getElementById("base").textContent =
    "base " + DADOS.codigo;


  mostrarPaginaAtual();

}


/* ============================================================
   SELETOR DE PESSOAS
============================================================ */

function desenharSeletorDePessoas() {

  var alvo =
    document.getElementById("quem");


  if (
    alvo.options.length === 0
  ) {

    for (
      var i = 0;
      i < DADOS.pessoas.length;
      i++
    ) {

      var pessoa =
        DADOS.pessoas[i];


      var opcao =
        document.createElement(
          "option"
        );


      opcao.value =
        pessoa.id;


      opcao.textContent =
        nomeDe(pessoa.id) +
        (
          pessoa.curso
            ? " (" + pessoa.curso + ")"
            : ""
        );


      alvo.appendChild(
        opcao
      );

    }

  }


  alvo.value =
    estado.pessoa;

}


/* ============================================================
   MURAL
============================================================ */

function desenharMural() {

  var lista =
    ideiasVisiveis();


  var alvo =
    document.getElementById(
      "cartoes"
    );


  alvo.innerHTML = "";


  for (
    var i = 0;
    i < lista.length;
    i++
  ) {

    alvo.appendChild(
      montarCartao(
        lista[i]
      )
    );

  }


  var totalPublicas =
    DADOS.ideias.filter(
      function (ideia) {

        return !ideiaArquivada(
          ideia.id
        );

      }
    ).length;


  document.getElementById(
    "contagem"
  ).textContent =
    lista.length +
    " de " +
    totalPublicas +
    " ideias";


  var aviso =
    document.getElementById(
      "filtro-ativo"
    );


  if (
    estado.tag !== null
  ) {

    aviso.textContent =
      "mostrando apenas ideias com a etiqueta: " +
      estado.tag;

  } else {

    aviso.textContent = "";

  }


  if (
    lista.length === 0
  ) {

    var vazio =
      document.createElement(
        "p"
      );

    vazio.className =
      "mensagem-vazia";

    vazio.textContent =
      estado.busca !== ""
        ? "nenhuma ideia encontrada para essa busca."
        : "nenhuma ideia disponível no mural.";

    alvo.appendChild(
      vazio
    );

  }

}


/* ============================================================
   CARTÃO DE IDEIA
============================================================ */

function montarCartao(ideia) {

  var cartao =
    document.createElement(
      "div"
    );

  cartao.className =
    "cartao";


  /*
    TÍTULO
  */

  var titulo =
    document.createElement(
      "h3"
    );


  var linkTitulo =
    document.createElement(
      "button"
    );


  linkTitulo.className =
    "link-titulo";


  linkTitulo.type =
    "button";


  linkTitulo.textContent =
    ideia.titulo;


  linkTitulo.onclick =
    function () {

      abrirIdeia(
        ideia.id
      );

    };


  titulo.appendChild(
    linkTitulo
  );


  cartao.appendChild(
    titulo
  );


  /*
    AUTOR
  */

  var autoria =
    document.createElement(
      "div"
    );


  autoria.className =
    "autoria";


  var autor =
    document.createElement(
      "button"
    );


  autor.type =
    "button";


  autor.className =
    "link-autor";


  autor.textContent =
    nomeDe(
      ideia.autor
    );


  autor.onclick =
    function () {

      abrirPessoa(
        ideia.autor
      );

    };


  autoria.appendChild(
    autor
  );


  autoria.appendChild(
    document.createTextNode(
      " · " +
      (ideia.data || "")
    )
  );


  cartao.appendChild(
    autoria
  );


  /*
    RESUMO
  */

  var resumo =
    document.createElement(
      "p"
    );


  resumo.className =
    "resumo";


  resumo.textContent =
    ideia.resumo || "";


  cartao.appendChild(
    resumo
  );


  /*
    TAGS
  */

  var tags =
    document.createElement(
      "div"
    );


  tags.className =
    "tags";


  var listaTags =
    ideia.tags || [];


  for (
    var i = 0;
    i < listaTags.length;
    i++
  ) {

    var etiqueta =
      document.createElement(
        "button"
      );


    etiqueta.type =
      "button";


    etiqueta.className =
      "etiqueta";


    etiqueta.textContent =
      listaTags[i];


    etiqueta.onclick =
      criarCliqueDeTag(
        listaTags[i]
      );


    tags.appendChild(
      etiqueta
    );

  }


  cartao.appendChild(
    tags
  );


  /*
    RODAPÉ
  */

  var rodape =
    document.createElement(
      "div"
    );


  rodape.className =
    "rodape";


  /*
    APOIAR
  */

  var apoiar =
    document.createElement(
      "button"
    );


  apoiar.type =
    "button";


  apoiar.className =
    "apoiar";


  apoiar.textContent =
    "demonstrar interesse";


  apoiar.onclick =
    criarCliqueDeApoio(
      ideia.id
    );


  rodape.appendChild(
    apoiar
  );


  /*
    CONTADOR
  */

  var contador =
    document.createElement(
      "span"
    );


  contador.className =
    "apoios";


  contador.textContent =
    (ideia.apoios || 0) +
    " apoios";


  rodape.appendChild(
    contador
  );


  /*
    ARQUIVAR.

    Só o dono da ideia
    pode arquivá-la.
  */

  if (
    Number(ideia.autor) ===
    Number(estado.pessoa)
  ) {

    var arquivo =
      document.createElement(
        "button"
      );


    arquivo.type =
      "button";


    arquivo.className =
      "botao-arquivar";


    arquivo.textContent =
      "arquivar";


    arquivo.onclick =
      function () {

        arquivarIdeia(
          ideia.id
        );

      };


    rodape.appendChild(
      arquivo
    );

  }


  cartao.appendChild(
    rodape
  );


  return cartao;

}


/* ============================================================
   APOIAR — V-09
============================================================ */

function criarCliqueDeApoio(
  idIdeia
) {

  return function () {

    var ideia =
      ideiaPorId(
        idIdeia
      );


    if (!ideia) {
      return;
    }


    /*
      O autor não precisa
      receber notificação
      quando demonstra interesse
      na própria ideia.
    */

    if (
      Number(ideia.autor) !==
      Number(estado.pessoa)
    ) {

      ideia.apoios =
        Number(ideia.apoios || 0) + 1;


      criarNotificacao(
        ideia.id,
        estado.pessoa
      );

    }


    /*
      Atualiza a tela sem
      recarregar a página.
    */

    desenharMural();

    desenharNotificacoes();

    atualizarContadorNotificacoes();

  };

}


/* ============================================================
   TAG
============================================================ */

function criarCliqueDeTag(tag) {

  return function () {

    estado.tag = tag;

    estado.aba = "mural";

    estado.pagina = "mural";

    desenhar();

  };

}


/* ============================================================
   PÁGINA DA IDEIA
============================================================ */

function abrirIdeia(id) {

  estado.pagina =
    "ideia";

  estado.ideiaAberta =
    Number(id);

  mostrarPaginaAtual();

}


function desenharIdeia() {

  var alvo =
    document.getElementById(
      "conteudo-ideia"
    );


  alvo.innerHTML = "";


  var ideia =
    ideiaPorId(
      estado.ideiaAberta
    );


  if (!ideia) {

    alvo.textContent =
      "ideia não encontrada.";

    return;

  }


  var titulo =
    document.createElement(
      "h2"
    );


  titulo.textContent =
    ideia.titulo;


  alvo.appendChild(
    titulo
  );


  /*
    AUTOR
  */

  var autoria =
    document.createElement(
      "p"
    );


  autoria.className =
    "autoria-grande";


  var autor =
    document.createElement(
      "button"
    );


  autor.type =
    "button";


  autor.className =
    "link-autor";


  autor.textContent =
    nomeDe(
      ideia.autor
    );


  autor.onclick =
    function () {

      abrirPessoa(
        ideia.autor
      );

    };


  autoria.appendChild(
    autor
  );


  autoria.appendChild(
    document.createTextNode(
      " · " +
      (ideia.data || "")
    )
  );


  alvo.appendChild(
    autoria
  );


  /*
    RESUMO
  */

  var resumo =
    document.createElement(
      "p"
    );


  resumo.className =
    "resumo-grande";


  resumo.textContent =
    ideia.resumo || "";


  alvo.appendChild(
    resumo
  );


  /*
    TAGS
  */

  var tags =
    document.createElement(
      "div"
    );


  tags.className =
    "tags";


  var listaTags =
    ideia.tags || [];


  for (
    var i = 0;
    i < listaTags.length;
    i++
  ) {

    var etiqueta =
      document.createElement(
        "span"
      );


    etiqueta.className =
      "etiqueta";


    etiqueta.textContent =
      listaTags[i];


    tags.appendChild(
      etiqueta
    );

  }


  alvo.appendChild(
    tags
  );


  /*
    AÇÕES
  */

  var acoes =
    document.createElement(
      "div"
    );


  acoes.className =
    "detalhe-acoes";


  var apoiar =
    document.createElement(
      "button"
    );


  apoiar.type =
    "button";


  apoiar.className =
    "apoiar";


  apoiar.textContent =
    "demonstrar interesse";


  apoiar.onclick =
    criarCliqueDeApoio(
      ideia.id
    );


  acoes.appendChild(
    apoiar
  );


  var contador =
    document.createElement(
      "span"
    );


  contador.className =
    "apoios";


  contador.textContent =
    (ideia.apoios || 0) +
    " apoios";


  acoes.appendChild(
    contador
  );


  /*
    ARQUIVAR
  */

  if (
    Number(ideia.autor) ===
    Number(estado.pessoa)
  ) {

    var arquivo =
      document.createElement(
        "button"
      );


    arquivo.type =
      "button";


    arquivo.className =
      "botao-arquivar";


    arquivo.textContent =
      ideiaArquivada(
        ideia.id
      )
        ? "desarquivar"
        : "arquivar";


    arquivo.onclick =
      function () {

        if (
          ideiaArquivada(
            ideia.id
          )
        ) {

          desarquivarIdeia(
            ideia.id
          );

        } else {

          arquivarIdeia(
            ideia.id
          );

        }

      };


    acoes.appendChild(
      arquivo
    );

  }


  alvo.appendChild(
    acoes
  );

}


/* ============================================================
   PÁGINA DA PESSOA — V-01
============================================================ */

function abrirPessoa(id) {

  estado.pagina =
    "pessoa";

  estado.pessoaAberta =
    Number(id);

  mostrarPaginaAtual();

}


function obterCampoPessoa(
  pessoa,
  campos,
  padrao
) {

  for (
    var i = 0;
    i < campos.length;
    i++
  ) {

    if (
      pessoa[campos[i]] !==
      undefined &&
      pessoa[campos[i]] !==
      null
    ) {

      return pessoa[campos[i]];

    }

  }

  return padrao;

}


function transformarLista(valor) {

  if (
    Array.isArray(valor)
  ) {

    return valor;

  }


  if (
    typeof valor ===
    "string"
  ) {

    return valor
      .split(",")
      .map(
        function (item) {
          return item.trim();
        }
      )
      .filter(
        function (item) {
          return item !== "";
        }
      );

  }


  return [];

}


function desenharPessoa() {

  var alvo =
    document.getElementById(
      "conteudo-pessoa"
    );


  alvo.innerHTML = "";


  var pessoa =
    pessoaPorId(
      estado.pessoaAberta
    );


  if (!pessoa) {

    alvo.textContent =
      "pessoa não encontrada.";

    return;

  }


  /*
    NOME / PSEUDÔNIMO
  */

  var titulo =
    document.createElement(
      "h2"
    );


  titulo.textContent =
    nomeDe(
      pessoa.id
    );


  alvo.appendChild(
    titulo
  );


  /*
    TIPO
  */

  var tipo =
    obterCampoPessoa(
      pessoa,
      [
        "tipo",
        "perfil",
        "papel",
        "funcao"
      ],
      ""
    );


  if (tipo !== "") {

    var tipoElemento =
      document.createElement(
        "p"
      );


    tipoElemento.className =
      "tipo-pessoa";


    tipoElemento.textContent =
      tipo;


    alvo.appendChild(
      tipoElemento
    );

  }


  /*
    INTERESSES
  */

  var interesses =
    obterCampoPessoa(
      pessoa,
      [
        "interesses",
        "interessesPessoais"
      ],
      []
    );


  interesses =
    transformarLista(
      interesses
    );


  var blocoInteresses =
    document.createElement(
      "div"
    );


  blocoInteresses.className =
    "perfil-bloco";


  var tituloInteresses =
    document.createElement(
      "h3"
    );


  tituloInteresses.textContent =
    "Interesses";


  blocoInteresses.appendChild(
    tituloInteresses
  );


  if (
    interesses.length === 0
  ) {

    var nenhumInteresse =
      document.createElement(
        "p"
      );


    nenhumInteresse.textContent =
      "nenhum interesse informado.";


    blocoInteresses.appendChild(
      nenhumInteresse
    );

  } else {

    var listaInteresses =
      document.createElement(
        "div"
      );


    listaInteresses.className =
      "lista-interesses";


    for (
      var i = 0;
      i < interesses.length;
      i++
    ) {

      var interesse =
        document.createElement(
          "span"
        );


      interesse.className =
        "interesse";


      interesse.textContent =
        interesses[i];


      listaInteresses.appendChild(
        interesse
      );

    }


    blocoInteresses.appendChild(
      listaInteresses
    );

  }


  alvo.appendChild(
    blocoInteresses
  );


  /*
    MUDANÇAS
  */

  var mudancas =
    obterCampoPessoa(
      pessoa,
      [
        "mudancas",
        "mudancasDeInteresse",
        "mudancasInteresses"
      ],
      []
    );


  mudancas =
    transformarLista(
      mudancas
    );


  var blocoMudancas =
    document.createElement(
      "div"
    );


  blocoMudancas.className =
    "perfil-bloco";


  var tituloMudancas =
    document.createElement(
      "h3"
    );


  tituloMudancas.textContent =
    "Mudanças";


  blocoMudancas.appendChild(
    tituloMudancas
  );


  if (
    mudancas.length === 0
  ) {

    var nenhumaMudanca =
      document.createElement(
        "p"
      );


    nenhumaMudanca.textContent =
      "nenhuma mudança registrada.";


    blocoMudancas.appendChild(
      nenhumaMudanca
    );

  } else {

    var listaMudancas =
      document.createElement(
        "ul"
      );


    listaMudancas.className =
      "lista-mudancas";


    for (
      var j = 0;
      j < mudancas.length;
      j++
    ) {

      var mudanca =
        document.createElement(
          "li"
        );


      mudanca.textContent =
        mudancas[j];


      listaMudancas.appendChild(
        mudanca
      );

    }


    blocoMudancas.appendChild(
      listaMudancas
    );

  }


  alvo.appendChild(
    blocoMudancas
  );


  /*
    NOME REAL

    O nome real não é mostrado
    publicamente. Ele fica disponível
    somente quando a pessoa entra
    em uma conversa.

    Como esta versão ainda não possui
    módulo de conversa, o nome fica
    preparado para essa utilização.
  */


  /*
    IDEIAS PUBLICADAS
  */

  var blocoIdeias =
    document.createElement(
      "div"
    );


  blocoIdeias.className =
    "perfil-bloco";


  var tituloIdeias =
    document.createElement(
      "h3"
    );


  tituloIdeias.textContent =
    "Ideias publicadas";


  blocoIdeias.appendChild(
    tituloIdeias
  );


  var ideiasPessoa =
    [];


  for (
    var k = 0;
    k < DADOS.ideias.length;
    k++
  ) {

    if (
      Number(
        DADOS.ideias[k].autor
      ) ===
      Number(
        pessoa.id
      )
    ) {

      /*
        Ideias arquivadas são privadas
        e não aparecem na página pública.
      */

      if (
        !ideiaArquivada(
          DADOS.ideias[k].id
        )
      ) {

        ideiasPessoa.push(
          DADOS.ideias[k]
        );

      }

    }

  }


  if (
    ideiasPessoa.length === 0
  ) {

    var nenhumaIdeia =
      document.createElement(
        "p"
      );


    nenhumaIdeia.className =
      "mensagem-vazia";


    nenhumaIdeia.textContent =
      "ainda não publicou ideias";


    blocoIdeias.appendChild(
      nenhumaIdeia
    );

  } else {

    var listaIdeias =
      document.createElement(
        "ul"
      );


    listaIdeias.className =
      "lista-ideias-pessoa";


    for (
      var l = 0;
      l < ideiasPessoa.length;
      l++
    ) {

      var item =
        document.createElement(
          "li"
        );


      var link =
        document.createElement(
          "button"
        );


      link.type =
        "button";


      link.className =
        "link-ideia-pessoa";


      link.textContent =
        ideiasPessoa[l].titulo;


      link.onclick =
        (function (
          idIdeia
        ) {

          return function () {

            abrirIdeia(
              idIdeia
            );

          };

        })(
          ideiasPessoa[l].id
        );


      item.appendChild(
        link
      );


      listaIdeias.appendChild(
        item
      );

    }


    blocoIdeias.appendChild(
      listaIdeias
    );

  }


  alvo.appendChild(
    blocoIdeias
  );

}


/* ============================================================
   PUBLICAR IDEIA — V-03
============================================================ */

function abrirPublicacao() {

  estado.pagina =
    "publicar";

  mostrarPaginaAtual();


  document.getElementById(
    "novo-titulo"
  ).focus();

}


function publicarIdeia() {

  var titulo =
    document.getElementById(
      "novo-titulo"
    ).value.trim();


  var resumo =
    document.getElementById(
      "novo-resumo"
    ).value.trim();


  var tagsTexto =
    document.getElementById(
      "novas-tags"
    ).value.trim();


  var erro =
    document.getElementById(
      "erro-publicacao"
    );


  /*
    V-03:
    título vazio impede envio.
  */

  if (
    titulo === ""
  ) {

    erro.textContent =
      "Digite um título para publicar a ideia.";

    document.getElementById(
      "novo-titulo"
    ).focus();

    return false;

  }


  erro.textContent =
    "";


  /*
    Tags.
  */

  var tags = [];


  if (
    tagsTexto !== ""
  ) {

    var separadas =
      tagsTexto.split(",");


    for (
      var i = 0;
      i < separadas.length;
      i++
    ) {

      var tag =
        separadas[i].trim();


      if (
        tag !== "" &&
        tags.indexOf(tag) === -1
      ) {

        tags.push(tag);

      }

    }

  }


  /*
    Gera um ID novo.
  */

  var maiorId = 0;


  for (
    var j = 0;
    j < DADOS.ideias.length;
    j++
  ) {

    var idAtual =
      Number(
        DADOS.ideias[j].id
      );


    if (
      idAtual > maiorId
    ) {

      maiorId =
        idAtual;

    }

  }


  var novoId =
    maiorId + 1;


  /*
    Data atual.
  */

  var hoje =
    new Date();


  var dataHoje =
    hoje.toLocaleDateString(
      "pt-BR"
    );


  /*
    Cria a ideia usando
    a mesma estrutura usada
    pelas ideias do DADOS.
  */

  var novaIdeia = {

    id: novoId,

    autor:
      Number(
        estado.pessoa
      ),

    titulo:
      titulo,

    resumo:
      resumo,

    tags:
      tags,

    data:
      dataHoje,

    apoios:
      0

  };


  /*
    Coloca a ideia no início
    do array.
  */

  DADOS.ideias.unshift(
    novaIdeia
  );


  /*
    Limpa formulário.
  */

  document.getElementById(
    "form-publicar"
  ).reset();


  /*
    Volta para o mural
    sem recarregar.
  */

  estado.busca = "";

  estado.tag = null;

  estado.aba = "mural";

  estado.pagina = "mural";


  document.getElementById(
    "busca"
  ).value = "";


  desenhar();


  return false;

}


/* ============================================================
   ARQUIVO — V-10
============================================================ */

function desenharArquivo() {

  var alvo =
    document.getElementById(
      "lista-arquivo"
    );


  alvo.innerHTML = "";


  var arquivadas =
    lerArquivadas();


  var minhasIdeias = [];


  for (
    var i = 0;
    i < DADOS.ideias.length;
    i++
  ) {

    var ideia =
      DADOS.ideias[i];


    if (
      Number(ideia.autor) ===
      Number(estado.pessoa)
    ) {

      if (
        arquivadas.indexOf(
          Number(ideia.id)
        ) !== -1
      ) {

        minhasIdeias.push(
          ideia
        );

      }

    }

  }


  if (
    minhasIdeias.length === 0
  ) {

    var vazio =
      document.createElement(
        "p"
      );


    vazio.className =
      "mensagem-vazia";


    vazio.textContent =
      "você ainda não possui ideias arquivadas.";


    alvo.appendChild(
      vazio
    );


    return;

  }


  for (
    var j = 0;
    j < minhasIdeias.length;
    j++
  ) {

    alvo.appendChild(
      montarCartaoArquivo(
        minhasIdeias[j]
      )
    );

  }

}


function montarCartaoArquivo(
  ideia
) {

  var cartao =
    document.createElement(
      "div"
    );


  cartao.className =
    "cartao cartao-arquivado";


  var titulo =
    document.createElement(
      "h3"
    );


  var link =
    document.createElement(
      "button"
    );


  link.type =
    "button";


  link.className =
    "link-titulo";


  link.textContent =
    ideia.titulo;


  link.onclick =
    function () {

      abrirIdeia(
        ideia.id
      );

    };


  titulo.appendChild(
    link
  );


  cartao.appendChild(
    titulo
  );


  var texto =
    document.createElement(
      "p"
    );


  texto.className =
    "resumo";


  texto.textContent =
    ideia.resumo || "";


  cartao.appendChild(
    texto
  );


  var aviso =
    document.createElement(
      "p"
    );


  aviso.className =
    "aviso-privado";


  aviso.textContent =
    "🔒 ideia arquivada — visível somente para você";


  cartao.appendChild(
    aviso
  );


  var desarquivar =
    document.createElement(
      "button"
    );


  desarquivar.type =
    "button";


  desarquivar.className =
    "botao-arquivar";


  desarquivar.textContent =
    "desarquivar";


  desarquivar.onclick =
    function () {

      desarquivarIdeia(
        ideia.id
      );

    };


  cartao.appendChild(
    desarquivar
  );


  return cartao;

}


/* ============================================================
   NOTIFICAÇÕES
============================================================ */

function desenharNotificacoes() {

  var alvo =
    document.getElementById(
      "lista-notificacoes"
    );


  alvo.innerHTML = "";


  var todas =
    lerNotificacoes();


  /*
    Mostra somente notificações
    destinadas à pessoa atual.
  */

  var minhas = [];


  for (
    var i = 0;
    i < todas.length;
    i++
  ) {

    if (
      Number(
        todas[i].autor
      ) ===
      Number(
        estado.pessoa
      )
    ) {

      minhas.push(
        todas[i]
      );

    }

  }


  if (
    minhas.length === 0
  ) {

    var vazio =
      document.createElement(
        "p"
      );


    vazio.className =
      "mensagem-vazia";


    vazio.textContent =
      "você não possui novas notificações.";


    alvo.appendChild(
      vazio
    );


    return;

  }


  for (
    var j = 0;
    j < minhas.length;
    j++
  ) {

    alvo.appendChild(
      montarNotificacao(
        minhas[j]
      )
    );

  }

}


function montarNotificacao(
  notificacao
) {

  var ideia =
    ideiaPorId(
      notificacao.ideia
    );


  var cartao =
    document.createElement(
      "button"
    );


  cartao.type =
    "button";


  cartao.className =
    notificacao.lida
      ? "notificacao lida"
      : "notificacao nova";


  if (!ideia) {

    cartao.textContent =
      "Uma pessoa demonstrou interesse em uma ideia.";

    return cartao;

  }


  var interessado =
    nomeCompletoDe(
      notificacao.interessado
    );


  /*
    A notificação mostra:
    nome de quem se interessou
    + título da ideia.
  */

  var texto =
    document.createElement(
      "span"
    );


  texto.className =
    "texto-notificacao";


  texto.innerHTML =
    "<strong>" +
    escaparHTML(interessado) +
    "</strong>" +
    " demonstrou interesse na sua ideia " +
    "<strong>\"" +
    escaparHTML(ideia.titulo) +
    "\"</strong>";


  cartao.appendChild(
    texto
  );


  var data =
    document.createElement(
      "small"
    );


  data.textContent =
    notificacao.data;


  cartao.appendChild(
    data
  );


  cartao.onclick =
    function () {

      marcarNotificacaoComoLida(
        notificacao.id
      );

      abrirIdeia(
        ideia.id
      );

    };


  return cartao;

}


/* ============================================================
   SEGURANÇA DO TEXTO
============================================================ */

function escaparHTML(
  texto
) {

  var div =
    document.createElement(
      "div"
    );


  div.textContent =
    String(texto);


  return div.innerHTML;

}


/* ============================================================
   CONTADOR DE NOTIFICAÇÕES
============================================================ */

function atualizarContadorNotificacoes() {

  var notificacoes =
    lerNotificacoes();


  var quantidade = 0;


  for (
    var i = 0;
    i < notificacoes.length;
    i++
  ) {

    if (
      Number(
        notificacoes[i].autor
      ) ===
      Number(
        estado.pessoa
      ) &&
      !notificacoes[i].lida
    ) {

      quantidade++;

    }

  }


  var contador =
    document.getElementById(
      "contador-notificacoes"
    );


  contador.textContent =
    quantidade;


  if (
    quantidade === 0
  ) {

    contador.classList.add(
      "sem-notificacao"
    );

  } else {

    contador.classList.remove(
      "sem-notificacao"
    );

  }

}


/* ============================================================
   MARCAR NOTIFICAÇÃO COMO LIDA
============================================================ */

function marcarNotificacaoComoLida(
  id
) {

  var lista =
    lerNotificacoes();


  for (
    var i = 0;
    i < lista.length;
    i++
  ) {

    if (
      Number(
        lista[i].id
      ) ===
      Number(id)
    ) {

      lista[i].lida =
        true;

    }

  }


  salvarNotificacoes(
    lista
  );


  atualizarContadorNotificacoes();

}


function marcarTodasComoLidas() {

  var lista =
    lerNotificacoes();


  for (
    var i = 0;
    i < lista.length;
    i++
  ) {

    if (
      Number(
        lista[i].autor
      ) ===
      Number(
        estado.pessoa
      )
    ) {

      lista[i].lida =
        true;

    }

  }


  salvarNotificacoes(
    lista
  );


  desenharNotificacoes();

  atualizarContadorNotificacoes();

}


/* ============================================================
   ABAS
============================================================ */

function trocarAba(
  qual
) {

  estado.aba =
    qual;

  estado.pagina =
    qual;

  mostrarPaginaAtual();

}


/* ============================================================
   CONTROLE DAS PÁGINAS
============================================================ */

function esconderTodasAsPaginas() {

  var paginas = [

    "mural",
    "grupos",
    "arquivo",
    "notificacoes",
    "pagina-pessoa",
    "pagina-ideia",
    "pagina-publicar"

  ];


  for (
    var i = 0;
    i < paginas.length;
    i++
  ) {

    document
      .getElementById(
        paginas[i]
      )
      .classList.add(
        "escondido"
      );

  }

}


function mostrarPaginaAtual() {

  esconderTodasAsPaginas();


  /*
    Páginas internas.
  */

  if (
    estado.pagina ===
    "pessoa"
  ) {

    document
      .getElementById(
        "pagina-pessoa"
      )
      .classList.remove(
        "escondido"
      );

    desenharPessoa();

    atualizarAbas();

    return;

  }


  if (
    estado.pagina ===
    "ideia"
  ) {

    document
      .getElementById(
        "pagina-ideia"
      )
      .classList.remove(
        "escondido"
      );

    desenharIdeia();

    atualizarAbas();

    return;

  }


  if (
    estado.pagina ===
    "publicar"
  ) {

    document
      .getElementById(
        "pagina-publicar"
      )
      .classList.remove(
        "escondido"
      );

    atualizarAbas();

    return;

  }


  /*
    Abas principais.
  */

  if (
    estado.pagina ===
    "grupos"
  ) {

    document
      .getElementById(
        "grupos"
      )
      .classList.remove(
        "escondido"
      );

  } else if (
    estado.pagina ===
    "arquivo"
  ) {

    document
      .getElementById(
        "arquivo"
      )
      .classList.remove(
        "escondido"
      );

  } else if (
    estado.pagina ===
    "notificacoes"
  ) {

    document
      .getElementById(
        "notificacoes"
      )
      .classList.remove(
        "escondido"
      );

  } else {

    document
      .getElementById(
        "mural"
      )
      .classList.remove(
        "escondido"
      );

  }


  atualizarAbas();

}


function atualizarAbas() {

  var abas = [

    {
      id: "aba-mural",
      pagina: "mural"
    },

    {
      id: "aba-grupos",
      pagina: "grupos"
    },

    {
      id: "aba-arquivo",
      pagina: "arquivo"
    },

    {
      id: "aba-notificacoes",
      pagina: "notificacoes"
    }

  ];


  for (
    var i = 0;
    i < abas.length;
    i++
  ) {

    var elemento =
      document.getElementById(
        abas[i].id
      );


    if (
      estado.pagina ===
      abas[i].pagina
    ) {

      elemento.className =
        "aba ativa";

    } else {

      elemento.className =
        "aba";

    }

  }

}


/* ============================================================
   GRUPOS
============================================================ */

function desenharGrupos() {

  var alvo =
    document.getElementById(
      "lista-grupos"
    );


  alvo.innerHTML = "";


  for (
    var i = 0;
    i < DADOS.grupos.length;
    i++
  ) {

    var grupo =
      DADOS.grupos[i];


    var item =
      document.createElement(
        "li"
      );


    var quantidade =
      document.createElement(
        "span"
      );


    quantidade.className =
      "quantos";


    quantidade.textContent =
      (
        grupo.membros || []
      ).length +
      " membros";


    item.appendChild(
      quantidade
    );


    var nome =
      document.createElement(
        "span"
      );


    nome.className =
      "nome";


    nome.textContent =
      grupo.nome;


    item.appendChild(
      nome
    );


    var descricao =
      document.createElement(
        "p"
      );


    descricao.className =
      "descricao";


    descricao.textContent =
      grupo.descricao || "";


    item.appendChild(
      descricao
    );


    alvo.appendChild(
      item
    );

  }


  if (
    DADOS.grupos.length === 0
  ) {

    var vazio =
      document.createElement(
        "p"
      );


    vazio.className =
      "mensagem-vazia";


    vazio.textContent =
      "nenhum grupo cadastrado.";


    alvo.appendChild(
      vazio
    );

  }

}


/* ============================================================
   INÍCIO
============================================================ */

function iniciar() {

  /*
    Primeira pessoa do dados_K.
  */

  if (
    DADOS.pessoas.length > 0
  ) {

    estado.pessoa =
      DADOS.pessoas[0].id;

  }


  /*
    Busca rápida.
  */

  document
    .getElementById(
      "busca"
    )
    .oninput =
    function (e) {

      estado.busca =
        e.target.value;

      desenharMural();

    };


  /*
    Trocar pessoa.
  */

  document
    .getElementById(
      "quem"
    )
    .onchange =
    function (e) {

      estado.pessoa =
        Number(
          e.target.value
        );


      /*
        Ao trocar de pessoa,
        volta para o mural.
      */

      estado.pagina =
        "mural";

      estado.aba =
        "mural";

      desenhar();

    };


  /*
    Abas.
  */

  document
    .getElementById(
      "aba-mural"
    )
    .onclick =
    function () {

      trocarAba(
        "mural"
      );

    };


  document
    .getElementById(
      "aba-grupos"
    )
    .onclick =
    function () {

      trocarAba(
        "grupos"
      );

    };


  document
    .getElementById(
      "aba-arquivo"
    )
    .onclick =
    function () {

      trocarAba(
        "arquivo"
      );

    };


  document
    .getElementById(
      "aba-notificacoes"
    )
    .onclick =
    function () {

      trocarAba(
        "notificacoes"
      );

    };


  /*
    Publicar.
  */

  document
    .getElementById(
      "botao-publicar"
    )
    .onclick =
    function () {

      abrirPublicacao();

    };


  document
    .getElementById(
      "form-publicar"
    )
    .onsubmit =
    function (e) {

      e.preventDefault();

      publicarIdeia();

    };


  /*
    Botões voltar.
  */

  document
    .getElementById(
      "voltar-pessoa"
    )
    .onclick =
    function () {

      estado.pagina =
        "mural";

      estado.aba =
        "mural";

      desenhar();

    };


  document
    .getElementById(
      "voltar-ideia"
    )
    .onclick =
    function () {

      estado.pagina =
        "mural";

      estado.aba =
        "mural";

      desenhar();

    };


  document
    .getElementById(
      "voltar-publicar"
    )
    .onclick =
    function () {

      estado.pagina =
        "mural";

      estado.aba =
        "mural";

      desenhar();

    };


  /*
    Notificações.
  */

  document
    .getElementById(
      "marcar-notificacoes"
    )
    .onclick =
    function () {

      marcarTodasComoLidas();

    };


  /*
    Primeiro desenho.
  */

  desenhar();

}


iniciar();
