import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Upload,
  Save,
  FileText,
  Compass,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { apiErrorMessage, apiUrl, normalizeMediaUrl } from "@/lib/api";
import logoImage from "../assets/LogoMainSection.png";

interface PropertyImage {
  imageId: number;
  imageUrl: string;
  propertyId: number;
}

interface PropertyDetails {
  propertyId: number;
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  propertyType?: string;
  isForSale?: boolean;
  isForRent?: boolean;
  price?: string | number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  furniture?: string;
  hasOwnershipDocument?: boolean;
  latitude?: number;
  longitude?: number;
  floorPlanUrl?: string;
  virtualTourUrl?: string;
}

interface SortableImageProps {
  image: PropertyImage;
  onDelete: (imageId: number) => void;
  onUpscale: (imageId: number) => void;
  upscaling: boolean;
}

const adminPage =
  "min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(18,56,36,0.95),#050705_48%,#020302_100%)] text-[#f5f0e8] p-4 md:p-8";
const adminPanel =
  "border border-real-estate-secondary/20 bg-[#0d1510]/95 shadow-2xl shadow-black/25";
const adminInput =
  "rounded-none border-real-estate-secondary/20 bg-[#050705] text-[#f5f0e8] placeholder:text-[#f5f0e8]/30 focus:border-real-estate-secondary focus:ring-2 focus:ring-real-estate-secondary/20";
const sectionTitle =
  "font-text text-xs font-bold uppercase tracking-[0.28em] text-real-estate-secondary";
const primaryGoldButton =
  "rounded-none border border-real-estate-secondary bg-real-estate-secondary px-6 py-5 font-text text-xs font-bold uppercase tracking-[0.2em] text-real-estate-primary hover:bg-[#f1d676]";
const outlineGoldButton =
  "rounded-none border-real-estate-secondary/40 bg-transparent px-5 py-5 font-text text-xs font-bold uppercase tracking-[0.2em] text-real-estate-secondary hover:bg-real-estate-secondary hover:text-real-estate-primary";

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
const API_ORIGIN = API_BASE
  ? new URL(API_BASE).origin
  : typeof window !== "undefined"
  ? window.location.origin
  : "";

// extract a likely URL from many shapes
const extractUrl = (val: unknown): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    const o = val as any;
    if (typeof o.imageUrl === "string") return o.imageUrl;
    if (typeof o.url === "string") return o.url;
    if (typeof o.src === "string") return o.src;
    if (typeof o.link === "string") return o.link;
    if (typeof o.href === "string") return o.href;
    if (o.imageUrl && typeof o.imageUrl === "object") {
      const nested = extractUrl(o.imageUrl);
      if (nested) return nested;
    }
    // last resort: first string value on the object
    for (const k of Object.keys(o)) {
      if (typeof o[k] === "string") return o[k];
    }
  }
  return "";
};

// make relative paths absolute to the API origin
const toAbsoluteUrl = (u: string): string => {
  const cleanUrl = normalizeMediaUrl(u);
  if (!cleanUrl) return "";
  if (/^data:/.test(cleanUrl) || /^https?:\/\//i.test(cleanUrl)) return cleanUrl;
  if (cleanUrl.startsWith("//")) return `https:${cleanUrl}`;
  if (cleanUrl.startsWith("/")) return `${API_ORIGIN}${cleanUrl}`;
  return cleanUrl;
};

const toArray = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    if (Array.isArray(raw.$values)) return raw.$values;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw.result)) return raw.result;
  }
  return [];
};

const normalizeImages = (raw: any, propertyId: number): PropertyImage[] =>
  toArray(raw).map((it: any) => {
    const url = toAbsoluteUrl(extractUrl(it));
    return {
      imageId: Number(it?.imageId ?? it?.ImageId), // 👈 use DB ImageId
      imageUrl: url,
      propertyId: Number(it?.propertyId ?? it?.PropertyId ?? propertyId),
    };
  });

/* ------------------------------------------------ */

