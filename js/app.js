/**
 * ============================================================================
 *  APP.JS — lógica do site
 * ============================================================================
 * Este arquivo faz 5 coisas:
 *
 *   1. Desenha a prateleira de álbuns na tela inicial (a partir de albums.js)
 *   2. Quando um álbum é aberto, monta a lista de faixas e toca em sequência
 *      automaticamente (uma termina, a próxima começa sozinha)
 *   3. Cuida da barra de progresso, dos botões de tocar/pausar/próxima/
 *      anterior e da lista de faixas clicável
 *   4. Publica o que está tocando nos controles de mídia do sistema
 *      (tela de bloqueio, notificação, fone Bluetooth)
 *   5. Gera o link direto de cada álbum (o ícone 🔗), pensado pra tags NFC
 *
 * Pra mudar CORES, NOME DA BANDA ou se a prateleira fica escondida, isso é
 * em js/config.js. Pra ADICIONAR UM ÁLBUM, isso é em js/albums.js. Este
 * arquivo raramente precisa ser editado — mas está comentado por completo.
 * ============================================================================
 */

// --------------------------------------------------------------------------
// Estado interno
// --------------------------------------------------------------------------
var libraryScreenEl, playerScreenEl, shelfEl, emptyStateEl, siteNameEls,
    backButtonEl, playerContextEl,
    recordEl, recordArtEl,
    trackTitleEl, trackMetaEl,
    seekEl, timeCurrentEl, timeTotalEl,
    prevButtonEl, playButtonEl, nextButtonEl,
    tracklistEl,
    bootOverlayEl, bootArtEl, bootTitleEl, bootArtistEl, bootPlayEl,
    finishedOverlayEl, replayButtonEl,
    audioEl;

var currentAlbum = null;
var currentTrackIndex = -1;
var isSeeking = false;

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheDomRefs();
  applySiteName();
  warnIfFileProtocol();
  wireTransportControls();

  backButtonEl.addEventListener("click", handleBackButton);
  bootPlayEl.addEventListener("click", function () {
    bootOverlayEl.hidden = true;
    playTrackAtIndex(0);
  });
  replayButtonEl.addEventListener("click", function () {
    playTrackAtIndex(0);
  });

  var albums = window.ALBUM_LIBRARY || [];

  // Link direto para um álbum específico: seusite.com/?album=id-do-album
  var startedFromLink = checkDeepLink(albums);
  if (!startedFromLink) {
    renderLibrary(albums);
  }
}

function cacheDomRefs() {
  libraryScreenEl = document.getElementById("screen-library");
  playerScreenEl = document.getElementById("screen-player");
  shelfEl = document.getElementById("album-shelf");
  emptyStateEl = document.getElementById("empty-state");
  siteNameEls = document.querySelectorAll("[data-site-name]");

  backButtonEl = document.getElementById("back-button");
  playerContextEl = document.getElementById("player-context");

  recordEl = document.getElementById("record");
  recordArtEl = document.getElementById("record-art");

  trackTitleEl = document.getElementById("track-title");
  trackMetaEl = document.getElementById("track-meta");

  seekEl = document.getElementById("seek");
  timeCurrentEl = document.getElementById("time-current");
  timeTotalEl = document.getElementById("time-total");

  prevButtonEl = document.getElementById("prev-button");
  playButtonEl = document.getElementById("play-button");
  nextButtonEl = document.getElementById("next-button");

  tracklistEl = document.getElementById("tracklist");

  bootOverlayEl = document.getElementById("boot-overlay");
  bootArtEl = document.getElementById("boot-art");
  bootTitleEl = document.getElementById("boot-title");
  bootArtistEl = document.getElementById("boot-artist");
  bootPlayEl = document.getElementById("boot-play");

  finishedOverlayEl = document.getElementById("finished-overlay");
  replayButtonEl = document.getElementById("replay-button");

  audioEl = document.getElementById("audio-player");
}

function applySiteName() {
  document.title = window.APP_CONFIG.siteName;
  for (var i = 0; i < siteNameEls.length; i++) {
    siteNameEls[i].textContent = window.APP_CONFIG.siteName;
  }
}

