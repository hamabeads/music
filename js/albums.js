/**
 * ============================================================================
 *  BIBLIOTECA DE ÁLBUNS
 * ============================================================================
 * Cada objeto abaixo é um álbum inteiro, com sua lista de faixas na ordem
 * em que devem tocar (a ordem do array — não importa o nome do arquivo).
 *
 * COMO ADICIONAR UM ÁLBUM NOVO:
 *   1. Crie uma pasta em /albums/ (ex: albums/album-3/) e coloque os
 *      arquivos de áudio (.mp3) e, se quiser, a capa (.jpg/.png) lá dentro.
 *   2. Duplique um dos blocos abaixo e ajuste os campos.
 *   3. Salve e recarregue a página.
 *
 * CAMPOS DO ÁLBUM:
 *   id     String única, sem espaços/acentos — vira o link direto
 *          (ex: seusite.com/?album=id-do-album).
 *   title  Nome do álbum.
 *   artist Nome da banda/artista (aparece embaixo do título).
 *   cover  (opcional) Caminho de uma imagem de capa. Vazio = usa um
 *          ícone padrão com a primeira letra do título.
 *   tracks Lista de faixas, NA ORDEM DE REPRODUÇÃO.
 *
 * CAMPOS DE CADA FAIXA:
 *   title  Nome da faixa (aparece na lista e no "tocando agora").
 *   file   Caminho do arquivo de áudio dentro do projeto.
 * ============================================================================
 */
window.ALBUM_LIBRARY = [

  // ---- EXEMPLO — apague o comentário abaixo (ou edite) para testar ----
  // {
  //   id: "primeiro-album",
  //   title: "Nome do Álbum",
  //   artist: "Nome da Banda",
  //   cover: "albums/album-1/capa.jpg",
  //   tracks: [
  //     { title: "Faixa 1", file: "albums/album-1/01-faixa1.mp3" },
  //     { title: "Faixa 2", file: "albums/album-1/02-faixa2.mp3" },
  //     { title: "Faixa 3", file: "albums/album-1/03-faixa3.mp3" },
  //   ],
  // },
    
  {
    id: "rock80",
    title: "Rock N' Roll",
    artist: "Rock N' Roll",
    cover: "albums/rock80/capa.png",
    tracks: [
      { title: "Nirvana - Smells Like Teen Spirit", file: "albums/rock80/01-faixa1.mp3" },
      { title: "Bon Jovi - Livin' on a Prayer", file: "albums/rock80/02-faixa2.mp3" },
      { title: "Guns N' Roses - Sweet Child O' Mine", file: "albums/rock80/03-faixa3.mp3" },
            ],

    id: "CRB",
    title: "CRB",
    artist: "O Maior de Alagoas",
    cover: "albums/CRB/capa.jpg",
    tracks: [
      { title: "Hino do CRB", file: "albums/CRB/Hino do CRB.mp3" },
      { title: "Galo, Eu Te Amo", file: "albums/CRB/Galo Eu Te Amo - Almir Rouche.mp3" },
            ],
  },

];
