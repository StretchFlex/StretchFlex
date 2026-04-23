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
function computeAllMetrics(time, distance) {
    const { pointA, pointB, pointC } = calculateKeyPoints(time, distance);

    if (!pointA || !pointB || !pointC) {
        return null;
    }

    const stretchOvershoot = pointA.value;
    const reflexRelaxationPoint = pointB.value;
    const muscleRelaxationLimit = pointC.value;
    const patientConfidence = pointC.time - pointB.time;
    const muscleRelaxation = pointB.value - pointC.value;
    const avgRelaxRate = muscleRelaxation / (pointC.time - pointB.time);
    const extensibilityIndex = pointC.value - pointA.value;

    return {
        stretchOvershoot: stretchOvershoot.toFixed(2),
        reflexRelaxationPoint: reflexRelaxationPoint.toFixed(2),
        muscleRelaxationLimit: muscleRelaxationLimit.toFixed(2),
        patientConfidence: patientConfidence.toFixed(2),
        muscleRelaxation: muscleRelaxation.toFixed(2),
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

    const stats = computeAllMetrics(time, distance);

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

// ------------------------------------------------------------
// Highlight A/B/C on the chart when a row is clicked
// ------------------------------------------------------------
function highlightABCOnChart(time, distance) {
    const { pointA, pointB, pointC } = calculateKeyPoints(time, distance);

    if (!pointA || !pointB || !pointC) {
        console.warn("Cannot highlight ABC — missing points");
        return;
    }

    const annotations = createPointAnnotations({ pointA, pointB, pointC });

    // Add pulse effect
    for (const key of Object.keys(annotations)) {
        annotations[key].radius = 10;
        annotations[key].backgroundColor += "AA"; // add transparency
    }

    lineChart.options.plugins.annotation.annotations = {
        ...lineChart.options.plugins.annotation.annotations,
        ...annotations
    };

    lineChart.update();
}

// ------------------------------------------------------------
// Make each row clickable
// ------------------------------------------------------------
export function setupRowClickHandlers() {
    for (let i = 1; i <= 4; i++) {
        const row = document.getElementById(`row-${i}`);
        if (!row) continue;

        row.addEventListener("click", () => {
            const key = `graph${i}`;
            const entry = graphSelections[key];

            if (!entry) return;

            highlightABCOnChart(entry.time, entry.raw);
        });
    }
}
