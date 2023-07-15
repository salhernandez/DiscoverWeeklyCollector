const express = require('express');
require('dotenv').config();
const PORT = process.env.FRONTEND_PORT;
const app = express();

app.get('/', function(req, res) {
    const urlParams = new URLSearchParams(req.url);
    const statusFromURL = urlParams.get('/?status');
    console.log(`=== FRONTEND - ${statusFromURL} ===`);
    res.json({"status": `${statusFromURL}`})
});

app.listen(PORT);
console.log(`Frontend server started on port ${PORT}`);