// ============================================================
// DROPDOWN‑ONLY MULTI‑GRAPH SYSTEM WITH FILTERING
// ============================================================

import { calculateKeyPoints, createPointAnnotations } from 'js/calculations.js'; 

document.addEventListener("DOMContentLoaded", () => {

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
    // FILTERS
    // ============================================================
    const b = [0.1551, 0.3101, 0.1551];
    const a = [1.0000, -0.6202, 0.2404];

    function applyIIRFilter(data, b, a) {
        const y = new Array(data.length).fill(0);
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < b.length; j++) {
                if (i - j >= 0) y[i] += b[j] * data[i - j];
            }
            for (let j = 1; j < a.length; j++) {
                if (i - j >= 0) y[i] -= a[j] * y[i - j];
            }
        }
        return y;
    }

    function filtfilt(data, b, a) {
        const forward = applyIIRFilter(data, b, a);
        const reversed = [...forward].reverse();
        const backward = applyIIRFilter(reversed, b, a);
        return backward.reverse();
    }

    function removeSpikesSafe(data, window = 11, threshold = 6) {
        const half = Math.floor(window / 2);
        const cleaned = [...data];
        for (let i = 0; i < data.length; i++) {
            const start = Math.max(0, i - half);
            const end = Math.min(data.length - 1, i + half);
            const segment = data.slice(start, end + 1);
            const sorted = [...segment].sort((a, b) => a - b);
            const median = sorted[Math.floor(sorted.length / 2)];
            const absDevs = segment.map(v => Math.abs(v - median));
            const sortedAbs = absDevs.sort((a, b) => a - b);
            const mad = sortedAbs[Math.floor(sortedAbs.length / 2)] || 1e-6;
            const deviation = Math.abs(data[i] - median);
            cleaned[i] = deviation > threshold * mad ? median : data[i];
        }
        return cleaned;
    }

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
    // RENDER MULTI‑CHART
    // ============================================================
    function renderMultiChart() {
        if (chartInstance) chartInstance.destroy();

        const datasets = [];
        let labels = [];

        const colors = ["blue", "green", "purple", "orange"];

        Object.keys(graphSelections).forEach((key, index) => {
            const entry = graphSelections[key];
            if (!entry) return;

            const { time, raw, cleaned, filtered } = entry;

            if (labels.length === 0) labels = time;

            datasets.push(
                { label: `${key} Raw`, data: raw, borderColor: colors[index], borderWidth: 1, fill: false },
                { label: `${key} Cleaned`, data: cleaned, borderColor: "gray", borderDash: [5, 5], borderWidth: 1, fill: false },
                { label: `${key} Filtered`, data: filtered, borderColor: "red", borderWidth: 2, fill: false }
            );
        });

        chartInstance = new Chart(ctx, {
            type: "line",
            data: { labels, datasets },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom" },
                    title: { display: true, text: "Multi‑Graph Display" },
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

                    const cleaned = removeSpikesSafe(distance);
                    const filtered = filtfilt(cleaned, b, a);

                    graphSelections[key] = { time, raw: distance, cleaned, filtered };

                    renderMultiChart();

                } catch (err) {
                    console.error("Error loading CSV:", err);
                    alert("Failed to load selected CSV file.");
                }
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
    // CLEAR BUTTON
    // ============================================================
    const clearChartButton = document.querySelector(".clearChartButton");
    if (clearChartButton) {
        clearChartButton.addEventListener("click", function () {
            chartInstance.destroy();
            chartInstance = createBlankChart();
            Object.keys(graphSelections).forEach(k => graphSelections[k] = null);
        });
    }

    // ============================================================
    // INITIALIZE EVERYTHING
    // ============================================================
    setupDropdownListeners();
    populateGraphSelects();
});
