<<<<<<< HEAD
// Stores data for each dropdown row
const graphSelections = {
    graph1: null,
    graph2: null,
    graph3: null,
    graph4: null
};

        
        const ctx = document.getElementById('lineChart').getContext('2d');
        
        //Added to load blank chart initially
        let chartInstanceBlank = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'CSV Data',
                    data: [],
                    borderColor: 'blue',
                    borderWidth: 2,
                    //backgroundColor: 'rgba(0, 0, 255, 0.1)',
                    fill: false,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Blank Chart Waiting for Selection' }
                },
                scales: {
                    x: { title: { display: true, text: 'Time (s)' }, beginAtZero: true },
                    y: { title: { display: true, text: 'Stretch Distance (mm)' }, beginAtZero: true }
                }
            }
        });
=======
import { calculateKeyPoints, createPointAnnotations } from './calculations.js';
>>>>>>> e63644c8ba7a9a08825f84f77cbcf61274bb01f2

// ============================================================
// INTEGRATED MAIN JS WITH BUTTERWORTH FILTERING
// ============================================================

// Chart canvas
const ctx = document.getElementById('lineChart').getContext('2d');

// Colors for multiple datasets
const datasetColors = ['orange', 'red', 'green', 'purple'];

// ============================================================
// INITIAL BLANK CHART
// ============================================================
let chartInstance = new Chart(ctx, {
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
            x: { title: { display: true, text: 'Time (s)' }, beginAtZero: true },
            y: { title: { display: true, text: 'Stretch Distance (mm)' } , beginAtZero: true}
        }
    }
});

// ============================================================
// BUTTERWORTH FILTER COEFFICIENTS (2nd order, 1.0 Hz @ fs=6 Hz)
// ============================================================
const b = [
  0.1551,
  0.3101,
  0.1551
];

const a = [
  1.0000,
  -0.6202,
  0.2404
];

