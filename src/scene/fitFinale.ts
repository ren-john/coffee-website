import { Box3, Vector3 } from 'three';

// Match the camera's slight downward angle and include the nearest surfaces,
// not just the objects' heights at their centers.
export function fitFinale(bounds: Box3, aspect: number, fov = 34) {
  const center = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const slope = .18;
  const cosine = 1 / Math.sqrt(1 + slope * slope), sine = slope * cosine;
  const tangent = Math.tan(fov * Math.PI / 360);
  const fill = .78;
  const vertical = size.y * cosine + size.z * sine;
  const depth = size.y * sine + size.z * cosine;
  const distanceAlongView = depth / 2 + Math.max(
    size.x / (2 * tangent * Math.max(aspect, .1) * fill),
    vertical / (2 * tangent * fill),
  );
  return { x: center.x, y: center.y, z: center.z, frameHeight: 2 * tangent * distanceAlongView * cosine };
}
