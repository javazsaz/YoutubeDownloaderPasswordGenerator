const { Telegraf } = require('telegraf');
const mongoose = require("mongoose");
const bot = new Telegraf('1940727082:AAHySxkTznp-3DjtHV31aB49oP-DpoPOMkw');
const passwordModel = require("./modelPsw");
const configDb = require("./configDb");
const express = require("express");
const app = new express();

var password = "";
app.listen(8080, () => {
	console.log("Server started");

	//When bot is started
	bot.start((ctx) =>

		//Welcome message
		ctx.reply("Welcome! Use '/' to obtain all commands available. For Generate a new password, please enter username and password to connect on MongoDB database. \nExample:\nusername - username1\npassword - password1")
	)
	//When send "/generate" command - to capture what user send
	bot.hears('/generate', (ctx) =>
		generate(ctx)
	)

	//When send message - to capture what user send
	bot.on('text', (ctx) =>

		getUserAndPassword(ctx)
	)

	bot.launch()

	/**
	 * Generate new password, send and save it
	 * @param {*} ctx -> obj of telegraf
	 */
	function generate(ctx) {
		if (configDb.username === "" || configDb.password === "") {
			ctx.reply("Set your usarname and password to continue")
		} else {
			password = Math.random().toString(36).slice(2)
			ctx.reply("Good! Your password is: " + password + "\nGood bye!")
			savePassword()

			configDb.username = "";
			configDb.password = "";
		}
	}

	/**
	 * Connect on MongoDB
	 * @param ctx -> obj telegraf
	 * @returns 
	 */
	function connectDb(ctx) {

		console.log("Connecting to database...")
		configDb.MongoUri = "mongodb+srv://" + configDb.username + ":" + configDb.password + "@cluster-youtubedownload.v9azt.mongodb.net/youtubeDownloadDB?retryWrites=true&w=majority"

		//Connect to Mongo
		mongoose.connect(configDb.MongoUri, { useNewUrlParser: true, useUnifiedTopology: true }).then(async () => {
			console.log("Connected!");
			ctx.reply("Database connected! Now you can generate a new password!")

		}).catch((err) => {
			console.log("Authentication failed! " + err.codeName + " - Error code: " + err.code);
			ctx.reply("Authentication failed! " + err.codeName + " - Error code: " + err.code);

			configDb.username = "";
			configDb.password = "";

		})
	}

	/**
	 * Create new document on MongoDB
	 */
	function savePassword() {
		if (configDb.username === "" && configDb.password === "") {
			ctx.reply("Set your usarname and password to continue")
		} else {
			const newPasswordModel = new passwordModel({ // create new document with model for mongodb
				password: password
			});
			passwordModel.remove({}, function () {
				newPasswordModel.save();
			})

		}
	}

	/**
	 * Get username and password when user write and if all information has been stored, connect on db
	 * @param {*} ctx -> obj of telegraf
	 */
	function getUserAndPassword(ctx) {
		let data = ctx.update.message.text;

		if (data.indexOf("username - ") !== -1) {
			configDb.username = data.substring(data.indexOf("- ") + 2, data.length);
		}

		if (data.indexOf("password - ") !== -1) {
			configDb.password = data.substring(data.indexOf("- ") + 2, data.length);
		}

		if (configDb.username !== "" && configDb.password !== "") {
			connectDb(ctx);
		}

	}
})