// ============================================================
// FORWARD IIR FILTER
// ============================================================
function applyIIRFilter(data, b, a) {
    const y = new Array(data.length).fill(0);

    for (let i = 0; i < data.length; i++) {
        y[i] = b[0] * data[i];

        for (let j = 1; j < b.length; j++) {
            if (i - j >= 0) y[i] += b[j] * data[i - j];
        }

<<<<<<< HEAD
        window.currentChartData = [];

//         // Listen for dropdown changes → load CSV → graph it
// document.querySelectorAll('.single-graph-select').forEach(select => {
//     select.addEventListener('change', async function () {
//         const filePath = this.value;

//         if (!filePath) return; // User selected "Select Graph"

//         try {
//             const response = await fetch(filePath);
//             if (!response.ok) throw new Error("Could not load CSV");

//             const csvText = await response.text();
//             const { labels, data } = parseCSV(csvText);

//             renderChart(labels, data);

//             if (typeof updateStatsTable === 'function') {
//                 updateStatsTable();
//             }

//         } catch (err) {
//             console.error("Error loading CSV:", err);
//             alert("Failed to load selected CSV file.");
//         }
//     });
// });

document.querySelectorAll('.single-graph-select').forEach(select => {
    select.addEventListener('change', async function () {
        const filePath = this.value;
        const key = this.name; // graph1, graph2, graph3, graph4

        if (!filePath) {
            graphSelections[key] = null;
            renderMultiChart();
            updateStatsTable();
            return;
=======
        for (let j = 1; j < a.length; j++) {
            if (i - j >= 0) y[i] -= a[j] * y[i - j];
>>>>>>> e63644c8ba7a9a08825f84f77cbcf61274bb01f2
        }
    }

    return y;
}

// ============================================================
// ZERO-PHASE FILTFILT
// ============================================================
function filtfilt(data, b, a) {
    const forward = applyIIRFilter(data, b, a);
    const reversed = [...forward].reverse();
    const backward = applyIIRFilter(reversed, b, a);
    return backward.reverse();
}

// ============================================================
// SPIKE REMOVAL 
// ============================================================
function removeSpikesSafe(data, window = 11, threshold = 6) {
    const half = Math.floor(window / 2);
    const cleaned = [...data];

    for (let i = 0; i < data.length; i++) {
        // Build a local window around the point
        const start = Math.max(0, i - half);
        const end = Math.min(data.length - 1, i + half);
        const segment = data.slice(start, end + 1);

        // Compute median of the window
        const sorted = [...segment].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];

        // Compute MAD (Median Absolute Deviation)
        const absDevs = segment.map(v => Math.abs(v - median));
        const sortedAbs = absDevs.sort((a, b) => a - b);
        const mad = sortedAbs[Math.floor(sortedAbs.length / 2)] || 1e-6;

        // Spike detection
        const deviation = Math.abs(data[i] - median);
        const isSpike = deviation > threshold * mad;

        // Replace only the spike — not the whole region
        cleaned[i] = isSpike ? median : data[i];
    }

    return cleaned;
}

// ============================================================
// PARSE CSV (time + distance)
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

        try {
            const response = await fetch(filePath);
            const csvText = await response.text();
            const { labels, data } = parseCSV(csvText);

            graphSelections[key] = { labels, data };

            renderMultiChart();
            updateStatsTable();

        } catch (err) {
            console.error("Error loading CSV:", err);
            alert("Failed to load selected CSV file.");
        }
    });
});
    
        // // Function to create/update chart and update statistics
        // function renderChart(labels, data) {
        //     if (chartInstance) {
        //         chartInstance.destroy(); // Avoid duplicate charts
        //     }
        //     window.currentChartData = Array.isArray(data) ? data : [];

        //     chartInstance = new Chart(ctx, {
        //         type: 'line',
        //         data: {
        //             labels: labels,
        //             datasets: [{
        //                 label: 'CSV Data',
        //                 data: data,
        //                 borderColor: 'blue',
        //                 //backgroundColor: 'rgba(0, 0, 255, 0.1)',
        //                 fill: false,
        //                 tension: 0.3
        //             }]
        //         },
        //         options: {
        //             responsive: true,
        //             plugins: {
        //                 legend: { position: 'bottom' },
        //                 title: { display: true, text: 'Line Chart from CSV' }
        //             },
        //             scales: {
        //                 y: { beginAtZero: true }
        //             }
        //         }
        //     });

        //     if (typeof updateStatsTable === 'function') {
        //         updateStatsTable();
        //     }
        // }

