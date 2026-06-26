import { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";
import type { TourHotspot, TourRoom } from "@/types/virtualTour";

type VirtualTourViewerProps = {
  room: TourRoom | null;
  rooms: TourRoom[];
  editable?: boolean;
  activeHotspotId?: number | null;
  placementMode?: boolean;
  onHotspotClick?: (hotspot: TourHotspot) => void;
  onPositionPick?: (position: { yaw: number; pitch: number }) => void;
};

const markerHtml = (active: boolean, label: string) => `
  <button class="realo-tour-marker ${active ? "realo-tour-marker-active" : ""}" type="button">
    <span>${label || "Go"}</span>
  </button>
`;

export function VirtualTourViewer({
  room,
  rooms,
  editable = false,
  activeHotspotId = null,
  placementMode = false,
  onHotspotClick,
  onPositionPick,
}: VirtualTourViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current || !room?.panoramaUrl) return;

    const markers = room.hotspots.map((hotspot) => {
      const target = rooms.find((candidate) => candidate.roomId === hotspot.toRoomId);
      return {
        id: String(hotspot.hotspotId),
        position: { yaw: hotspot.yaw + (room.compassOffset || 0), pitch: hotspot.pitch },
        html: markerHtml(activeHotspotId === hotspot.hotspotId, hotspot.label || target?.label || "Go"),
        anchor: "center center",
        data: hotspot,
      };
    });

    viewerRef.current?.destroy();
    const viewer = new Viewer({
      container: containerRef.current,
      panorama: room.panoramaUrl,
      defaultYaw: room.initialYaw + (room.compassOffset || 0),
      defaultPitch: room.initialPitch,
      navbar: editable ? ["zoom", "caption", "fullscreen"] : ["zoom", "caption", "fullscreen"],
      caption: room.label,
      plugins: [[MarkersPlugin, { markers }]],
    });

    const markersPlugin = viewer.getPlugin(MarkersPlugin) as any;
    markersPlugin?.addEventListener?.("select-marker", ({ marker }: any) => {
      const hotspot = marker?.config?.data;
      if (hotspot) onHotspotClick?.(hotspot);
    });

    viewer.addEventListener("click", ({ data }: any) => {
      if (!placementMode || !data) return;
      onPositionPick?.({
        yaw: Number((data.yaw - (room.compassOffset || 0)).toFixed(4)),
        pitch: Number(data.pitch.toFixed(4)),
      });
    });

    viewerRef.current = viewer;
    return () => {
      viewer.destroy();
      if (viewerRef.current === viewer) viewerRef.current = null;
    };
  }, [activeHotspotId, editable, onHotspotClick, onPositionPick, placementMode, room, rooms]);

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-md bg-black">
      <div ref={containerRef} className="h-full min-h-[420px] w-full" />
      <style>{`
        .realo-tour-marker {
          border: 1px solid rgba(214, 173, 47, 0.85);
          background: rgba(5, 7, 6, 0.78);
          color: #f6d56c;
          min-width: 42px;
          min-height: 42px;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
          cursor: pointer;
        }
        .realo-tour-marker-active {
          background: #d6ad2f;
          color: #08150f;
        }
      `}</style>
    </div>
  );
}
