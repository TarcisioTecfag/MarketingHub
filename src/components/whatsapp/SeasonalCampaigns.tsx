import { useState } from "react";
import { Plus, Pencil, Trash2, CalendarHeart, Clock, ImageIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockCampaigns, mockGroups, type SeasonalCampaign } from "@/data/mock-data";

const statusBadge: Record<SeasonalCampaign["status"], { label: string; variant: "default" | "secondary" | "outline" }> = {
  agendado: { label: "Agendado", variant: "default" },
  enviado: { label: "Enviado", variant: "secondary" },
  rascunho: { label: "Rascunho", variant: "outline" },
};

function WhatsAppPreview({ message, imageUrl, groupName }: { message: string; imageUrl: string | null; groupName: string }) {
  return (
    <div className="flex flex-col h-full">
      <Label className="text-xs text-muted-foreground mb-2">Preview do WhatsApp</Label>
      <div className="flex-1 rounded-xl overflow-hidden border bg-[#e5ddd5] dark:bg-[#0b141a] flex flex-col">
        {/* Header */}
        <div className="bg-[#075e54] dark:bg-[#1f2c34] text-white px-4 py-2.5 flex items-center gap-2 text-sm font-medium">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <span className="truncate">{groupName || "Selecione um grupo"}</span>
        </div>

        {/* Chat area */}
        <div className="flex-1 p-3 flex flex-col justify-end min-h-0 overflow-y-auto"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        >
          {/* Message bubble */}
          {(message || imageUrl) ? (
            <div className="max-w-[85%] self-end">
              <div className="bg-[#dcf8c6] dark:bg-[#005c4b] rounded-lg shadow-sm overflow-hidden">
                {imageUrl && (
                  <img src={imageUrl} alt="Campanha" className="w-full max-h-48 object-cover" />
                )}
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
}: {
  initial?: SeasonalCampaign;
  onSave: (c: Omit<SeasonalCampaign, "id" | "status">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [time, setTime] = useState(initial?.time ?? "");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.imageUrl ?? null);
  const [groupId, setGroupId] = useState(initial?.groupId ?? "");

  const selectedGroup = mockGroups.find((g) => g.id === groupId);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Preview à esquerda */}
      <WhatsAppPreview
        message={message}
        imageUrl={imagePreview}
        groupName={selectedGroup?.name ?? ""}
      />

      {/* Form à direita */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Título da Campanha</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Páscoa 2025" />
        </div>

        <div className="space-y-2">
          <Label>Grupo de Destino</Label>
          <Select value={groupId} onValueChange={setGroupId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o grupo" />
            </SelectTrigger>
            <SelectContent>
              {mockGroups.map((g) => (
                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data do Disparo</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Hora do Disparo</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
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
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={() => onSave({ title, date, time, message, imageUrl: imagePreview, groupId })} disabled={!title || !date || !groupId}>
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SeasonalCampaigns() {
  const [items, setItems] = useState<SeasonalCampaign[]>(mockCampaigns);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SeasonalCampaign | undefined>();

  const handleSave = (data: Omit<SeasonalCampaign, "id" | "status">) => {
    if (editing) {
      setItems((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...data } : c)));
    } else {
      setItems((prev) => [...prev, { ...data, id: String(Date.now()), status: "rascunho" }]);
    }
    setDialogOpen(false);
    setEditing(undefined);
  };

  const handleDelete = (id: string) => setItems((prev) => prev.filter((c) => c.id !== id));

  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  const getGroupName = (groupId: string) => mockGroups.find((g) => g.id === groupId)?.name ?? "—";

  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));

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
            <CampaignForm initial={editing} onSave={handleSave} onCancel={() => { setDialogOpen(false); setEditing(undefined); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((c) => {
          const badge = statusBadge[c.status];
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
                      {formatDate(c.date)} às {c.time}
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
                  <Button size="sm" variant="outline" onClick={() => { setEditing(c); setDialogOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5 mr-1" />Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1 text-destructive" />Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {items.length === 0 && (
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
