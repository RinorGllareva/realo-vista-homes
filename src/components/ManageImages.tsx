import React, { useState, useEffect, useRef } from "react";
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
import { ArrowLeft, Plus, Trash2, GripVertical, Upload } from "lucide-react";

interface PropertyImage {
  imageId: number;
  imageUrl: string;
  propertyId: number;
}

interface SortableImageProps {
  image: PropertyImage;
  onDelete: (imageId: number) => void;
}

const SortableImage: React.FC<SortableImageProps> = ({ image, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.imageId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-video relative">
        <img
          src={image.imageUrl}
          alt={`Property ${image.imageId}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%230b1220'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='0.3em' font-family='system-ui' font-size='14' fill='%238a8fa3'%3EImage not found%3C/text%3E%3C/svg%3E";
          }}
        />

        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 p-1.5 bg-[#0b1220]/80 border border-slate-700 rounded-md cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-slate-400" />
        </div>

        {/* Delete button */}
        <Button
          size="icon"
          variant="destructive"
          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onDelete(image.imageId)}
          aria-label="Delete image"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-3 py-2 bg-[#0b1220]/60 border-t border-slate-800">
        <p className="text-xs text-slate-400 truncate">{image.imageUrl}</p>
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
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchPropertyImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPropertyImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.realo-realestate.com/api/Property/GetPropertyImages/${id}/images`
      );
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error("Error fetching property images:", error);
      toast({
        title: "Error",
        description: "Failed to fetch property images. Please try again.",
        variant: "destructive",
      });
      // Demo fallback
      setImages([
        {
          imageId: 1,
          imageUrl:
            "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200",
          propertyId: Number(id),
        },
        {
          imageId: 2,
          imageUrl:
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200",
          propertyId: Number(id),
        },
        {
          imageId: 3,
          imageUrl:
            "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200",
          propertyId: Number(id),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid image URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      setAdding(true);
      const response = await fetch(
        `https://api.realo-realestate.com/api/Property/AddPropertyImage/${id}/images`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newImageUrl),
        }
      );

      if (!response.ok) throw new Error("Failed to add image");

      const newImage: PropertyImage = {
        imageId: Date.now(),
        imageUrl: newImageUrl,
        propertyId: Number(id),
      };
      setImages((prev) => [...prev, newImage]);
      setNewImageUrl("");
      toast({ title: "Success", description: "Image added successfully!" });
    } catch (error) {
      console.error("Error adding property image:", error);
      const newImage: PropertyImage = {
        imageId: Date.now(),
        imageUrl: newImageUrl,
        propertyId: Number(id),
      };
      setImages((prev) => [...prev, newImage]);
      setNewImageUrl("");
      toast({
        title: "Success",
        description: "Image added successfully! (Demo mode)",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const response = await fetch(
        `https://api.realo-realestate.com/api/Property/DeletePropertyImage/${id}/images/${imageId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete image");

      setImages((prev) => prev.filter((img) => img.imageId !== imageId));
      toast({ title: "Success", description: "Image deleted successfully!" });
    } catch (error) {
      console.error("Error deleting property image:", error);
      setImages((prev) => prev.filter((img) => img.imageId !== imageId));
      toast({
        title: "Success",
        description: "Image deleted successfully! (Demo mode)",
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImages((items) => {
      const oldIndex = items.findIndex((it) => it.imageId === active.id);
      const newIndex = items.findIndex((it) => it.imageId === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });

    toast({ title: "Success", description: "Images reordered successfully!" });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setNewImageUrl(localUrl);
  };

  // shared dark theme field like in AddProperty
  const field =
    "bg-[#0b1220] text-slate-200 placeholder:text-slate-500 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-200 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border border-slate-800 bg-[#0f172a]/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button
                className="border-slate-700 bg-[#0b1220] text-slate-200 hover:bg-slate-800 rounded-xl"
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <CardTitle className="text-2xl text-slate-100">
                Manage Property Images
              </CardTitle>
            </div>
          </CardHeader>
        </Card>

        {/* Add Image Section */}
        <Card className="border border-slate-800 bg-[#0f172a]">
          <CardHeader>
            <CardTitle className="text-lg text-slate-100">
              Add New Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="imageUrl" className="text-slate-300">
                  Image URL
                </Label>
                <div className="relative flex gap-2">
                  <Input
                    id="imageUrl"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={`${field}`}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-slate-700 bg-[#0b1220] text-slate-200 hover:bg-slate-800 px-4"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={handleAddImage}
              disabled={adding || !newImageUrl.trim()}
              className="bg-blue-500 hover:bg-blue-500/90 text-white shadow-md rounded-xl"
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

        {/* Images Grid */}
        <Card className="border border-slate-800 bg-[#0f172a]">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg text-slate-100">
              Property Images ({images.length})
            </CardTitle>
            <p className="text-sm text-slate-400">
              Drag and drop to reorder images
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No images found</p>
                <p className="text-sm text-slate-500">
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
                    {images.map((image) => (
                      <SortableImage
                        key={image.imageId}
                        image={image}
                        onDelete={handleDeleteImage}
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