// Mesma checagem do projeto retro-play: se o navegador mostra
// origin "null" / protocolo "file:", é sinal de que o index.html foi
// aberto direto do disco em vez de por um servidor local — e nesse modo
// o carregamento de áudio por caminho relativo é bloqueado por segurança.
function warnIfFileProtocol() {
  if (window.location.protocol !== "file:") return;

  var warning = document.createElement("div");
  warning.className = "file-protocol-warning";
  warning.innerHTML =
    "<strong>Este arquivo foi aberto direto do disco (\u201cfile://\u201d).</strong>" +
    "<p>Por uma restrição de segurança do navegador, os álbuns não vão " +
    "conseguir carregar assim. Inicie um servidor local — no VS Code, " +
    "clique com o botão direito em <code>index.html</code> → \u201cOpen with " +
    "Live Server\u201d — e use a aba que abrir com endereço <code>http://</code>, " +
    "não esta. Veja o README.md, seção 1.</p>";
  document.body.insertBefore(warning, document.body.firstChild);
}

// ============================================================================
// PRATELEIRA DE ÁLBUNS (tela inicial)
// ============================================================================

function renderLibrary(albums) {
  shelfEl.innerHTML = "";

  if (window.APP_CONFIG.hideLibraryByDefault) {
    // "Modo secreto": nenhum álbum aparece aqui. Só dá pra ouvir
    // acessando o link direto de um álbum específico (?album=id), que
    // já foi checado antes desta função rodar (ver checkDeepLink/init).
    emptyStateEl.hidden = true;
    showScreen("library");
    return;
  }

  shelfEl.classList.toggle("shelf--single", albums.length === 1);
  emptyStateEl.hidden = albums.length !== 0;

  albums.forEach(function (album) {
    shelfEl.appendChild(buildAlbumCard(album));
  });

  // O card de "tocar arquivo do aparelho" sempre aparece — assim dá pra
  // testar o player mesmo antes de cadastrar qualquer álbum em albums.js.
  shelfEl.appendChild(buildUploadCard());

  showScreen("library");
}

function buildAlbumCard(album) {
  // Estrutura em duas partes irmãs (não uma dentro da outra) pelo mesmo
  // motivo do projeto retro-play: <button> dentro de <button> não é
  // HTML válido e causa comportamento imprevisível de clique/teclado.
  var wrap = document.createElement("div");
  wrap.className = "album-card-wrap";

  var card = document.createElement("button");
  card.type = "button";
  card.className = "album-card";
  card.setAttribute("aria-label", "Tocar " + album.title);

  card.innerHTML =
    '<span class="album-card__art"></span>' +
    '<span class="album-card__body">' +
      '<span class="album-card__title">' + escapeHtml(album.title) + "</span>" +
      '<span class="album-card__artist">' + escapeHtml(album.artist || "") + "</span>" +
    "</span>";

  card.addEventListener("click", function () {
    openAlbum(album);
  });

  applyAlbumArt(card.querySelector(".album-card__art"), album);

  var linkBtn = document.createElement("button");
  linkBtn.type = "button";
  linkBtn.className = "album-card__link";
  linkBtn.setAttribute("aria-label", "Copiar link direto de " + album.title + " (útil para tag NFC ou QR code)");
  linkBtn.innerHTML = "🔗";
  linkBtn.addEventListener("click", function () {
    copyDeepLink(album.id, linkBtn);
  });

  wrap.appendChild(card);
  wrap.appendChild(linkBtn);
  return wrap;
}

function buildUploadCard() {
  var card = document.createElement("label");
  card.className = "album-card album-card--upload";
  card.innerHTML =
    '<span class="album-card__upload-icon">+</span>' +
    '<span class="album-card__body">' +
      '<span class="album-card__title">Tocar arquivo</span>' +
      '<span class="album-card__artist">do aparelho</span>' +
    "</span>" +
    '<input type="file" accept="audio/*" class="album-card__file-input" />';

  var input = card.querySelector("input");
  input.addEventListener("change", function () {
    if (input.files && input.files[0]) {
      var file = input.files[0];
      var name = file.name.replace(/\.[^/.]+$/, "");
      openAlbum({
        id: "upload",
        title: name,
        artist: "",
        cover: "",
        tracks: [{ title: name, file: URL.createObjectURL(file) }],
      });
    }
    input.value = "";
  });

  return card;
}

function checkDeepLink(albums) {
  var params = new URLSearchParams(window.location.search);
  var slug = params.get("album");
  if (!slug) return false;

  var found = albums.find(function (a) { return a.id === slug; });
  if (!found) return false;

  openAlbum(found);
  return true;
}

/**
 * Copia pra área de transferência o link direto de um álbum
 * (seusite.com/?album=ID) — pensado pra gravar em tags NFC ou virar QR
 * code: acessar o link já abre e toca aquele álbum, sem passar pela
 * prateleira.
 */
