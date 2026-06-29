# Huong dan tao chuyen dong chuot giong Ghost Cursor

Tai lieu nay tom tat cach project `ghost-cursor` tao chuyen dong chuot giong nguoi va dua code mau doc lap de dung trong project khac.

Nguon chinh trong project nay:

- `src/spoof.ts`: ham `path`, `moveMouse`, `move`, `click`, `scroll`.
- `src/math.ts`: vector math, Bezier control points, overshoot, speed theo dao ham Bezier.

## Y tuong cot loi

Ghost Cursor khong di chuyen chuot theo duong thang. No tao mot duong cong Cubic Bezier tu diem hien tai den dich, lay nhieu diem tren duong cong, roi gui tung diem qua Chrome DevTools Protocol (`Input.dispatchMouseEvent`).

Chuyen dong nhin giong nguoi nho cac yeu to:

1. Duong di cong, khong thang.
2. Control points random nam gan duong noi start -> end, lech theo phuong vuong goc.
3. So buoc phu thuoc khoang cach va kich thuoc target theo Fitts' Law.
4. Toc do co random, khong hang so tuyet doi.
5. Neu dich qua xa, cursor co the vuot qua target mot chut (`overshoot`), roi sua lai ve target.
6. Diem click trong element la diem random ben trong box, khong luon giua.
7. Co delay truoc click, giua mouse down/up, sau move/click.

## Thuat toan path

Pipeline trong `src/spoof.ts:path`:

1. Lay `start` va `end`.
2. Tinh khoang cach `length = magnitude(end - start)`.
3. Chon `spread = clamp(length, 2, 200)` neu khong truyen `spreadOverride`.
4. Tao 2 anchor/control points bang `generateBezierAnchors`.
5. Tao Cubic Bezier: `start -> anchor1 -> anchor2 -> finish`.
6. Tinh so diem can lay.
7. `fitts(distance, targetWidth) = 2 * log2(distance / targetWidth + 1)`.
8. `steps = ceil((log2(fitts(length, width) + 1) + baseTime) * 3)`.
9. `baseTime = speed * 25`.
10. Lay LUT (`getLUT`) tren curve thanh mang point.
11. Clamp x/y ve `>= 0` de tranh toa do am.
12. Neu can timestamp, tinh timestamp dua tren toc do tuc thoi cua Cubic Bezier.

## Control points

Trong `src/math.ts`, `generateBezierAnchors(a, b, spread)` lam viec nhu sau:

1. Chon ngau nhien 1 phia cua duong di (`side = 1` hoac `-1`).
2. Moi anchor chon random 1 diem nam tren duong thang `a -> b`.
3. Lay vector vuong goc voi huong `a -> randMid`.
4. Dat do dai vector vuong goc bang `spread`.
5. Chon random 1 diem tren doan `randMid -> randMid + normal * side`.
6. Sap xep 2 anchor theo `x` tang dan.

Ket qua: curve khong qua ngoan ngoan nhu duong thang, nhung cung khong lech qua xa.

## Overshoot

Trong `src/spoof.ts:move`, neu khoang cach hien tai den dich lon hon `overshootThreshold` mac dinh `500`, Ghost Cursor:

1. Di toi 1 diem random quanh dich voi ban kinh `120` (`overshoot(destination, 120)`).
2. Sau do di ve target voi `spreadOverride = 10` de sua lai nhe hon.

Overshoot tao cam giac nguoi keo chuot nhanh qua muc roi can chinh lai.

## Target point trong element

`getRandomBoxPoint` chon diem random trong bounding box:

```ts
x = box.x + paddingWidth / 2 + Math.random() * (box.width - paddingWidth)
y = box.y + paddingHeight / 2 + Math.random() * (box.height - paddingHeight)
```

`paddingPercentage` lam vung random hep lai gan trung tam hon:

- `0`: bat ky diem nao trong element.
- `100`: gan nhu luon o trung tam.

## Delay va click

Click trong `src/spoof.ts:click`:

1. Neu co selector, move toi selector truoc.
2. Doi `hesitate` ms neu co.
3. Gui `mousePressed`.
4. Doi `waitForClick` ms neu co.
5. Gui `mouseReleased`.
6. Doi `moveDelay`, co the random tu `0` den `moveDelay` neu `randomizeMoveDelay=true`.

## Code mau doc lap TypeScript

Code duoi day khong can `bezier-js`. No tu tinh Cubic Bezier bang cong thuc co ban. Co the copy sang project khac.

