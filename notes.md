# Hyperlocal 

# Model

## Collections:

* Users
* Events


### Users

* UID
* Name
* Photo link
* (User defined interests)


### Events

* Location (lat, long) - tag w/ name (fouresquare?)
* Description
* Timestamp
* Optional end time
* Users attending (array)
* Photos

### Group

## Socket data types

*all* interactions happen through sockets, should not need an $http request

* Create event (Client)
* Event created (Server)
* Join event (Client)
* New attendee (Server)
* Leave event (client)
* New photo (client)
* New photo (server)

# Program flow

1. User creates event - socket broadcast - (fire push)
2. User sees on phone
3. User opts in to event - added to array - socket event to server
4. Socket broadcast to attendees
5. Attend event (checkin?)


# Pitch

"The timestamp is now"
