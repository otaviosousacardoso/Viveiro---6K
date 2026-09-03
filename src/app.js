/* Viveiro — lógica da página
V-01, V-03, V-04, V-09 e V-10

Os dados vêm de:
dados/dados_K.js

A variável DADOS é usada como base do sistema.
*/

var estado = {
pessoa: null,
busca: "",
tag: null,
aba: "mural",
pessoaPagina: null,
ideiaPagina: null
};

/* ================================================================
PREPARAÇÃO DOS DADOS
================================================================ */

function prepararDados() {

if (!DADOS.pessoas) {
DADOS.pessoas = [];
}

if (!DADOS.ideias) {
DADOS.ideias = [];
}

if (!DADOS.grupos) {
DADOS.grupos = [];
}

/*

* Cada ideia recebe sua própria lista de interessados.
* Isso permite que a mesma pessoa não seja contabilizada
* duas vezes.
  */

for (var i = 0; i < DADOS.ideias.length; i++) {

```
var ideia = DADOS.ideias[i];

if (!Array.isArray(ideia.interessados)) {
  ideia.interessados = [];

  /*
   * Se os dados antigos possuem apoios, criamos
   * apenas a quantidade inicial de interesses.
   * Os novos interesses passam a ser controlados
   * individualmente.
   */
  var quantidade = Number(ideia.apoios) || 0;

  for (var j = 0; j < quantidade; j++) {
    ideia.interessados.push("legado-" + j);
  }
}

if (ideia.arquivada === undefined) {
  ideia.arquivada = false;
}
```

}

if (!DADOS.notificacoes) {
DADOS.notificacoes = [];
}
}

/* ================================================================
ATALHOS
================================================================ */

function pessoaPorId(id) {

for (var i = 0; i < DADOS.pessoas.length; i++) {

```
if (DADOS.pessoas[i].id === id) {
  return DADOS.pessoas[i];
}
```

}

return null;
}

function nomeDe(id) {

var p = pessoaPorId(id);

return p ? p.nome : "(desconhecido)";
}

function ideiaPorId(id) {

for (var i = 0; i < DADOS.ideias.length; i++) {

```
if (DADOS.ideias[i].id === id) {
  return DADOS.ideias[i];
}
```

}

return null;
}

/* ================================================================
DATA
================================================================ */

function dataHoje() {

var agora = new Date();

var dia = String(agora.getDate()).padStart(2, "0");
var mes = String(agora.getMonth() + 1).padStart(2, "0");
var ano = agora.getFullYear();

return dia + "/" + mes + "/" + ano;
}

/* ================================================================
TAGS
================================================================ */

function tagsDaIdeia(ideia) {

if (Array.isArray(ideia.tags)) {
return ideia.tags;
}

if (typeof ideia.tags === "string") {

```
return ideia.tags
  .split(",")
  .map(function (tag) {
    return tag.trim();
  })
  .filter(function (tag) {
    return tag !== "";
  });
```

}

return [];
}

/* ================================================================
FILTRAGEM / V-04
================================================================ */

function ideiasVisiveis() {

var resultado = [];

var texto = estado.busca.toLowerCase().trim();

for (var i = 0; i < DADOS.ideias.length; i++) {

```
var ideia = DADOS.ideias[i];

/*
 * Ideias arquivadas não aparecem no mural.
 */
if (ideia.arquivada === true) {
  continue;
}

var titulo = String(ideia.titulo || "").toLowerCase();
var resumo = String(ideia.resumo || "").toLowerCase();

var tags = tagsDaIdeia(ideia);

var textoTags = tags.join(" ").toLowerCase();

var casaTexto = true;

if (texto !== "") {

  casaTexto =
    titulo.includes(texto) ||
    resumo.includes(texto) ||
    textoTags.includes(texto);

}

var casaTag = true;

if (estado.tag !== null) {

  casaTag =
    tags.indexOf(estado.tag) >= 0;

}

if (casaTexto && casaTag) {

  resultado.push(ideia);

}
```

}

/*

* Ideias que combinam melhor com a busca ficam primeiro.
  */
  if (texto !== "") {

```
resultado.sort(function (a, b) {
```

```
  var tituloA = String(a.titulo || "").toLowerCase();
  var tituloB = String(b.titulo || "").toLowerCase();

  var resumoA = String(a.resumo || "").toLowerCase();
  var resumoB = String(b.resumo || "").toLowerCase();

  var pontosA = 0;
  var pontosB = 0;

  if (tituloA.includes(texto)) pontosA += 3;
  if (resumoA.includes(texto)) pontosA += 1;

  if (tituloB.includes(texto)) pontosB += 3;
  if (resumoB.includes(texto)) pontosB += 1;

  return pontosB - pontosA;

});
```

}

return resultado;
}

