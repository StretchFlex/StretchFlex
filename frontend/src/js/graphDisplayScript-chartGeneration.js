// ============================================================
// GRAPH DISPLAY + DATA LOADING + DROPDOWN SYSTEM
// - Loads CSVs
// - Stores graph selections
// - Updates chart
// - Triggers stats updates
// - Exports lineChart + graphSelections
// ============================================================

import { calculateKeyPoints, createPointAnnotations } from "./calculations.js";
import { updateStatsTable, setupRowClickHandlers } from "./statisticsScript.js";

// ------------------------------------------------------------
// Exported so statisticsScript.js can access selected graph data
// ------------------------------------------------------------
export const graphSelections = {
    graph1: null,
    graph2: null,
    graph3: null,
    graph4: null
};

// ------------------------------------------------------------
// Export chart instance so stats script can modify annotations
// ------------------------------------------------------------
export let lineChart = null;

// ============================================================
// CHART SETUP
// ============================================================
const ctx = document.getElementById("lineChart").getContext("2d");

function createBlankChart() {
    lineChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            animation: false,
            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                    onClick: function(event, legendItem, legend) {
                        const datasets = lineChart.data.datasets;
                        const lineIndex = datasets.findIndex(ds => ds.label === legendItem.text);
                        if (lineIndex !== -1) {
                            const lineMeta = lineChart.getDatasetMeta(lineIndex);
                            lineMeta.hidden = !lineMeta.hidden;
                            // Find and toggle scatter
                            const scatterLabel = `${legendItem.text} Points`;
                            const scatterIndex = datasets.findIndex(ds => ds.label === scatterLabel);
                            if (scatterIndex !== -1) {
                                const scatterMeta = lineChart.getDatasetMeta(scatterIndex);
                                scatterMeta.hidden = lineMeta.hidden;
                            }
                            lineChart.update();
                        }
                    }
                },
                annotation: { annotations: {} }
            },
            scales: {
                x: {
                    title: { display: true, text: "Time (s)" },
                    ticks: {
                        callback: (value) => Number(value).toFixed(2)   // ⬅️ 2 decimals
                    }
                },
                y: {
                    title: { display: true, text: "Distance (mm)" },
                    ticks: {
                        callback: (value) => Number(value).toFixed(2)   // ⬅️ 2 decimals
                    }
                }
            }
        }
    });
}


createBlankChart();

// ============================================================
// CSV LOADING
// ============================================================
async function loadCSV(url) {
    const response = await fetch(url);
    const text = await response.text();

    const lines = text.trim().split("\n");

    // Parse header row
    const headers = lines[0].split(",").map(h => h.trim());

    // Find column indices dynamically
    const timeIndex = headers.indexOf("Stop Watch time");
    const lhIndex = headers.indexOf("LH");

    if (timeIndex === -1 || lhIndex === -1) {
        console.error("CSV missing required columns: Stop Watch time or LH");
        return { time: [], raw: [] };
    }

    const time = [];
    const raw = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");

        const t = Number(cols[timeIndex]);
        const d = Number(cols[lhIndex]);

        if (!isNaN(t) && !isNaN(d)) {
            time.push(t);
            raw.push(d);
        }
    }

    return { time, raw };
}


// ============================================================
// UPDATE CHART WHEN ANY GRAPH CHANGES
// ============================================================
function refreshChart() {
    const lineDatasets = [];
    const scatterDatasets = [];

    Object.entries(graphSelections).forEach(([key, entry]) => {
        if (!entry) return;

        // Add the line dataset
        lineDatasets.push({
            label: key,
            data: entry.raw,
            borderColor: entry.color,
            borderWidth: 2,
            fill: false,
            pointRadius: 2  // Hide default points on the line
        });

        // Calculate points A, B, C
        const { pointA, pointB, pointC } = calculateKeyPoints(entry.time, entry.raw);

        // Add scatter dataset for points as circles
        if (pointA || pointB || pointC) {
            const pointData = [];
            if (pointA) pointData.push({ x: pointA.time, y: pointA.value });
            if (pointB) pointData.push({ x: pointB.time, y: pointB.value });
            if (pointC) pointData.push({ x: pointC.time, y: pointC.value });

            scatterDatasets.push({
                type: 'scatter',
                label: `${key} Points`,
                data: pointData,
                pointStyle: 'circle',
                pointRadius: 6,
                pointBackgroundColor: entry.color,
                pointBorderColor: 'black',
                pointBorderWidth: 2,
                showLine: false,
                legend: { display: false }
            });
        }
    });

    const datasets = [...lineDatasets, ...scatterDatasets];

    // FIX: use the first loaded graph for labels
    const firstLoaded = Object.values(graphSelections).find(g => g && g.time);
    lineChart.data.labels = firstLoaded ? firstLoaded.time : [];

    lineChart.data.datasets = datasets;
    lineChart.options.plugins.annotation.annotations = {}; // Clear annotations

    lineChart.update();
}


// ============================================================
// DROPDOWN HANDLING
// ============================================================
function setupDropdownListeners() {
    const dropdowns = document.querySelectorAll(".single-graph-select");

    dropdowns.forEach((select) => {
        select.addEventListener("change", async function () {
            const key = this.name;
            const file = this.value;

            if (!file) {
                graphSelections[key] = null;
                refreshChart();
                updateStatsTable();
                return;
            }

            // ⬇⬇⬇ THIS IS WHERE THE LINE GOES ⬇⬇⬇
            const dataset = await loadCSV(`sampleGraphsJasTest/${file}`);
            // ⬆⬆⬆ EXACTLY HERE ⬆⬆⬆

            graphSelections[key] = {
                ...dataset,
                color: pickColorForGraph(key)
            };

            refreshChart();
            updateStatsTable();
        });
    });
}


// ============================================================
// REMOVE BUTTONS
// ============================================================
function setupRemoveButtons() {
    const buttons = document.querySelectorAll(".clearGraphButton");

    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.target;
            graphSelections[key] = null;

            const select = document.querySelector(`select[name="${key}"]`);
            if (select) select.value = "";

            refreshChart();
            updateStatsTable();
        });
    });
}


// ============================================================
// COLOR ASSIGNMENT
// ============================================================
function pickColorForGraph(key) {
    const colors = {
        graph1: "#007bff",
        graph2: "#ff5733",
        graph3: "#28a745",
        graph4: "#8e44ad"
    };
    return colors[key] || "black";
}



async function populateGraphSelects() {
    try {
        const response = await fetch("sampleGraphsJasTest/graphs.json");
        const files = await response.json(); // <-- RAW ARRAY

        if (!Array.isArray(files)) {
            console.error("graphs.json is not an array");
            return;
        }

        const selects = document.querySelectorAll(".single-graph-select");

        selects.forEach((select) => {
            files.forEach((file) => {
                const opt = document.createElement("option");
                opt.value = file;
                opt.textContent = file;
                select.appendChild(opt);
            });
        });

    } catch (err) {
        console.error("Error loading graphs.json:", err);
    }
}


// ============================================================
// INITIALIZE EVERYTHING
// ============================================================
setupDropdownListeners();
setupRemoveButtons();
populateGraphSelects();
setupRowClickHandlers(); // NEW: makes rows clickable