import { calculateKeyPoints } from "./calculations.js";

function computeAllMetrics(time, distance) {
    const { pointA, pointB, pointC } = calculateKeyPoints(time, distance);

    if (!pointA || !pointB || !pointC) {
        return null;
    }

    const stretchOvershoot = pointB.value - pointA.value;
    const reflexRelaxationPoint = pointB.time - pointA.time;
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
        
        
        // Placeholder for stats calculation - replace with actual logic
        function calculateStats(data) {
            if (!Array.isArray(data) || data.length === 0) return null;
            const cleaned = data.filter(x => typeof x === 'number' && !isNaN(x));
            if (cleaned.length === 0) return null;
            const sum = cleaned.reduce((a, b) => a + b, 0);
            const mean = sum / cleaned.length;
            const min = Math.min(...cleaned);
            const max = Math.max(...cleaned);
            const variance = cleaned.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / cleaned.length;
            const stdDev = Math.sqrt(variance);
            return {
                mean: mean.toFixed(2),
                stdDev: stdDev.toFixed(2),
                min: min.toFixed(2),
                max: max.toFixed(2)
            };
        }

function updateStatsForRow(rowNumber, time, distance) {
    const row = document.getElementById(`row-${rowNumber}`);
    if (!row) return;

    const cells = row.querySelectorAll("td");

    // If no data, clear row
    if (!time || !distance) {
        for (let i = 1; i < cells.length; i++) {
            cells[i].textContent = "...";
        }
        return;
    }

    const stats = computeAllMetrics(time, distance);

    if (!stats) {
        for (let i = 1; i < cells.length; i++) {
            cells[i].textContent = "...";
        }
        return;
    }

    cells[1].textContent = stats.stretchOvershoot;
    cells[2].textContent = stats.reflexRelaxationPoint;
    cells[3].textContent = stats.muscleRelaxationLimit;
    cells[4].textContent = stats.patientConfidence;
    cells[5].textContent = stats.muscleRelaxation;
    cells[6].textContent = stats.avgRelaxRate;
    cells[7].textContent = stats.extensibilityIndex;
}

//         function updateStatsTable() {
//             const graphInputs = [
//                 document.getElementById('graphInput1'),
//                 document.getElementById('graphInput2'),
//                 document.getElementById('graphInput3'),
//                 document.getElementById('graphInput4')
//             ];

//             graphInputs.forEach((input, idx) => {
//                 const value = input?.value?.trim();
//                 if (!value) {
//                     updateStatsForRow(idx + 1, null);
//                 } else {
//                     // placeholder for actual data retrieval per graph by name
//                     // If you have chart series per graph, replace this with that data.
//                     const selectedGraphName = input.value.trim();
// const dataset = window.loadedGraphs[selectedGraphName];

// if (!dataset) {
//     updateStatsForRow(idx + 1, null, null);
// } else {
//     updateStatsForRow(idx + 1, dataset.time, dataset.distance);
// }

//                 }
//             });
//         }

function updateStatsTable() {
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

