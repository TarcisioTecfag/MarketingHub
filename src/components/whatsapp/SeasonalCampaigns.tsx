import { useState } from "react";
import { Plus, Pencil, Trash2, CalendarHeart, Clock, ImageIcon, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";

type SeasonalCampaign = {
  id: string;
  title: string;
  type: string;
  sendDate: string;
  groupId: string;
  message: string;
  imageBase64: string | null;
  status: "pendente" | "enviado" | "erro";
};

type Group = {
  id: string;
  name: string;
};

const statusBadge: Record<SeasonalCampaign["status"], { label: string; variant: "default" | "secondary" | "destructive" }> = {
  pendente: { label: "Agendado", variant: "default" },
  enviado: { label: "Enviado", variant: "secondary" },
  erro: { label: "Erro", variant: "destructive" },
};

function WhatsAppPreview({ message, imageUrl, groupName }: { message: string; imageUrl: string | null; groupName: string }) {
  return (
    <div className="flex flex-col h-full">
      <Label className="text-xs text-muted-foreground mb-2">Preview do WhatsApp</Label>
      <div className="flex-1 rounded-xl overflow-hidden border bg-[#e5ddd5] dark:bg-[#0b141a] flex flex-col">
        <div className="bg-[#075e54] dark:bg-[#1f2c34] text-white px-4 py-2.5 flex items-center gap-2 text-sm font-medium">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <span className="truncate">{groupName || "Selecione um grupo"}</span>
        </div>
        <div
          className="flex-1 p-3 flex flex-col justify-end min-h-0 overflow-y-auto"
          style={{
             backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        >
          {message || imageUrl ? (
            <div className="max-w-[85%] self-end">
              <div className="bg-[#dcf8c6] dark:bg-[#005c4b] rounded-lg shadow-sm overflow-hidden">
                {imageUrl && <img src={imageUrl} alt="Campanha" className="w-full max-h-48 object-cover" />}
                {message && (
                  <p className="text-[13px] leading-relaxed px-2.5 py-1.5 text-[#111b21] dark:text-[#e9edef] whitespace-pre-wrap break-words">
                    {message}
                  </p>
                )}
                <div className="flex justify-end px-2 pb-1">
                  <span className="text-[10px] text-[#667781] dark:text-[#8696a0]">
                    {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground/50 text-xs text-center gap-1 py-8">
              <ImageIcon className="h-8 w-8 opacity-30" />
              <span>Preencha os campos para<br />visualizar a preview</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CampaignForm({
  initial,
  onSave,
  onCancel,
  groups,
  isPending
}: {
  initial?: SeasonalCampaign;
  onSave: (c: Omit<SeasonalCampaign, "id" | "status" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  groups: Group[];
  isPending: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [sendDate, setSendDate] = useState(initial?.sendDate ?? "");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [imageBase64, setImageBase64] = useState<string | null>(initial?.imageBase64 ?? null);
  const [groupId, setGroupId] = useState(initial?.groupId ?? "");
  const [type, setType] = useState(initial?.type ?? "feriado");

  const selectedGroup = groups.find((g) => g.id === groupId);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => setImageBase64(evt.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <WhatsAppPreview message={message} imageUrl={imageBase64} groupName={selectedGroup?.name ?? ""} />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Título da Campanha</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Páscoa 2025" />
        </div>

        <div className="space-y-2">
          <Label>Grupo de Destino</Label>
          <Select value={groupId} onValueChange={setGroupId}>
            <SelectTrigger>
              <SelectValue placeholder={groups.length > 0 ? "Selecione o grupo" : "Nenhum grupo encontrado..."} />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
            <Label>Tipo da Campanha</Label>
             <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="feriado">Feriado</SelectItem>
                <SelectItem value="aviso">Aviso</SelectItem>
                <SelectItem value="evento">Evento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Data do Disparo</Label>
            <Input type="date" value={sendDate} onChange={(e) => setSendDate(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Mensagem</Label>
          <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mensagem da campanha..." />
        </div>

        <div className="space-y-2">
          <Label>Imagem da Campanha</Label>
          <Input type="file" accept="image/*" onChange={handleImage} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={isPending}>Cancelar</Button>
          <Button
            onClick={() => onSave({ title, type, sendDate, message, imageBase64, groupId })}
            disabled={!title || !sendDate || !groupId || isPending}
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SeasonalCampaigns() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SeasonalCampaign | undefined>();

  const { data: items = [], isLoading } = useQuery<SeasonalCampaign[]>({
    queryKey: ["seasonals"],
    queryFn: () => fetchApi("/seasonals"),
  });

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: () => fetchApi("/groups")
  });

  const saveMutation = useMutation({
    mutationFn: (data: Omit<SeasonalCampaign, "id" | "status" | "createdAt" | "updatedAt">) => {
      if (editing) {
        return fetchApi(`/seasonals/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      return fetchApi("/seasonals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasonals"] });
      setDialogOpen(false);
      setEditing(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/seasonals/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seasonals"] }),
  });

  const formatDate = (d: string) => {
    const parts = d.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return d;
  };

  const getGroupName = (groupId: string) => groups.find((g) => g.id === groupId)?.name ?? groupId;

  const sorted = [...items].sort((a, b) => a.sendDate.localeCompare(b.sendDate));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Disparos Sazonais</h1>
          <p className="text-muted-foreground mt-1">Agende mensagens para datas comemorativas e avisos gerais.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(undefined); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nova Campanha</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Campanha" : "Nova Campanha Sazonal"}</DialogTitle>
            </DialogHeader>
            <CampaignForm
              initial={editing}
              groups={groups}
              isPending={saveMutation.isPending}
              onSave={(data) => saveMutation.mutate(data)}
              onCancel={() => { setDialogOpen(false); setEditing(undefined); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading && (
            <div className="col-span-full py-8 text-center flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )}
        {!isLoading && sorted.map((c) => {
          const badge = statusBadge[c.status] || statusBadge.pendente;
          return (
            <Card key={c.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CalendarHeart className="h-4 w-4 text-primary" />
                      {c.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(c.sendDate)}
                    </CardDescription>
                    <CardDescription className="flex items-center gap-1 mt-0.5">
                      <Users className="h-3.5 w-3.5" />
                      {getGroupName(c.groupId)}
                    </CardDescription>
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{c.message}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(c); setDialogOpen(true); }} disabled={deleteMutation.isPending}>
                    <Pencil className="h-3.5 w-3.5 mr-1" />Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(c.id)} disabled={deleteMutation.isPending}>
                    <Trash2 className="h-3.5 w-3.5 mr-1 text-destructive" />Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!isLoading && items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <CalendarHeart className="h-12 w-12 opacity-20 mb-3" />
            <p>Nenhuma campanha cadastrada.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
