🌤 Weather Dashboard

An interactive weather dashboard that shows current weather information for any location using Leaflet.js and the OpenWeather API. Click on the map to view weather info and explore a detailed weather page.

Features

🗺 Interactive map to select a location

🌡 Displays temperature, feels-like temperature, wind speed & direction, humidity, and weather description

🌤 Dynamic weather icons

🔗 Popup with a “More Info” button linking to a detailed weather page

↩ Easy Return to Map button

Demo

https://github.com/user-attachments/assets/24b44136-9570-4a34-a683-7d9683f34f3a
## Installation

### Prerequisites

- [Node.js](https://nodejs.org/)  
- OpenWeather API key  

### Steps

1. Clone the repository:  
   `git clone <repository-url>`  
   `cd weather-dashboard`

2. Install dependencies:  
   `npm install`

3. Create a `.env` file in the root directory and add:  
   `WEATHER_API_KEY=your_openweather_api_key`

4. Start the server:  
   `node index.js`

5. Open your browser at:  
   `http://localhost:3000`

---

## Usage

1. Click anywhere on the map to drop a marker.  
2. View a popup with temperature, weather description, wind info, and humidity.  
3. Click **More Info** to see detailed weather stats on the `weather.html` page.  
4. Use **Return to Map** to go back to the interactive map.  

---


## File Structure

```
weather-dashboard/
|
├─ index.html          # Main page with map
├─ weather.html        # Detailed weather page
├─ script.js           # Map and weather JS
├─ styles.css          # Styling for the app
├─ weather-icons/      # Folder containing weather icon images
|   ├─ clear.png
|   ├─ rain.png
|   ├─ snow.png
|   └─ ...             # Other weather icons
├─ index.js            # Node/Express server
├─ package.json        # Dependencies
└─ .env                # API key (not committed)
```
---

## Dependencies

- [Express](https://www.npmjs.com/package/express)  
- [dotenv](https://www.npmjs.com/package/dotenv)  
- [node-fetch](https://www.npmjs.com/package/node-fetch)  

---

## Notes

- `node_modules` is excluded — run `npm install` to install dependencies.  
- Do **not** commit `.env`; it contains your private API key.  

---
