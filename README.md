# Discografia

Player de música para os álbuns de uma banda, direto no navegador, sem
login. Pensado pra ficar invisível no site por padrão — só quem tem o
link direto (ou uma tag NFC / QR code gravado com esse link) consegue
abrir e ouvir um álbum específico, que começa a tocar automaticamente do
início ao fim.

Diferente do projeto `retro-play`, este não depende de nenhuma
biblioteca externa — é só HTML/CSS/JS puro com o elemento `<audio>`
nativo do navegador. Funciona 100% offline depois de carregado (a não
ser pelas fontes do Google, que são opcionais).

---

## Sumário

1. [Como rodar o projeto](#1-como-rodar-o-projeto)
2. [Estrutura de pastas](#2-estrutura-de-pastas)
3. [Como adicionar um álbum](#3-como-adicionar-um-álbum)
4. [Link direto e modo "links secretos"](#4-link-direto-e-modo-links-secretos)
5. [Sobre a reprodução automática](#5-sobre-a-reprodução-automática)
6. [Personalização](#6-personalização)
7. [Publicando o site](#7-publicando-o-site)
8. [Solução de problemas](#8-solução-de-problemas)

---

## 1. Como rodar o projeto

⚠️ **Não abra o `index.html` clicando duas vezes nele.** Assim como no
`retro-play`, o navegador bloqueia o carregamento de arquivos locais
(os áudios) quando a página é aberta direto do disco (`file://`). É
preciso servir os arquivos por HTTP, mesmo que localmente. Se o site
for aberto assim, um aviso vermelho aparece automaticamente no topo da
página explicando isso.

**Com Python:**
```bash
cd discografia
python3 -m http.server 8080
```
Depois abra `http://localhost:8080`.

**Com VS Code:** extensão "Live Server" → botão direito em `index.html`
→ "Open with Live Server". Use a aba que abrir (endereço `http://...`).

---

## 2. Estrutura de pastas

```
discografia/
├── index.html            Página única do site
├── css/
│   └── style.css         Aparência (cores, layout, disco giratório)
├── js/
│   ├── config.js         Configurações gerais (nome da banda, cores, etc.)
│   ├── albums.js         Lista de álbuns e faixas — edite pra adicionar
│   └── app.js             Lógica do site (reprodução, prateleira, etc.)
├── albums/
│   ├── album-1/            Arquivos de áudio + capa do 1º álbum
│   └── album-2/             Arquivos de áudio + capa do 2º álbum
└── README.md              Este arquivo
```

---

## 3. Como adicionar um álbum

1. Crie uma pasta em `albums/` (ex: `albums/album-3/`) e copie os
   arquivos de áudio (`.mp3`) e, se quiser, uma capa (`.jpg`/`.png`)
   pra lá.
2. Abra `js/albums.js` e adicione um novo bloco na lista
   `ALBUM_LIBRARY`:

   ```js
   {
     id: "album-3",
     title: "Nome do Álbum",
     artist: "Nome da Banda",
     cover: "albums/album-3/capa.jpg",
     tracks: [
       { title: "Faixa 1", file: "albums/album-3/01-faixa1.mp3" },
       { title: "Faixa 2", file: "albums/album-3/02-faixa2.mp3" },
     ],
   },
   ```
3. Salve e recarregue a página.

A ordem de reprodução é a ordem da lista `tracks` — não importa o nome
do arquivo. O campo `cover` é opcional: sem ele, o álbum usa um ícone
padrão com a primeira letra do título (no card, na tela de "tocar
álbum" e no disco do player).

**Recomendação pra imagem de capa:** formato `.jpg` ou `.png`, quadrada
(ex: 800×800px — não precisa ser maior que isso, só deixa o arquivo mais
pesado à toa), e o mesmo arquivo é reaproveitado em todos os tamanhos
que aparece no site (card pequeno, tela de "tocar álbum", disco grande,
e também nos controles de mídia da tela de bloqueio do celular).

---

## 4. Link direto e modo "links secretos"

Cada álbum cadastrado tem um link direto:
`seusite.com/?album=id-do-album` — abrir esse link já pula qualquer
prateleira e começa a tocar aquele álbum específico.

**Para pegar o link** de um álbum sem digitar na mão: em `js/config.js`,
troque `hideLibraryByDefault` para `false` temporariamente, recarregue a
página, e toque no ícone 🔗 no canto do card do álbum — o link vai pra
área de transferência, pronto pra colar num app de gravação de tag NFC
(ex: "NFC Tools" no Android → Gravar → URL/URI) ou gerar um QR code.
Depois volte `hideLibraryByDefault` pra `true`.

**`hideLibraryByDefault: true`** (o padrão neste projeto) faz a tela
inicial não mostrar nenhum álbum clicável — só o nome da banda numa tela
vazia. A única forma de ouvir é pelo link direto. Vale saber: isso
*esconde* a lista, não a protege de verdade — não há senha nem login, e
`js/albums.js` continua sendo um arquivo público como qualquer outro do
site. Serve bem contra "alguém que só está navegando no site não vê
nada"; não impede alguém que abra o arquivo de propósito.

---

## 5. Sobre a reprodução automática

Ao abrir o link de um álbum, aparece a capa com um botão "▶ Tocar
álbum" — não a lista tocando direto, sozinha, sem nenhum toque. Isso
não é uma escolha de design, é uma restrição de segurança dos
navegadores: **áudio com som não pode começar sozinho sem uma
interação direta do usuário na página**, mesmo que a pessoa tenha
acabado de tocar uma tag NFC ou escanear um QR code pra chegar até ali
— o navegador exige um toque *dentro* da página em si. Não tem como
contornar isso.

A boa notícia: depois desse primeiro toque, o álbum inteiro toca
sozinho — uma faixa termina, a próxima começa automaticamente, sem
precisar de mais nenhuma interação, até o fim do álbum.

---

## 6. Personalização

Em `js/config.js`, com comentário explicando cada campo:
- `siteName` — nome da banda, exibido no topo.
- `hideLibraryByDefault` — mostrar ou esconder a prateleira.
- `accentColor` / `backgroundColor` — cores da interface.
- `spinRecordWhilePlaying` — liga/desliga a animação do disco girando.

Pra mudar a fonte ou o formato dos cards, o ponto de partida é o bloco
`:root { ... }` no topo de `css/style.css`.

---

## 7. Publicando o site

Site 100% estático — qualquer hospedagem de arquivos estáticos serve
(Cloudflare Pages, GitHub Pages, Netlify, Vercel). Não tem passo de
build; os arquivos já estão prontos para publicar como estão.

Um detalhe pros arquivos de áudio: como são arquivos potencialmente
grandes, confira se a hospedagem escolhida não tem um limite de tamanho
de arquivo baixo demais para eles (a maioria das opções gratuitas
citadas acima aceita arquivos de até 25-100 MB tranquilamente, o que
cobre uma faixa de música comum sem problema).

---

## 8. Solução de problemas

**Faixa não toca / "Não consegui carregar esta faixa"**
Confira o caminho no campo `file` em `js/albums.js` contra o nome real
do arquivo dentro de `albums/` — maiúsculas/minúsculas contam. Se o
aviso vermelho de "aberto direto do disco" estiver aparecendo no topo da
página, comece por aí (veja a [seção 1](#1-como-rodar-o-projeto)).

**Som não toca mesmo depois de tocar em "Tocar álbum"**
Confira se o aparelho não está no modo silencioso/mudo (é comum em
iPhone) e se o volume do sistema está audível — o player não controla
isso, só o áudio em si.

**Os controles na tela de bloqueio do celular não aparecem**
Depende do navegador ter suporte à Media Session API (Chrome e Safari
recentes suportam bem; alguns navegadores mais antigos, não). Não afeta
a reprodução em si, só a conveniência de controlar pela tela de bloqueio.
