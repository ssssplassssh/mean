const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config/db');

const UserSchema = mongoose.Schema({
	name: {
		type: String
	},
	email: {
		type: String,
		required: true
	},
	login: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
});

const User = module.exports = mongoose.model('User', UserSchema)

module.exports.getUserByLogin = function(login, callback){
	const query = {login: login};
	User.findOne(query, callback);
};

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
};

module.exports.addUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt){
		bcrypt.hash(newUser.password, salt, function(err, hash){
			if (err) throw err;
			newUser.password = hash;
			newUser.save(callback);
		});
	});
};

module.exports.comparePass = function(passFromUser, userDbPass, callback){ // функція порівняння паролів, passFromUser-введений користувачем, userDbPass з бд
	bcrypt.compare(passFromUser, userDbPass, (err, isMatch) => {
		if(err) throw err; // видає помилку
		callback(null, isMatch); // якщо ніяких помилок немає, null - означає що ніяких помилок немає, isMatch(true) - паролі співпали, isMatch(false) - паролі не співпали
	})  // функція, яка допоможе порівняти паролі 
};