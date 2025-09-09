
export enum DetectionStatus {
  Mask = 'Mask',
  NoMask = 'No Mask',
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceDetection {
  box: BoundingBox;
  status: DetectionStatus;
  confidence: number;
}
