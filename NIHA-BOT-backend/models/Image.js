const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation', // Assuming you have a Conversation model
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Image = mongoose.model('Image', imageSchema);
module.exports = Image;
