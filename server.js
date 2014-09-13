var express = require("express");
var app = express();
var http = require("http");
var mongoose = require("mongoose");
var pjson = require("./package.json");
var path = require("path");
// just don't touch this and everything will work
var server = http.createServer(app).listen(3000, function()
{
	console.log("HTTP server listening.");
});

var io = require("socket.io").listen(server);

mongoose.connect("mongodb://localhost/hypr", function()
{
	console.log("Started DB service");
});

var eventSchema = mongoose.Schema({
	title: String,
	latitude: Number,
	longitude: Number,
	//foursquare tag
	fstag: String,
	description: String,
	timestamp: Number,
	creator: String,
	attendees: [String]
});

app.use(express.static(path.join(__dirname,"public")));

console.log("Hypr backend version " + pjson.version);

io.on("connection", function(socket)
{
	console.log("New client connected.");

	socket.on("auth", function(uid)
	{
		// uhhhh let's just trust them for now.
		// better auth to come.
		if(uid == "")
		{
			socket.emit("err", "No UID given.");
			console.log("No UID given, aborting login");
			return;
		}

		if(!(typeof socket.uid === "undefined"))
		{
			socket.emit("err", "You are already logged in!");
			console.log("Already authenticated");
			return;
		}

		socket.uid = uid;

		var Event = mongoose.model("Event", eventSchema);
		var allEvents = [];
		Event.find({}, function(err, events)
		{
			if(err)
			{
				console.log("001 Database error: " + err);
				socket.emit("err", "Error 001: Could not read from database. Please try again later.");
				return;
			}

			events.forEach(function(e)
			{
				allEvents.push(e);
			});

			// update-all to the user that just logged in
			socket.emit("update-all", allEvents);
			
			console.log("Authed client: " + socket.uid);
		});
	});

	socket.on("create", function(eventData)
	{
		if(typeof socket.uid === "undefined")
		{
			console.log("User not authenticated, unable to create event.");
			socket.emit("err", "You are not logged in!");
			return;
		}

		// need to validate data
		var Event = mongoose.model("Event", eventSchema);

		var newEvent = new Event(
		{
			title: eventData.title,
			latitude: eventData.latitude,
			longitude: eventData.longitude,
			fstag: "",
			description: eventData.description,
			timestamp: Date.now(),
			creator: socket.uid,
			attendees: []
		});

		newEvent.save(function(err, result, nAff)
		{
			if(err)
			{
				console.log("002 Error saving document: " + err);
				socket.emit("err", "Error 002: Could not connect to database. Please try again later.");
				return;
			}

			socket.join(result.id);

			// tell EVERYONE that this was created.
			io.emit("update", result);

			console.log(socket.uid + " created room: " + result.id + " (" + result.title + ")");
		});
	});

	socket.on("join", function(eventID)
	{
		if(typeof socket.uid === "undefined")
		{
			console.log("User not authenticated, unable to join event.");
			socket.emit("err", "You are not logged in!");
			return;
		}

		var Event = mongoose.model("Event", eventSchema);

		Event.findOne({_id: eventID}, function(err, result)
		{
			if(err)
			{
				console.log("003 Error reading database: " + err);
				socket.emit("err", "Error 003: Could not connect to database.");
				return;
			}

			if(!result)
			{
				console.log("004 Event does not exist.");
				socket.emit("err", "This event does not exist!");
				return;
			}

			result.attendees.push(socket.uid);

			socket.to(result.id).emit("bcast-join", socket.uid);
			socket.join(result.id);


			console.log("User " + socket.uid + " joined event " + result.id + " (" + result.title + ")");

			result.save(function(err, e, nAffected)
			{
				if(err)
				{
					console.log("005 Could not save updated event.");
					socket.emit("err", "Error 005: Could not write to database. Please try again later.");
					return;
				}

				console.log("Successfully updated event " + e.id);
			});
		});

	});

	socket.on("leave", function(eventID)
	{
		if(typeof socket.uid === "undefined")
		{
			console.log("User not authenticated, unable to leave event.");
			socket.emit("err", "You are not logged in!");
			return;
		}

		var Event = mongoose.model("Event", eventSchema);

		Event.findOne({_id: eventID}, function(err, result)
		{
			if(err)
			{
				console.log("006 Error reading database: " + err);
				socket.emit("err", "Error 006: Could not read from database. Please try again later.");
				return;
			}

			if(!result)
			{
				console.log("007 Event not found");
				socket.emit("err", "This event does not exist!");
				return;
			}

			var attendeeIndex = result.attendees.indexOf(result.id);

			if(attendeeIndex == -1)
			{
				console.log("008 Client is not attending this event!");
				socket.emit("err", "You were not attending this event.");
				return;
			}

			result.attendees.splice(attendeeIndex ,1);

			console.log("User " + socket.uid + " left room " + result.id + " (" + result.title + ")");

			result.save(function(err, e, nAffected)
			{
				socket.leave(e.id);
			});

		});
	});

	/*
	socket.on("message", function(messageData)
	{

	});
	*/

	socket.on("disconnect", function()
	{
		if(typeof socket.uid === "undefined")
		{
			console.log("Unauthenticated user disconnected.");	
		}
		else
		{
			console.log(socket.uid + " disconnected.");
		}
	});
});