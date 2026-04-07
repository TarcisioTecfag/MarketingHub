import { useEffect, useState, useCallback } from "react";
import { Smartphone, QrCode, Wifi, WifiOff, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchApi } from "@/lib/api";

type Status = "disconnected" | "connecting" | "connected";

const statusConfig: Record<Status, { label: string; variant: "destructive" | "secondary" | "default"; icon: React.ReactNode }> = {
  disconnected: { label: "Desconectado", variant: "destructive", icon: <WifiOff className="h-3.5 w-3.5" /> },
  connecting: { label: "Aguardando QR", variant: "secondary", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> },
  connected: { label: "Conectado", variant: "default", icon: <Wifi className="h-3.5 w-3.5" /> },
};

export function ConnectionStatus() {
  const [status, setStatus] = useState<Status>("disconnected");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const { status: s } = await fetchApi("/whatsapp/status");
      setStatus(s);
      // Always try to fetch QR — server returns null when none available
      const { qr } = await fetchApi("/whatsapp/qr");
      setQrCode(qr || null);
    } catch {
      // silently ignore — no user-facing error needed here
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await fetchApi("/whatsapp/connect", { method: "POST" });
      // Give server 1s to generate QR then poll immediately
      setTimeout(fetchStatus, 1000);
    } catch {
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetchApi("/whatsapp/disconnect", { method: "POST" });
      setStatus("disconnected");
      setQrCode(null);
    } catch {}
  };

  const cfg = statusConfig[status];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Conexão do Dispositivo</h1>
        <p className="text-muted-foreground mt-1">Conecte o WhatsApp da Tecfag para habilitar os disparos automáticos.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Smartphone className="h-5 w-5 text-primary" />
                Status da Conexão
              </CardTitle>
              <Badge variant={cfg.variant} className="flex items-center gap-1.5">
                {cfg.icon}
                {cfg.label}
              </Badge>
            </div>
            <CardDescription>Gerencie a conexão do WhatsApp com o sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
              {status === "disconnected" && "Nenhum dispositivo conectado. Clique em \"Gerar QR Code\" para iniciar a conexão."}
              {status === "connecting" && "Escaneie o QR Code com o WhatsApp no seu celular para concluir a conexão."}
              {status === "connected" && "✅ Dispositivo conectado com sucesso. Os disparos automáticos estão habilitados."}
            </div>
            <div className="flex gap-3">
              {status !== "connected" && (
                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="flex items-center gap-2"
                >
                  {connecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {connecting ? "Iniciando..." : "Gerar QR Code"}
                </Button>
              )}
              <Button variant="outline" onClick={handleDisconnect} disabled={status === "disconnected"}>
                Desconectar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-5 w-5 text-primary" />
              QR Code
            </CardTitle>
            <CardDescription>Escaneie com o aplicativo WhatsApp.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {status === "connected" ? (
              <div className="flex flex-col items-center gap-3 py-8 text-success">
                <Wifi className="h-16 w-16 text-primary" />
                <p className="text-sm font-medium">Conectado com sucesso!</p>
              </div>
            ) : qrCode ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <img src={qrCode} alt="WhatsApp QR Code" className="h-48 w-48 rounded-xl border border-primary/20" />
                <p className="text-sm text-muted-foreground animate-pulse">Aguardando leitura... (expira em ~60s)</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                <QrCode className="h-16 w-16 opacity-20" />
                <p className="text-sm text-center">
                  Clique em <strong>"Gerar QR Code"</strong> ao lado para iniciar a conexão.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
