import express from "express";
import cors from "cors";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// WhatsApp module — loaded lazily so server starts even if Baileys has issues
let waModule: typeof import("./whatsapp") | null = null;
const getWA = async () => {
  if (!waModule) waModule = await import("./whatsapp");
  return waModule;
};

const JWT_SECRET = process.env.JWT_SECRET || "tecfag_marketing_hub_super_secret";

const app = express();

// Manual CORS — raw headers, no package dependency
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: "50mb" }));

// Health check — confirms server is alive
app.get("/health", (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// ---- WhatsApp Core Routes ----
app.get("/api/whatsapp/status", async (req, res) => {
  const wa = await getWA();
  res.json({ status: wa.connectionStatus });
});

app.get("/api/whatsapp/qr", async (req, res) => {
  const wa = await getWA();
  res.json({ qr: wa.qrCodeBase64 });
});

app.post("/api/whatsapp/connect", async (req, res) => {
  try {
    const wa = await getWA();
    await wa.startWhatsApp();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Falha ao iniciar WhatsApp" });
  }
});

app.post("/api/whatsapp/disconnect", async (req, res) => {
  const wa = await getWA();
  await wa.disconnectWhatsApp();
  res.json({ success: true });
});

app.post("/api/whatsapp/send-test", async (req, res) => {
  try {
    const { number, message } = req.body;
    if (!number || !message) {
      return res.status(400).json({ error: "Número e mensagem são obrigatórios" });
    }
    const wa = await getWA();
    await wa.sendTestMessage(number, message);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Falha ao enviar mensagem de teste" });
  }
});

app.get("/api/whatsapp/logs", async (req, res) => {
  const wa = await getWA();
  res.json(wa.connectionLogs);
});

app.get("/api/groups", async (req, res) => {
  try {
    const wa = await getWA();
    const groups = await wa.getGroups();
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

// ---- Auth & Users Routes ----
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    
    const userData = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.json({ token, user: userData });
  } catch (error) {
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const data = req.body;
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const created = await prisma.user.create({ data });
    res.json(created);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const updated = await prisma.user.update({ where: { id }, data });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir usuário" });
  }
});

import { startCronJobs } from "./cron";

const PORT = process.env.PORT || 3000;

async function seedMasterUser() {
  try {
    const masterEmail = "tarcisio@tecfag.com.br";
    const existingMaster = await prisma.user.findUnique({ where: { email: masterEmail } });
    if (!existingMaster) {
      const hashedPassword = await bcrypt.hash("123", 10);
      await prisma.user.create({
        data: {
          name: "Tarcisio",
          email: masterEmail,
          password: hashedPassword,
          role: "admin",
        }
      });
      console.log("Master user created automatically.");
    }
  } catch (err) {
    console.error("Error seeding master user:", err);
  }
}

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  seedMasterUser();
  startCronJobs();
  // Load WhatsApp lazily — don't crash server if Baileys fails on startup
  getWA().then(wa => wa.startWhatsApp()).catch((err) => {
    console.error("WhatsApp startup error (non-fatal):", err.message);
  });
});

