var express = require("express");
var app = express();
var http = require("http");
var socketio = require("socket.io")(http);
var mongoose = require("mongoose");
var pjson = require("./package.json");
var path = require("path");

console.log("Hypr backend version " + pjson.version);

app.use(express.static(path.join(__dirname,"public")));

socketio.on("connection", function(socket)
{
	console.log("Client connected.");

	socket.on("auth", function(uid)
	{
		// uhhhh let's just trust them for now.
		// better auth to come.
		socket.uid = data;
		socket.auth = true;

		// search in radius of user
		// gather event data
		// concatenate into variable events

		socket.emit("update-all", events);
	});

	socket.on("create", function(roomData)
	{
		// joining the room should create it

		// where is room ID going to come from?
		socket.join(roomData.id);
	});

	socket.on("join", function(room)
	{
		// that was easy
		socket.join(room);
	});

	socket.on("leave", function(room)
	{
		socket.leave(room);
	});

	socket.on("disconnect", function()
	{
		console.log("Client disconnected.");
	});
});

app.listen(8080, function()
{
	console.log("HTTP server started.");
});