import { useEffect, useMemo, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VirtualTourViewer } from "@/components/VirtualTourViewer";
import type { TourHotspot, VirtualTour } from "@/types/virtualTour";

type PublicVirtualTourProps = {
  tour: VirtualTour;
  propertyTitle: string;
};

export function PublicVirtualTour({ tour, propertyTitle }: PublicVirtualTourProps) {
  const startRoomId = tour.startRoomId || tour.rooms[0]?.roomId;
  const [activeRoomId, setActiveRoomId] = useState<number | null>(startRoomId || null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const activeRoom = useMemo(
    () => tour.rooms.find((room) => room.roomId === activeRoomId) || tour.rooms[0] || null,
    [activeRoomId, tour.rooms],
  );

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement?.id === "realo-media-frame");
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const goToHotspot = (hotspot: TourHotspot) => {
    setActiveRoomId(hotspot.toRoomId);
  };

  const toggleFullscreen = async () => {
    const frame = document.getElementById("realo-media-frame");
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await frame?.requestFullscreen();
  };

  return (
    <div id="realo-media-frame" className="relative overflow-hidden rounded-md bg-[#050706] shadow-xl">
      <div className="realo-tour-toolbar flex flex-col gap-3 border-b border-real-estate-secondary/20 bg-[#08150f] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-text text-xs uppercase tracking-[0.22em] text-real-estate-secondary">{tour.title || "Virtual Tour"}</p>
          <h3 className="font-title text-2xl text-[#f8f0df]">{activeRoom?.label || propertyTitle}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {tour.rooms.map((room) => (
            <button
              key={room.roomId}
              type="button"
              onClick={() => setActiveRoomId(room.roomId)}
              className={`rounded-sm px-3 py-2 font-text text-xs uppercase tracking-[0.14em] transition ${
                activeRoom?.roomId === room.roomId
                  ? "bg-real-estate-secondary text-real-estate-primary"
                  : "bg-[#050706] text-real-estate-secondary hover:bg-real-estate-primary"
              }`}
            >
              {room.label}
            </button>
          ))}
          <Button
            type="button"
            className="bg-real-estate-primary text-real-estate-secondary hover:bg-real-estate-primary/90"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="mr-2 h-4 w-4" /> : <Maximize2 className="mr-2 h-4 w-4" />}
            {isFullscreen ? "Dil" : "Ekran"}
          </Button>
        </div>
      </div>
      <div className="realo-tour-stage h-[430px] sm:h-[560px] lg:h-[720px]">
        <VirtualTourViewer room={activeRoom} rooms={tour.rooms} onHotspotClick={goToHotspot} />
      </div>
      <style>{`
        #realo-media-frame:fullscreen {
          width: 100vw;
          height: 100vh;
          border-radius: 0;
          background: #000;
        }
        #realo-media-frame:fullscreen .realo-tour-toolbar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 20;
          border-bottom-color: rgba(214, 173, 47, 0.2);
          background: rgba(5, 7, 6, 0.72);
          backdrop-filter: blur(10px);
        }
        #realo-media-frame:fullscreen .realo-tour-stage {
          height: 100vh !important;
        }
        #realo-media-frame:fullscreen .psv-container {
          height: 100% !important;
        }
      `}</style>
    </div>
  );
}
