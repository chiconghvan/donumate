export type Point = { x: number; y: number };
export type Viewport = { width: number; height: number };
export type TargetBox = { x: number; y: number; width: number; height: number };
export type TargetPoint = Point & { viewport: Viewport; scrolled: boolean; box: TargetBox };
export type PathPoint = Point & { duration: number };

type PathOptions = {
  moveSpeed?: number;
  spreadOverride?: number;
  targetWidth?: number;
  minSteps?: number;
  maxSteps?: number;
  viewport?: Viewport;
};

export function generateHumanMousePath(start: Point, end: Point, options: PathOptions = {}): PathPoint[] {
  const distance = magnitude(direction(start, end));
  if (distance < 1) return [{ ...end, duration: randomInt(20, 45) }];

  const targetWidth = Math.max(1, options.targetWidth ?? 100);
  const minSteps = options.minSteps ?? 25;
  const maxSteps = options.maxSteps ?? 80;
  const spread = options.spreadOverride ?? clamp(distance, 2, 200);
  const speedFactor = options.moveSpeed !== undefined && options.moveSpeed > 0 ? 25 / options.moveSpeed : randomFloat(0.5, 1);
  const baseTime = speedFactor * minSteps;
  const steps = clamp(Math.ceil((Math.log2(fitts(distance, targetWidth) + 1) + baseTime) * 3), 2, maxSteps);
  const [p1, p2] = generateBezierAnchors(start, end, spread);
  const points: Point[] = [];

  for (let i = 0; i <= steps; i += 1) {
    const point = cubicBezier(start, p1, p2, end, i / steps);
    points.push(options.viewport ? clampPoint(point, options.viewport) : { x: Math.max(0, point.x), y: Math.max(0, point.y) });
  }

  return addTiming(points, options.moveSpeed);
}

export function randomPointInBox(box: TargetBox, viewport: Viewport, paddingPercentage = 30): Point {
  const safePadding = clamp(paddingPercentage, 0, 100);
  const paddingWidth = (box.width * safePadding) / 100;
  const paddingHeight = (box.height * safePadding) / 100;
  return clampPoint({
    x: box.x + paddingWidth / 2 + Math.random() * Math.max(0, box.width - paddingWidth),
    y: box.y + paddingHeight / 2 + Math.random() * Math.max(0, box.height - paddingHeight),
  }, viewport);
}

export function randomStartPoint(target: TargetPoint): Point {
  const nearTarget = Math.random() < 0.35;
  if (nearTarget) {
    return clampPoint({
      x: target.x + randomFloat(-180, 180),
      y: target.y + randomFloat(-140, 140),
    }, target.viewport);
  }
  return {
    x: randomFloat(target.viewport.width * 0.25, target.viewport.width * 0.75),
    y: randomFloat(target.viewport.height * 0.25, target.viewport.height * 0.75),
  };
}

export function overshootPoint(target: Point, viewport: Viewport, radius = 120): Point {
  const angle = Math.random() * Math.PI * 2;
  const distance = radius * Math.sqrt(Math.random());
  return clampPoint({
    x: target.x + distance * Math.cos(angle),
    y: target.y + distance * Math.sin(angle),
  }, viewport);
}

export function clampPoint(point: Point, viewport: Viewport): Point {
  return {
    x: Math.min(Math.max(point.x, 0), Math.max(0, viewport.width - 1)),
    y: Math.min(Math.max(point.y, 0), Math.max(0, viewport.height - 1)),
  };
}

export function randomFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomFloat(min, max + 1));
}

function addTiming(points: Point[], moveSpeed?: number): PathPoint[] {
  const speed = moveSpeed ?? randomFloat(0.5, 1);
  const timed: PathPoint[] = [];

  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    if (!point) continue;
    if (i === 0) {
      timed.push({ ...point, duration: 0 });
      continue;
    }

    const prev = points[i - 1] ?? point;
    const p0 = points[Math.max(0, i - 1)] ?? point;
    const p1 = point;
    const p2 = points[Math.min(points.length - 1, i + 1)] ?? point;
    const p3 = points[Math.min(points.length - 1, i + 2)] ?? point;
    const t = i / Math.max(1, points.length - 1);
    const localSpeed = Math.max(1, bezierSpeed(p0, p1, p2, p3, t));
    const stepDistance = magnitude(direction(prev, point));
    const duration = clamp(Math.round((stepDistance / localSpeed) * 10 / speed), 1, 30);
    timed.push({ ...point, duration });
  }

  return timed;
}

function generateBezierAnchors(start: Point, end: Point, spread: number): [Point, Point] {
  const side = Math.round(Math.random()) === 1 ? 1 : -1;
  const calc = (): Point => {
    const randomMid = randomVectorOnLine(start, end);
    const normal = setMagnitude(perpendicular(direction(start, randomMid)), spread);
    return randomVectorOnLine(randomMid, add(randomMid, mul(normal, side)));
  };

  return [calc(), calc()].sort((a, b) => a.x - b.x) as [Point, Point];
}

function cubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const mt = 1 - t;
  return {
    x: mt ** 3 * p0.x + 3 * mt ** 2 * t * p1.x + 3 * mt * t ** 2 * p2.x + t ** 3 * p3.x,
    y: mt ** 3 * p0.y + 3 * mt ** 2 * t * p1.y + 3 * mt * t ** 2 * p2.y + t ** 3 * p3.y,
  };
}

function bezierSpeed(p0: Point, p1: Point, p2: Point, p3: Point, t: number): number {
  const mt = 1 - t;
  const dx = 3 * mt ** 2 * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t ** 2 * (p3.x - p2.x);
  const dy = 3 * mt ** 2 * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t ** 2 * (p3.y - p2.y);
  return Math.sqrt(dx * dx + dy * dy);
}

function fitts(distance: number, width: number): number {
  return 2 * Math.log2(distance / width + 1);
}

function add(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

function sub(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

function mul(a: Point, value: number): Point {
  return { x: a.x * value, y: a.y * value };
}

function div(a: Point, value: number): Point {
  return { x: a.x / value, y: a.y / value };
}

function magnitude(a: Point): number {
  return Math.sqrt(a.x * a.x + a.y * a.y);
}

function direction(a: Point, b: Point): Point {
  return sub(b, a);
}

function perpendicular(a: Point): Point {
  return { x: a.y, y: -a.x };
}

function unit(a: Point): Point {
  const length = magnitude(a);
  return length === 0 ? { x: 0, y: 0 } : div(a, length);
}

function setMagnitude(a: Point, amount: number): Point {
  return mul(unit(a), amount);
}

function randomVectorOnLine(a: Point, b: Point): Point {
  return add(a, mul(direction(a, b), Math.random()));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
