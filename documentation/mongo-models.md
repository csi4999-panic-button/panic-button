# Mongo Collections

The Mongo database is going to have multiple schemas to allow the functionality of our applications. 

### Users

* _id
* email
* password
* first name
* last name
* apiToken

### Classrooms

* id (unique)
* course type
* course number
* section number
* teachers (list, *ref Users._id*)
* teacher assistants (list, *ref Users._id*)
* students (list, *ref Users._id*)

### InviteCodes

* classroom (*ref Classrooms.id*)
* code (unique)
* type (Number, enum: 1, 2, 3)
