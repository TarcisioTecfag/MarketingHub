import makeWASocket, { DisconnectReason, Browsers } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import { prisma } from "./db";
import { usePrismaAuthState } from "./prismaAuthState";
import * as QRCode from "qrcode";

export let waSocket: ReturnType<typeof makeWASocket> | null = null;
export let connectionStatus: "disconnected" | "connecting" | "connected" = "disconnected";
export let qrCodeBase64: string | null = null;

const logger = pino({ level: "silent" });

export const startWhatsApp = async () => {
  const { state, saveCreds } = await usePrismaAuthState(prisma, "default");

  waSocket = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger,
    browser: Browsers.macOS("Desktop"),
  });

  waSocket.ev.on("creds.update", saveCreds);

  waSocket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCodeBase64 = await QRCode.toDataURL(qr);
      connectionStatus = "connecting";
    }

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      
      connectionStatus = "disconnected";
      qrCodeBase64 = null;
      waSocket = null;

      if (shouldReconnect) {
        setTimeout(startWhatsApp, 3000);
      } else {
        // Se deslogou, limpamos tudo para novo QR Code ser gerado.
        await prisma.authState.deleteMany();
        startWhatsApp();
      }
    } else if (connection === "open") {
      connectionStatus = "connected";
      qrCodeBase64 = null;
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
    waSocket.logout();
  }
};
