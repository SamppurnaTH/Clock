// DOM elements
const analogClock = document.getElementById('analog-clock');
const digitalClock = document.getElementById('digital-clock');
const timeDisplay = document.getElementById('time');
const dateDisplay = document.getElementById('date');
const modeToggle = document.getElementById('mode-toggle');
const timeFormatSelect = document.getElementById('time-format');
const clockToggle = document.getElementById('clock-toggle');
const body = document.body;
const weatherStatus = document.getElementById('weather-status');
const locationInput = document.getElementById('location');
const updateLocationButton = document.getElementById('update-location');

// Configuration
const weatherAPIKey = '9d0a72b537fe4190aec125333241209';
let weatherAPIURL = `https://api.weatherapi.com/v1/current.json?q=India&key=${weatherAPIKey}`; // Default location

let is24HourFormat = false; // Default to 12-hour format
let isAnalogMode = false; // Default is digital clock

// Function to update the analog clock
function updateAnalogClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    let hours = now.getHours();
    
    const secondHand = document.querySelector('.second-hand');
    const minuteHand = document.querySelector('.minute-hand');
    const hourHand = document.querySelector('.hour-hand');
    
    const secondsDegrees = ((seconds / 60) * 360) + 90;
    const minutesDegrees = ((minutes / 60) * 360) + 90;
    const hoursDegrees = ((hours % 12) / 12) * 360 + ((minutes / 60) * 30) + 90;
    
    secondHand.style.transform = `rotate(${secondsDegrees}deg)`;
    minuteHand.style.transform = `rotate(${minutesDegrees}deg)`;
    hourHand.style.transform = `rotate(${hoursDegrees}deg)`;
    
    if (seconds === 0) {
        secondHand.style.transition = 'none';
    } else {
        secondHand.style.transition = 'transform 0.05s cubic-bezier(0.4, 0, 0.2, 1)';
    }
}

// Function to update the digital clock
function updateDigitalClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    if (!is24HourFormat) {
        hours = hours % 12 || 12;
    }

    const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timeDisplay.textContent = time;
    
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString(undefined, dateOptions); 
}

// Fetch and display weather data
async function fetchWeatherData() {
    try {
        const response = await fetch(weatherAPIURL);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        
        // Extract weather information from the response
        const condition = data.current.condition.text;
        const temperature = data.current.temp_c;
        const location = data.location.name;

        // Update the weather status display
        weatherStatus.textContent = `In ${location}, ${condition}, ${temperature}°C`;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        weatherStatus.textContent = 'Weather data unavailable';
    }
}

// Update weather data based on user input
function updateWeatherLocation() {
    const location = locationInput.value.trim();
    if (location) {
        weatherAPIURL = `https://api.weatherapi.com/v1/current.json?q=${encodeURIComponent(location)}&key=${weatherAPIKey}`;
        fetchWeatherData(); // Fetch new weather data
    }
}

// Switch between analog and digital clocks
clockToggle.addEventListener('click', () => {
    isAnalogMode = !isAnalogMode;
    analogClock.classList.toggle('hidden', !isAnalogMode);
    digitalClock.classList.toggle('hidden', isAnalogMode);
});

// Toggle between 12-hour and 24-hour format
timeFormatSelect.addEventListener('change', (event) => {
    is24HourFormat = event.target.value === '24hr';
    updateDigitalClock();
});

// Toggle dark mode
modeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    // Smooth transition for dark mode
    body.style.transition = 'background 0.3s ease, color 0.3s ease';
});

// Detect and apply system's dark mode preference
function applyDarkModePreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
}

// Listen for system dark mode changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyDarkModePreference);

// Update both clocks every second
setInterval(() => {
    if (isAnalogMode) {
        updateAnalogClock();
    }
    updateDigitalClock();
}, 1000);

// Event listener for updating weather location
updateLocationButton.addEventListener('click', updateWeatherLocation);

// Debounce function for user input
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Debounce location input
const debouncedUpdateWeatherLocation = debounce(updateWeatherLocation, 500);
locationInput.addEventListener('input', debouncedUpdateWeatherLocation);

// Initial setup
fetchWeatherData();
applyDarkModePreference();
