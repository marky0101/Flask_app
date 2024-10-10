const ctxDirection = document.getElementById('WindWaveDirectionChart').getContext('2d');
const ctxHeight = document.getElementById('WindWaveHeightChart').getContext('2d');
const ctxPeriod = document.getElementById('WindWavePeriodChart').getContext('2d');
const ctxPeakPeriod = document.getElementById('WindWavePeakPeriodChart').getContext('2d');

// Fetch data from the server
function fetchData() {
    return fetch('/data')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        });
}

// Process and display the fetched data
function processData(data) {
    const timestamps = data.map(entry => new Date(entry.timestamp).toLocaleString());
    const windWaveDirections = data.map(entry => entry.wind_wave_direction);
    const windWaveHeights = data.map(entry => entry.wind_wave_height);
    const windWavePeriods = data.map(entry => entry.wind_wave_period);
    const windWavePeakPeriods = data.map(entry => entry.wind_wave_peak_period);

    // Display latitude and longitude
    const latitude = data.length > 0 ? data[0].latitude : 'N/A';
    const longitude = data.length > 0 ? data[0].longitude : 'N/A';
    displayLocation(latitude, longitude);

    // Create separate charts for each dataset
    createDirectionChart(timestamps, windWaveDirections);
    createHeightChart(timestamps, windWaveHeights);
    createPeriodChart(timestamps, windWavePeriods);
    createPeakPeriodChart(timestamps, windWavePeakPeriods);
}

// Display latitude and longitude
function displayLocation(latitude, longitude) {
    document.getElementById('latitude').innerText = `Latitude: ${latitude}`;
    document.getElementById('longitude').innerText = `Longitude: ${longitude}`;
    
}

// Create the Wind Wave Direction chart
function createDirectionChart(timestamps, windWaveDirections) {
    new Chart(ctxDirection, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Wind Wave Direction (°)',
                data: windWaveDirections,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Timestamp',
                        font: {
                            size: 12
                        }
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Wind Wave Direction (°)',
                        font: {
                            size: 10
                        }
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// Create the Wind Wave Height chart
function createHeightChart(timestamps, windWaveHeights) {
    new Chart(ctxHeight, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Wind Wave Height (m)',
                data: windWaveHeights,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Timestamp',
                        font: {
                            size: 12
                        }
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Wind Wave Height (m)',
                        font: {
                            size: 10
                        }
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// Create the Wind Wave Period chart
function createPeriodChart(timestamps, windWavePeriods) {
    new Chart(ctxPeriod, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Wind Wave Period (s)',
                data: windWavePeriods,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Timestamp',
                        font: {
                            size: 12
                        }
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Wind Wave Period (s)',
                        font: {
                            size: 10
                        }
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// Create the Wind Wave Peak Period chart
function createPeakPeriodChart(timestamps, windWavePeakPeriods) {
    new Chart(ctxPeakPeriod, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Wind Wave Peak Period (s)',
                data: windWavePeakPeriods,
                borderColor: 'rgba(255, 206, 86, 1)',
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Timestamp',
                        font: {
                            size: 12
                        }
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Wind Wave Peak Period (s)',
                        font: {
                            size: 10
                        }
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// Main function to initiate data fetch and processing
function init() {
    fetchData()
        .then(processData)
        .catch(error => console.error('Error fetching data:', error));
}

// Execute the main function
init();