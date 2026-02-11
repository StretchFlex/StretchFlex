
        //const fileInput = document.getElementById('csvFile'); //going to change when pulling csv from backend

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
                    backgroundColor: 'rgba(0, 0, 255, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Blank Chart Waiting for Selection' }
                },
                scales: {
                    x: { title: { display: true, text: 'Time (s)' }, beginAtZero: true },
                    y: { title: { display: true, text: 'Stretch Distance (mm)' }, beginAtZero: true }
                }
            }
        });

        chartInstance = chartInstanceBlank;
        //end of initial blank chart addition
        
        // Function to parse CSV text into arrays
        function parseCSV(text) {
            const rows = text.trim().split("\n");
            const labels = [];
            const data = [];

            for (let i = 1; i < rows.length; i++) { // Skip header row
                const cols = rows[i].split(",");
                if (cols.length >= 2) {
                    labels.push(cols[0].trim());
                    const value = parseFloat(cols[1]);
                    data.push(isNaN(value) ? null : value);
                }
            }
            return { labels, data };
        }

        // Function to create/update chart and update statistics
        function renderChart(labels, data) {
            if (chartInstance) {
                chartInstance.destroy(); // Avoid duplicate charts
            }
            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'CSV Data',
                        data: data,
                        borderColor: 'blue',
                        backgroundColor: 'rgba(0, 0, 255, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Line Chart from CSV' }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
            //updateStats(data);
        }

/*

        // Call fetchAndRenderChart on page load or based on user action
        //fetchAndRenderChart(); // Uncomment to load chart on page load    

        // Button to manually trigger data fetch and chart rendering
        const loadChartButton = document.querySelector('.generateButton'); // Assuming there's a button with class 'generateButton'
        loadChartButton.addEventListener('click', fetchAndRenderChart);     

        //Function to fetch CSV from backend and render chart - replace URL with actual endpoint
        async function fetchAndRenderChart() {
            try {
                const response = await fetch('/api/get-chart-data'); // Example endpoint
                if (!response.ok) throw new Error('Network response was not ok');
                const csvText = await response.text();
                const { labels, data } = parseCSV(csvText);
                renderChart(labels, data);
            } catch (error) {
                console.error('Error fetching chart data:', error);
                alert('Failed to load chart data from server.');
            }
        }

        */
/*
        //Function to toggle stats display
        const statsToggle = document.getElementById('stats-toggle-box');
        const statsContainer = document.getElementById('stats-toggle-content');

        statsToggle.addEventListener('change', function() {
            if (this.checked) {
                statsContainer.style.display = 'block';
            } else {
                statsContainer.style.display = 'none';
            }
        }); 

     */   
        /*
        // Placeholder for stats calculation - replace with actual logic
        function calculateStats(data) {
            if (data.length === 0) return null;
            const sum = data.reduce((a, b) => a + b, 0);
            const mean = sum / data.length;
            const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
            const stdDev = Math.sqrt(variance);
            return { mean: mean.toFixed(2), stdDev: stdDev.toFixed(2) };
        }

        // Update stats display when chart is rendered
        function updateStats(data) {
            const stats = calculateStats(data);
            if (stats) {
                statsContainer.innerHTML = `<p><strong>Mean:</strong> ${stats.mean}</p><p><strong>Standard Deviation:</strong> ${stats.stdDev}</p>`;
            } else {
                statsContainer.innerHTML = "<p>No data available for statistics.</p>";
            }
        }
            */
/*
        // Button to clear chart and stats
        const clearChartButton = document.querySelector('.clearChartButton');
        clearChartButton.addEventListener('click', function() {
            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = chartInstanceBlank; // Reset to blank chart
            }
            statsContainer.innerHTML = '';
        }); 


        //Function to clear all statistics checkboxes   
        const clearStatsButton = document.querySelector('.clearAllStatsButton');
        clearStatsButton.addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('.stats-toggle-box input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = false);
            statsContainer.innerHTML = '';
        });

        //Function to check all statistics checkboxes
        const checkAllStatsButton = document.querySelector('.checkAllStatsButton');
        checkAllStatsButton.addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('.stats-toggle-box input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = true);
            updateStats(chartInstance.data.datasets[0].data); // Update stats display with current chart data
        });
*/
        

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