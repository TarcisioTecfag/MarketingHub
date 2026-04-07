import { useEffect, useState, useCallback, useRef } from "react";
import { Smartphone, QrCode, Wifi, WifiOff, Loader2, RefreshCw, Send, Terminal, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchApi } from "@/lib/api";

type Status = "disconnected" | "connecting" | "connected";

interface LogEntry {
  time: string;
  message: string;
  type: "info" | "success" | "error";
}

const statusConfig: Record<Status, { label: string; variant: "destructive" | "secondary" | "default"; icon: React.ReactNode }> = {
  disconnected: { label: "Desconectado", variant: "destructive", icon: <WifiOff className="h-3.5 w-3.5" /> },
  connecting: { label: "Aguardando QR", variant: "secondary", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> },
  connected: { label: "Conectado", variant: "default", icon: <Wifi className="h-3.5 w-3.5" /> },
};

export function ConnectionStatus() {
  const [status, setStatus] = useState<Status>("disconnected");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testNumber, setTestNumber] = useState("");
  const [testMessage, setTestMessage] = useState("Mensagem de teste do sistema Tecfag via WhatsApp.");
  const [sendingTest, setSendingTest] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const { status: s } = await fetchApi("/whatsapp/status");
      setStatus(s);
      
      const { qr } = await fetchApi("/whatsapp/qr");
      setQrCode(qr || null);

      const logData = await fetchApi("/whatsapp/logs");
      if (Array.isArray(logData)) {
        setLogs(logData);
      }
    } catch {
      // silently ignore
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

  const handleSendTestMessage = async () => {
    if (!testNumber) return;
    setSendingTest(true);
    try {
      await fetchApi("/whatsapp/send-test", {
        method: "POST",
        body: JSON.stringify({ number: testNumber, message: testMessage })
      });
      setTestNumber("");
      // O log de sucesso virá no próximo fetch de logs
    } catch (err) {
      console.error(err);
    } finally {
      setSendingTest(false);
    }
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

        {/* Novo Card: Teste de Disparo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Send className="h-5 w-5 text-primary" />
              Disparo de Teste
            </CardTitle>
            <CardDescription>Envie uma mensagem manual para testar a conexão.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Número do Destinatário (WhatsApp)</Label>
              <Input 
                placeholder="Ex: 5545999999999" 
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                disabled={status !== "connected"}
              />
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea 
                placeholder="Sua mensagem de teste" 
                className="resize-none"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                disabled={status !== "connected"}
                rows={3}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleSendTestMessage}
              disabled={status !== "connected" || !testNumber || sendingTest}
            >
              {sendingTest ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {sendingTest ? "Enviando..." : "Testar Conexão"}
            </Button>
          </CardContent>
        </Card>

        {/* Novo Card: Log de Eventos */}
        <Card className="flex flex-col h-[380px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Terminal className="h-5 w-5 text-primary" />
              Logs de Conexão
            </CardTitle>
            <CardDescription>Monitoramento em tempo real do webhook.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-hidden">
            <div className="rounded-lg border bg-zinc-950 p-4 h-full flex flex-col font-mono text-xs text-zinc-300">
              {logs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-zinc-500 italic">
                  Aguardando eventos...
                </div>
              ) : (
                <ScrollArea className="flex-1 -pr-4">
                  <div className="space-y-3 pb-2">
                    {/* Exibe do mais antigo pro mais novo ou vice versa (dependendo de como o backend mandou) */}
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-2 items-start opacity-90 transition-opacity hover:opacity-100">
                        <span className="text-zinc-500 flex-shrink-0 mt-0.5">
                          {new Date(log.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        
                        {log.type === "error" && <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
                        {log.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
                        {log.type === "info" && <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />}
                        
                        <span className={`break-words ${
                          log.type === "error" ? "text-red-400" : 
                          log.type === "success" ? "text-emerald-400" : 
                          "text-zinc-300"
                        }`}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
