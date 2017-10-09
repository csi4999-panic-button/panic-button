# REST API Documentation

This documentation covers the REST API access and how it will be utilized by clients in our service. If you would like to have more information on the REST API than is given here, please contact [tcarrio](email:tom@carrio.me) or [dyladan](). 

Table of Contents

* [Default return structure](#return-structure)
* [/](#root)
* [/api/v1](#api-v1)
* [/api/v1/classrooms](#api-v1-classrooms)
* [/api/v1/schools](#api-v1-schools)

# <a name="return-structure">Default Return Structure</a>

If there is not a provided description of the returned object, the returned body of calls to the API will have the following structure:

```json
{
    success: Boolean,
    message: String
}
```

This provides whether the operation was performed successfully and any further description of the status. 

# <a name="root"> / </a>

### <a name="root-register">`POST /register`</a>

This is used to register a new user account on Panic-Button. The request needs to have the following fields:

| Route | Request Type | Variables | Type | Required (*) |
|-------|--------------|-----------|------|--------------|
|`/register`| POST | email | String | * |
| | | password | String | * |
| | | firstName | String | * |
| | | lastName | String | * |

### <a name="root-login">`POST /login`</a>

This is used to create a session with the server, sending a cookie to the client and allowing access until that session is destroyed or timed out. To retreive a token to access the REST API, see [/api/v1](#api-v1) instead. 

| Route | Request Type | Variables | Type | Required (*) |
|-------|--------------|-----------|------|--------------|
|`/login`| POST | email | String | * |
| | | password | String | * |

### <a name="root-logout">`GET /logout`</a>

This will destroy the session stored server side so the cookie is no longer valid. 

| Route | Request Type | Variables | Type | Required (*) |
|-------|--------------|-----------|------|--------------|
|`/logout`| GET | | |

# <a name="api-v1"> /api/v1/ </a>

### <a name="api-v1-authenticate">`POST /api/v1/authenticate`</a>

This will return the `apiToken` for the currently authenticated user. An existing session must be active. 

| Route | Request Type | Variables | Type | Required (*) |
|-------|--------------|-----------|------|--------------|
|`/authenticate`| POST | | | |

### <a name="api-v1-users">`GET /api/v1/users`</a>

This retreives a list of all the users in the database. An existing session must be active. 

| Route | Request Type | Variables | Type | Required (*) |
|-------|--------------|-----------|------|--------------|
|`/users`| GET | | | | 

# <a name="api-v1-classrooms"> /api/v1/classrooms </a>

### `GET /api/v1/classrooms`

This retrieves a list of classrooms that the currently authenticated user belongs to. An existing session must be active. 

| Route | Request Type | Variables | Type | Required (*) |
|-------|--------------|-----------|------|--------------|

### `POST /api/v1/classrooms`

This creates a classroom with the currently authenticated user being the teacher. An existing session must be active. Pass the following variables:

| Route | Request Type | Variables | Type | Required (*) |
|-------|--------------|-----------|------|--------------|
|`/api/v1/classrooms`|POST|schoolId|String||
|||courseType|String||
|||courseNumber|String||
|||sectionNumber|String||
|||courseTitle|String|*|

This will also return your invitation codes in the following format:

```json
{
    teachers: String,
    teacherAssistants: String,
    students: String
}
```

### `PUT /api/v1/classrooms/id/$id`

This will modify a classroom by the provided `$id` in the request route. An example would be `PUT /api/v1/classrooms/id/1234`. An existing session must be active. Pass the following variables:

| Route | Request Type | Variables | Type | Required (*) |
|-------|--------------|-----------|------|--------------|
|`/api/v1/classrooms/id/$id`|PUT|schoolId|String||
|||courseType|String||
|||courseNumber|String||
|||sectionNumber|String||
|||courseTitle|String|*|

### `POST /api/v1/classrooms/join`

This will add the currently active user to the classroom referenced by the given invitation code. The return status is based on whether the user successfully **belongs** to the classroom, so if they already belonged to the classroom, joining the classroom will return in a success status. Pass the invitation code in the request:

| Route | Request Type | Variables | Type | Required (*) |
|-------|--------------|-----------|------|--------------|
|`/api/v1/classrooms/join`|POST|inviteCode|String|*|


# <a name="api-v1-schools"> / </a>

### `GET /api/v1/schools`

This returns a listing of all schools in the database. 

| Route | Request Type | Variables | Type | Required (*) |
|-------|--------------|-----------|------|--------------|
|`/api/v1/schools`|GET|name|String||
|||address|String||
|||city|String||
|||state|String||
|||country|String||
|||zip|String||
|||domain|String||

The returned JSON object is an array of schools with the following structure:

```json
[
    {
        _id: String,
        name: String,
        address: String,
        city: String,
        state: String,
        country: String,
        zip: Number,
        domain: String
    },
    {
        ...
    }
]
```

### `POST /api/v1/schools`

This creates a new school in the database.

| Route | Request Type | Variables | Type | Required (*) |
|-------|--------------|-----------|------|--------------|
|`/api/v1/schools`|POST|name|String|*|
|||address|String||
|||city|String|*|
|||state|String|*|
|||country|String|*|
|||zip|String||
|||domain|String||

### `PUT /api/v1/schools/id/$id`

This modifies an existing school in the database matching the given `$id`.

| Route | Request Type | Variables | Type | Required (*) |
|-------|--------------|-----------|------|--------------|
|`/api/v1/schools`|PUT|schoolId|String||
|||name|String||
|||address|String||
|||city|String||
|||state|String||
|||country|String||
|||zip|String||
|||domain|String||