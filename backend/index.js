const express = require('express');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.BACKEND_PORT;
const application = express();

application.use(express.json());
application.use(express.urlencoded({ extended: true}));
application.use(cors());

const AuthRoutes = require('./routes/authRoutes.js');
application.use('/api', cors(), AuthRoutes);

application.listen(PORT, () => {
    console.log(`Backend server started on port ${PORT}`);
});