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

        function updateStatsForRow(rowNumber, data) {
            const row = document.getElementById(`row-${rowNumber}`);
            if (!row) return;
            const statCells = {
                mean: row.querySelector('.stat-mean'),
                std: row.querySelector('.stat-std'),
                min: row.querySelector('.stat-min'),
                max: row.querySelector('.stat-max')
            };
            if (!data || !data.length) {
                Object.values(statCells).forEach(cell => cell.textContent = '...');
                return;
            }
            const stats = calculateStats(data);
            if (!stats) {
                Object.values(statCells).forEach(cell => cell.textContent = '...');
                return;
            }
            statCells.mean.textContent = stats.mean;
            statCells.std.textContent = stats.stdDev;
            statCells.min.textContent = stats.min;
            statCells.max.textContent = stats.max;
        }

        function updateStatsTable() {
            const graphInputs = [
                document.getElementById('graphInput1'),
                document.getElementById('graphInput2'),
                document.getElementById('graphInput3'),
                document.getElementById('graphInput4')
            ];

            graphInputs.forEach((input, idx) => {
                const value = input?.value?.trim();
                if (!value) {
                    updateStatsForRow(idx + 1, null);
                } else {
                    // placeholder for actual data retrieval per graph by name
                    // If you have chart series per graph, replace this with that data.
                    const chartSourceData = window.currentChartData || [12, 15, 8, 20, 18];
                    updateStatsForRow(idx + 1, chartSourceData);
                }
            });
        }

    const selectAll = document.getElementById('selectAll');
    const deselectAll = document.getElementById('deselectAll');
    const items = document.querySelectorAll('.item');

    // "Select All" toggles all
    selectAll.addEventListener('click', function () {
        items.forEach(item => item.checked = true);
    });

    // "Deselect All" button
    deselectAll.addEventListener('click', function () {
        items.forEach(item => item.checked = false);
    });

    /*// Update "Select All" based on individual items
    items.forEach(item => {
        item.addEventListener('change', function () {
            selectAll.checked = [...items].every(i => i.checked);
        });
    }); 
    */     