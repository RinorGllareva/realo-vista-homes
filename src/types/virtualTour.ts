export type TourHotspot = {
  hotspotId: number;
  fromRoomId: number;
  toRoomId: number;
  label: string;
  yaw: number;
  pitch: number;
  sortOrder: number;
};

export type TourRoom = {
  roomId: number;
  tourId: number;
  label: string;
  panoramaUrl: string;
  panoramaWidth?: number | null;
  panoramaHeight?: number | null;
  sortOrder: number;
  initialYaw: number;
  initialPitch: number;
  compassOffset: number;
  hotspots: TourHotspot[];
};

export type VirtualTour = {
  tourId?: number;
  propertyId: number;
  title?: string;
  startRoomId?: number | null;
  isPublished: boolean;
  rooms: TourRoom[];
};
