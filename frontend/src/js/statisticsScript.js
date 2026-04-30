// ============================================================
// STATISTICS + INTERACTION SCRIPT
// - Computes biomechanical metrics
// - Updates table rows
// - Handles missing A/B/C errors
// - Makes rows clickable to highlight A/B/C on chart
// ============================================================

import { calculateKeyPoints, createPointAnnotations } from "./calculations.js";
import { graphSelections, lineChart } from "./graphDisplayScript-chartGeneration.js";

// ------------------------------------------------------------
// Compute all biomechanical metrics from A/B/C
// ------------------------------------------------------------
function formatPointTimeDistance(point) {
    return `${point.time.toFixed(2)}s / ${point.value.toFixed(2)}mm`;
}

function computeAllMetrics(time, distance, slantConfig) {
    const { pointA, pointB, pointC } = calculateKeyPoints(time, distance);

    if (!pointA || !pointB || !pointC) {
        return null;
    }

    const slant = Number(slantConfig);
    const divisor = slant === 2 ? 30 : 15;

    const stretchOvershoot = formatPointTimeDistance(pointA);
    const reflexRelaxationPoint = formatPointTimeDistance(pointB);
    const muscleRelaxationLimit = formatPointTimeDistance(pointC);
    const patientConfidence = pointB.value - pointA.value;
    const muscleRelaxationTime = Math.abs(pointC.time - pointB.time);
    const muscleRelaxationDistance = Math.abs(pointB.value - pointC.value);
    const muscleRelaxation = `${muscleRelaxationTime.toFixed(2)}s / ${muscleRelaxationDistance.toFixed(2)}mm`;
    const avgRelaxRate = (pointB.value - pointC.value) / (pointC.time - pointB.time);
    const extensibilityIndex = (pointC.value - pointB.value) / -divisor;

    return {
        stretchOvershoot,
        reflexRelaxationPoint,
        muscleRelaxationLimit,
        patientConfidence: `${patientConfidence.toFixed(2)}mm`,
        muscleRelaxation,
        avgRelaxRate: avgRelaxRate.toFixed(2),
        extensibilityIndex: extensibilityIndex.toFixed(2)
    };
}


// ------------------------------------------------------------
// Update a single table row
// ------------------------------------------------------------
function updateStatsForRow(rowNumber, time, distance) {
    const row = document.getElementById(`row-${rowNumber}`);
    if (!row) return;

    const cells = row.querySelectorAll("td");

    // Reset error styling
    row.classList.remove("stats-error");

    // No data → clear row
    if (!time || !distance) {
        for (let i = 1; i < cells.length; i++) {
            cells[i].textContent = "...";
        }
        return;
    }

    const stats = computeAllMetrics(time, distance, graphSelections[`graph${rowNumber}`].angle);

    // Missing A/B/C → show error
    if (!stats) {
        row.classList.add("stats-error");

        cells[1].textContent = "A/B/C not found";
        for (let i = 2; i < cells.length; i++) {
            cells[i].textContent = "—";
        }
        return;
    }

    // Normal case
    cells[1].textContent = stats.stretchOvershoot;
    cells[2].textContent = stats.reflexRelaxationPoint;
    cells[3].textContent = stats.muscleRelaxationLimit;
    cells[4].textContent = stats.patientConfidence;
    cells[5].textContent = stats.muscleRelaxation;
    cells[6].textContent = stats.avgRelaxRate;
    cells[7].textContent = stats.extensibilityIndex;
}

// ------------------------------------------------------------
// Update all rows in the table
// ------------------------------------------------------------
export function updateStatsTable() {
    const rows = ["graph1", "graph2", "graph3", "graph4"];

    rows.forEach((key, index) => {
        const entry = graphSelections[key];

        if (!entry) {
            updateStatsForRow(index + 1, null, null);
        } else {
            updateStatsForRow(index + 1, entry.time, entry.raw);
        }
    });
}

