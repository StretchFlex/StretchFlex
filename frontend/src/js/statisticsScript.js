
        // Placeholder for stats calculation - replace with actual logic
        function calculateStats(data) {
            if (data.length === 0) return null;
            const sum = data.reduce((a, b) => a + b, 0);
            const mean = sum / data.length;
            const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
            const stdDev = Math.sqrt(variance);
            return { mean: mean.toFixed(2), stdDev: stdDev.toFixed(2) };
        }

        // Update stats display when chart is rendered does statsContainer need to be changed to the actual id of the stats container in the html?
        const statsContainer = document.getElementById('stats-toggle-box-container'); // Make sure this ID matches the HTML element
        function updateStats(data) {
            const stats = calculateStats(data);
            if (stats) {
                statsContainer.innerHTML = `<p><strong>Mean:</strong> ${stats.mean}</p><p><strong>Standard Deviation:</strong> ${stats.stdDev}</p>`;
            } else {
                statsContainer.innerHTML = "<p>No data available for statistics.</p>";
            }
        }
    

    const selectAll = document.getElementById('selectAll');
    const deselectAllBtn = document.getElementById('deselectAll');
    const items = document.querySelectorAll('.item');

    // "Select All" toggles all
    selectAll.addEventListener('change', function () {
        items.forEach(item => item.checked = this.checked);
    });

    // "Deselect All" button
    deselectAllBtn.addEventListener('click', function () {
        items.forEach(item => item.checked = false);
        selectAll.checked = false;
    });

    // Update "Select All" based on individual items
    items.forEach(item => {
        item.addEventListener('change', function () {
            selectAll.checked = [...items].every(i => i.checked);
        });
    });      