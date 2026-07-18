/** Canvas chart utilities — browser-only (assumes Canvas 2D context). */

export interface ChartTheme {
  canvas: string;
  text: string;
  muted: string;
  border: string;
  gridLine: string;
  magColor: string;
  phaseColor: string;
}

export function resolveTheme(): ChartTheme {
  const get = (v: string, fallback: string) =>
    (typeof document !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue(v).trim() : '') || fallback;

  return {
    canvas: get('--mp-canvas', '#0f141c'),
    text: get('--mp-text', '#e8eef6'),
    muted: get('--mp-muted', '#a8b9cc'),
    border: get('--mp-border', 'rgba(255,255,255,0.08)'),
    gridLine: get('--mp-grid-line', 'rgba(168,185,204,0.028)'),
    magColor: '#ce445d',
    phaseColor: '#4a7bb8',
  };
}

export function setupHiDPI(canvas: HTMLCanvasElement, w: number, h: number): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

export function clearCanvas(ctx: CanvasRenderingContext2D, theme: ChartTheme, w: number, h: number): void {
  ctx.fillStyle = theme.canvas;
  ctx.fillRect(0, 0, w, h);
}

export function drawLogFreqGrid(
  ctx: CanvasRenderingContext2D,
  theme: ChartTheme,
  w: number, h: number,
  minF: number, maxF: number,
): void {
  const gridFreqs = [20, 30, 40, 50, 60, 80, 100, 200, 300, 400, 500, 600, 800, 1000, 2000, 3000, 4000, 5000, 6000, 8000, 10000, 15000, 20000];

  ctx.strokeStyle = theme.gridLine;
  ctx.lineWidth = 0.5;
  for (const f of gridFreqs) {
    if (f < minF || f > maxF) continue;
    const x = (Math.log(f / minF) / Math.log(maxF / minF)) * w;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // label major freqs
  ctx.fillStyle = theme.muted;
  ctx.font = '9px ui-monospace, monospace';
  for (const f of [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]) {
    if (f < minF || f > maxF) continue;
    const x = (Math.log(f / minF) / Math.log(maxF / minF)) * w;
    const label = f >= 1000 ? (f / 1000) + 'k' : String(f);
    ctx.fillText(label, x + 3, h - 4);
  }
}

export function drawDbGrid(
  ctx: CanvasRenderingContext2D,
  theme: ChartTheme,
  w: number, h: number,
  minDb: number, maxDb: number,
): void {
  const step = maxDb - minDb > 60 ? 12 : 6;
  for (let db = Math.ceil(minDb / step) * step; db <= maxDb; db += step) {
    const y = h - ((db - minDb) / (maxDb - minDb)) * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.strokeStyle = db === 0 ? theme.border : theme.gridLine;
    ctx.stroke();

    ctx.fillStyle = theme.muted;
    ctx.font = '9px ui-monospace, monospace';
    ctx.fillText(db + ' dB', 4, y - 3);
  }
}

export function drawPhaseGrid(
  ctx: CanvasRenderingContext2D,
  theme: ChartTheme,
  w: number, h: number,
): void {
  for (const ph of [-180, -135, -90, -45, 0, 45, 90, 135, 180]) {
    const y = h - ((ph + 180) / 360) * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.setLineDash(ph === 0 ? [] : [3, 4]);
    ctx.strokeStyle = ph === 0 ? theme.border : theme.gridLine;
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = theme.muted;
    ctx.font = '8px ui-monospace, monospace';
    ctx.fillText(ph + '°', w - 36, y - 2);
  }
}

export function drawFreqResponse(
  ctx: CanvasRenderingContext2D,
  freqData: number[],
  magData: number[],
  phaseData: number[],
  theme: ChartTheme,
  w: number, h: number,
  minF: number, maxF: number,
  minDb: number, maxDb: number,
  showPhase: boolean,
): void {
  clearCanvas(ctx, theme, w, h);
  drawLogFreqGrid(ctx, theme, w, h, minF, maxF);

  // Magnitude
  ctx.beginPath();
  ctx.strokeStyle = theme.magColor;
  ctx.lineWidth = 1.8;
  for (let i = 0; i < freqData.length; i++) {
    const x = (Math.log(freqData[i] / minF) / Math.log(maxF / minF)) * w;
    const y = h - ((magData[i] - minDb) / (maxDb - minDb)) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Phase
  if (showPhase && phaseData) {
    drawPhaseGrid(ctx, theme, w, h);
    ctx.beginPath();
    ctx.strokeStyle = theme.phaseColor;
    ctx.lineWidth = 1.2;
    for (let i = 0; i < freqData.length; i++) {
      const x = (Math.log(freqData[i] / minF) / Math.log(maxF / minF)) * w;
      const y = h - ((phaseData[i] + 180) / 360) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  color: string,
  width = 1,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  r: number,
  fill: string,
  stroke?: string,
  strokeWidth = 1,
): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  color: string,
  size = 10,
  align: CanvasTextAlign = 'left',
): void {
  ctx.fillStyle = color;
  ctx.font = `${size}px ui-monospace, SFMono-Regular, monospace`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}
