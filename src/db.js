const mongoose = require('mongoose');
const User = new Schema({
    username: String,
    password: String,
});
const Internship = new mongoose.Schema({
    user: String,
    company: String,
    role: String,
    status: String,
    date: String
})
mongoose.model('User', User);
mongoose.model('Internship', Internship);
const uri = process.env.MONGODB_URI || 'mongodb://localhost/buzzZ';
mongoose.connect(uri,{useNewUrlParser: true});
module.exports = {mongoose};
