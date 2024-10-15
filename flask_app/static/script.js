var map = L.map('map').setView([7.077399, 125.712589], 13);
        var currentMarker = null; // Store the currently displayed marker

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(map);

        let hourlyChart; // Store Chart.js instance

        // Function to create or update a chart
        function createOrUpdateChart(chart, ctx, labels, data, label) {
            if (chart) {
                chart.data.labels = labels;
                chart.data.datasets[0].data = data;
                chart.update();
            } else {
                chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: label,
                            data: data,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            fill: false,
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: true }
                        }
                    }
                });
            }
            return chart;
        }

        // Add click event listener on the map
        map.on('click', function(e) {
            var lat = e.latlng.lat.toFixed(6);
            var lng = e.latlng.lng.toFixed(6);

            // Check if the current marker already exists
            if (currentMarker) {
                // Remove the existing marker
                map.removeLayer(currentMarker);
                currentMarker = null; // Reset the current marker
                // Reset table values and location info
                document.getElementById('windHeight').innerText = 'N/A';
                document.getElementById('windTimestamp').innerText = 'N/A';
                document.getElementById('windDirection').innerText = 'N/A';
                document.getElementById('windPeriod').innerText = 'N/A';
                document.getElementById('windPeakPeriod').innerText = 'N/A';
                document.getElementById('locationLat').innerText = 'N/A';
                document.getElementById('locationLng').innerText = 'N/A';
            } else {
                // Fetch stored swell data from the backend
                fetch('/get-stored-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ latitude: lat, longitude: lng })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Data received from server:', data);

                    if (data.success) {
                        // Update the location information
                        document.getElementById('locationLat').innerText = lat;
                        document.getElementById('locationLng').innerText = lng;

                        // Update the current swell data table
                        document.getElementById('windHeight').innerText = data.current.wind_wave_height + ' m';
                        document.getElementById('windTimestamp').innerText = data.current.time || 'N/A'; 
                        document.getElementById('windDirection').innerText = data.current.wind_wave_direction || 'N/A';
                        document.getElementById('windPeriod').innerText = data.current.wind_wave_period || 'N/A';
                        document.getElementById('windPeakPeriod').innerText = data.current.wind_wave_peak_period || 'N/A';



                        // Plot hourly swell data
                        const hourlyCtx = document.getElementById('hourlyWindWaveChart').getContext('2d');
                        hourlyChart = createOrUpdateChart(
                            hourlyChart,
                            hourlyCtx,
                            data.hourly.time,
                            data.hourly.wind_wave_height,
                            'Hourly Wind Wave Height'
                        );

                        // Add marker to the clicked location
                        currentMarker = L.marker([lat, lng]).addTo(map)
                            .bindPopup(`Latitude: ${lat}<br> Longitude: ${lng} `)
                            .openPopup();
                    } else {
                        alert('No data found for this location.');
                    }
                })
                .catch(error => console.error('Error:', error));
            }
            document.addEventListener("DOMContentLoaded", function () {
    const toggleChartButton = document.getElementById('toggleChartButton');
    const chartContainer = document.getElementById('chartContainer');
    
    let chartVisible = false; // Keep track of chart visibility

    // Function to toggle chart visibility
    toggleChartButton.addEventListener('click', function () {
        chartVisible = !chartVisible;
        if (chartVisible) {
            chartContainer.style.display = 'block';
            toggleChartButton.textContent = 'Hide Wind Wave Data';
        } else {
            chartContainer.style.display = 'none';
            toggleChartButton.textContent = 'Show Wind Wave Data';
        }
    });

    // Initialize Chart.js for hourly wind wave data
    const ctx = document.getElementById('hourlyWindWaveChart').getContext('2d');
    const hourlyWindWaveChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // You can add labels for timestamps here
            datasets: [{
                label: 'Wind Wave Height (m)',
                data: [], // Wind wave height data here
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Wind Wave Height (m)'
                    }
                }
            }
        }
    });

    // Function to update the chart data with new wind wave values and timestamps
    function updateChart(timestamps, waveHeights) {
        hourlyWindWaveChart.data.labels = timestamps;
        hourlyWindWaveChart.data.datasets[0].data = waveHeights;
        hourlyWindWaveChart.update();
    }

    // Example of how to call updateChart with sample data
    const sampleTimestamps = ['12:00', '13:00', '14:00', '15:00'];
    const sampleWaveHeights = [1.2, 1.5, 1.3, 1.8];
    updateChart(sampleTimestamps, sampleWaveHeights);
});

        });