const SortableImage: React.FC<SortableImageProps> = ({
  image,
  onDelete,
  onUpscale,
  upscaling,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(image.imageId ?? image.imageUrl ?? Math.random().toString()),
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const short = (u?: string) => {
    if (!u) return "";
    try {
      const url = new URL(u);
      return `${url.hostname}${url.pathname}`;
    } catch {
      return u.substring(0, 70);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative overflow-hidden border border-real-estate-secondary/20 bg-[#08150f] shadow-xl shadow-black/20 transition hover:border-real-estate-secondary/60"
    >
      <div className="aspect-video relative">
        <img
          src={image.imageUrl || ""}
          alt={`Property ${image.imageId ?? "image"}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%230b1220'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='0.3em' font-family='system-ui' font-size='14' fill='%238a8fa3'%3EImage not found%3C/text%3E%3C/svg%3E";
          }}
        />
        <div
          {...attributes}
          {...listeners}
          className="absolute left-2 top-2 cursor-grab border border-real-estate-secondary/35 bg-[#050705]/85 p-1.5 text-real-estate-secondary opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <Button
          size="icon"
          variant="destructive"
          className="absolute right-2 top-2 h-8 w-8 rounded-none border border-red-500/50 bg-red-950/70 text-red-100 opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100"
          onClick={() => onDelete(image.imageId)}
          aria-label="Delete image"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          className="absolute bottom-2 right-2 h-8 rounded-none border border-real-estate-secondary/60 bg-[#050705]/85 px-3 font-text text-[10px] font-bold uppercase tracking-[0.16em] text-real-estate-secondary opacity-0 transition-opacity hover:bg-real-estate-secondary hover:text-real-estate-primary group-hover:opacity-100"
          onClick={() => onUpscale(image.imageId)}
          disabled={upscaling}
          aria-label="Upscale image quality"
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          {upscaling ? "Upscaling" : "Upscale"}
        </Button>
      </div>
      <div className="border-t border-real-estate-secondary/15 bg-[#050705]/70 px-3 py-2">
        <p className="truncate text-xs text-[#f5f0e8]/45">
          {short(image.imageUrl)}
        </p>
      </div>
    </div>
  );
};

const ManageImages: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [floorPlanUrl, setFloorPlanUrl] = useState("");
  const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null);
  const [virtualTourUrl, setVirtualTourUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [savingMedia, setSavingMedia] = useState(false);
  const [uploadingFloorPlan, setUploadingFloorPlan] = useState(false);
  const [upscalingImageId, setUpscalingImageId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const [propertyRes, imagesRes, mediaRes] = await Promise.all([
          axios.get(apiUrl(`/api/Property/GetProperty/${id}`), {
            headers: { Accept: "application/json" },
            signal: ac.signal,
          }),
          axios
            .get(apiUrl(`/api/Property/GetPropertyImages/${id}`), {
              headers: { Accept: "application/json" },
              signal: ac.signal,
            })
            .catch((error) => {
              if (error?.response?.status === 404) return { data: [] };
              throw error;
            }),
          axios
            .get(apiUrl(`/api/Property/UpdatePropertyMedia/${id}`), {
              headers: { Accept: "application/json" },
              signal: ac.signal,
            })
            .catch(() => ({ data: null })),
        ]);
        const p = propertyRes.data as PropertyDetails;
        const media =
          mediaRes?.data && typeof mediaRes.data === "object"
            ? (mediaRes.data as Partial<PropertyDetails>)
            : {};
        const merged = {
          ...p,
          floorPlanUrl: media.floorPlanUrl ?? p.floorPlanUrl,
          virtualTourUrl: media.virtualTourUrl ?? p.virtualTourUrl,
        };
        setProperty(merged);
        setFloorPlanUrl(merged.floorPlanUrl ?? "");
        setVirtualTourUrl(merged.virtualTourUrl ?? "");
        setImages(normalizeImages(imagesRes.data, Number(id)));
      } catch (error: any) {
        if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED")
          return;
        console.error("Error fetching property images:", error);
        toast({
          title: "Error",
          description: "Failed to fetch property images. Please try again.",
          variant: "destructive",
        });
        setImages([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [id, toast]);

  const handleAddImage = async () => {
    const clean = newImageUrl.trim();
    if (!clean && !newImageFile) {
      toast({
        title: "Error",
        description: "Please enter an image URL or choose a file.",
        variant: "destructive",
      });
      return;
    }

    try {
      setAdding(true);
      const url = apiUrl(`/api/Property/AddPropertyImage/${id}`);
      const { data } = newImageFile
        ? await axios.post(
            url,
            (() => {
              const body = new FormData();
              body.append("image", newImageFile);
              if (clean) body.append("originalUrl", clean);
              return body;
            })()
          )
        : await axios.post(
            url,
            { imageUrl: clean },
            { headers: { "Content-Type": "application/json" } }
          );
      const normalized = normalizeImages([data], Number(id))[0];
      setImages((prev) => [...prev, normalized]);
      setNewImageUrl("");
      setNewImageFile(null);
      const fileInput = document.getElementById("imageFile") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      toast({ title: "Success", description: "Image added successfully!" });
    } catch (error) {
      console.error("Error adding property image:", error);
      toast({
        title: "Error",
        description: apiErrorMessage(error, "Failed to add image."),
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleUpscaleImage = async (imageId: number) => {
    try {
      setUpscalingImageId(imageId);
      const { data } = await axios.post(apiUrl(`/api/Property/UpscalePropertyImage/${imageId}`));
      const normalized = normalizeImages([data], Number(id))[0];
      setImages((prev) =>
        prev.map((image) => (image.imageId === imageId ? { ...image, ...normalized } : image))
      );
      toast({
        title: "Image upscaled",
        description: "The database image was reprocessed and saved.",
      });
    } catch (error) {
      console.error("Error upscaling property image:", error);
      toast({
        title: "Error",
        description: apiErrorMessage(error, "Failed to upscale image."),
        variant: "destructive",
      });
    } finally {
      setUpscalingImageId(null);
    }
  };

  const handleSaveFeatureUrls = async () => {
    if (!id || !property) return;
    try {
      setSavingMedia(true);
      const updated = {
        ...property,
        floorPlanUrl: floorPlanUrl.trim(),
        virtualTourUrl: virtualTourUrl.trim(),
      };
      const { data } = await axios.patch(apiUrl(`/api/Property/UpdatePropertyMedia/${id}`), {
        floorPlanUrl: updated.floorPlanUrl,
        virtualTourUrl: updated.virtualTourUrl,
      }, {
        headers: { "Content-Type": "application/json" },
      });
      setProperty({
        ...updated,
        floorPlanUrl: data?.floorPlanUrl ?? updated.floorPlanUrl,
        virtualTourUrl: data?.virtualTourUrl ?? updated.virtualTourUrl,
      });
      toast({
        title: "Success",
        description: "Property media links updated successfully.",
      });
    } catch (error) {
      console.error("Error saving media links:", error);
      toast({
        title: "Error",
        description: "Failed to save media links.",
        variant: "destructive",
      });
    } finally {
      setSavingMedia(false);
    }
  };

  const handleUploadFloorPlan = async () => {
    if (!id || !property || !floorPlanFile) {
      toast({
        title: "Error",
        description: "Choose a floor plan image first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingFloorPlan(true);
      const body = new FormData();
      body.append("floorPlan", floorPlanFile);
      const { data } = await axios.post(apiUrl(`/api/Property/UploadFloorPlanImage/${id}`), body);
      const uploadedUrl = data?.floorPlanUrl ?? "";
      setFloorPlanUrl(uploadedUrl);
      setProperty({ ...property, floorPlanUrl: uploadedUrl });
      setFloorPlanFile(null);
      const fileInput = document.getElementById("floorPlanFile") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      toast({
        title: "Floor plan uploaded",
        description: "The floor plan image was saved in the database.",
      });
    } catch (error) {
      console.error("Error uploading floor plan:", error);
      toast({
        title: "Error",
        description: apiErrorMessage(error, "Failed to upload floor plan image."),
        variant: "destructive",
      });
    } finally {
      setUploadingFloorPlan(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      const url = apiUrl(`/api/Property/DeletePropertyImage/${id}/${imageId}`);
      await axios.delete(url);
      setImages((prev) => prev.filter((img) => img.imageId !== imageId));
      toast({ title: "Success", description: "Image deleted successfully!" });
    } catch (error) {
      console.error("Error deleting property image:", error);
      toast({
        title: "Error",
        description: "Failed to delete image from server.",
        variant: "destructive",
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImages((items) => {
      const oldIndex = items.findIndex(
        (it) => String(it.imageId) === String(active.id)
      );
      const newIndex = items.findIndex(
        (it) => String(it.imageId) === String(over.id)
      );
      return arrayMove(items, oldIndex, newIndex);
    });

    toast({ title: "Success", description: "Images reordered successfully!" });
  };

  const field = adminInput;
  const cleanFloorPlanUrl = normalizeMediaUrl(floorPlanUrl.trim());
  const cleanVirtualTourUrl = virtualTourUrl.trim();
  const isFloorPlanPdf = /\.pdf($|[?#])/i.test(cleanFloorPlanUrl);
  const hasFloorPlan = cleanFloorPlanUrl.length > 0;
  const hasVirtualTour = cleanVirtualTourUrl.length > 0;

  return (
    <div className={adminPage}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <Card className={adminPanel}>
          <CardHeader className="p-5 md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <img src={logoImage} alt="Realo Real Estate" className="h-14 w-auto object-contain" />
                <div className="h-px w-full bg-real-estate-secondary/20 sm:h-12 sm:w-px" />
                <div>
                  <p className="font-text text-xs uppercase tracking-[0.32em] text-real-estate-secondary">
                    Media Studio
                  </p>
                  <CardTitle className="mt-2 font-title text-4xl font-normal leading-none text-[#f5f0e8] md:text-5xl">
                    Manage Property Images
                  </CardTitle>
                </div>
              </div>
              <Button
                className={outlineGoldButton}
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Add Image */}
        <Card className={adminPanel}>
          <CardHeader className="border-b border-real-estate-secondary/15">
            <p className={sectionTitle}>Photo Library</p>
            <CardTitle className="mt-2 font-title text-3xl font-normal text-[#f5f0e8]">
              Add New Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-4 md:grid-cols-[1fr_320px]">
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-[#f5f0e8]/75">
                  Image URL
                </Label>
                <div className="relative flex gap-2">
                  <Input
                    id="imageUrl"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg  or  /uploads/abc.jpg"
                    className={field}
                  />
                </div>
                <p className="text-xs text-[#f5f0e8]/45">
                  Paste a public image URL or use the upload option. The API upscales and stores it in the database.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageFile" className="text-[#f5f0e8]/75">
                  Upload Image
                </Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImageFile(e.target.files?.[0] ?? null)}
                  className={field}
                />
                <p className="text-xs text-[#f5f0e8]/45">
                  Choose a local image to save directly into SQL Server.
                </p>
              </div>
            </div>
            <Button
              onClick={handleAddImage}
              disabled={adding || (!newImageUrl.trim() && !newImageFile)}
              className={primaryGoldButton}
            >
              {adding ? (
                "Adding..."
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Floor Plan & Pioneer Tour */}
        <Card className="overflow-hidden border border-real-estate-secondary/30 bg-[#08150f] shadow-xl shadow-black/20">
          <CardHeader className="border-b border-[#d6ad2f]/20 bg-gradient-to-r from-[#050706] via-[#08150f] to-[#123824]">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className={sectionTitle}>Interactive Media</p>
                <CardTitle className="font-title text-3xl text-[#f8f0df]">
                  Floor Plan & Pioneer Virtual Tour
                </CardTitle>
                <p className="mt-2 max-w-2xl text-sm text-[#f8f0df]/65">
                  Add the public floor plan URL and the exported Pioneer or Panoee tour link. These links appear in the WEB360-style viewer on the public property page.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={`rounded-full border px-3 py-1.5 font-semibold ${hasFloorPlan ? "border-[#d6ad2f]/60 bg-[#d6ad2f]/15 text-[#f4d57c]" : "border-[#d6ad2f]/20 bg-[#050706]/80 text-[#f5f0e8]/40"}`}>
                  {hasFloorPlan ? "Floor plan ready" : "Floor plan missing"}
                </span>
                <span className={`rounded-full border px-3 py-1.5 font-semibold ${hasVirtualTour ? "border-[#d6ad2f]/60 bg-[#d6ad2f]/15 text-[#f4d57c]" : "border-[#d6ad2f]/20 bg-[#050706]/80 text-[#f5f0e8]/40"}`}>
                  {hasVirtualTour ? "Tour ready" : "Tour missing"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-5 md:p-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-[#d6ad2f]/25 bg-[#06130f]">
                <div className="flex items-center justify-between gap-3 border-b border-[#d6ad2f]/15 bg-black/25 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-[#d6ad2f]/35 bg-[#d6ad2f]/10 text-[#d6ad2f]">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-[#f8f0df]">Floor Plan</h3>
                      <p className="text-xs text-[#f5f0e8]/50">Image or PDF URL</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${hasFloorPlan ? "bg-emerald-500/15 text-emerald-200" : "bg-[#050706] text-[#f5f0e8]/40"}`}>
                    {hasFloorPlan ? "Ready" : "Missing"}
                  </span>
                </div>
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="floorPlanUrl" className="text-[#f5f0e8]/75">
                      Floor Plan URL
                    </Label>
                    <Input
                      id="floorPlanUrl"
                      type="url"
                      value={floorPlanUrl}
                      onChange={(e) => setFloorPlanUrl(e.target.value)}
                      placeholder="https://example.com/floor-plan.pdf"
                      className={field}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div className="space-y-2">
                      <Label htmlFor="floorPlanFile" className="text-[#f5f0e8]/75">
                        Upload Floor Plan Image
                      </Label>
                      <Input
                        id="floorPlanFile"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFloorPlanFile(e.target.files?.[0] ?? null)}
                        className={field}
                      />
                      <p className="text-xs text-[#f5f0e8]/45">
                        Upload a floor plan image to store it directly in SQL Server.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleUploadFloorPlan}
                      disabled={uploadingFloorPlan || !floorPlanFile}
                      className="rounded-none border border-[#d6ad2f]/55 bg-transparent px-4 py-5 font-text text-xs font-semibold uppercase tracking-[0.18em] text-[#d6ad2f] transition hover:bg-[#d6ad2f] hover:text-[#06130f]"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingFloorPlan ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                  <div className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-lg border border-[#d6ad2f]/15 bg-[#050706]">
                    {hasFloorPlan ? (
                      isFloorPlanPdf ? (
                        <div className="text-center">
                          <FileText className="mx-auto h-10 w-10 text-[#d6ad2f]" />
                          <p className="mt-2 text-sm font-medium text-[#f8f0df]">PDF floor plan attached</p>
                          <p className="text-xs text-[#f5f0e8]/45">It will open in an embedded viewer.</p>
                        </div>
                      ) : (
                        <img
                          src={cleanFloorPlanUrl}
                          alt="Floor plan preview"
                          className="h-full max-h-[220px] w-full object-contain p-3"
                        />
                      )
                    ) : (
                      <div className="px-6 text-center">
                        <FileText className="mx-auto h-9 w-9 text-[#d6ad2f]/35" />
                        <p className="mt-2 text-sm text-[#f5f0e8]/45">Paste a floor plan URL to preview it here.</p>
                      </div>
                    )}
                  </div>
                  {hasFloorPlan && (
                    <a
                      href={cleanFloorPlanUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 border border-[#d6ad2f]/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d6ad2f] transition hover:bg-[#d6ad2f] hover:text-[#06130f]"
                    >
                      <ExternalLink className="h-4 w-4" /> Preview / Open
                    </a>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#d6ad2f]/25 bg-[#06130f]">
                <div className="flex items-center justify-between gap-3 border-b border-[#d6ad2f]/15 bg-black/25 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-[#d6ad2f]/35 bg-[#d6ad2f]/10 text-[#d6ad2f]">
                      <Compass className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-[#f8f0df]">Pioneer Virtual Tour</h3>
                      <p className="text-xs text-[#f5f0e8]/50">Public Pioneer or Panoee URL</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${hasVirtualTour ? "bg-emerald-500/15 text-emerald-200" : "bg-[#050706] text-[#f5f0e8]/40"}`}>
                    {hasVirtualTour ? "Ready" : "Missing"}
                  </span>
                </div>
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="virtualTourUrl" className="text-[#f5f0e8]/75">
                      Pioneer Virtual Tour URL
                    </Label>
                    <Input
                      id="virtualTourUrl"
                      type="url"
                      value={virtualTourUrl}
                      onChange={(e) => setVirtualTourUrl(e.target.value)}
                      placeholder="https://panoee.live/example/post-1"
                      className={field}
                    />
                  </div>
                  <div className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-lg border border-[#d6ad2f]/15 bg-[radial-gradient(circle_at_center,#153b28_0%,#07110d_58%,#050706_100%)]">
                    <div className="px-6 text-center">
                      <Compass className={`mx-auto h-11 w-11 ${hasVirtualTour ? "text-[#d6ad2f]" : "text-[#d6ad2f]/35"}`} />
                      <p className="mt-3 text-sm font-medium text-[#f8f0df]">
                        {hasVirtualTour ? "360° tour link attached" : "No virtual tour link yet"}
                      </p>
                      <p className="mt-1 text-xs text-[#f5f0e8]/45">
                        {hasVirtualTour ? "The public page will load this URL in the tour viewer." : "Paste the exported Pioneer/Panoee URL after publishing."}
                      </p>
                    </div>
                  </div>
                  {hasVirtualTour && (
                    <a
                      href={cleanVirtualTourUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 border border-[#d6ad2f]/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d6ad2f] transition hover:bg-[#d6ad2f] hover:text-[#06130f]"
                    >
                      <ExternalLink className="h-4 w-4" /> Preview / Open
                    </a>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={handleSaveFeatureUrls}
              disabled={savingMedia || !property}
              className={primaryGoldButton}
            >
              <Save className="h-4 w-4 mr-2" />
              {savingMedia ? "Saving..." : "Save Media Links"}
            </Button>
          </CardContent>
        </Card>

        {/* Images Grid */}
        <Card className={adminPanel}>
          <CardHeader className="pb-0">
            <p className={sectionTitle}>Gallery Order</p>
            <CardTitle className="mt-2 font-title text-3xl font-normal text-[#f5f0e8]">
              Property Images ({images.length})
            </CardTitle>
            <p className="text-sm text-[#f5f0e8]/55">
              Drag and drop to reorder images
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-real-estate-secondary border-t-transparent" />
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="mx-auto mb-4 h-12 w-12 text-real-estate-secondary/55" />
                <p className="text-[#f5f0e8]/70">No images found</p>
                <p className="text-sm text-[#f5f0e8]/40">
                  Add your first image above
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={images.map((img) => img.imageId)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((image, i) => (
                      <SortableImage
                        key={`${image.imageId}-${i}`}
                        image={image}
                        onDelete={handleDeleteImage}
                        onUpscale={handleUpscaleImage}
                        upscaling={upscalingImageId === image.imageId}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageImages;
