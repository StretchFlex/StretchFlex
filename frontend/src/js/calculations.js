/**
 * detectABC - Identify points A, B, C from time (x) and distance (y)
 * @param {number[]} x - time vector (seconds)
 * @param {number[]} y - distance vector
 * @returns {{A:number[], B:number[], C:number[]}} - A, B, C as [time, distance]
 */

function detectABC(x, y) {
  // Ensure arrays are copies and have same length
  x = Array.from(x);
  y = Array.from(y);
  const n = x.length;
  if (n < 3) throw new Error('Need at least 3 samples');

  // Helpers
  const diff = arr => arr.slice(1).map((v, i) => v - arr[i]);
  const argMin = arr => arr.reduce((bestIdx, v, i, a) => v < a[bestIdx] ? i : bestIdx, 0);
  const argMax = arr => arr.reduce((bestIdx, v, i, a) => v > a[bestIdx] ? i : bestIdx, 0);
  const findFirstIndex = (arr, pred) => {
    for (let i = 0; i < arr.length; i++) if (pred(arr[i], i)) return i;
    return -1;
  };
  const findIndices = (arr, pred) => {
    const out = [];
    for (let i = 0; i < arr.length; i++) if (pred(arr[i], i)) out.push(i);
    return out;
  };

  // Compute slope between consecutive points (dy/dt)
  const dt = diff(x);
  const dy = diff(y);
  const slope = dy.map((d, i) => d / dt[i]); // length n-1
  const tSlope = dt.map((dti, i) => x[i] + dti / 2); // midpoints, length n-1

  // Helper: find index range within time limit from start
  const maxA_t = x[0] + 30; // A must be within 30 seconds from start

  // 1) Find Point A
  const tol = 1e-8;
  const signSlope = slope.map(s => {
    if (Math.abs(s) < tol) return 0;
    return Math.sign(s);
  });

  let A_idx = -1;
  for (let k = 0; k < signSlope.length - 1; k++) {
    const t_k = tSlope[k + 1];
    if (t_k <= maxA_t) {
      if (signSlope[k] <= 0 && signSlope[k + 1] > 0) {
        // candidate transition between slope sample k and k+1
        const trans_time = tSlope[k + 1];
        const withinMask = x.map(xi => xi <= trans_time);
        const indices = findIndices(withinMask, v => v);
        if (indices.length > 0) {
          const yWithin = indices.map(i => y[i]);
          const relMin = argMin(yWithin);
          A_idx = indices[relMin];
          break;
        }
      }
    } else {
      break;
    }
  }

  // Fallback: minima in distance before 30s
  if (A_idx === -1) {
    const withinMask = x.map(xi => xi <= maxA_t);
    const indices = findIndices(withinMask, v => v);
    if (indices.length > 0) {
      const yWithin = indices.map(i => y[i]);
      const relMin = argMin(yWithin);
      A_idx = indices[relMin];
    } else {
      A_idx = 0;
    }
  }

  const A = [x[A_idx], y[A_idx]];

  // 2) Find Point B
  const maxB_t = A[0] + 60;
  const startSlopeIdx = findFirstIndex(tSlope, t => t > A[0]);
  let B_idx = -1;
  if (startSlopeIdx !== -1) {
    for (let k = startSlopeIdx; k < signSlope.length - 1; k++) {
      if (tSlope[k + 1] <= maxB_t) {
        if (signSlope[k] >= 0 && signSlope[k + 1] < 0) {
          const trans_time = tSlope[k + 1];
          const rngMask = x.map(xi => xi >= A[0] && xi <= trans_time);
          const indices = findIndices(rngMask, v => v);
          if (indices.length > 0) {
            const yRange = indices.map(i => y[i]);
            const relMax = argMax(yRange);
            B_idx = indices[relMax];
            break;
          }
        }
      } else {
        break;
      }
    }
  }

  // Fallback: max distance between A and A+60s
  if (B_idx === -1) {
    const rngMask = x.map(xi => xi >= A[0] && xi <= maxB_t);
    const indices = findIndices(rngMask, v => v);
    if (indices.length > 0) {
      const yRange = indices.map(i => y[i]);
      const relMax = argMax(yRange);
      B_idx = indices[relMax];
    } else {
      B_idx = n - 1;
    }
  }

  const B = [x[B_idx], y[B_idx]];

  // 3) Find Point C
  // C is after B where slope trend tries to level out
  const slopeThresh = 0.06;
  const minDuration = 20; // seconds
  const minSamples = Math.max(1, Math.floor(minDuration * 6)); // 6 Hz assumption
  let C_idx = -1;

  const startCtime = B[0] + 10; // offset

  // slopes after B
  const maskAfterB = tSlope.map(t => t >= startCtime);
  const slopeAfterB = findIndices(maskAfterB, v => v).map(i => slope[i]);
  const tAfterB = findIndices(maskAfterB, v => v).map(i => tSlope[i]);

  // find where slope is near zero
  const lowSlope = slopeAfterB.map(s => Math.abs(s) < slopeThresh);

  // find first run of consecutive low-slope samples
  let runLength = 0;
  for (let i = 0; i < lowSlope.length; i++) {
    if (lowSlope[i]) {
      runLength += 1;
    } else {
      runLength = 0;
    }
    if (runLength >= minSamples) {
      const tC = tAfterB[i - runLength + 1];
      C_idx = findFirstIndex(x, xi => xi >= tC);
      if (C_idx === -1) C_idx = n - 1;
      break;
    }
  }

  // If not found, use rolling 10s windows in last 30s of data
  if (C_idx === -1) {
    const win10 = 10;
    const last30start = Math.max(x[n - 1] - 30, startCtime);
    const candidateTimes = x.filter(xi => xi >= last30start);
    let found = false;
    for (let ct of candidateTimes) {
      const t0 = ct;
      const t1 = t0 + win10;
      const inWin = tSlope.map(t => t >= t0 && t <= t1);
      const winIndices = findIndices(inWin, v => v);
      if (winIndices.length === 0) continue;
      const s = winIndices.map(i => {
        const sv = slope[i];
        if (Math.abs(sv) < tol) return 0;
        return Math.sign(sv);
      });
      const allNonNeg = s.every(si => si >= 0);
      const allNonPos = s.every(si => si <= 0);
      if (allNonNeg || allNonPos) {
        const idxX = findFirstIndex(x, xi => xi >= t0);
        C_idx = idxX === -1 ? n - 1 : idxX;
        found = true;
        break;
      }
    }
    if (!found) C_idx = n - 1;
  }

  const C = [x[C_idx], y[C_idx]];

  return { A, B, C };
}