function copyDeepLink(albumId, buttonEl) {
  var url = window.location.origin + window.location.pathname + "?album=" + encodeURIComponent(albumId);

  function showCopiedFeedback() {
    var original = buttonEl.innerHTML;
    buttonEl.innerHTML = "✓";
    buttonEl.classList.add("is-copied");
    window.setTimeout(function () {
      buttonEl.innerHTML = original;
      buttonEl.classList.remove("is-copied");
    }, 1500);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(showCopiedFeedback, function () {
      window.prompt("Copie o link manualmente:", url);
    });
  } else {
    window.prompt("Copie o link manualmente:", url);
  }
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

/**
 * Aplica a capa de um álbum num elemento (o card na prateleira, a tela
 * de "tocar álbum" ou o disco no player). Sem capa cadastrada, usa a
 * mesma letra de fallback nos três lugares, em vez de ficar em branco.
 */
function applyAlbumArt(containerEl, album) {
  containerEl.innerHTML = "";
  if (album.cover) {
    containerEl.style.backgroundImage = "url('" + album.cover + "')";
  } else {
    containerEl.style.backgroundImage = "none";
    var glyph = document.createElement("span");
    glyph.className = "album-art-glyph";
    glyph.textContent = (album.title || "?").charAt(0).toUpperCase();
    containerEl.appendChild(glyph);
  }
}

/** Adivinha o tipo MIME de uma imagem pela extensão do arquivo — usado
 * ao publicar a capa nos controles de mídia do sistema (ver
 * updateMediaSessionMetadata). */
function guessImageMimeType(path) {
  var ext = (path.split(".").pop() || "").toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "image/jpeg";
}

// ============================================================================
// TROCA DE TELA (prateleira <-> player)
// ============================================================================

function showScreen(name) {
  libraryScreenEl.hidden = name !== "library";
  playerScreenEl.hidden = name !== "player";
}

function handleBackButton() {
  audioEl.pause();
  showScreen("library");
  applySiteName();

  // Limpa o "?album=..." da URL — senão a página fica com uma URL de
  // álbum específico mesmo mostrando a prateleira geral.
  if (window.location.search) {
    window.history.replaceState({}, "", window.location.pathname);
  }
}

// ============================================================================
// ABRIR UM ÁLBUM
// ============================================================================
// Diferente do projeto retro-play (que precisava de um toque prévio por
// causa do EmulatorJS), aqui a tela de "toque pra tocar" existe só por
// UM motivo, mas é um motivo que não tem como contornar: navegadores
// bloqueiam áudio COM SOM até existir uma interação direta na página.
// Um álbum sendo aberto por link direto (NFC, QR code) nunca teve esse
// toque ainda — por isso mostramos a capa e pedimos 1 toque antes de
// começar. Depois desse primeiro toque, as próximas faixas do álbum
// avançam sozinhas, sem precisar de mais nenhum toque.

function openAlbum(album) {
  currentAlbum = album;
  currentTrackIndex = -1;

  showScreen("player");
  playerContextEl.textContent = album.artist ? album.artist + " · " + album.title : album.title;
  document.title = album.title + " · " + window.APP_CONFIG.siteName;

  bootTitleEl.textContent = album.title;
  bootArtistEl.textContent = album.artist || "";
  finishedOverlayEl.hidden = true;
  bootOverlayEl.hidden = false;
  applyAlbumArt(bootArtEl, album);

  applyAlbumArt(recordArtEl, album);
  renderTracklist(album);
}

function renderTracklist(album) {
  tracklistEl.innerHTML = "";
  album.tracks.forEach(function (track, index) {
    var li = document.createElement("li");
    li.className = "tracklist__item";
    li.innerHTML =
      '<span class="tracklist__number">' + (index + 1) + "</span>" +
      '<span class="tracklist__title">' + escapeHtml(track.title) + "</span>";
    li.addEventListener("click", function () {
      playTrackAtIndex(index);
    });
    tracklistEl.appendChild(li);
  });
}

// ============================================================================
// REPRODUÇÃO
// ============================================================================

function playTrackAtIndex(index) {
  if (!currentAlbum) return;

  if (index < 0) index = 0;
  if (index >= currentAlbum.tracks.length) {
    showAlbumFinished();
    return;
  }

  currentTrackIndex = index;
  var track = currentAlbum.tracks[index];

  finishedOverlayEl.hidden = true;
  audioEl.src = track.file;

  var playPromise = audioEl.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(function () {
      // O navegador recusou tocar sozinho (política de autoplay) — sem
      // problema, o botão de play manual na tela resolve isso.
    });
  }

  updateNowPlayingUI(track, index);
  updateMediaSessionMetadata(track, index);
}

