// DOM elements
const analogClock = document.getElementById('analog-clock');
const digitalClock = document.getElementById('digital-clock');
const timeDisplay = document.getElementById('time');
const dateDisplay = document.getElementById('date');
const modeToggle = document.getElementById('mode-toggle');
const timeFormatSelect = document.getElementById('time-format');
const timeZoneSelect = document.getElementById('time-zone'); // Time zone select element
const clockToggle = document.getElementById('clock-toggle');
const body = document.body;
const weatherStatus = document.getElementById('weather-status');
const locationInput = document.getElementById('location');
const updateLocationButton = document.getElementById('update-location');
const weatherAPIKey = '9d0a72b537fe4190aec125333241209';
let weatherAPIURL = `https://api.weatherapi.com/v1/current.json?q=India&key=${weatherAPIKey}`; // Default location

let is24HourFormat = false;
let isAnalogMode = false;
let timeZone = 'Asia/Kolkata'; // Default time zone

// Function to update both digital and analog clocks with the same time in the selected time zone
function updateClocks() {
    const now = new Date().toLocaleString('en-US', { timeZone: timeZone });
    const selectedTime = new Date(now);

    // Update Digital Clock
    let hours = selectedTime.getHours();
    const minutes = selectedTime.getMinutes();
    const seconds = selectedTime.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // For 12-hour format, adjust hours
    const displayHours = is24HourFormat ? hours : hours % 12 || 12;
    const time = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${!is24HourFormat ? ampm : ''}`;
    timeDisplay.textContent = time;

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: timeZone };
    dateDisplay.textContent = selectedTime.toLocaleDateString(undefined, dateOptions);

    // Update Analog Clock
    updateAnalogClock(selectedTime);
}

// Function to update the analog clock hands based on the current time
function updateAnalogClock(time) {
    const secondHand = document.querySelector('.second-hand');
    const minuteHand = document.querySelector('.minute-hand');
    const hourHand = document.querySelector('.hour-hand');

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    let hours = time.getHours();

    // Always use 12-hour format for analog clock
    hours = hours % 12 || 12; // Convert 24-hour format to 12-hour format

    // Calculate degrees for clock hands
    const secondsDegrees = ((seconds / 60) * 360) + 90; // +90 to account for initial offset
    const minutesDegrees = ((minutes / 60) * 360) + 90;
    const hoursDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30) + 90; // Hour needs minute offset

    // Apply rotation to the clock hands
    secondHand.style.transform = `rotate(${secondsDegrees}deg)`;
    minuteHand.style.transform = `rotate(${minutesDegrees}deg)`;
    hourHand.style.transform = `rotate(${hoursDegrees}deg)`;

    // Smooth transition for second hand except at 0 seconds
    secondHand.style.transition = seconds === 0 ? 'none' : 'transform 0.05s cubic-bezier(0.4, 0, 0.2, 1)';
}

// Fetch weather data from the API
async function fetchWeatherData() {
    try {
        const response = await fetch(weatherAPIURL);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
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
        fetchWeatherData(); 
    }
}

// Event listeners
clockToggle.addEventListener('click', () => {
    isAnalogMode = !isAnalogMode;
    analogClock.classList.toggle('hidden', !isAnalogMode);
    digitalClock.classList.toggle('hidden', isAnalogMode);
});

timeFormatSelect.addEventListener('change', (event) => {
    is24HourFormat = event.target.value === '24hr';
    updateClocks();
});

timeZoneSelect.addEventListener('change', (event) => {
    timeZone = event.target.value;
    updateClocks();
});

modeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    body.style.transition = 'background 0.3s ease, color 0.3s ease';
});

function applyDarkModePreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyDarkModePreference);

setInterval(updateClocks, 1000); // Update both clocks every second

updateLocationButton.addEventListener('click', updateWeatherLocation);

const debouncedUpdateWeatherLocation = debounce(updateWeatherLocation, 500);
locationInput.addEventListener('input', debouncedUpdateWeatherLocation);

fetchWeatherData();
applyDarkModePreference();

// Debounce utility function
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}
