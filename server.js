const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Path to the data file
const dataFile = path.join(__dirname, 'favorite-counts.json');

// Initialize data file if it doesn't exist
function initializeDataFile() {
    if (!fs.existsSync(dataFile)) {
        const initialData = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0
        };
        fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
    }
}

// Read counts from file
function readCounts() {
    try {
        const data = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading counts:', err);
        return {};
    }
}

// Write counts to file
function writeCounts(counts) {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(counts, null, 2));
    } catch (err) {
        console.error('Error writing counts:', err);
    }
}

// GET all favorite counts
app.get('/api/favorites', (req, res) => {
    const counts = readCounts();
    res.json(counts);
});

// GET favorite count for a specific item
app.get('/api/favorites/:id', (req, res) => {
    const counts = readCounts();
    const id = req.params.id;
    res.json({ id, count: counts[id] || 0 });
});

// INCREMENT favorite count
app.post('/api/favorites/:id/increment', (req, res) => {
    const counts = readCounts();
    const id = req.params.id;
    counts[id] = (counts[id] || 0) + 1;
    writeCounts(counts);
    res.json({ id, count: counts[id] });
});

// DECREMENT favorite count
app.post('/api/favorites/:id/decrement', (req, res) => {
    const counts = readCounts();
    const id = req.params.id;
    counts[id] = Math.max(0, (counts[id] || 0) - 1);
    writeCounts(counts);
    res.json({ id, count: counts[id] });
});

// Initialize and start server
initializeDataFile();
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