/* ================================================================
DESENHO PRINCIPAL
================================================================ */

function desenhar() {

desenharSeletorDePessoas();
desenharMural();
desenharGrupos();
desenharArquivadas();
desenharNotificacoes();
atualizarContadorNotificacoes();

document.getElementById("base").textContent =
"base " + (DADOS.codigo || "K");
}

/* ================================================================
SELETOR DE PESSOA
================================================================ */

function desenharSeletorDePessoas() {

var alvo = document.getElementById("quem");

if (alvo.options.length === 0) {

```
for (var i = 0; i < DADOS.pessoas.length; i++) {

  var p = DADOS.pessoas[i];

  var opcao = document.createElement("option");

  opcao.value = p.id;

  opcao.textContent =
    p.nome +
    (p.curso ? " (" + p.curso + ")" : "");

  alvo.appendChild(opcao);

}
```

}

alvo.value = estado.pessoa;
}

/* ================================================================
MURAL
================================================================ */

function desenharMural() {

var lista = ideiasVisiveis();

var alvo = document.getElementById("cartoes");

alvo.innerHTML = "";

for (var i = 0; i < lista.length; i++) {

```
alvo.appendChild(
  montarCartao(lista[i])
);
```

}

document.getElementById("contagem").textContent =
lista.length +
" de " +
DADOS.ideias.filter(function (ideia) {
return ideia.arquivada !== true;
}).length +
" ideias";

var aviso = document.getElementById("filtro-ativo");

if (estado.tag !== null) {

```
aviso.textContent =
  "mostrando apenas ideias com a etiqueta: " +
  estado.tag;
```

} else if (estado.busca !== "") {

```
aviso.textContent =
  "resultados para: " +
  estado.busca;
```

} else {

```
aviso.textContent = "";
```

}

var vazio = document.getElementById("sem-ideias");

if (lista.length === 0) {

```
vazio.classList.remove("escondido");
```

} else {

```
vazio.classList.add("escondido");
```

}

}

/* ================================================================
CARTÃO
================================================================ */

