const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const passport = require('passport');
const jwt = require('jsonwebtoken')
const config = require('../config/db');
const { request } = require('express');

router.post('/reg', (req, res) => {
	let newUser = new User({
		name: req.body.name,
		email: req.body.email,
		login: req.body.login,
		password: req.body.password
	});

	User.addUser(newUser, (err, user) => {
		if(err) {
			res.json({success: false, msg: 'User has not been added.'})
		}
		else {
			res.json({success: true, msg: 'User has been added.'}) 
		}
	});
});

router.post('/auth', (req, res) => { // сторінка авторизації
	const login = req.body.login; // отримуємо дані від користувача логін і пароль
	const password = req.body.password; // ці дані зберігаютсья в даних змінах

	User.getUserByLogin(login, (err, user) => { // в базі даних шукаємо користувача по логіну
		if(err) throw err; // вивід помилки
		if(!user) { // якщо користувач не був знайдений в базі даних поверне помилку
			return res.json({success: false, msg: 'This user was not found!'}) // повертає відповідь, return - дозволяє вийти з даної функції
		};

		User.comparePass(password, user.password, (err, isMatch) =>{  // якщо користувач був знайдений(порівняння паролів), User.password - пароль з бд, isMatch - в цей параметр будемо записувати True - якщо паролі співпали, false - не співпали
			if(err) throw err;
			if(isMatch) { // якщо паролі збігаються то створюється токен
				const token = jwt.sign(user.toJSON(), config.secret, {  // user.toJSON() - функція що переводить в формат JSON
					expiresIn: 3600*24 // опція, яка вказує через скільки часу сесія буде автоматично видалена і він більше не буде авторизований(авторизація на 24 год)
				});

				res.json({
					success: true, // відповідь що користувач успішно авторизувався 
					token: 'JWT ' + token, // повертаємо токен користувача і дані про нього що знизу
					user:{
						id: user._id, // в mongoDB id пишеться знижнім прочерком спереду
						name: user.name, // беремо з бд
						login: user.login,
						email: user.email
					}
				})
			} else {
				return res.json({success: false, msg: 'Password mismatch!'}) // якщо користувач не авторизувався
			}
		})  
	})
});

router.post('/dashboard', (req, res) => { //passport.authenticate('jwt', { session: false}),
	let newPost = new Post({
		category: req.body.category,
		title: req.body.title,
		photo: req.body.photo,
		text: req.body.text,
		author: req.body.author,
		date: req.body.date
	});

	Post.addPost(newPost, (err, user) => { // passport.authenticate('jwt', { session: false}),
		if(err) {
			res.json({success: false, msg: 'Post has not been added.'})
		}
		else {
			res.json({success: true, msg: 'Post has been added.'}) 
		}
	});
});

module.exports = router;