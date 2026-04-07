import express from "express";
import cors from "cors";
import { startWhatsApp, connectionStatus, qrCodeBase64, getGroups, disconnectWhatsApp } from "./whatsapp";
import { prisma } from "./db";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// ---- WhatsApp Core Routes ----
app.get("/api/whatsapp/status", (req, res) => {
  res.json({ status: connectionStatus });
});

app.get("/api/whatsapp/qr", (req, res) => {
  res.json({ qr: qrCodeBase64 });
});

app.post("/api/whatsapp/disconnect", async (req, res) => {
  await disconnectWhatsApp();
  res.json({ success: true });
});

app.get("/api/groups", async (req, res) => {
  try {
    const groups = await getGroups();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar grupos." });
  }
});

// ---- Birthdays Routes ----
app.get("/api/birthdays", async (req, res) => {
  const birthdays = await prisma.birthday.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(birthdays);
});

app.post("/api/birthdays", async (req, res) => {
  const data = req.body;
  const created = await prisma.birthday.create({ data });
  res.json(created);
});

app.put("/api/birthdays/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const updated = await prisma.birthday.update({ where: { id }, data });
  res.json(updated);
});

app.delete("/api/birthdays/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.birthday.delete({ where: { id } });
  res.json({ success: true });
});

// ---- Seasonal Campaigns ----
app.get("/api/seasonals", async (req, res) => {
  const seasonals = await prisma.seasonalCampaign.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(seasonals);
});

app.post("/api/seasonals", async (req, res) => {
  const data = req.body;
  const created = await prisma.seasonalCampaign.create({ data });
  res.json(created);
});

app.put("/api/seasonals/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const updated = await prisma.seasonalCampaign.update({ where: { id }, data });
  res.json(updated);
});

app.delete("/api/seasonals/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.seasonalCampaign.delete({ where: { id } });
  res.json({ success: true });
});

import { startCronJobs } from "./cron";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  startCronJobs();
  startWhatsApp().catch(console.error);
});
