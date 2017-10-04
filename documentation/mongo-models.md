# Mongo Models 

The Mongo database is going to have multiple schemas to allow the functionality of our applications. 

### User

* email
* password
* first name
* last name
* apiToken

### Classroom

This model consists of 

* id (unique)
* course type
* course number
* section number
* teachers (list)
* teacher code (unique)
* teacher assistants (list)
* ta code (unique)
* students (list)
* student code