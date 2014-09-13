var express = require("express");
var app = express();
var http = require("http");
var socketio = require("socket.io")(http);
var mongoose = require("mongoose");
var pjson = require("./package.json");
var path = require("path");

app.use(express.static(path.join(__dirname,"public")));

socketio.on("connection", function(socket)
{
	
});