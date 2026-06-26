import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, Compass, Eye, GripVertical, Plus, Save, Trash2, Upload } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { VirtualTourViewer } from "@/components/VirtualTourViewer";
import type { TourHotspot, TourRoom, VirtualTour } from "@/types/virtualTour";

const adminPage = "min-h-screen bg-[#050706] px-4 py-6 text-[#f5f0e8] md:px-8";
const adminPanel = "border border-real-estate-secondary/25 bg-[#08150f] text-[#f5f0e8] shadow-xl shadow-black/25";
const field = "border-real-estate-secondary/25 bg-[#050706] text-[#f5f0e8] placeholder:text-[#f5f0e8]/35";
const goldButton = "bg-real-estate-secondary text-real-estate-primary hover:bg-real-estate-secondary/90";
const outlineGoldButton = "border-real-estate-secondary/40 bg-transparent text-real-estate-secondary hover:bg-real-estate-secondary hover:text-real-estate-primary";

function SortableRoom({
  room,
  active,
  onSelect,
}: {
  room: TourRoom;
  active: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: room.roomId });
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onSelect}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex w-full items-center gap-3 border px-3 py-3 text-left ${
        active
          ? "border-real-estate-secondary bg-real-estate-secondary/10"
          : "border-real-estate-secondary/15 bg-[#050706]"
      }`}
    >
      <span {...attributes} {...listeners} className="cursor-grab text-real-estate-secondary">
        <GripVertical size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-text text-sm font-semibold text-[#f8f0df]">{room.label}</span>
        <span className="block text-xs text-[#f5f0e8]/45">{room.hotspots.length} hotspots</span>
      </span>
    </button>
  );
}

export default function ManageTour() {
  const { id } = useParams();
  const propertyId = Number(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tour, setTour] = useState<VirtualTour | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [activeHotspotId, setActiveHotspotId] = useState<number | null>(null);
  const [placingHotspot, setPlacingHotspot] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newRoomLabel, setNewRoomLabel] = useState("");
  const [newRoomFile, setNewRoomFile] = useState<File | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeRoom = useMemo(
    () => tour?.rooms.find((room) => room.roomId === activeRoomId) || tour?.rooms[0] || null,
    [activeRoomId, tour?.rooms],
  );
  const activeHotspot = activeRoom?.hotspots.find((hotspot) => hotspot.hotspotId === activeHotspotId) || null;

  const loadTour = async () => {
    const { data } = await axios.get(apiUrl(`/api/VirtualTour/GetByProperty/${propertyId}`));
    setTour(data);
    setActiveRoomId((current) => current || data.startRoomId || data.rooms?.[0]?.roomId || null);
  };

  useEffect(() => {
    if (!propertyId) return;
    loadTour().catch((error) => {
      console.error(error);
      toast({ title: "Error", description: "Failed to load virtual tour.", variant: "destructive" });
    });
  }, [propertyId]);

  const updateRoom = (roomId: number, patch: Partial<TourRoom>) => {
    setTour((current) => {
      if (!current) return current;
      return {
        ...current,
        rooms: current.rooms.map((room) => (room.roomId === roomId ? { ...room, ...patch } : room)),
      };
    });
  };

  const updateHotspot = (hotspotId: number, patch: Partial<TourHotspot>) => {
    if (!activeRoom) return;
    setTour((current) => {
      if (!current) return current;
      return {
        ...current,
        rooms: current.rooms.map((room) =>
          room.roomId === activeRoom.roomId
            ? {
                ...room,
                hotspots: room.hotspots.map((hotspot) =>
                  hotspot.hotspotId === hotspotId ? { ...hotspot, ...patch } : hotspot,
                ),
              }
            : room,
        ),
      };
    });
  };

  const uploadRoom = async () => {
    if (!newRoomFile) {
      toast({ title: "Missing panorama", description: "Choose a 360 panorama image first.", variant: "destructive" });
      return;
    }
    const body = new FormData();
    body.append("panorama", newRoomFile);
    body.append("label", newRoomLabel.trim() || newRoomFile.name.replace(/\.[^.]+$/, ""));

    try {
      setUploading(true);
      const { data } = await axios.post(apiUrl(`/api/VirtualTour/AddRoom/${propertyId}`), body);
      setTour(data);
      setActiveRoomId(data.rooms?.at(-1)?.roomId || data.startRoomId || null);
      setNewRoomLabel("");
      setNewRoomFile(null);
      toast({ title: "Room added", description: "Panorama room was uploaded." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to upload panorama.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const saveTour = async (forcedPublished?: boolean) => {
    const isPublished = forcedPublished ?? !!tour?.isPublished;
    if (!tour?.tourId) {
      const { data } = await axios.post(apiUrl(`/api/VirtualTour/CreateOrUpdate/${propertyId}`), {
        title: tour?.title || "Virtual Tour",
        startRoomId: tour?.startRoomId || activeRoom?.roomId || null,
        isPublished,
      });
      setTour(data);
      return;
    }

    try {
      setSaving(true);
      const { data } = await axios.put(apiUrl(`/api/VirtualTour/UpdateRooms/${tour.tourId}`), {
        title: tour.title || "Virtual Tour",
        startRoomId: tour.startRoomId || activeRoom?.roomId || null,
        isPublished,
        rooms: tour.rooms,
      });
      await Promise.all(
        data.rooms.map((room: TourRoom) =>
          axios.put(apiUrl(`/api/VirtualTour/UpdateHotspots/${room.roomId}`), {
            hotspots: tour.rooms.find((candidate) => candidate.roomId === room.roomId)?.hotspots || [],
          }),
        ),
      );
      await loadTour();
      toast({ title: "Saved", description: "Virtual tour changes were saved." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to save virtual tour.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!tour?.rooms?.length) {
      toast({ title: "No rooms", description: "Upload at least one panorama room before publishing.", variant: "destructive" });
      return;
    }
    const nextPublished = !tour.isPublished;
    setTour((current) => current ? { ...current, isPublished: nextPublished } : current);
    await saveTour(nextPublished);
  };

  const deleteRoom = async (roomId: number) => {
    if (!confirm("Delete this room and its hotspots?")) return;
    await axios.delete(apiUrl(`/api/VirtualTour/DeleteRoom/${roomId}`));
    await loadTour();
    setActiveRoomId(null);
    setActiveHotspotId(null);
  };

  const addHotspotAt = async ({ yaw, pitch }: { yaw: number; pitch: number }) => {
    if (!activeRoom || !tour) return;
    const target = tour.rooms.find((room) => room.roomId !== activeRoom.roomId);
    if (!target) {
      toast({ title: "Need another room", description: "Upload a second room before adding a hotspot.", variant: "destructive" });
      setPlacingHotspot(false);
      return;
    }
    const { data } = await axios.post(apiUrl(`/api/VirtualTour/AddHotspot/${activeRoom.roomId}`), {
      toRoomId: target.roomId,
      label: target.label,
      yaw,
      pitch,
    });
    setTour((current) => {
      if (!current) return current;
      return {
        ...current,
        rooms: current.rooms.map((room) =>
          room.roomId === activeRoom.roomId ? { ...room, hotspots: [...room.hotspots, {
            hotspotId: data.HotspotId,
            fromRoomId: data.FromRoomId,
            toRoomId: data.ToRoomId,
            label: data.Label || target.label,
            yaw: data.Yaw,
            pitch: data.Pitch,
            sortOrder: data.SortOrder || 0,
          }] } : room,
        ),
      };
    });
    setActiveHotspotId(data.HotspotId);
    setPlacingHotspot(false);
  };

  const deleteHotspot = async (hotspotId: number) => {
    await axios.delete(apiUrl(`/api/VirtualTour/DeleteHotspot/${hotspotId}`));
    if (!activeRoom) return;
    updateRoom(activeRoom.roomId, {
      hotspots: activeRoom.hotspots.filter((hotspot) => hotspot.hotspotId !== hotspotId),
    });
    setActiveHotspotId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!tour || !event.over || event.active.id === event.over.id) return;
    const oldIndex = tour.rooms.findIndex((room) => room.roomId === event.active.id);
    const newIndex = tour.rooms.findIndex((room) => room.roomId === event.over?.id);
    setTour({ ...tour, rooms: arrayMove(tour.rooms, oldIndex, newIndex).map((room, index) => ({ ...room, sortOrder: index })) });
  };

  return (
    <div className={adminPage}>
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className={adminPanel}>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-text text-xs uppercase tracking-[0.32em] text-real-estate-secondary">Virtual Tour Studio</p>
              <CardTitle className="mt-2 font-title text-4xl font-normal text-[#f5f0e8]">360 Panorama Builder</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className={outlineGoldButton} onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Dashboard
              </Button>
              <Button className={goldButton} onClick={saveTour} disabled={saving}>
                <Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                className={tour?.isPublished ? "bg-emerald-600 text-white hover:bg-emerald-700" : goldButton}
                onClick={togglePublish}
                disabled={saving || !tour?.rooms?.length}
              >
                <Eye className="mr-2 h-4 w-4" /> {tour?.isPublished ? "Published" : "Draft"}
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="space-y-6">
            <Card className={adminPanel}>
              <CardHeader>
                <CardTitle className="font-title text-2xl">Add Room</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label>Room label</Label>
                <Input className={field} value={newRoomLabel} onChange={(event) => setNewRoomLabel(event.target.value)} placeholder="Living room" />
                <Label>360 panorama</Label>
                <Input className={field} type="file" accept="image/*" onChange={(event) => setNewRoomFile(event.target.files?.[0] || null)} />
                <Button className={goldButton} onClick={uploadRoom} disabled={uploading}>
                  <Upload className="mr-2 h-4 w-4" /> {uploading ? "Uploading..." : "Upload Room"}
                </Button>
              </CardContent>
            </Card>

            <Card className={adminPanel}>
              <CardHeader>
                <CardTitle className="font-title text-2xl">Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={tour?.rooms.map((room) => room.roomId) || []} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {tour?.rooms.map((room) => (
                        <SortableRoom key={room.roomId} room={room} active={activeRoom?.roomId === room.roomId} onSelect={() => setActiveRoomId(room.roomId)} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>
          </div>

          <Card className={adminPanel}>
            <CardContent className="space-y-5 p-4 md:p-6">
              {activeRoom ? (
                <>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <Label>Room label</Label>
                      <Input className={field} value={activeRoom.label} onChange={(event) => updateRoom(activeRoom.roomId, { label: event.target.value })} />
                    </div>
                    <div>
                      <Label>Initial yaw</Label>
                      <Input className={field} type="number" step="0.01" value={activeRoom.initialYaw} onChange={(event) => updateRoom(activeRoom.roomId, { initialYaw: Number(event.target.value) })} />
                    </div>
                    <div>
                      <Label>Initial pitch</Label>
                      <Input className={field} type="number" step="0.01" value={activeRoom.initialPitch} onChange={(event) => updateRoom(activeRoom.roomId, { initialPitch: Number(event.target.value) })} />
                    </div>
                    <div>
                      <Label>Compass offset</Label>
                      <Input className={field} type="number" step="0.01" value={activeRoom.compassOffset} onChange={(event) => updateRoom(activeRoom.roomId, { compassOffset: Number(event.target.value) })} />
                    </div>
                    <Button className={outlineGoldButton} onClick={() => setTour((current) => current ? { ...current, startRoomId: activeRoom.roomId } : current)}>
                      <Compass className="mr-2 h-4 w-4" /> Set Start Room
                    </Button>
                    <Button className="border border-red-500/50 bg-red-950/40 text-red-200 hover:bg-red-700 hover:text-white" onClick={() => deleteRoom(activeRoom.roomId)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Room
                    </Button>
                  </div>

                  <div className="h-[560px]">
                    <VirtualTourViewer
                      room={activeRoom}
                      rooms={tour?.rooms || []}
                      editable
                      placementMode={placingHotspot}
                      activeHotspotId={activeHotspotId}
                      onHotspotClick={(hotspot) => setActiveHotspotId(hotspot.hotspotId)}
                      onPositionPick={addHotspotAt}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button className={placingHotspot ? "bg-emerald-600 text-white hover:bg-emerald-700" : goldButton} onClick={() => setPlacingHotspot((value) => !value)}>
                      <Plus className="mr-2 h-4 w-4" /> {placingHotspot ? "Click Panorama" : "Add Hotspot"}
                    </Button>
                    <Button className={outlineGoldButton} onClick={() => setPlacingHotspot(false)}>Preview Mode</Button>
                  </div>

                  {activeHotspot && (
                    <div className="grid gap-3 border border-real-estate-secondary/20 bg-[#050706] p-4 md:grid-cols-5">
                      <div>
                        <Label>Label</Label>
                        <Input className={field} value={activeHotspot.label} onChange={(event) => updateHotspot(activeHotspot.hotspotId, { label: event.target.value })} />
                      </div>
                      <div>
                        <Label>Target room</Label>
                        <select className={`${field} h-10 w-full rounded-md px-3`} value={activeHotspot.toRoomId} onChange={(event) => updateHotspot(activeHotspot.hotspotId, { toRoomId: Number(event.target.value) })}>
                          {tour?.rooms.filter((room) => room.roomId !== activeRoom.roomId).map((room) => (
                            <option key={room.roomId} value={room.roomId}>{room.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Yaw</Label>
                        <Input className={field} type="number" step="0.01" value={activeHotspot.yaw} onChange={(event) => updateHotspot(activeHotspot.hotspotId, { yaw: Number(event.target.value) })} />
                      </div>
                      <div>
                        <Label>Pitch</Label>
                        <Input className={field} type="number" step="0.01" value={activeHotspot.pitch} onChange={(event) => updateHotspot(activeHotspot.hotspotId, { pitch: Number(event.target.value) })} />
                      </div>
                      <Button className="self-end border border-red-500/50 bg-red-950/40 text-red-200 hover:bg-red-700 hover:text-white" onClick={() => deleteHotspot(activeHotspot.hotspotId)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="grid min-h-[560px] place-items-center text-center text-[#f5f0e8]/55">
                  Upload a panorama room to start building the tour.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
