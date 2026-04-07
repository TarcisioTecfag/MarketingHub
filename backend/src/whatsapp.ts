import makeWASocket, { DisconnectReason, Browsers, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import { prisma } from "./db";
import { usePrismaAuthState } from "./prismaAuthState";
import * as QRCode from "qrcode";

export let waSocket: ReturnType<typeof makeWASocket> | null = null;
export let connectionStatus: "disconnected" | "connecting" | "connected" = "disconnected";
export let qrCodeBase64: string | null = null;

export interface LogEntry {
  time: string;
  message: string;
  type: "info" | "success" | "error";
}
export const connectionLogs: LogEntry[] = [];

const addLog = (message: string, type: "info" | "success" | "error" = "info") => {
  connectionLogs.unshift({ time: new Date().toISOString(), message, type });
  if (connectionLogs.length > 50) connectionLogs.pop(); // Keep last 50 logs
};

const logger = pino({ level: "silent" });

export const startWhatsApp = async () => {
  const { state, saveCreds } = await usePrismaAuthState(prisma, "default");

  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`📡 Iniciando WhatsApp v${version.join(".")} (Latest: ${isLatest})`);

  waSocket = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger,
    browser: Browsers.ubuntu("Chrome"),
  });

  waSocket.ev.on("creds.update", saveCreds);

  waSocket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCodeBase64 = await QRCode.toDataURL(qr);
      connectionStatus = "connecting";
      addLog("QR Code gerado. Aguardando leitura...", "info");
    }

    if (connection === "close") {
      const error = (lastDisconnect?.error as Boom)?.output?.statusCode;
      // 401: Logged Out, 405: Not Allowed (corrupted session data, need new QR)
      const shouldReconnect = error !== DisconnectReason.loggedOut && error !== 405;
      
      connectionStatus = "disconnected";
      qrCodeBase64 = null;
      waSocket = null;

      if (shouldReconnect) {
        addLog(`Conexão fechada (Status: ${error}). Tentando reconectar...`, "error");
        setTimeout(startWhatsApp, 3000);
      } else {
        addLog(`Sessão inválida ou desconectada (Status: ${error}). Limpando e solicitando novo QR...`, "error");
        setTimeout(async () => {
          await prisma.authState.deleteMany();
          startWhatsApp();
        }, 2000);
      }
    } else if (connection === "open") {
      connectionStatus = "connected";
      qrCodeBase64 = null;
      addLog("WhatsApp Conectado com sucesso!", "success");
      console.log("✅ WhatsApp Conectado via Baileys API");
    }
  });
};

export const getGroups = async () => {
  if (!waSocket || connectionStatus !== "connected") return [];
  const groups = await waSocket.groupFetchAllParticipating();
  return Object.values(groups).map((g) => ({
    id: g.id,
    name: g.subject,
  }));
};

export const disconnectWhatsApp = async () => {
  if (waSocket) {
    addLog("Desconectando via sistema...", "info");
    waSocket.logout();
  }
};

export const sendTestMessage = async (number: string, text: string) => {
  if (!waSocket || connectionStatus !== "connected") {
    throw new Error("WhatsApp não está conectado");
  }
  
  // Formata o número (ex: 554599999999) para formato do WhatsApp do Brasil ou mantem o inserido
  let formattedNumber = number;
  if (!formattedNumber.includes('@s.whatsapp.net')) {
    // Basic formatting - Remove tudo não numérico
    formattedNumber = formattedNumber.replace(/\\D/g, '');
    if (!formattedNumber.startsWith('55')) {
       // Assumindo BR se nao tiver DDI (simplificado, melhor deixar o user pôr o 55)
    }
    formattedNumber = `${formattedNumber}@s.whatsapp.net`;
  }

  await waSocket.sendMessage(formattedNumber, { text });
  addLog(`Mensagem de teste enviada para ${number}`, "success");
};
