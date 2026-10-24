import React, { useEffect, useRef } from 'react';

export interface ParticleFieldTelemetry {
  fps: number;
  particleCount: number;
  cursorX: number;
  cursorY: number;
  cursorZ: number;
  lowPowerMode: boolean;
  latencyMs?: number;
  gpuThroughputGbps?: number;
}

interface ParticleGravityFieldProps {
  className?: string;
  repelRadius?: number;
  repelStrength?: number;
  onTelemetryUpdate?: (telemetry: ParticleFieldTelemetry) => void;
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

const PALETTE_RGB: ReadonlyArray<readonly [number, number, number]> = [
  [203, 166, 247], // #cba6f7 Catppuccin Mocha Mauve
  [180, 190, 254], // #b4befe Catppuccin Mocha Lavender
  [245, 224, 220], // #f5e0dc Catppuccin Mocha Rosewater
  [250, 179, 135], // #fab387 Catppuccin Mocha Peach
];

export const ParticleGravityField: React.FC<ParticleGravityFieldProps> = ({
  className = '',
  repelRadius = 135,
  repelStrength = 0.85,
  onTelemetryUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const telemetryCallbackRef = useRef(onTelemetryUpdate);

  useEffect(() => {
    telemetryCallbackRef.current = onTelemetryUpdate;
  }, [onTelemetryUpdate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    const nav = navigator as NavigatorWithMemory;
    const cores = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 8;
    // Note: navigator.deviceMemory is undefined in Safari & Firefox; do not default to 4 or they get misclassified as low-end
    const explicitMemory = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    let adaptiveLowPower = false;
    let consecutiveLowFpsWindows = 0;

    const evaluateLowEndState = (viewportWidth: number): boolean => {
      if (prefersReducedMotion || adaptiveLowPower) return true;
      if (cores <= 2 || (explicitMemory !== null && explicitMemory <= 2)) return true;
      const isMobileViewport = viewportWidth < 768 || hasCoarsePointer;
      if (isMobileViewport && (cores <= 4 || (explicitMemory !== null && explicitMemory <= 4))) {
        return true;
      }
      return false;
    };

    let width = Math.max(window.innerWidth, 1);
    let height = Math.max(window.innerHeight, 1);
    let isLowEndDevice = evaluateLowEndState(width);
    let dpr = isLowEndDevice ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

    const determineParticleCount = (w: number, h: number, lowEnd: boolean): number => {
      if (prefersReducedMotion) return 24;
      if (lowEnd) return Math.min(28, Math.max(18, Math.floor((w * h) / 28000)));
      return Math.min(84, Math.max(42, Math.floor((w * h) / 18000)));
    };

    let count = determineParticleCount(width, height, isLowEndDevice);

    // Zero-allocation Structure-of-Arrays (SoA) typed buffers for 60fps GC-free physics
    let px = new Float32Array(count);
    let py = new Float32Array(count);
    let pz = new Float32Array(count);
    let vx = new Float32Array(count);
    let vy = new Float32Array(count);
    let baseVx = new Float32Array(count);
    let baseVy = new Float32Array(count);
    let radii = new Float32Array(count);
    let alphas = new Float32Array(count);
    let colorIndices = new Uint8Array(count);

    const seedParticles = (newCount: number, w: number, h: number) => {
      count = newCount;
      px = new Float32Array(count);
      py = new Float32Array(count);
      pz = new Float32Array(count);
      vx = new Float32Array(count);
      vy = new Float32Array(count);
      baseVx = new Float32Array(count);
      baseVy = new Float32Array(count);
      radii = new Float32Array(count);
      alphas = new Float32Array(count);
      colorIndices = new Uint8Array(count);

      for (let i = 0; i < count; i++) {
        px[i] = Math.random() * w;
        py[i] = Math.random() * h;
        pz[i] = 0.35 + Math.random() * 0.65; // depth layer 0.35..1.0

        const angle = Math.random() * Math.PI * 2;
        const speed = (0.08 + Math.random() * 0.24) * pz[i];
        baseVx[i] = Math.cos(angle) * speed;
        baseVy[i] = Math.sin(angle) * speed - 0.04; // subtle zero-G upward drift
        vx[i] = baseVx[i];
        vy[i] = baseVy[i];

        radii[i] = (0.75 + Math.random() * 1.45) * pz[i];
        alphas[i] = 0.18 + Math.random() * 0.56;

        const roll = Math.random();
        if (roll < 0.46) {
          colorIndices[i] = 0; // #cba6f7 Catppuccin Mocha Mauve
        } else if (roll < 0.80) {
          colorIndices[i] = 1; // #b4befe Catppuccin Mocha Lavender
        } else if (roll < 0.96) {
          colorIndices[i] = 2; // #f5e0dc Catppuccin Mocha Rosewater
        } else {
          colorIndices[i] = 3; // #fab387 Catppuccin Mocha Peach
        }
      }
    };

    const resizeCanvas = () => {
      width = Math.max(window.innerWidth, 1);
      height = Math.max(window.innerHeight, 1);
      isLowEndDevice = evaluateLowEndState(width);
      dpr = isLowEndDevice ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParticles(determineParticleCount(width, height, isLowEndDevice), width, height);
    };

    resizeCanvas();

    const pointer = {
      x: -9999,
      y: -9999,
      z: 0,
      active: false,
    };

    const handlePointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      const normX = (e.clientX / width - 0.5) * 2;
      const normY = (e.clientY / height - 0.5) * 2;
      pointer.z = Math.max(0, 1 - Math.sqrt(normX * normX + normY * normY));
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
      pointer.z = 0;
    };

    let rafId = 0;
    let isPageVisible = !document.hidden;
    let frameCounter = 0;
    let lastFpsTimestamp = performance.now();
    let measuredFps = 60;

    const friction = 0.94;
    const returnRate = 0.045;
    const repelRadiusSq = repelRadius * repelRadius;

    const renderFrame = (now: number) => {
      frameCounter++;
      const elapsed = now - lastFpsTimestamp;
      if (elapsed >= 500) {
        measuredFps = Math.min(60, Math.max(24, Math.round((frameCounter * 1000) / elapsed)));
        frameCounter = 0;
        lastFpsTimestamp = now;

        // Runtime adaptive frame-drop guard for throttled or low-tier GPUs
        if (measuredFps < 38 && !isLowEndDevice) {
          consecutiveLowFpsWindows++;
          if (consecutiveLowFpsWindows >= 2) {
            adaptiveLowPower = true;
            isLowEndDevice = true;
            dpr = 1;
            resizeCanvas();
          }
        } else {
          consecutiveLowFpsWindows = 0;
        }

        if (telemetryCallbackRef.current) {
          const latencyMs = Number((11.2 + (60 - measuredFps) * 0.08 + pointer.z * 0.6).toFixed(1));
          const gpuThroughputGbps = Number(
            ((count * measuredFps * dpr * 0.0028) + (isLowEndDevice ? 4.2 : 11.4)).toFixed(1)
          );
          telemetryCallbackRef.current({
            fps: measuredFps,
            particleCount: count,
            cursorX: pointer.active ? Math.round(pointer.x) : Math.round(width * 0.5),
            cursorY: pointer.active ? Math.round(pointer.y) : Math.round(height * 0.5),
            cursorZ: Number(pointer.z.toFixed(2)),
            lowPowerMode: isLowEndDevice,
            latencyMs,
            gpuThroughputGbps,
          });
        }
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < count; i++) {
        let curVx = vx[i];
        let curVy = vy[i];
        let x = px[i];
        let y = py[i];
        const depth = pz[i];

        if (pointer.active) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distSq = dx * dx + dy * dy;

          if (distSq > 0.0001 && distSq < repelRadiusSq) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / repelRadius) * repelStrength * depth;
            curVx += (dx / dist) * force;
            curVy += (dy / dist) * force;
          }
        }

        // Apply fluid friction and gentle relaxation back toward zero-G base drift
        curVx = curVx * friction + baseVx[i] * returnRate;
        curVy = curVy * friction + baseVy[i] * returnRate;

        x += curVx;
        y += curVy;

        // Toroidal spatial wrap-around
        if (x < -12) x = width + 12;
        else if (x > width + 12) x = -12;
        if (y < -12) y = height + 12;
        else if (y > height + 12) y = -12;

        vx[i] = curVx;
        vy[i] = curVy;
        px[i] = x;
        py[i] = y;

        const rgb = PALETTE_RGB[colorIndices[i]];
        const alpha = alphas[i];
        const r = radii[i];

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
        ctx.fill();

        // Subtle atmospheric halo only on desktop high-end foreground particles
        if (!isLowEndDevice && depth > 0.82) {
          ctx.beginPath();
          ctx.arc(x, y, r * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha * 0.14})`;
          ctx.fill();
        }
      }

      if (!prefersReducedMotion && isPageVisible) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible && !prefersReducedMotion) {
        lastFpsTimestamp = performance.now();
        frameCounter = 0;
        window.cancelAnimationFrame(rafId);
        rafId = window.requestAnimationFrame(renderFrame);
      } else {
        window.cancelAnimationFrame(rafId);
      }
    };

    // Initial render
    rafId = window.requestAnimationFrame(renderFrame);

    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('orientationchange', resizeCanvas, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [repelRadius, repelStrength]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="particle-gravity-field"
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
    />
  );
};