function renderMultiChart() {
    if (chartInstance) chartInstance.destroy();

    const datasets = [];
    let labels = [];

    const colors = ["blue", "red", "green", "purple"];

    Object.keys(graphSelections).forEach((key, index) => {
        const entry = graphSelections[key];
        if (entry) {
            if (labels.length === 0) labels = entry.labels;

            datasets.push({
                label: key,
                data: entry.data,
                borderColor: colors[index],
                fill: false,
                tension: 0.3
            });
        }
    });

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Multi‑Graph Display' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// ============================================================
// SIMPLE MOVING AVERAGE (for comparison)
// ============================================================
function movingAverage(data, window = 5) {
  const out = new Array(data.length);
  for (let i = 0; i < data.length; i++) {
    let sum = 0, count = 0;
    for (let j = -window; j <= window; j++) {
      const k = i + j;
      if (k >= 0 && k < data.length) {
        sum += data[k];
        count++;
      }
    }
    out[i] = sum / count;
  }
  return out;
}

// ============================================================
// LOAD CSV → CLEAN → FILTER
// ============================================================
async function loadAndFilterCSV(file) {
    const text = await file.text();
    const { time, distance } = parseCSV(text);

    const cleaned = removeSpikesSafe(distance);
    const filtered = movingAverage(cleaned, 5);

    return { time, raw: distance, cleaned, filtered };
}

// ============================================================
// ADD DATASET TO CHART (raw + cleaned + filtered)
// ============================================================
function addFilteredDatasetToChart(time, raw, cleaned, filtered, index) {
    const color = datasetColors[index % datasetColors.length];

    chartInstance.data.labels = time;

    chartInstance.data.datasets.push(
        {
            label: `Raw ${index + 1}`,
            data: raw,
            borderColor: color,
            borderWidth: 1,
            fill: false,
            tension: 0.3
        },
        {
            label: `Filtered ${index + 1}`,
            data: filtered,
            borderColor: "red",
            borderWidth: 2,
            fill: false,
            tension: 0.2
        }
    );

    chartInstance.update();
    
    if (typeof updateStatsTable === 'function') {
        updateStatsTable();
    }
}

// ============================================================
// MAIN MULTI-FILE LOADER (graphInput1–4)
// ============================================================
async function fetchAndRenderChart() {
    const fileInputs = [
        document.getElementById('graphInput1'),
        document.getElementById('graphInput2'),
        document.getElementById('graphInput3'),
        document.getElementById('graphInput4')
    ];

    chartInstance.data.labels = [];
    chartInstance.data.datasets = [];

    for (let i = 0; i < fileInputs.length; i++) {
        const input = fileInputs[i];
        if (input.files.length === 0) continue;

        const file = input.files[0];

        // Load + clean + filter
        const { time, raw, cleaned, filtered } = await loadAndFilterCSV(file);

        // Plot
        addFilteredDatasetToChart(time, raw, cleaned, filtered, i);

        // Key point detection
        const { pointA, pointB, pointC } = calculateKeyPoints(time, filtered);
        console.log("Key Points:", { pointA, pointB, pointC });

        // Add annotations
        const annotations = createPointAnnotations({ pointA, pointB, pointC });

        chartInstance.options.plugins.annotation.annotations = {
            ...chartInstance.options.plugins.annotation.annotations,
            ...annotations
        };

        chartInstance.update();
    }
}


// ============================================================
// BUTTON HANDLERS
// ============================================================
document.querySelector('.generateButton')
    .addEventListener('click', fetchAndRenderChart);

        const generateButton = document.querySelector('.generateButton'); 
        generateButton.addEventListener('click', function () {
            if (typeof fetchAndRenderChart === 'function') {
                fetchAndRenderChart();
            }
            if (typeof updateStatsTable === 'function') {
                updateStatsTable();
            }
        });


        // Recompute stats table on each graph selection change
        const graphInputs = document.querySelectorAll('.single-graph-select');
        graphInputs.forEach(input => {
            input.addEventListener('change', function () {
                if (typeof updateStatsTable === 'function') {
                    updateStatsTable();
                }
            });
        });

                // Button to clear chart and stats
        const clearChartButton = document.querySelector('.clearChartButton');
        clearChartButton.addEventListener('click', function() {
            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = chartInstanceBlank; // Reset to blank chart
            }
            window.currentChartData = [];
            if (typeof updateStatsTable === 'function') {
                updateStatsTable();
            }
        });

        // async function populateGraphSelects() {
        //     const selects = document.querySelectorAll('.single-graph-select');

        //     try {
        //         const response = await fetch('/csv-graphs/graphs.json');
        //         if (!response.ok) throw new Error('Failed to fetch graph list');
        //         const graphs = await response.json();
        //         if (!Array.isArray(graphs)) throw new Error('Unexpected graphs payload');
