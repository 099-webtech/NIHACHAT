const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb://127.0.0.1:27017/NihaBot', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error(err));

// API routes
const apiRoutes = require('./routes/auth');
app.use('/api', apiRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
