var map = L.map('map').setView([8.926317, 124.158692], 13);
var currentMarker = null; // Store the currently displayed marker
let hourlyChart; // Store Chart.js instance

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

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

// Function to handle click on the map
function handleMapClick(e) {
    var lat = e.latlng.lat.toFixed(6);
    var lng = e.latlng.lng.toFixed(6);

    fetchWindWaveData(lat, lng);
}

// Toggle data container visibility when button is clicked
document.getElementById('windWaveBtn').addEventListener('click', function () {
    var container = document.querySelector('.data-container');
    container.style.display = (container.style.display === 'none' || container.style.display === '') ? 'block' : 'none';
});

// Add event listener for Exit button
document.getElementById('exitBtn').addEventListener('click', function () {
    document.querySelector('.data-container').style.display = 'none'; // Hide data container
});

// Fetch wind wave data from server
function fetchWindWaveData(lat, lng) {
    fetch('/get-stored-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateWindWaveData(data.current);
            // Update latitude and longitude in the container
            document.getElementById('latitude').innerText = lat;
            document.getElementById('longitude').innerText = lng;

            if (currentMarker) map.removeLayer(currentMarker);
            currentMarker = L.marker([lat, lng]).addTo(map)
                .bindPopup(`Latitude: ${lat}<br>Longitude: ${lng}`)
                .openPopup();

            // Plot hourly swell data
            const hourlyCtx = document.getElementById('hourlyWindWaveChart').getContext('2d');
            hourlyChart = createOrUpdateChart(
                hourlyChart,
                hourlyCtx,
                data.hourly.time,
                data.hourly.wind_wave_height,
                'Hourly Wind Wave Height'
            );
        } else {
            alert('No data found for this location.');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Update wind wave data in the table
function updateWindWaveData(data) {
    document.getElementById('windHeight').innerText = data.wind_wave_height || 'N/A';
    document.getElementById('windDirection').innerText = data.wind_wave_direction || 'N/A';
    document.getElementById('windPeriod').innerText = data.wind_wave_period || 'N/A';
}

// Event listener for map clicks
map.on('click', handleMapClick);

// Document ready for toggle chart button
document.addEventListener("DOMContentLoaded", function () {
    const toggleChartButton = document.getElementById('toggleChartButton');
    const chartContainer = document.getElementById('chartContainer');
    
    let chartVisible = false; // Keep track of chart visibility

    // Function to toggle chart visibility
    toggleChartButton.addEventListener('click', function () {
        chartVisible = !chartVisible;
        chartContainer.style.display = chartVisible ? 'block' : 'none';
        toggleChartButton.textContent = chartVisible ? 'Hide Wind Wave Data' : 'Show Wind Wave Data';
    });
    // Assuming your existing JavaScript is here...

// Create chart context
const hourlyCtx = document.getElementById('hourlyWindWaveChart').getContext('2d');
let hourlyChart = null; // Store Chart.js instance

// Function to create or update a chart
function createOrUpdateChart(ctx, labels, data, label) {
    if (hourlyChart) {
        hourlyChart.data.labels = labels;
        hourlyChart.data.datasets[0].data = data;
        hourlyChart.update();
    } else {
        hourlyChart = new Chart(ctx, {
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
}

// Document ready for toggle chart button
document.addEventListener("DOMContentLoaded", function () {
    const toggleChartButton = document.getElementById('toggleChartButton');
    const chartContainer = document.getElementById('chartContainer');
    
    let chartVisible = false; // Keep track of chart visibility

    // Hide chart container initially
    chartContainer.style.display = 'none';

    // Function to toggle chart visibility
    toggleChartButton.addEventListener('click', function () {
        chartVisible = !chartVisible;
        chartContainer.style.display = chartVisible ? 'block' : 'none';
        toggleChartButton.textContent = chartVisible ? 'Hide Wind Wave Data' : 'Show Wind Wave Data';
    });
});

});
