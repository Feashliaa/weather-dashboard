// Initialize the map with a default view
var map = L.map('map').setView([40.7128, -74.0060], 13);
var currentLocation = [40.7128, -74.0060]; // Default to New York City coordinates
var defaultLocationName = "New York, NY";
var isFetching = false;


// Add OSM tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var marker = null; // Variable to store the marker

// Function to add a marker at the clicked location
function onMapClick(e) {
    if (isFetching) {
        return; // Ignore click if fetch request is in progress
    }

    // Disable map click event temporarily
    map.off('click', onMapClick);

    // Remove the existing marker if necessary
    if (marker) {
        map.removeLayer(marker);
    }

    // Add a new marker at the clicked location
    marker = L.marker(e.latlng).addTo(map);

    // Use reverse geocoding to get the town name
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(response => response.json())
        .then(data => {
            let town = data.address.town || data.address.city || data.address.village || data.address.hamlet || 'Unknown';
            marker.bindPopup(town).openPopup();
        })
        .catch(error => {
            console.log('Error fetching town name:', error);
            marker.bindPopup('You clicked here!').openPopup();
        })
        .finally(() => {
            // Enable map click event after fetch request is completed
            map.on('click', onMapClick);
            isFetching = false;
        });

    let coords = e.latlng;
    currentLocation = [coords.lat, coords.lng];
    localStorage.setItem('currentLocation', JSON.stringify(currentLocation));
    console.log("Current Location stored in local storage");
}

function grabCoords() {
    console.log('Grabbing coordinates...');

    // check if there is a marker on the map, if not, place a marker at the default location
    if (!marker) {
        console.log('No marker found, placing marker at default location');
        marker = L.marker(currentLocation).addTo(map);
        marker.bindPopup(defaultLocationName).openPopup();
    }

    // grab currentLocation from local storage
    currentLocation = JSON.parse(localStorage.getItem('currentLocation'));
    console.log("Current Location from local storage: " + currentLocation);

    setTimeout(function () {
        SendDataToApi(currentLocation);
    }, 2000);
}

function degToCompass(deg) {
    const directions = [
        "North", "North North East", "North East", "East North East",
        "East", "East South East", "South East", "South South East",
        "South", "South South West", "South West", "West South West",
        "West", "West North West", "North West", "North North West"
    ];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
}

async function SendDataToApi(currentLocation) {
    // extract the latitude and longitude from the coords
    let lat = currentLocation[0];
    let lon = currentLocation[1];

    try {
        // Call your backend proxy instead of exposing the API key
        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Weather data:', data);

        // Extract values from API response
        let temp = data.main.temp;
        let feelsLike = data.main.feels_like;
        let desc = data.weather[0].description;
        let windSpeed = data.wind.speed || 0; // Default to 0 if wind speed is not available
        let windDirection = data.wind.deg;
        let windDirectionCompass = degToCompass(windDirection);

        let humidity = data.main.humidity;
        let city = data.name;

        // console log all the values
        console.log(`Temperature: ${temp}, Feels Like: ${feelsLike}, Description: ${desc}, 
            Wind Speed: ${windSpeed}, Wind Direction: ${windDirectionCompass}, Humidity: ${humidity}, City: ${city}`);

        // Capitalize description
        desc = desc
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        // Convert Kelvin → Fahrenheit
        temp = Math.round((temp - 273.15) * 9 / 5 + 32);
        feelsLike = Math.round((feelsLike - 273.15) * 9 / 5 + 32);

        // Icon chooser
        function setIcon(weatherType) {
            const weatherIcons = {
                'Clear': 'weather-icons/clear.png',
                'Thunderstorm': 'weather-icons/thunderstorms.png',
                'Rain': 'weather-icons/rain.png',
                'Snow': 'weather-icons/snow.png',
                'Cloudy': 'weather-icons/cloudy.png',
                'Fog': 'weather-icons/fog.png',
                'Partly Cloudy': 'weather-icons/partly-cloudy.png',
                'Haze': 'weather-icons/haze.png',
                'Windy': 'weather-icons/windy.png',
                'default': 'weather-icons/clear.png'
            };

            const iconPath =
                weatherIcons[
                Object.keys(weatherIcons).find(key =>
                    weatherType.includes(key)
                )
                ] || weatherIcons['default'];

            return iconPath;
        }

        const iconPath = setIcon(desc);

        // Save icon for weather.html
        localStorage.setItem('iconPath', iconPath);

        let url = `weather.html?temperature=${temp}&windChill=${feelsLike}&weatherType=${encodeURIComponent(desc)}&windSpeed=${windSpeed}&windDirection=${encodeURIComponent(windDirectionCompass)}&humidity=${humidity}&city=${encodeURIComponent(city)}`;

        let weatherInfo = `
        <div style="text-align: center;">
            <img src="/${iconPath}" alt="${desc}" id="WeatherIcon">
            <br>
            <div><strong>${city}</strong></div>
            <div>Temperature: ${temp}° F</div>
            <div>Description: ${desc}</div>
            <br>
            <div style="text-align: center; margin-top: 10px;">
                <div class="more-info-button" role="button" onclick="window.location.href='${url}'">
                    More Info
                </div>
            </div>
        </div>
        `;


        // Bind popup
        marker.bindPopup(weatherInfo).openPopup();

    } catch (error) {
        console.log('Error fetching weather data:', error);
        marker.bindPopup('Weather data not available').openPopup();
    }
}


// Bind the click event to the map
map.on('click', onMapClick);