```ts
type Vector = { x: number; y: number }
type Box = { x: number; y: number; width: number; height: number }
type TimedVector = Vector & { delay: number }

type PathOptions = {
  moveSpeed?: number
  spreadOverride?: number
  targetWidth?: number
  minSteps?: number
}

const add = (a: Vector, b: Vector): Vector => ({ x: a.x + b.x, y: a.y + b.y })
const sub = (a: Vector, b: Vector): Vector => ({ x: a.x - b.x, y: a.y - b.y })
const mul = (a: Vector, n: number): Vector => ({ x: a.x * n, y: a.y * n })
const div = (a: Vector, n: number): Vector => ({ x: a.x / n, y: a.y / n })
const magnitude = (a: Vector): number => Math.sqrt(a.x * a.x + a.y * a.y)
const direction = (a: Vector, b: Vector): Vector => sub(b, a)
const perpendicular = (a: Vector): Vector => ({ x: a.y, y: -a.x })
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))
const randomRange = (min: number, max: number): number => Math.random() * (max - min) + min

function unit(a: Vector): Vector {
  const len = magnitude(a)
  return len === 0 ? { x: 0, y: 0 } : div(a, len)
}

function setMagnitude(a: Vector, amount: number): Vector {
  return mul(unit(a), amount)
}

function randomVectorOnLine(a: Vector, b: Vector): Vector {
  return add(a, mul(direction(a, b), Math.random()))
}

function generateBezierAnchors(start: Vector, end: Vector, spread: number): [Vector, Vector] {
  const side = Math.round(Math.random()) === 1 ? 1 : -1

  const calc = (): Vector => {
    const randomMid = randomVectorOnLine(start, end)
    const normal = setMagnitude(perpendicular(direction(start, randomMid)), spread)
    const sidedNormal = mul(normal, side)
    return randomVectorOnLine(randomMid, add(randomMid, sidedNormal))
  }

  return [calc(), calc()].sort((a, b) => a.x - b.x) as [Vector, Vector]
}

function cubicBezier(p0: Vector, p1: Vector, p2: Vector, p3: Vector, t: number): Vector {
  const mt = 1 - t
  return {
    x: mt ** 3 * p0.x + 3 * mt ** 2 * t * p1.x + 3 * mt * t ** 2 * p2.x + t ** 3 * p3.x,
    y: mt ** 3 * p0.y + 3 * mt ** 2 * t * p1.y + 3 * mt * t ** 2 * p2.y + t ** 3 * p3.y
  }
}

function bezierSpeed(p0: Vector, p1: Vector, p2: Vector, p3: Vector, t: number): number {
  const mt = 1 - t
  const dx = 3 * mt ** 2 * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t ** 2 * (p3.x - p2.x)
  const dy = 3 * mt ** 2 * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t ** 2 * (p3.y - p2.y)
  return Math.sqrt(dx * dx + dy * dy)
}

function fitts(distance: number, width: number): number {
  return 2 * Math.log2(distance / width + 1)
}

function generateHumanPath(start: Vector, end: Vector, options: PathOptions = {}): Vector[] {
  const minSteps = options.minSteps ?? 25
  const targetWidth = options.targetWidth ?? 100
  const length = magnitude(direction(start, end))
  const spread = options.spreadOverride ?? clamp(length, 2, 200)
  const speedFactor = options.moveSpeed !== undefined && options.moveSpeed > 0
    ? 25 / options.moveSpeed
    : Math.random()

  const baseTime = speedFactor * minSteps
  const steps = Math.max(2, Math.ceil((Math.log2(fitts(length, targetWidth) + 1) + baseTime) * 3))
  const [p1, p2] = generateBezierAnchors(start, end, spread)

  const points: Vector[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const p = cubicBezier(start, p1, p2, end, t)
    points.push({ x: Math.max(0, p.x), y: Math.max(0, p.y) })
  }

  return points
}

function addTiming(points: Vector[], options: { moveSpeed?: number } = {}): TimedVector[] {
  const speed = options.moveSpeed ?? randomRange(0.5, 1)
  const timed: TimedVector[] = []

  for (let i = 0; i < points.length; i++) {
    if (i === 0) {
      timed.push({ ...points[i], delay: 0 })
      continue
    }

    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[Math.min(points.length - 1, i + 1)]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    const t = i / Math.max(1, points.length - 1)
    const localSpeed = Math.max(1, bezierSpeed(p0, p1, p2, p3, t))
    const distance = magnitude(direction(points[i - 1], points[i]))
    const delay = clamp(Math.round((distance / localSpeed) * 16 / speed), 1, 40)

    timed.push({ ...points[i], delay })
  }

  return timed
}

function randomPointInBox(box: Box, paddingPercentage = 0): Vector {
  const safePadding = clamp(paddingPercentage, 0, 100)
  const paddingWidth = (box.width * safePadding) / 100
  const paddingHeight = (box.height * safePadding) / 100

  return {
    x: box.x + paddingWidth / 2 + Math.random() * (box.width - paddingWidth),
    y: box.y + paddingHeight / 2 + Math.random() * (box.height - paddingHeight)
  }
}

function overshoot(target: Vector, radius = 120): Vector {
  const angle = Math.random() * Math.PI * 2
  const distance = radius * Math.sqrt(Math.random())
  return {
    x: target.x + distance * Math.cos(angle),
    y: target.y + distance * Math.sin(angle)
  }
}

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return
  await new Promise(resolve => setTimeout(resolve, ms))
}
```

## Vi du voi Puppeteer

Dung CDP giong Ghost Cursor de gui event that vao Chrome.

