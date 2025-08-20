const express = require('express');
const path = require('path');
require('dotenv').config();

// grab the api key from the .env file
const apiKey = process.env.WEATHER_API_KEY;

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: "Missing latitude or longitude" });
    }

    try {
        
        const fetch = (await import('node-fetch')).default;

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching weather data" });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port} : http://localhost:${port}`);
});
