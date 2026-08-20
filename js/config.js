/**
 * ============================================================================
 *  CONFIGURAÇÃO GERAL DO SITE
 * ============================================================================
 * Ajustes de comportamento sem precisar mexer em lógica. Edite e recarregue
 * a página — não precisa mexer em mais nada.
 * ============================================================================
 */
window.APP_CONFIG = {

    // Nome da banda/site, exibido no topo e na aba do navegador.
    siteName: "Hama Discos",

    // Se true (padrão), a tela inicial não mostra nenhum álbum clicável —
    // vira uma tela praticamente vazia, só com o nome. A única forma de
    // ouvir um álbum é pelo link direto dele (ícone 🔗 em cada card, ou
    // README.md — pensado pra uso com QR code / tag NFC como "link secreto").
    // Troque para false pra mostrar a lista normal de álbuns pra qualquer
    // visitante.
    hideLibraryByDefault: true,

    // Cor de destaque (botões, faixa em reprodução, barra de progresso).
    accentColor: "#d98f4e",

    // Cor de fundo.
    backgroundColor: "#14110f",

    // Gira o disco na tela enquanto uma faixa está tocando (efeito visual).
    spinRecordWhilePlaying: true,
};
