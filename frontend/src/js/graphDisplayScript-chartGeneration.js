
        //const fileInput = document.getElementById('csvFile'); //going to change when pulling csv from backend

        const ctx = document.getElementById('lineChart').getContext('2d');
        
        //Added to load blank chart initially
        let chartInstance = new Chart(ctx, {
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

        // Function to create/update chart
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
        }

        // Handle file upload
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;

            if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
                alert("Please upload a valid CSV file.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const csvText = e.target.result;
                const { labels, data } = parseCSV(csvText);
                if (labels.length === 0 || data.length === 0) {
                    alert("CSV file must have at least two columns: label, value.");
                    return;
                }
                renderChart(labels, data);
            };
            reader.onerror = function() {
                alert("Error reading file.");
            };
            reader.readAsText(file);
        });
