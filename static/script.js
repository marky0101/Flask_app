var map = L.map('map').setView([8.926317, 124.158692], 7); // Adjusted zoom level
var currentMarker = null; // Store the currently displayed marker
let hourlyChart; // Store Chart.js instance for wind wave height
let directionChart; // Store Chart.js instance for wind wave direction
let periodChart; // Store Chart.js instance for wind wave period

// Add OpenStreetMap tile layer
var streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    zoom: 7, // Set initial zoom level
    minZoom: 7, // Prevent zooming out
    maxZoom: 16 // Prevent zooming in
}).addTo(map);

// Add OpenTopoMap tile layer
var topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    zoom: 7,
    minZoom: 7,
    maxZoom: 16,
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap'
});

// Layer control to switch between street map and topographic map
var baseMaps = {
    "Street Map": streetLayer,
    "Topographic Map": topoLayer
};
L.control.layers(baseMaps).addTo(map);

// Define custom icon for marker
var customIcon = L.icon({
    iconUrl: '../static/assets/marker.png', // Replace with your custom marker image path
    iconSize: [38, 45], // Size of the icon
    iconAnchor: [22, 45], // Point of the icon which will correspond to marker's location
    popupAnchor: [-3, -45] // Point from which the popup should open relative to the iconAnchor
});

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

            // Remove previous marker if it exists
            if (currentMarker) map.removeLayer(currentMarker);

            // Add new marker with custom icon
            currentMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
                .bindPopup(`Latitude: ${lat}<br>Longitude: ${lng}`)
                .openPopup();

            // Plot hourly wind wave data
            const hourlyCtx = document.getElementById('hourlyWindWaveChart').getContext('2d');
            hourlyChart = createOrUpdateChart(
                hourlyChart,
                hourlyCtx,
                data.hourly.time,
                data.hourly.wind_wave_height,
                'Hourly Wind Wave Height'
            );

            // Check if direction data exists
            const directionData = data.hourly.wind_wave_direction || Array(data.hourly.time.length).fill(null); // Use null or any placeholder
            const directionCtx = document.getElementById('windWaveDirectionChart').getContext('2d');
            directionChart = createOrUpdateChart(
                directionChart,
                directionCtx,
                data.hourly.time,
                directionData,
                'Hourly Wind Wave Direction'
            );

            // Check if period data exists
            const periodData = data.hourly.wind_wave_period || Array(data.hourly.time.length).fill(null); // Use null or any placeholder
            const periodCtx = document.getElementById('windWavePeriodChart').getContext('2d');
            periodChart = createOrUpdateChart(
                periodChart,
                periodCtx,
                data.hourly.time,
                periodData,
                'Hourly Wind Wave Period'
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
});
