// index.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const POR_PAGINA = 25;
const botToken = process.env.BOT_TOKEN;

if (!botToken) {
  console.error("BOT_TOKEN não configurado no Vercel");
}

// Listar canais de texto com paginação
app.get("/canais", async (req, res) => {
  const guildId = req.query.guildID;
  const pagina = Number(req.query.pagina || 1);

  if (!guildId) {
    return res.status(400).json({ error: "Faltando guildID" });
  }

  try {
    const discordRes = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/channels`,
      {
        headers: {
          Authorization: `Bot ${botToken}`
        }
      }
    );

    const allChannels = await discordRes.json();

    if (!Array.isArray(allChannels)) {
      return res.status(500).json({
        error: "Erro ao buscar canais do Discord",
        discord: allChannels
      });
    }

    const textChannels = allChannels.filter(c => c.type === 0);

    const inicio = (pagina - 1) * POR_PAGINA;
    const fim = inicio + POR_PAGINA;

    const canais = textChannels.slice(inicio, fim).map(c => ({
      id: c.id,
      nome: c.name
    }));

    res.json({
      pagina,
      total_paginas: Math.ceil(textChannels.length / POR_PAGINA),
      canais
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Importante para Vercel:
export default app;