```ts
import puppeteer, { type Page } from 'puppeteer'

// Dat cac helper va type tu phan tren vao cung file, hoac import tu file rieng.

class HumanMouse {
  private location: Vector

  constructor(private readonly page: Page, start: Vector = { x: 0, y: 0 }) {
    this.location = start
  }

  async moveTo(destination: Vector, options: { moveSpeed?: number; spreadOverride?: number } = {}): Promise<void> {
    const points = generateHumanPath(this.location, destination, options)
    const timedPoints = addTiming(points, options)
    const client = await this.page.createCDPSession()

    for (const point of timedPoints) {
      await sleep(point.delay)
      await client.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: point.x,
        y: point.y
      })
      this.location = { x: point.x, y: point.y }
    }

    await client.detach()
  }

  async moveToBox(box: Box, options: { moveSpeed?: number; paddingPercentage?: number; overshootThreshold?: number } = {}): Promise<void> {
    const destination = randomPointInBox(box, options.paddingPercentage ?? 0)
    const distance = magnitude(direction(this.location, destination))
    const threshold = options.overshootThreshold ?? 500

    if (distance > threshold) {
      await this.moveTo(overshoot(destination, 120), { moveSpeed: options.moveSpeed })
      await this.moveTo(destination, { moveSpeed: options.moveSpeed, spreadOverride: 10 })
      return
    }

    await this.moveTo(destination, { moveSpeed: options.moveSpeed })
  }

  async click(options: { hesitate?: number; waitForClick?: number; button?: 'left' | 'right' | 'middle' } = {}): Promise<void> {
    const client = await this.page.createCDPSession()
    const button = options.button ?? 'left'

    await sleep(options.hesitate ?? randomRange(20, 120))
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: this.location.x,
      y: this.location.y,
      button,
      clickCount: 1
    })
    await sleep(options.waitForClick ?? randomRange(30, 140))
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: this.location.x,
      y: this.location.y,
      button,
      clickCount: 1
    })

    await client.detach()
  }

  async clickSelector(selector: string): Promise<void> {
    const element = await this.page.$(selector)
    if (!element) throw new Error(`Selector not found: ${selector}`)

    const box = await element.boundingBox()
    if (!box) throw new Error(`Element has no bounding box: ${selector}`)

    await this.moveToBox(box, { paddingPercentage: 20, moveSpeed: randomRange(0.8, 1.4) })
    await this.click()
    await sleep(randomRange(100, 600))
  }
}

async function main(): Promise<void> {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  await page.goto('https://example.com')

  const mouse = new HumanMouse(page, { x: 20, y: 20 })
  await mouse.clickSelector('a')

  await browser.close()
}

main().catch(console.error)
```

## Vi du khong Puppeteer

Neu project khac chi can danh sach toa do, dung:

```ts
const start = { x: 100, y: 200 }
const end = { x: 800, y: 450 }

const points = generateHumanPath(start, end, { moveSpeed: 1 })
const timedPoints = addTiming(points, { moveSpeed: 1 })

for (const point of timedPoints) {
  await sleep(point.delay)
  drawCursor(point.x, point.y) // thay bang API cua project ban
}
```

## Tham so nen chinh

- `moveSpeed`: so lon hon lam di nhanh hon trong code mau. Thu `0.8` den `1.5` cho tu nhien.
- `spreadOverride`: do cong cua path. De `undefined` de tu tinh theo khoang cach. Dung `10` cho doan sua sau overshoot.
- `overshootThreshold`: mac dinh `500`. Giam neu muon overshoot thuong xuyen hon.
- `paddingPercentage`: `0` click random ca element, `20-40` tu nhien hon voi button, `100` gan giua.
- `hesitate`: delay truoc click, thu `20-200ms`.
- `waitForClick`: thoi gian giu mouse down, thu `30-140ms`.

## Diem can luu y

- Path dep hon khi start location dung voi vi tri cursor that gan nhat.
- Dung timestamp/delay nho giua cac point, dung jump truc tiep den dich.
- Khong click luon trung tam moi element, de random trong bounding box.
- Voi target xa, overshoot + correction nhin tu nhien hon di thang toi dich.
- Nen scroll element vao viewport truoc khi lay bounding box va move.
- Neu can do on dinh cao, kiem tra sau khi move: cursor co nam trong bounding box khong. Neu element dich chuyen, tinh lai box va move lai.

## Cong thuc chinh

Cubic Bezier:

```txt
B(t) = (1-t)^3 P0 + 3(1-t)^2 t P1 + 3(1-t)t^2 P2 + t^3 P3
```

Dao ham dung de uoc luong toc do cuc bo:

```txt
B'(t) = 3(1-t)^2(P1-P0) + 6(1-t)t(P2-P1) + 3t^2(P3-P2)
speed = sqrt(dx^2 + dy^2)
```

Fitts' Law ban rut gon trong Ghost Cursor:

```txt
timeIndex = 2 * log2(distance / targetWidth + 1)
```

Dung no de tang so buoc khi target xa hoac target nho.