function montarCartao(ideia) {

var cartao = document.createElement("div");

cartao.className = "cartao";

/* título */

var titulo = document.createElement("h3");

titulo.textContent =
ideia.titulo || "Sem título";

titulo.className = "titulo-ideia";

titulo.onclick = function () {
abrirIdeia(ideia.id);
};

cartao.appendChild(titulo);

/* autoria */

var autoria = document.createElement("div");

autoria.className = "autoria";

var autor = document.createElement("button");

autor.className = "link-autor";

autor.textContent =
nomeDe(ideia.autor);

autor.onclick = function () {
abrirPessoa(ideia.autor);
};

autoria.appendChild(autor);

var data = document.createElement("span");

data.textContent =
" · " + (ideia.data || "");

autoria.appendChild(data);

cartao.appendChild(autoria);

/* resumo */

var resumo = document.createElement("p");

resumo.className = "resumo";

resumo.textContent =
ideia.resumo || "";

cartao.appendChild(resumo);

/* tags */

var tags = document.createElement("div");

tags.className = "tags";

var listaTags = tagsDaIdeia(ideia);

for (var i = 0; i < listaTags.length; i++) {

```
var etiqueta =
  document.createElement("button");

etiqueta.className = "etiqueta";

etiqueta.textContent =
  listaTags[i];

etiqueta.onclick =
  criarCliqueDeTag(listaTags[i]);

tags.appendChild(etiqueta);
```

}

cartao.appendChild(tags);

/* rodapé */

var rodape =
document.createElement("div");

rodape.className = "rodape";

/* ============================================================
MOSTRAR INTERESSE
============================================================ */

var botao =
document.createElement("button");

botao.className = "apoiar";

var interessados =
ideia.interessados || [];

var jaInteressado =
interessados.indexOf(estado.pessoa) !== -1;

if (jaInteressado) {

```
botao.textContent =
  "retirar interesse";

botao.classList.add("interessado");
```

} else {

```
botao.textContent =
  "mostrar interesse";
```

}

botao.onclick =
criarCliqueDeApoio(ideia.id);

rodape.appendChild(botao);

/* contador */

var contador =
document.createElement("span");

contador.className = "apoios";

contador.textContent =
interessados.length +
(interessados.length === 1
? " interessado"
: " interessados");

rodape.appendChild(contador);

/* arquivar */

if (ideia.autor === estado.pessoa) {

```
var arquivar =
  document.createElement("button");

arquivar.className =
  "botao-arquivar";

arquivar.textContent =
  "arquivar";

arquivar.onclick = function () {

  arquivarIdeia(ideia.id);

};

rodape.appendChild(arquivar);
```

}

cartao.appendChild(rodape);

return cartao;
}

/* ================================================================
INTERESSE
================================================================ */

function criarCliqueDeApoio(idIdeia) {

return function () {

```
var ideia =
  ideiaPorId(idIdeia);

if (!ideia) return;

if (!Array.isArray(ideia.interessados)) {

  ideia.interessados = [];

}


var indice =
  ideia.interessados.indexOf(estado.pessoa);


/*
 * JÁ TEM INTERESSE
 *
 * Segundo clique:
 * remove a pessoa da lista.
 */

if (indice !== -1) {

  ideia.interessados.splice(
    indice,
    1
  );

  ideia.apoios =
    ideia.interessados.length;

  /*
   * Remove também a notificação
   * correspondente, se ainda estiver
   * pendente.
   */

  for (
    var i = DADOS.notificacoes.length - 1;
    i >= 0;
    i--
  ) {

    var n =
      DADOS.notificacoes[i];

    if (
      n.ideia === ideia.id &&
      n.pessoa === estado.pessoa
    ) {

      DADOS.notificacoes.splice(i, 1);

    }

  }

}


/*
 * NÃO TEM INTERESSE
 *
 * Primeiro clique:
 * adiciona a pessoa.
 */

else {

  ideia.interessados.push(
    estado.pessoa
  );

  ideia.apoios =
    ideia.interessados.length;


  /*
   * V-09
   *
   * O autor recebe um aviso interno
   * quando outra pessoa demonstra interesse.
   */

  if (
    ideia.autor !== estado.pessoa
  ) {

    var notificacao = {

      id:
        Date.now() +
        "-" +
        Math.random(),

      autor:
        ideia.autor,

      pessoa:
        estado.pessoa,

      ideia:
        ideia.id,

      titulo:
        ideia.titulo,

      data:
        dataHoje(),

      lida: false

    };

    DADOS.notificacoes.push(
      notificacao
    );

  }

}


desenharMural();

desenharNotificacoes();

atualizarContadorNotificacoes();
```

};

}

/* ================================================================
TAG
================================================================ */

function criarCliqueDeTag(tag) {

return function () {

```
estado.tag = tag;

trocarAba("mural");

desenharMural();
```

};

}

/* ================================================================
GRUPOS
================================================================ */

