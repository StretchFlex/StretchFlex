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


        // Call fetchAndRenderChart on page load or based on user action
        //fetchAndRenderChart(); // Uncomment to load chart on page load    

        // Button to manually trigger data fetch and chart rendering
        const generateButton = document.querySelector('.generateButton'); // Assuming there's a button with class 'generateButton'
        generateButton.addEventListener('click', fetchAndRenderChart);     

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
  

        // Button to clear chart and stats
        const clearChartButton = document.querySelector('.clearChartButton');
        clearChartButton.addEventListener('click', function() {
            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = chartInstanceBlank; // Reset to blank chart
            }
            statsContainer.innerHTML = '';
        }); 
