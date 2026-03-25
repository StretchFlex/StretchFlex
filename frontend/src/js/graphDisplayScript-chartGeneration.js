// ============================================================
// DROPDOWN‑ONLY MULTI‑GRAPH SYSTEM — RAW DATA ONLY
// ============================================================

import { calculateKeyPoints, createPointAnnotations } from './calculations.js';

// Stores data for each dropdown row
const graphSelections = {
    graph1: null,
    graph2: null,
    graph3: null,
    graph4: null
};

window.currentChartData = [];

// ============================================================
// CHART SETUP BLANK INITIALLY
// ============================================================
const ctx = document.getElementById('lineChart').getContext('2d');

function createBlankChart() {
    return new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Blank Chart Waiting for Selection' },
                annotation: { annotations: {} }
            },
            scales: {
                x: { title: { display: true, text: 'Time (s)' } },
                y: { title: { display: true, text: 'Stretch Distance (mm)' }, beginAtZero: true }
            }
        }
    });
}

let chartInstance = createBlankChart();

// ============================================================
// CSV PARSER
// ============================================================
function parseCSV(text) {
    const lines = text.trim().split("\n");
    const header = lines[0].split(",");
    const timeIndex = header.indexOf("time");
    const distIndex = header.indexOf("distance");

    const time = [];
    const distance = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        time.push(parseFloat(cols[timeIndex]));
        distance.push(parseFloat(cols[distIndex]));
    }

    return { time, distance };
}

// ============================================================
// RENDER MULTI‑CHART (RAW ONLY)
// ============================================================
function renderMultiChart() {
    if (chartInstance) chartInstance.destroy();

    const datasets = [];
    let labels = [];

    const colors = ["blue", "green", "purple", "orange"];

    Object.keys(graphSelections).forEach((key, index) => {
        const entry = graphSelections[key];
        if (!entry) return;

        const { time, raw } = entry;

        if (labels.length === 0) labels = time;

        datasets.push({
            label: `${key} Raw`,
            data: raw,
            borderColor: colors[index],
            borderWidth: 2,
            fill: false
        });
    });

    chartInstance = new Chart(ctx, {
        type: "line",
        data: { labels, datasets },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" },
                title: { display: true, text: "Multi‑Graph Display (Raw Only)" },
                annotation: { annotations: {} }
            }
        }
    });
}

// ============================================================
// DROPDOWN LISTENERS
// ============================================================
function setupDropdownListeners() {
    document.querySelectorAll(".single-graph-select").forEach(select => {
        select.addEventListener("change", async function () {
            const filePath = this.value;
            const key = this.name;

            if (!filePath) {
                graphSelections[key] = null;
                renderMultiChart();
                return;
            }

            try {
                const response = await fetch(filePath);
                const csvText = await response.text();
                const { time, distance } = parseCSV(csvText);

                graphSelections[key] = { time, raw: distance };

                renderMultiChart();

            } catch (err) {
                console.error("Error loading CSV:", err);
                alert("Failed to load selected CSV file.");
            }
        });
    });
}

// ============================================================
// REMOVE GRAPH BUTTONS
// ============================================================
function setupRemoveButtons() {
    document.querySelectorAll(".remove-graph-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.target;

            graphSelections[key] = null;

            const select = document.querySelector(`select[name="${key}"]`);
            if (select) select.value = "";

            const rowNum = key.replace("graph", "");
            const row = document.getElementById(`row-${rowNum}`);
            if (row) {
                row.querySelector(".stat-mean").textContent = "...";
                row.querySelector(".stat-std").textContent = "...";
                row.querySelector(".stat-min").textContent = "...";
                row.querySelector(".stat-max").textContent = "...";
            }

            renderMultiChart();
        });
    });
}

// ============================================================
// POPULATE DROPDOWNS
// ============================================================
async function populateGraphSelects() {
    const selects = document.querySelectorAll(".single-graph-select");

    try {
        const response = await fetch("sampleGraphsJasTest/graphs.json");
        const files = await response.json();

        selects.forEach(select => {
            while (select.options.length > 1) select.remove(1);

            files.forEach(file => {
                const opt = document.createElement("option");
                opt.value = `sampleGraphsJasTest/${file}`;
                opt.textContent = file;
                select.appendChild(opt);
            });
        });

    } catch (err) {
        console.error("Error loading CSV list:", err);
    }
}

// ============================================================
// INITIALIZE EVERYTHING
// ============================================================
setupDropdownListeners();
setupRemoveButtons();
populateGraphSelects();
