var express = require("express");
var app = express();
var http = require("http");
var mongoose = require("mongoose");
var pjson = require("./package.json");
var path = require("path");

var server = http.createServer(app).listen(3000, function()
{
	console.log("HTTP server listening.");
});

var io = require("socket.io").listen(server);

console.log("Hypr backend version " + pjson.version);

app.use(express.static(path.join(__dirname,"public")));

io.on("connection", function(socket)
{
	console.log("Client connected.");

	socket.on("auth", function(uid)
	{
		// uhhhh let's just trust them for now.
		// better auth to come.
		socket.uid = uid;
		socket.auth = true;

		// search in radius of user
		// gather event data
		// concatenate into variable events

		socket.emit("update-all", events);

		console.log("Authed client: " + socket.uid);
	});

	socket.on("create", function(roomData)
	{
		// joining the room should create it

		// where is room ID going to come from?
		socket.join(roomData.id);

		console.log("Created room: " + roomData.id);
	});

	socket.on("join", function(room)
	{
		// that was easy
		socket.join(room);

		console.log("Joined room: " + room);
	});

	socket.on("leave", function(room)
	{
		// that was also easy
		socket.leave(room);

		console.log("Left room: " + room);
	});

	socket.on("disconnect", function()
	{
		console.log("Client disconnected.");
	});
});