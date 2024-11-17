import "./style.css";

const minDistance = 4;

const initialize = (canvas: HTMLCanvasElement) => {
  const { innerWidth: width, innerHeight: height } = window;

  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d")!;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#000000";
  context.textAlign = "center";
  context.font = "bold 32px serif";
  context.fillText("Freehand Circle Challenge", width / 2, 64, width);
};

const mousePosition = (event: MouseEvent) => {
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  return [event.x - rect.x, event.y - rect.y];
};

const distance = ([x1, y1]: [number, number], [x2, y2]: [number, number]) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

const pathLength = (path: [number, number][]) => {
  let length = 0;
  for (let i = 0; i < path.length; i++) {
    length += distance(path[i], path[(i || path.length) - 1]);
  }
  return length;
};

const pathArea = (path: [number, number][]) => {
  let area = 0;
  for (let i = 0; i < path.length; i++) {
    const [x1, y1] = path[i];
    const [x2, y2] = path[(i || path.length) - 1];
    area += x1 * y2 - y1 * x2;
  }
  return Math.abs(area) / 2;
};

const pathCentroid = (path: [number, number][]) => {
  let cx = 0;
  let cy = 0;
  let total = 0;
  for (let i = 0; i < path.length; i++) {
    const [x1, y1] = path[i];
    const [x2, y2] = path[(i || path.length) - 1];
    const weight = distance([x1, y1], [x2, y2]);
    cx += (x1 + x2) * weight;
    cy += (y1 + y2) * weight;
    total += weight;
  }
  return [cx / (total * 2), cy / (total * 2)];
};

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
const context = canvas.getContext("2d")!;

const path: [number, number][] = [];
let mouseDown = false;

canvas.onpointerdown = (ev) => {
  if (!mouseDown) {
    const [x, y] = mousePosition(ev);

    path.length = 0;
    path.push([x, y]);

    initialize(canvas);

    context.lineWidth = 4;
    context.lineCap = "round";
    context.strokeStyle = "#0000ff";

    canvas.setPointerCapture(ev.pointerId);
    mouseDown = true;
  }
};

canvas.onpointermove = (ev) => {
  if (mouseDown) {
    const [x, y] = mousePosition(ev);
    if (distance([x, y], path[path.length - 1]) < minDistance) {
      return;
    }
    const [nx, ny] = path[path.length - 1];
    path.push([x, y]);

    context.beginPath();
    context.moveTo(nx, ny);
    context.lineTo(x, y);
    context.stroke();
  }
};

canvas.onpointerup = (ev) => {
  if (mouseDown) {
    if (path.length > 1) {
      const ratio = Math.pow(pathLength(path), 2) / (pathArea(path) * 4);
      const [cx, cy] = pathCentroid(path);

      context.fillStyle = "#000000";
      context.textAlign = "center";
      context.font = "bold 24px serif";
      context.fillText(`Pi = ${ratio.toFixed(6)}`, cx, cy);
    }

    canvas.releasePointerCapture(ev.pointerId);
    mouseDown = false;
  }
};

initialize(canvas);