function showAlbumFinished() {
  finishedOverlayEl.hidden = false;
  recordEl.classList.remove("is-playing");
  playButtonEl.textContent = "▶";
}

function updateNowPlayingUI(track, index) {
  trackTitleEl.textContent = track.title;
  trackMetaEl.textContent = "Faixa " + (index + 1) + " de " + currentAlbum.tracks.length;

  var items = tracklistEl.querySelectorAll(".tracklist__item");
  for (var i = 0; i < items.length; i++) {
    items[i].classList.toggle("is-playing", i === index);
  }
}

function updatePlayButtonAndRecord() {
  var playing = !audioEl.paused && !audioEl.ended;
  playButtonEl.textContent = playing ? "⏸" : "▶";
  playButtonEl.setAttribute("aria-label", playing ? "Pausar" : "Tocar");
  if (window.APP_CONFIG.spinRecordWhilePlaying) {
    recordEl.classList.toggle("is-playing", playing);
  }
}

function wireTransportControls() {
  playButtonEl.addEventListener("click", function () {
    if (!currentAlbum) return;
    if (audioEl.paused) {
      if (!audioEl.src) {
        playTrackAtIndex(0);
      } else {
        audioEl.play();
      }
    } else {
      audioEl.pause();
    }
  });

  prevButtonEl.addEventListener("click", function () {
    // Reinicia a faixa atual se já passou de 3s (comportamento padrão de
    // qualquer tocador de música); só volta uma faixa se estiver bem no
    // começo.
    if (audioEl.currentTime > 3) {
      audioEl.currentTime = 0;
    } else {
      playTrackAtIndex(currentTrackIndex - 1);
    }
  });

  nextButtonEl.addEventListener("click", function () {
    playTrackAtIndex(currentTrackIndex + 1);
  });

  audioEl.addEventListener("play", updatePlayButtonAndRecord);
  audioEl.addEventListener("pause", updatePlayButtonAndRecord);
  audioEl.addEventListener("ended", function () {
    playTrackAtIndex(currentTrackIndex + 1);
  });

  audioEl.addEventListener("error", function () {
    if (currentTrackIndex < 0 || !currentAlbum) return;
    var track = currentAlbum.tracks[currentTrackIndex];
    trackTitleEl.textContent = "Não consegui carregar esta faixa";
    trackMetaEl.textContent = 'Confira o caminho "' + track.file + '" em js/albums.js';
  });

  audioEl.addEventListener("loadedmetadata", function () {
    timeTotalEl.textContent = formatTime(audioEl.duration);
  });

  audioEl.addEventListener("timeupdate", function () {
    timeCurrentEl.textContent = formatTime(audioEl.currentTime);
    if (!isSeeking && audioEl.duration) {
      seekEl.value = (audioEl.currentTime / audioEl.duration) * 100;
    }
  });

  seekEl.addEventListener("pointerdown", function () { isSeeking = true; });
  seekEl.addEventListener("pointerup", function () { isSeeking = false; });
  seekEl.addEventListener("input", function () {
    if (audioEl.duration) {
      audioEl.currentTime = (seekEl.value / 100) * audioEl.duration;
    }
  });
}

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  var m = Math.floor(seconds / 60);
  var s = Math.floor(seconds % 60);
  return m + ":" + (s < 10 ? "0" : "") + s;
}

// ============================================================================
// CONTROLES DE MÍDIA DO SISTEMA (tela de bloqueio, notificação, fone)
// ============================================================================

function updateMediaSessionMetadata(track, index) {
  if (!("mediaSession" in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: currentAlbum.artist || "",
    album: currentAlbum.title,
    artwork: currentAlbum.cover ? [{ src: currentAlbum.cover, sizes: "512x512", type: guessImageMimeType(currentAlbum.cover) }] : [],
  });

  navigator.mediaSession.setActionHandler("play", function () { audioEl.play(); });
  navigator.mediaSession.setActionHandler("pause", function () { audioEl.pause(); });
  navigator.mediaSession.setActionHandler("previoustrack", function () { playTrackAtIndex(index - 1); });
  navigator.mediaSession.setActionHandler("nexttrack", function () { playTrackAtIndex(index + 1); });
}