function desenharGrupos() {

var alvo =
document.getElementById("lista-grupos");

alvo.innerHTML = "";

for (
var i = 0;
i < DADOS.grupos.length;
i++
) {

```
var g =
  DADOS.grupos[i];

var item =
  document.createElement("li");


var nome =
  document.createElement("span");

nome.className = "nome";

nome.textContent =
  g.nome;

item.appendChild(nome);


var quantos =
  document.createElement("span");

quantos.className =
  "quantos";

quantos.textContent =
  (g.membros || []).length +
  " membros";

item.appendChild(quantos);


var descricao =
  document.createElement("p");

descricao.className =
  "descricao";

descricao.textContent =
  g.descricao || "";

item.appendChild(descricao);


alvo.appendChild(item);
```

}

}

/* ================================================================
V-01 — PÁGINA DA PESSOA
================================================================ */

function abrirPessoa(id) {

estado.pessoaPagina = id;

esconderTodasAsPaginas();

document
.getElementById("pessoa")
.classList.remove("escondido");

var alvo =
document.getElementById("pagina-pessoa");

alvo.innerHTML = "";

var pessoa =
pessoaPorId(id);

if (!pessoa) {

```
alvo.textContent =
  "Pessoa não encontrada.";

return;
```

}

var titulo =
document.createElement("h2");

titulo.textContent =
pessoa.nome;

alvo.appendChild(titulo);

var tipo =
document.createElement("p");

tipo.className =
"informacao-pessoa";

tipo.textContent =
"é " +
(pessoa.tipo ||
pessoa.papel ||
"aluno");

alvo.appendChild(tipo);

if (pessoa.curso) {

```
var curso =
  document.createElement("p");

curso.textContent =
  "Curso: " +
  pessoa.curso;

alvo.appendChild(curso);
```

}

if (pessoa.interesses) {

```
var interesses =
  document.createElement("p");

interesses.innerHTML =
  "<strong>Interesses:</strong> " +
  pessoa.interesses;

alvo.appendChild(interesses);
```

}

if (pessoa.mudancas) {

```
var mudancas =
  document.createElement("p");

mudancas.innerHTML =
  "<strong>Mudanças:</strong> " +
  pessoa.mudancas;

alvo.appendChild(mudancas);
```

}

if (pessoa.nomeCompleto) {

```
var nomeCompleto =
  document.createElement("p");

nomeCompleto.innerHTML =
  "<strong>Nome:</strong> " +
  pessoa.nomeCompleto;

alvo.appendChild(nomeCompleto);
```

}

var tituloIdeias =
document.createElement("h3");

tituloIdeias.textContent =
"Ideias publicadas";

alvo.appendChild(tituloIdeias);

var ideiasPessoa =
DADOS.ideias.filter(
function (ideia) {

```
    return (
      ideia.autor === id &&
      ideia.arquivada !== true
    );

  }
);
```

if (ideiasPessoa.length === 0) {

```
var vazio =
  document.createElement("p");

vazio.className =
  "mensagem-vazia";

vazio.textContent =
  "ainda não publicou ideias";

alvo.appendChild(vazio);
```

} else {

```
var lista =
  document.createElement("div");

lista.className =
  "lista-ideias-pessoa";


for (
  var i = 0;
  i < ideiasPessoa.length;
  i++
) {

  var link =
    document.createElement("button");

  link.className =
    "ideia-link";

  link.textContent =
    ideiasPessoa[i].titulo;

  link.onclick =
    criarCliqueDeIdeia(
      ideiasPessoa[i].id
    );

  lista.appendChild(link);

}

alvo.appendChild(lista);
```

}

}

function criarCliqueDeIdeia(id) {

return function () {

```
abrirIdeia(id);
```

};

}

/* ================================================================
PÁGINA DA IDEIA
================================================================ */

function abrirIdeia(id) {

estado.ideiaPagina = id;

esconderTodasAsPaginas();

document
.getElementById("ideia")
.classList.remove("escondido");

var alvo =
document.getElementById("pagina-ideia");

alvo.innerHTML = "";

var ideia =
ideiaPorId(id);

if (!ideia) {

```
alvo.textContent =
  "Ideia não encontrada.";

return;
```

}

var titulo =
document.createElement("h2");

titulo.textContent =
ideia.titulo;

alvo.appendChild(titulo);

var autoria =
document.createElement("p");

autoria.innerHTML =
"<strong>Publicado por:</strong> ";

var autor =
document.createElement("button");

autor.className =
"link-autor";

autor.textContent =
nomeDe(ideia.autor);

autor.onclick = function () {

```
abrirPessoa(ideia.autor);
```

};

autoria.appendChild(autor);

alvo.appendChild(autoria);

var resumo =
document.createElement("p");

resumo.className =
"resumo-ideia";

resumo.textContent =
ideia.resumo;

alvo.appendChild(resumo);

var tags =
document.createElement("div");

tags.className =
"tags";

var listaTags =
tagsDaIdeia(ideia);

for (
var i = 0;
i < listaTags.length;
i++
) {

```
var tag =
  document.createElement("span");

tag.className =
  "etiqueta";

tag.textContent =
  listaTags[i];

tags.appendChild(tag);
```

}

alvo.appendChild(tags);

var info =
document.createElement("p");

info.className =
"apoios-grande";

info.textContent =
(ideia.interessados || []).length +
" interessados";

alvo.appendChild(info);

var botao =
document.createElement("button");

botao.className =
"apoiar";

var jaInteressado =
(ideia.interessados || [])
.indexOf(estado.pessoa) !== -1;

botao.textContent =
jaInteressado
? "retirar interesse"
: "mostrar interesse";

botao.onclick =
criarCliqueDeApoio(ideia.id);

alvo.appendChild(botao);

}

/* ================================================================
V-03 — PUBLICAR IDEIA
================================================================ */

function publicarIdeia(e) {

e.preventDefault();

var titulo =
document
.getElementById("titulo-ideia")
.value
.trim();

var resumo =
document
.getElementById("resumo-ideia")
.value
.trim();

var tagsTexto =
document
.getElementById("tags-ideia")
.value
.trim();

var erro =
document.getElementById(
"erro-publicacao"
);

if (titulo === "") {

```
erro.textContent =
  "Digite um título para publicar a ideia.";

document
  .getElementById("titulo-ideia")
  .focus();

return;
```

}

if (resumo === "") {

```
erro.textContent =
  "Digite um resumo para publicar a ideia.";

document
  .getElementById("resumo-ideia")
  .focus();

return;
```

}

var tags = [];

if (tagsTexto !== "") {

```
tags =
  tagsTexto
    .split(",")
    .map(function (tag) {
      return tag.trim();
    })
    .filter(function (tag) {
      return tag !== "";
    });
```

}

/*

* Cria um ID único.
  */

var novoId =
Date.now();

var novaIdeia = {

```
id: novoId,

titulo: titulo,

resumo: resumo,

tags: tags,

autor: estado.pessoa,

data: dataHoje(),

apoios: 0,

interessados: [],

arquivada: false
```

};

/*

* unshift coloca a ideia no começo
* do array.
  */

DADOS.ideias.unshift(
novaIdeia
);

/*

* Limpa o formulário.
  */

document
.getElementById("form-publicar")
.reset();

erro.textContent =
"Ideia publicada com sucesso!";

/*

* Volta para o mural imediatamente.
  */

trocarAba("mural");

estado.busca = "";
estado.tag = null;

desenhar();

}

/* ================================================================
V-10 — ARQUIVAR
================================================================ */

function arquivarIdeia(id) {

var ideia =
ideiaPorId(id);

if (!ideia) return;

if (ideia.autor !== estado.pessoa) {

```
return;
```

}

ideia.arquivada = true;

trocarAba("arquivadas");

desenhar();

}

/* ================================================================
DESARQUIVAR
================================================================ */

function desarquivarIdeia(id) {

var ideia =
ideiaPorId(id);

if (!ideia) return;

if (ideia.autor !== estado.pessoa) {

```
return;
```

}

ideia.arquivada = false;

desenhar();

}

/* ================================================================
ARQUIVADAS
================================================================ */

function desenharArquivadas() {

var alvo =
document.getElementById(
"lista-arquivadas"
);

alvo.innerHTML = "";

var minhas =
DADOS.ideias.filter(
function (ideia) {

```
    return (
      ideia.autor === estado.pessoa &&
      ideia.arquivada === true
    );

  }
);
```

var vazio =
document.getElementById(
"sem-arquivadas"
);

if (minhas.length === 0) {

```
vazio.classList.remove(
  "escondido"
);
```

} else {

```
vazio.classList.add(
  "escondido"
);
```

}

for (
var i = 0;
i < minhas.length;
i++
) {

```
alvo.appendChild(
  montarCartaoArquivado(
    minhas[i]
  )
);
```

}

}

function montarCartaoArquivado(ideia) {

var cartao =
document.createElement("div");

cartao.className =
"cartao arquivado";

var titulo =
document.createElement("h3");

titulo.textContent =
ideia.titulo;

cartao.appendChild(titulo);

var resumo =
document.createElement("p");

resumo.className =
"resumo";

resumo.textContent =
ideia.resumo;

cartao.appendChild(resumo);

var botao =
document.createElement("button");

botao.className =
"botao-principal";

botao.textContent =
"desarquivar";

botao.onclick =
function () {

```
  desarquivarIdeia(
    ideia.id
  );

};
```

cartao.appendChild(botao);

return cartao;

}

/* ================================================================
V-09 — NOTIFICAÇÕES
================================================================ */

function desenharNotificacoes() {

var alvo =
document.getElementById(
"lista-notificacoes"
);

alvo.innerHTML = "";

var minhas =
DADOS.notificacoes.filter(
function (n) {

```
    return n.autor === estado.pessoa;

  }
);
```

var vazio =
document.getElementById(
"sem-notificacoes"
);

if (minhas.length === 0) {

```
vazio.classList.remove(
  "escondido"
);
```

} else {

```
vazio.classList.add(
  "escondido"
);
```

}

for (
var i = minhas.length - 1;
i >= 0;
i--
) {

```
var n =
  minhas[i];

var item =
  document.createElement("div");

item.className =
  "notificacao";


var texto =
  document.createElement("p");

texto.innerHTML =
  "<strong>" +
  nomeDe(n.pessoa) +
  "</strong> demonstrou interesse na ideia " +
  "<strong>" +
  n.titulo +
  "</strong>.";

item.appendChild(texto);


var data =
  document.createElement("small");

data.textContent =
  n.data;

item.appendChild(data);


var abrir =
  document.createElement("button");

abrir.className =
  "botao-secundario";

abrir.textContent =
  "abrir ideia";

abrir.onclick =
  function (idIdeia) {

    return function () {

      abrirIdeia(idIdeia);

    };

  }(n.ideia);


item.appendChild(abrir);


alvo.appendChild(item);
```

}

}

function atualizarContadorNotificacoes() {

var contador =
document.getElementById(
"contador-notificacoes"
);

var quantidade =
DADOS.notificacoes.filter(
function (n) {

```
    return (
      n.autor === estado.pessoa &&
      n.lida !== true
    );

  }
).length;
```

if (quantidade > 0) {

```
contador.textContent =
  "(" + quantidade + ")";
```

} else {

```
contador.textContent =
  "";
```

}

}

/* ================================================================
ABAS
================================================================ */

function trocarAba(qual) {

estado.aba = qual;

esconderTodasAsPaginas();

if (qual === "mural") {

```
document
  .getElementById("mural")
  .classList.remove(
    "escondido"
  );
```

}

if (qual === "grupos") {

```
document
  .getElementById("grupos")
  .classList.remove(
    "escondido"
  );
```

}

if (qual === "publicar") {

```
document
  .getElementById("publicar")
  .classList.remove(
    "escondido"
  );
```

}

if (qual === "arquivadas") {

```
document
  .getElementById("arquivadas")
  .classList.remove(
    "escondido"
  );

desenharArquivadas();
```

}

if (qual === "notificacoes") {

```
document
  .getElementById("notificacoes")
  .classList.remove(
    "escondido"
  );

/*
 * Ao abrir a área de notificações,
 * consideramos as notificações visualizadas.
 */

for (
  var i = 0;
  i < DADOS.notificacoes.length;
  i++
) {

  if (
    DADOS.notificacoes[i].autor ===
    estado.pessoa
  ) {

    DADOS.notificacoes[i].lida =
      true;

  }

}

atualizarContadorNotificacoes();
```

}

var abas = [
"aba-mural",
"aba-grupos",
"aba-publicar",
"aba-arquivadas",
"aba-notificacoes"
];

for (
var i = 0;
i < abas.length;
i++
) {

```
var elemento =
  document.getElementById(
    abas[i]
  );

if (!elemento) continue;


elemento.className =
  "aba";


if (
  (qual === "mural" &&
    abas[i] === "aba-mural") ||

  (qual === "grupos" &&
    abas[i] === "aba-grupos") ||

  (qual === "publicar" &&
    abas[i] === "aba-publicar") ||

  (qual === "arquivadas" &&
    abas[i] === "aba-arquivadas") ||

  (qual === "notificacoes" &&
    abas[i] === "aba-notificacoes")
) {

  elemento.className =
    "aba ativa";

}
```

}

}

/* ================================================================
ESCONDER PÁGINAS
================================================================ */

function esconderTodasAsPaginas() {

var paginas = [
"mural",
"grupos",
"publicar",
"arquivadas",
"notificacoes",
"pessoa",
"ideia"
];

for (
var i = 0;
i < paginas.length;
i++
) {

```
var elemento =
  document.getElementById(
    paginas[i]
  );

if (elemento) {

  elemento.classList.add(
    "escondido"
  );

}
```

}

}

/* ================================================================
INÍCIO
================================================================ */

function iniciar() {

prepararDados();

if (
DADOS.pessoas.length > 0
) {

```
estado.pessoa =
  DADOS.pessoas[0].id;
```

}

/* busca */

document
.getElementById("busca")
.oninput = function (e) {

```
  estado.busca =
    e.target.value;

  desenharMural();

};
```

/* pessoa */

document
.getElementById("quem")
.onchange = function (e) {

```
  estado.pessoa =
    isNaN(Number(e.target.value))
      ? e.target.value
      : Number(e.target.value);

  estado.tag = null;

  desenhar();

};
```

/* limpar filtros */

document
.getElementById(
"limpar-filtros"
)
.onclick = function () {

```
  estado.busca = "";
  estado.tag = null;

  document
    .getElementById("busca")
    .value = "";

  desenharMural();

};
```

/* abas */

document
.getElementById("aba-mural")
.onclick = function () {

```
  trocarAba("mural");

};
```

document
.getElementById("aba-grupos")
.onclick = function () {

```
  trocarAba("grupos");

};
```

document
.getElementById("aba-publicar")
.onclick = function () {

```
  trocarAba("publicar");

};
```

document
.getElementById("aba-arquivadas")
.onclick = function () {

```
  trocarAba("arquivadas");

};
```

document
.getElementById("aba-notificacoes")
.onclick = function () {

```
  trocarAba("notificacoes");

};
```

/* formulário */

document
.getElementById("form-publicar")
.addEventListener(
"submit",
publicarIdeia
);

/* voltar do perfil */

document
.getElementById("voltar-mural")
.onclick = function () {

```
  trocarAba("mural");

};
```

/* voltar da ideia */

document
.getElementById(
"voltar-mural-ideia"
)
.onclick = function () {

```
  trocarAba("mural");

};
```

desenhar();

trocarAba("mural");

}

iniciar();
