// ------------------------------------------------------------
// Robust detection of Point A (local min), Point B (local max),
// and Point C (steady-state) using slope-based logic.
// ------------------------------------------------------------

// Compute slopes using central difference
export function computeSlopes(time, distance) {
    const slopes = new Array(distance.length).fill(0);

    for (let i = 1; i < distance.length - 1; i++) {
        const dy = distance[i + 1] - distance[i - 1];
        const dt = time[i + 1] - time[i - 1];
        slopes[i] = dy / dt;
    }

    slopes[0] = slopes[1];
    slopes[slopes.length - 1] = slopes[slopes.length - 2];

    return slopes;
}

// Helper: check if index is local minimum in ±window neighborhood
function isLocalMin(distance, i, window = 10) {
    const start = Math.max(0, i - window);
    const end = Math.min(distance.length - 1, i + window);
    const val = distance[i];

    for (let j = start; j <= end; j++) {
        if (distance[j] < val) return false;
    }
    return true;
}

// Helper: check if index is local maximum in ±window neighborhood
function isLocalMax(distance, i, window = 10) {
    const start = Math.max(0, i - window);
    const end = Math.min(distance.length - 1, i + window);
    const val = distance[i];

    for (let j = start; j <= end; j++) {
        if (distance[j] > val) return false;
    }
    return true;
}

// Point A: first robust local minimum
export function findPointA(
    time,
    distance,
    slopes,
    maxTimeSeconds = 60
) {
    for (let i = 1; i < slopes.length; i++) {
        if (time[i] > maxTimeSeconds) break;  // don’t look past 60 s

        if (slopes[i - 1] < 0 && slopes[i] >= 0) {
            // optional: keep or remove local-min check
            // if (isLocalMin(distance, i)) {
            //     return { index: i, time: time[i], value: distance[i] };
            // }
            return { index: i, time: time[i], value: distance[i] };
        }
    }

    return null;
}

// Point B: first robust local maximum AFTER Point A
export function findPointB(
    time,
    distance,
    slopes,
    indexA,
    maxTimeAfterA = 60   // search up to 60 s after A
) {
    if (indexA == null) return null;

    const start = indexA + 1;
    let end = slopes.length - 1;

    // optional: limit search window in time
    const maxTime = time[indexA] + maxTimeAfterA;
    for (let i = start; i < slopes.length; i++) {
        if (time[i] > maxTime) {
            end = i;
            break;
        }
    }

    // find global max distance between A and end
    let bestIdx = null;
    let bestVal = -Infinity;

    for (let i = start; i <= end; i++) {
        if (distance[i] > bestVal) {
            bestVal = distance[i];
            bestIdx = i;
        }
    }

    if (bestIdx == null) return null;

    return { index: bestIdx, time: time[bestIdx], value: distance[bestIdx] };
}

// Point C: steady-state after Point B
export function findPointC(
    time,
    distance,
    slopes,
    indexB,
    consecutiveSeconds = 5,   // only need 5 seconds of low slope
    sampleRate = 6,
    slopeThreshold = 0.01     // more realistic for noisy data
) {
    const needed = consecutiveSeconds * sampleRate;
    let count = 0;

    for (let i = indexB + 1; i < slopes.length; i++) {
        if (Math.abs(slopes[i]) < slopeThreshold) {
            count++;
            if (count >= needed) {
                const idx = i - Math.floor(needed / 2);
                return { index: idx, time: time[idx], value: distance[idx] };
            }
        } else {
            count = 0; // reset if slope rises again
        }
    }

    // fallback: last point
    const last = distance.length - 1;
    return { index: last, time: time[last], value: distance[last] };
}


// Main wrapper
export function calculateKeyPoints(time, distance) {
    const slopes = computeSlopes(time, distance);

    const pointA = findPointA(time, distance, slopes);
    const pointB = pointA ? findPointB(time, distance, slopes, pointA.index) : null;
    const pointC = pointB ? findPointC(time, distance, slopes, pointB.index) : null;

    return { pointA, pointB, pointC, slopes };
}

// Chart.js annotation helpers
export function createPointAnnotations(points) {
    const ann = {};

    for (const [label, p] of Object.entries(points)) {
        if (!p) continue;

        ann[label] = {
            type: 'point',
            xValue: p.time,
            yValue: p.value,
            backgroundColor: label === "pointA" ? "blue" :
                             label === "pointB" ? "orange" : "purple",
            radius: 6,
            borderWidth: 2,
            borderColor: "black",
            label: {
                display: true,
                content: `${label.toUpperCase()} (${p.time.toFixed(1)}s, ${p.value.toFixed(1)}mm)`,
                position: 'top'
            }
        };
    }

    return ann;
}
