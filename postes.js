import fs from "fs";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      "enclosure",
      "description",
      "summary"
    ],
  },
});

// util: remove HTML e espaçamento extra
const stripHtml = (html = "") =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// util: limita tamanho do resumo
const truncate = (txt, n = 1100) =>
  txt && txt.length > n ? txt.slice(0, n - 1).trim() + "…" : txt;

// escolhe o melhor resumo disponível
const extrairResumo = (item) => {
  const candidatos = [
    item.contentSnippet,      // gerado pelo rss-parser (quando possível)
    item.summary,             // Atom
    item.description,         // RSS <description>
    item.content,             // mapeado pelo rss-parser em alguns feeds
    item.contentEncoded,      // WordPress <content:encoded>
  ]
    .filter(Boolean)
    .map(stripHtml)
    .filter(Boolean);

  return truncate(candidatos[0] || "");
};

// escolhe a melhor imagem disponível
const extrairImagem = (item, html) => {
  let url =
    item.enclosure?.url ||
    item.mediaContent?.$?.url ||
    item.mediaThumbnail?.$?.url ||
    "";

  if (!url && html) {
    const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m) url = m[1];
  }
  return url || "/img/default.png";
};

async function importarNoticias() {
  try {
    const feed = await parser.parseURL("https://rss.tecmundo.com.br/feed");

    // TecMundo já é de tecnologia; se quiser manter um filtro, deixe aqui:
    const itens = feed.items || [];
    if (itens.length === 0) {
      console.log("⚠️ Feed sem itens.");
      return;
    }

    // Pega o mais recente do feed
    const item = itens[0];

    const slug = item.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // resumo robusto
    const resumo = extrairResumo(item) || "Resumo não disponível.";

    // HTML de referência para extrair imagem
    const htmlConteudo = item.contentEncoded || item.content || "";

    const imagem = extrairImagem(item, htmlConteudo);

    // conteúdo curto + link pro original (legalmente mais seguro)
    const conteudo = `
<p>${resumo}</p>
<p><a href="${item.link}" target="_blank" rel="noopener noreferrer">Leia mais no TecMundo</a></p>
`.trim();

    const post = {
      slug,
      titulo: item.title,
      resumo,
      imagem,
      data: new Date(item.isoDate || item.pubDate || Date.now())
        .toISOString()
        .split("T")[0],
      conteudo,
    };

    // lê posts existentes e acrescenta sem duplicar (por slug)
    let posts = [];
    if (fs.existsSync("posts.json")) {
      posts = JSON.parse(fs.readFileSync("posts.json", "utf-8"));
    }

    const jaExiste = posts.some((p) => p.slug === post.slug);
    if (!jaExiste) {
      posts.unshift(post);
      fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2), "utf-8");
      console.log("✅ Novo post adicionado com resumo!");
    } else {
      console.log("ℹ️ Post já existe, não duplicado.");
    }
  } catch (error) {
    console.error("❌ Erro ao importar notícias:", error);
  }
}

// Executa manualmente
importarNoticias();
