const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const User = new mongoose.Schema({
    username: String,
    password: String,
});
User.plugin(passportLocalMongoose);

const Internship = new mongoose.Schema({
    user: String,
    company: String,
    role: String,
    status: String,
    date: String
})
mongoose.model('User', User);
mongoose.model('Internship', Internship);
const uri = process.env.MONGODB_URI || 'mongodb://localhost/hackNYU';
mongoose.connect(uri,{useNewUrlParser: true});
module.exports = {mongoose};
