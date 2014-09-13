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
	console.log("Connected to DB");
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
	console.log("Client connected.");

	socket.on("auth", function(uid)
	{
		// uhhhh let's just trust them for now.
		// better auth to come.
		socket.uid = uid;
		
		// search in radius of user
		// gather event data
		// concatenate into variable events

		var Event = mongoose.model("Event", eventSchema);
		var allEvents = [];
		Event.find({}, function(err, events)
		{
			if(err)
			{
				console.log("001 Database error: " + err);
			}

			events.forEach(function(e)
			{
				console.log("Event retrieved: " + e);
				allEvents.push(e);
			});

			socket.emit("update-all", allEvents);
			
			console.log("Authed client: " + socket.uid);
		});
	});

	socket.on("create", function(eventData)
	{
		if(typeof socket.uid === "undefined")
		{
			console.log("User not authenticated, unable to create event.");
			return;
		}

		// need to validate data
		var Event = mongoose.model("Event", eventSchema);

		var newEvent = new Event(
		{
			latitude: eventData.latitude,
			longitude: eventData.longitude,
			fstag: "",
			description: eventData.description,
			timestamp: Date.now(),
			creator: socket.uid,
			attendees: []
		});

		var eid;

		newEvent.save(function(err, result, nAff)
		{
			if(err)
			{
				console.log("002 Error saving document: " + err);
			}

			// joining the room should create it
			// where is room ID going to come from?
			socket.join(result.id);

			//console.log(eventData);

			console.log("Created room: " + result.id);
		});

	});

	socket.on("join", function(eventID)
	{
		if(typeof socket.uid === "undefined")
		{
			console.log("User not authenticated, unable to join room.");
		}

		var Event = mongoose.model("Event", eventSchema);

		Event.findOne({_id: eventID}, function(err, result)
		{
			if(err)
			{
				console.log("003 Error reading database: " + err);
				return;
			}

			if(!result)
			{
				console.log("004 Event does not exist.");
				return;
			}

			result.attendees.push(socket.uid);

			socket.join(result.id);

			console.log("User " + socket.uid + " joined event " + result.id + " (" + result.title + ")");

			result.save(function(err, e, nAffected)
			{
				if(err)
				{
					console.log("005 Could not save updated event.");
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
			return;
		}

		var Event = mongoose.model("Event", eventSchema);

		Event.findOne({_id: eventID}, function(err, result)
		{
			if(err)
			{
				console.log("006 Error reading database: " + err);
				return;
			}

			if(!result)
			{
				console.log("007 Event not found");
				return;
			}

			var attendeeIndex = result.attendees.indexOf(result.id);

			if(attendeeIndex == -1)
			{
				console.log("008 Client is not attending this event!");
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

	socket.on("message", function(messageData)
	{

	});

	socket.on("disconnect", function()
	{
		console.log("Client disconnected.");
	});
});