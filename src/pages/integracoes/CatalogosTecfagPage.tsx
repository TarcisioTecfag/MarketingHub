import { useRef, useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import {
  Upload,
  FileText,
  Trash2,
  Download,
  Copy,
  ExternalLink,
  ImageIcon,
  CheckCircle2,
  Loader2,
  Activity,
  RefreshCw,
} from "lucide-react";

const HUB_URL = "https://catalogos-tecfag.vercel.app";

interface CatalogConfig {
  id: string;
  semiImageBase64?: string | null;
  semiImageName?: string | null;
  semiPdfBase64?: string | null;
  semiPdfName?: string | null;
  industrialImageBase64?: string | null;
  industrialImageName?: string | null;
  industrialPdfBase64?: string | null;
  industrialPdfName?: string | null;
  updatedAt: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function downloadBase64(base64: string, name: string) {
  const link = document.createElement("a");
  link.href = base64;
  link.download = name;
  link.click();
}

// Usa o fetchApi centralizado — VITE_API_URL já inclui /api
const fetchCatalogs = (): Promise<CatalogConfig> => fetchApi("/catalogs");

const putField = (path: string, body: object) =>
  fetchApi(path, { method: "PUT", body: JSON.stringify(body) });

const deleteField = (catalog: string, field: string) =>
  fetchApi(`/catalogs/${catalog}/${field}`, { method: "DELETE" });

// ── CatalogCard component ─────────────────────────────────────────────────────

type CatalogKey = "semi" | "industrial";

interface CatalogCardProps {
  label: string;
  catalogKey: CatalogKey;
  imageBase64?: string | null;
  imageName?: string | null;
  pdfBase64?: string | null;
  pdfName?: string | null;
  onRefetch: () => void;
}

function CatalogCard({
  label,
  catalogKey,
  imageBase64,
  imageName,
  pdfBase64,
  pdfName,
  onRefetch,
}: CatalogCardProps) {
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [removingImg, setRemovingImg] = useState(false);
  const [removingPdf, setRemovingPdf] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // ── image upload ────────────────────────────────────────────────────────────
  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingImg(true);
      try {
        const base64 = await readFileAsBase64(file);
        await putField(`/catalogs/${catalogKey}/image`, {
          base64,
          name: file.name,
        });
        toast({ title: "Imagem salva com sucesso!" });
        onRefetch();
      } catch {
        toast({ title: "Erro ao salvar imagem", variant: "destructive" });
      } finally {
        setUploadingImg(false);
        if (imgInputRef.current) imgInputRef.current.value = "";
      }
    },
    [catalogKey, onRefetch]
  );

  // ── pdf upload ──────────────────────────────────────────────────────────────
  const handlePdfChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingPdf(true);
      try {
        const base64 = await readFileAsBase64(file);
        await putField(`/catalogs/${catalogKey}/pdf`, {
          base64,
          name: file.name,
        });
        toast({ title: "PDF salvo com sucesso!" });
        onRefetch();
      } catch {
        toast({ title: "Erro ao salvar PDF", variant: "destructive" });
      } finally {
        setUploadingPdf(false);
        if (pdfInputRef.current) pdfInputRef.current.value = "";
      }
    },
    [catalogKey, onRefetch]
  );

  // ── remove image ────────────────────────────────────────────────────────────
  const handleRemoveImage = async () => {
    setRemovingImg(true);
    try {
      await deleteField(catalogKey, "image");
      toast({ title: "Imagem removida" });
      onRefetch();
    } catch {
      toast({ title: "Erro ao remover imagem", variant: "destructive" });
    } finally {
      setRemovingImg(false);
    }
  };

  // ── remove pdf ──────────────────────────────────────────────────────────────
  const handleRemovePdf = async () => {
    setRemovingPdf(true);
    try {
      await deleteField(catalogKey, "pdf");
      toast({ title: "PDF removido" });
      onRefetch();
    } catch {
      toast({ title: "Erro ao remover PDF", variant: "destructive" });
    } finally {
      setRemovingPdf(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card flex flex-col overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">{label}</h2>
        {imageBase64 && pdfBase64 && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completo
          </span>
        )}
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* ── Imagem de capa ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              Imagem de Capa
            </p>
            <span className="text-[11px] text-muted-foreground bg-muted rounded px-2 py-0.5">
              1024 × 768 px — proporção 4:3
            </span>
          </div>

          {/* Preview */}
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-border bg-muted/20">
            {imageBase64 ? (
              <>
                <img
                  src={imageBase64}
                  alt={`Capa ${label}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <p className="text-xs text-white/80 truncate">{imageName}</p>
                  <button
                    onClick={handleRemoveImage}
                    disabled={removingImg}
                    className="flex items-center gap-1 text-xs bg-red-600/80 hover:bg-red-600 text-white rounded-md px-2 py-1 transition-colors"
                  >
                    {removingImg ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    Remover
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <ImageIcon className="h-10 w-10 opacity-30" />
                <p className="text-xs">Nenhuma imagem cadastrada</p>
              </div>
            )}
          </div>

          {/* Upload button */}
          <input
            ref={imgInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
            id={`img-input-${catalogKey}`}
          />
          <label
            htmlFor={`img-input-${catalogKey}`}
            className="flex items-center justify-center gap-2 cursor-pointer w-full rounded-lg border border-dashed border-border bg-muted/20 hover:bg-muted/40 transition-colors py-2.5 text-sm text-muted-foreground hover:text-foreground"
          >
            {uploadingImg ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploadingImg ? "Salvando..." : imageBase64 ? "Trocar Imagem" : "Fazer Upload da Imagem"}
          </label>
        </div>

        {/* ── PDF ─────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Catálogo PDF
          </p>

          {pdfBase64 ? (
            <div className="rounded-lg border border-border bg-muted/20 p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-600/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{pdfName ?? "catalogo.pdf"}</p>
                <p className="text-xs text-muted-foreground">PDF armazenado</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => downloadBase64(pdfBase64!, pdfName ?? "catalogo.pdf")}
                  title="Baixar PDF"
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={handleRemovePdf}
                  disabled={removingPdf}
                  title="Remover PDF"
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/20 dark:hover:bg-red-950/40 transition-colors text-red-600"
                >
                  {removingPdf ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/10 p-4 flex flex-col items-center gap-1 text-muted-foreground">
              <FileText className="h-6 w-6 opacity-30" />
              <p className="text-xs">Nenhum PDF cadastrado</p>
            </div>
          )}

          {/* Upload PDF button */}
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handlePdfChange}
            id={`pdf-input-${catalogKey}`}
          />
          <label
            htmlFor={`pdf-input-${catalogKey}`}
            className="flex items-center justify-center gap-2 cursor-pointer w-full rounded-lg border border-dashed border-border bg-muted/20 hover:bg-muted/40 transition-colors py-2.5 text-sm text-muted-foreground hover:text-foreground"
          >
            {uploadingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploadingPdf ? "Salvando..." : pdfBase64 ? "Trocar PDF" : "Fazer Upload do PDF"}
          </label>
        </div>
      </div>
    </div>
  );
}

// ── Page component ────────────────────────────────────────────────────────────

export default function CatalogosTecfagPage() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery<CatalogConfig>({
    queryKey: ["catalogs"],
    queryFn: fetchCatalogs,
  });

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(HUB_URL);
    setCopied(true);
    toast({ title: "Link copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ["catalogs"] });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Catálogos Tecfag
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as imagens de capa e os PDFs exibidos no site de catálogos.
        </p>
      </div>

      {/* Site link bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">Site dos catálogos</p>
          <p className="text-sm font-mono text-foreground truncate">{HUB_URL}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copiado!" : "Copiar Link"}
          </button>
          <a
            href={HUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-3 py-2 text-sm font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir Site
          </a>
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Carregando configurações...</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-destructive">
          <p className="text-sm font-medium">Erro ao conectar com o servidor</p>
          <button
            onClick={() => refetch()}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CatalogCard
            label="Catálogo Semi-Novo"
            catalogKey="semi"
            imageBase64={data?.semiImageBase64}
            imageName={data?.semiImageName}
            pdfBase64={data?.semiPdfBase64}
            pdfName={data?.semiPdfName}
            onRefetch={handleRefetch}
          />
          <CatalogCard
            label="Catálogo Industrial"
            catalogKey="industrial"
            imageBase64={data?.industrialImageBase64}
            imageName={data?.industrialImageName}
            pdfBase64={data?.industrialPdfBase64}
            pdfName={data?.industrialPdfName}
            onRefetch={handleRefetch}
          />
        </div>
      )}

      {data?.updatedAt && (
        <p className="text-center text-xs text-muted-foreground">
          Última atualização:{" "}
          {new Date(data.updatedAt).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}

      {/* ── Analytics Panel ──────────────────────────────────────────────── */}
      <AnalyticsPanel />
    </div>
  );
}

// ── Analytics Panel ───────────────────────────────────────────────────────────

interface VisitorStats {
  total: number;
  onlineNow: number;
  last24h: number;
  avgDuration: number;
  topCountries: { country: string | null; countryCode: string | null; count: number }[];
  recent: {
    id: string;
    country: string | null;
    countryCode: string | null;
    city: string | null;
    region: string | null;
    browser: string | null;
    os: string | null;
    device: string | null;
    language: string | null;
    referrer: string | null;
    duration: number | null;
    catalogViewed: string | null;
    createdAt: string;
  }[];
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function deviceIcon(device: string | null) {
  if (device === "mobile") return "📱";
  if (device === "tablet") return "📟";
  return "🖥️";
}

function flagEmoji(countryCode: string | null): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  return countryCode
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

function AnalyticsPanel() {
  const { data, isLoading, refetch } = useQuery<VisitorStats>({
    queryKey: ["visitor-stats"],
    queryFn: () => fetchApi("/visitors/stats"),
    refetchInterval: 30_000, // atualiza a cada 30 segundos
  });

  return (
    <div className="flex flex-col gap-5 mt-4">
      {/* Divisor */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" />
          Monitoramento do Site
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Online agora */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Online agora</p>
          <div className="flex items-end gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <p className="text-2xl font-bold text-foreground">{data?.onlineNow ?? 0}</p>
                {(data?.onlineNow ?? 0) > 0 && (
                  <span className="mb-0.5 flex items-center gap-1 text-xs text-emerald-500 font-medium">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    ao vivo
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Total geral */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Histórico total</p>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              <p className="text-2xl font-bold text-foreground">{data?.total?.toLocaleString("pt-BR") ?? 0}</p>
              <p className="text-[11px] text-muted-foreground">desde o início</p>
            </>
          )}
        </div>

        {/* Últimas 24h */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Últimas 24h</p>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{data?.last24h ?? 0}</p>
          )}
        </div>

        {/* Tempo médio */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Tempo médio</p>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{formatDuration(data?.avgDuration ?? 0)}</p>
          )}
        </div>
      </div>

      {/* Top países + tabela de visitantes */}
      {!isLoading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Top países */}
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
            <p className="text-sm font-medium text-foreground">Top Países</p>
            {data.topCountries.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados ainda</p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.topCountries.map((c, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg leading-none">{flagEmoji(c.countryCode)}</span>
                      <span className="text-sm text-foreground truncate">{c.country ?? "Desconhecido"}</span>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground shrink-0">{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tabela de visitantes recentes */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Visitantes Recentes</p>
              <button
                onClick={() => refetch()}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Atualizar
              </button>
            </div>

            {data.recent.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Nenhum visitante registrado ainda
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="text-left px-3 py-2 text-muted-foreground font-medium">País / Cidade</th>
                      <th className="text-left px-3 py-2 text-muted-foreground font-medium">Dispositivo</th>
                      <th className="text-left px-3 py-2 text-muted-foreground font-medium">Catálogo</th>
                      <th className="text-left px-3 py-2 text-muted-foreground font-medium">Tempo</th>
                      <th className="text-left px-3 py-2 text-muted-foreground font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((v) => (
                      <tr key={v.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <span>{flagEmoji(v.countryCode)}</span>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{v.country ?? "—"}</p>
                              {v.city && <p className="text-muted-foreground truncate">{v.city}{v.region ? `, ${v.region}` : ""}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <span>{deviceIcon(v.device)}</span>
                            <div>
                              <p className="text-foreground">{v.browser ?? "—"}</p>
                              <p className="text-muted-foreground">{v.os ?? ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {v.catalogViewed ? (
                            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-medium">
                              {v.catalogViewed === "semi" ? "Semi-Novo" : "Industrial"}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-foreground">{formatDuration(v.duration)}</td>
                        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                          {new Date(v.createdAt).toLocaleString("pt-BR", {
                            day: "2-digit", month: "2-digit",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

