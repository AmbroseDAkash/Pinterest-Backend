const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

// Correct the MongoDB connection string
mongoose.connect('mongodb://127.0.0.1:27017/pinproject', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(error => console.error('Error connecting to MongoDB:', error));

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  profileImage: String,
  contact: Number,
  boards: { // Pinterest allows creating boards to store photos
    type: Array,
    default: []
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post' // Ensure this matches the name of the post model
    }
  ]
});

// Plugin to use passport-local-mongoose for handling user authentication
userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);
