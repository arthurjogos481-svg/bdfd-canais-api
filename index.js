export default async function handler(req, res) {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);

  if (!BOT_TOKEN) {
    return res.status(500).json({ error: "BOT_TOKEN não configurado" });
  }

  // ===== ROTA RAIZ =====
  if (pathname === "/") {
    return res.json({ status: "API online" });
  }

  // ===== LISTAR CANAIS COM PAGINAÇÃO =====
  if (pathname === "/canais") {
    const guildID = searchParams.get("guildID");
    const pagina = Number(searchParams.get("pagina") || 1);
    const porPagina = 25;

    if (!guildID) {
      return res.status(400).json({ error: "Falta guildID" });
    }

    try {
      const r = await fetch(`https://discord.com/api/v10/guilds/${guildID}/channels`, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` }
      });

      const dados = await r.json();

      const textos = dados.filter(c => c.type === 0);

      const totalPaginas = Math.ceil(textos.length / porPagina);
      const inicio = (pagina - 1) * porPagina;
      const fim = inicio + porPagina;

      const paginaCanais = textos.slice(inicio, fim).map(c => ({
        id: c.id,
        nome: c.name
      }));

      return res.json({
        pagina,
        total_paginas: totalPaginas,
        quantidade: paginaCanais.length,
        canais: paginaCanais
      });

    } catch (e) {
      return res.status(500).json({ error: "Erro ao buscar canais" });
    }
  }

  // ===== BUSCAR CANAL PELO NOME =====
  if (pathname === "/buscar-canal") {
    const guildID = searchParams.get("guildID");
    const nome = searchParams.get("nome");

    if (!guildID || !nome) {
      return res.status(400).json({ error: "Falta guildID ou nome" });
    }

    try {
      const r = await fetch(`https://discord.com/api/v10/guilds/${guildID}/channels`, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` }
      });

      const dados = await r.json();

      const filtrados = dados
        .filter(c => c.type === 0)
        .filter(c => c.name.toLowerCase().includes(nome.toLowerCase()))
        .map(c => ({
          id: c.id,
          nome: c.name
        }));

      return res.json({
        total: filtrados.length,
        canais: filtrados
      });

    } catch (e) {
      return res.status(500).json({ error: "Erro ao buscar canal" });
    }
  }

  // ===== ROTA NÃO EXISTE =====
  return res.status(404).json({ error: "Rota não encontrada" });
}
