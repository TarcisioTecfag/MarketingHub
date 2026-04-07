import { useState } from "react";
import { Smartphone, QrCode, Wifi, WifiOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Status = "disconnected" | "connecting" | "connected";

const statusConfig: Record<Status, { label: string; variant: "destructive" | "secondary" | "default"; icon: React.ReactNode }> = {
  disconnected: { label: "Desconectado", variant: "destructive", icon: <WifiOff className="h-3.5 w-3.5" /> },
  connecting: { label: "Conectando...", variant: "secondary", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> },
  connected: { label: "Conectado", variant: "default", icon: <Wifi className="h-3.5 w-3.5" /> },
};

export function ConnectionStatus() {
  const [status, setStatus] = useState<Status>("disconnected");
  const [showQr, setShowQr] = useState(false);

  const handleGenerateQr = () => {
    setStatus("connecting");
    setShowQr(true);
    setTimeout(() => setStatus("connected"), 3000);
  };

  const handleDisconnect = () => {
    setStatus("disconnected");
    setShowQr(false);
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
              <Button onClick={handleGenerateQr} disabled={status !== "disconnected"}>
                Gerar QR Code
              </Button>
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
            {!showQr ? (
              <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                <QrCode className="h-16 w-16 opacity-20" />
                <p className="text-sm">Aguardando geração do QR Code</p>
              </div>
            ) : status === "connecting" ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="h-48 w-48 rounded-xl border-2 border-dashed border-primary/30 bg-muted flex items-center justify-center">
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className={`h-7 w-7 rounded-sm ${Math.random() > 0.4 ? "bg-foreground" : "bg-transparent"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground animate-pulse-dot">Aguardando leitura...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-success">
                <Wifi className="h-16 w-16" />
                <p className="text-sm font-medium">Conectado com sucesso!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