<<<<<<< HEAD

        //         selects.forEach(select => {
        //             // Clear existing options except the first
        //             while (select.options.length > 1) {
        //                 select.remove(1);
        //             }
        //             graphs.forEach(graph => {
        //                 const opt = document.createElement('option');
        //                 opt.value = graph;
        //                 opt.textContent = graph;
        //                 select.appendChild(opt);
        //             });
        //         });
        //     } catch (error) {
        //         console.error('Error loading graph list:', error);
        //         // Fallback
        //         selects.forEach(select => {
        //             while (select.options.length > 1) {
        //                 select.remove(1);
        //             }
        //             ['Curve Graph', 'Linear Graph'].forEach(graph => {
        //                 const opt = document.createElement('option');
        //                 opt.value = graph;
        //                 opt.textContent = graph;
        //                 select.appendChild(opt);
        //             });
        //         });
        //     }
        // }


    async function populateGraphSelects() {
    const selects = document.querySelectorAll('.single-graph-select');

    try {
        const response = await fetch("sampleGraphsJasTest/graphs.json");
        const files = await response.json();

        selects.forEach(select => {
            // Remove old options except the first
            while (select.options.length > 1) {
                select.remove(1);
            }
=======

        //         selects.forEach(select => {
        //             // Clear existing options except the first
        //             while (select.options.length > 1) {
        //                 select.remove(1);
        //             }
        //             graphs.forEach(graph => {
        //                 const opt = document.createElement('option');
        //                 opt.value = graph;
        //                 opt.textContent = graph;
        //                 select.appendChild(opt);
        //             });
        //         });
        //     } catch (error) {
        //         console.error('Error loading graph list:', error);
        //         // Fallback
        //         selects.forEach(select => {
        //             while (select.options.length > 1) {
        //                 select.remove(1);
        //             }
        //             ['Curve Graph', 'Linear Graph'].forEach(graph => {
        //                 const opt = document.createElement('option');
        //                 opt.value = graph;
        //                 opt.textContent = graph;
        //                 select.appendChild(opt);
        //             });
        //         });
        //     }
        // }

>>>>>>> e63644c8ba7a9a08825f84f77cbcf61274bb01f2

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

document.addEventListener("DOMContentLoaded", populateGraphSelects);
    
        // Call on DOMContentLoaded
        //document.addEventListener('DOMContentLoaded', populateGraphSelects); 
<<<<<<< HEAD
=======



//OLD STUFF BELOW - KEEP FOR REFERENCE
//         //const ctx = document.getElementById('lineChart').getContext('2d');
        
//         //Added to load blank chart initially
//         // let chartInstanceBlank = new Chart(ctx, {
//         //     type: 'line',
//         //     data: {
//         //         labels: [],
//         //         datasets: [{
//         //             label: 'CSV Data',
//         //             data: [],
//         //             borderColor: 'blue',
//         //             borderWidth: 2,
//         //             //backgroundColor: 'rgba(0, 0, 255, 0.1)',
//         //             fill: false,
//         //             tension: 0.3
//         //         }]
//         //     },
//         //     options: {
//         //         responsive: true,
//         //         plugins: {
//         //             legend: { position: 'bottom' },
//         //             title: { display: true, text: 'Blank Chart Waiting for Selection' }
//         //         },
//         //         scales: {
//         //             x: { title: { display: true, text: 'Time (s)' }, beginAtZero: true },
//         //             y: { title: { display: true, text: 'Stretch Distance (mm)' }, beginAtZero: true }
//         //         }
//         //     }
//         // });

//         //chartInstance = chartInstanceBlank;
//         //end of initial blank chart addition
        
//         // Function to parse CSV text into arrays
//         // function parseCSV(text) {
//         //     const rows = text.trim().split("\n");
//         //     const labels = [];
//         //     const data = [];

//         //     for (let i = 1; i < rows.length; i++) { // Skip header row
//         //         const cols = rows[i].split(",");
//         //         if (cols.length >= 2) {
//         //             labels.push(cols[0].trim());
//         //             const value = parseFloat(cols[1]);
//         //             data.push(isNaN(value) ? null : value);
//         //         }
//         //     }
//         //     return { labels, data };
//         // }

//         // window.currentChartData = [];

//         // Function to create/update chart and update statistics
//         // function renderChart(labels, data) {
//         //     if (chartInstance) {
//         //         chartInstance.destroy(); // Avoid duplicate charts
//         //     }
//         //     window.currentChartData = Array.isArray(data) ? data : [];

//         //     chartInstance = new Chart(ctx, {
//         //         type: 'line',
//         //         data: {
//         //             labels: labels,
//         //             datasets: [{
//         //                 label: 'CSV Data',
//         //                 data: data,
//         //                 borderColor: 'blue',
//         //                 //backgroundColor: 'rgba(0, 0, 255, 0.1)',
//         //                 fill: false,
//         //                 tension: 0.3
//         //             }]
//         //         },
//         //         options: {
//         //             responsive: true,
//         //             plugins: {
//         //                 legend: { position: 'bottom' },
//         //                 title: { display: true, text: 'Line Chart from CSV' }
//         //             },
//         //             scales: {
//         //                 y: { beginAtZero: true }
//         //             }
//         //         }
//         //     });

//         //     if (typeof updateStatsTable === 'function') {
//         //         updateStatsTable();
//         //     }
//         // }


//         // Call fetchAndRenderChart on page load or based on user action
//         //fetchAndRenderChart(); // Uncomment to load chart on page load    

//         // Button to manually trigger data fetch and chart rendering
//         const generateButton = document.querySelector('.generateButton'); 
//         generateButton.addEventListener('click', function () {
//             if (typeof fetchAndRenderChart === 'function') {
//                 fetchAndRenderChart();
//             }
//             if (typeof updateStatsTable === 'function') {
//                 updateStatsTable();
//             }
//         });

//         // Recompute stats table on each graph selection change
//         const graphInputs = document.querySelectorAll('.single-graph-select');
//         graphInputs.forEach(input => {
//             input.addEventListener('change', function () {
//                 if (typeof updateStatsTable === 'function') {
//                     updateStatsTable();
//                 }
//             });
//         });


//         /* Need to update this function to match backend API and pull the chart selected by user
//         //Function to fetch CSV from backend and render chart - replace URL with actual endpoint
//         async function fetchAndRenderChart() {
//             try {
//                 const response = await fetch('/api/get-chart-data'); // Example endpoint
//                 if (!response.ok) throw new Error('Network response was not ok');
//                 const csvText = await response.text();
//                 const { labels, data } = parseCSV(csvText);
//                 renderChart(labels, data);
//             } catch (error) {
//                 console.error('Error fetching chart data:', error);
//                 alert('Failed to load chart data from server.');
//             }
//         }
//   */

//         // Button to clear chart and stats
//         const clearChartButton = document.querySelector('.clearChartButton');
//         clearChartButton.addEventListener('click', function() {
//             if (chartInstance) {
//                 chartInstance.destroy();
//                 chartInstance = chartInstanceBlank; // Reset to blank chart
//             }
//             window.currentChartData = [];
//             if (typeof updateStatsTable === 'function') {
//                 updateStatsTable();
//             }
//         });

//         async function populateGraphSelects() {
//             const selects = document.querySelectorAll('.single-graph-select');

//             try {
//                 const response = await fetch('/csv-graphs/graphs.json');
//                 if (!response.ok) throw new Error('Failed to fetch graph list');
//                 const graphs = await response.json();
//                 if (!Array.isArray(graphs)) throw new Error('Unexpected graphs payload');

//                 selects.forEach(select => {
//                     // Clear existing options except the first
//                     while (select.options.length > 1) {
//                         select.remove(1);
//                     }
//                     graphs.forEach(graph => {
//                         const opt = document.createElement('option');
//                         opt.value = graph;
//                         opt.textContent = graph;
//                         select.appendChild(opt);
//                     });
//                 });
//             } catch (error) {
//                 console.error('Error loading graph list:', error);
//                 // Fallback
//                 selects.forEach(select => {
//                     while (select.options.length > 1) {
//                         select.remove(1);
//                     }
//                     ['Curve Graph', 'Linear Graph'].forEach(graph => {
//                         const opt = document.createElement('option');
//                         opt.value = graph;
//                         opt.textContent = graph;
//                         select.appendChild(opt);
//                     });
//                 });
//             }
//         }

//         // Call on DOMContentLoaded
//         document.addEventListener('DOMContentLoaded', populateGraphSelects); 
>>>>>>> e63644c8ba7a9a08825f84f77cbcf61274bb01f2
