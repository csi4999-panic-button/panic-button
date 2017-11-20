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

```js
{
    success: Boolean,
    message: String
}
```

This provides whether the operation was performed successfully and any further description of the status. 

# <a name="root"> / </a>

### <a name="root-register">`POST /register`</a>

This is used to register a new user account on Panic-Button. The request needs to have the following fields:

| Route       | Request Type | Variables | Type   | Required (*) |
| ----------- | ------------ | --------- | ------ | ------------ |
| `/register` | POST         | email     | String | *            |
|             |              | password  | String | *            |
|             |              | firstName | String | *            |
|             |              | lastName  | String | *            |

### <a name="root-login">`POST /login`</a>

This is used to create a session with the server, sending a cookie to the client and allowing access until that session is destroyed or timed out. To retreive a token to access the REST API, see [/api/v1](#api-v1) instead. 

| Route    | Request Type | Variables | Type   | Required (*) |
| -------- | ------------ | --------- | ------ | ------------ |
| `/login` | POST         | email     | String | *            |
|          |              | password  | String | *            |

### <a name="root-logout">`GET /logout`</a>

This will destroy the session stored server side so the cookie is no longer valid. 

| Route     | Request Type | Variables | Type | Required (*) |
| --------- | ------------ | --------- | ---- | ------------ |
| `/logout` | GET          |           |      |              |

# <a name="api-v1"> /api/v1/ </a>

### <a name="api-v1-authenticate">`POST /api/v1/authenticate`</a>

This will return the `apiToken` for the currently authenticated user. An existing session must be active. If the user is not authenticated, an email and password can be sent to generate a token.

| Route           | Request Type | Variables | Type   | Required (*) |
| --------------- | ------------ | --------- | ------ | ------------ |
| `/authenticate` | POST         | email     | string |              |
|                 |              | password  | string |              |

### <a name="api-v1-users">`GET /api/v1/users`</a>

This retreives a list of all the users in the database. An existing session must be active. 

| Route    | Request Type | Variables | Type | Required (*) |
| -------- | ------------ | --------- | ---- | ------------ |
| `/users` | GET          |           |      |              |

# <a name="api-v1-classrooms"> /api/v1/classrooms </a>

### `GET /api/v1/classrooms`

This retrieves a list of classrooms that the currently authenticated user belongs to. An existing session must be active. 

| Route                | Request Type | Variables | Type | Required (*) |
| -------------------- | ------------ | --------- | ---- | ------------ |
| `/api/v1/classrooms` | GET          |           |      |              |

The return type is `[Classroom]`, where the Classroom model contains the following:

```js
{
	"_id": "classroomId",
	"updatedAt": "YYYY-MM-DDThh:mm:ss.msZ",
	"createdAt": "YYYY-MM-DDThh:mm:ss.msZ",
	"courseType": "CSI",
	"courseNumber": "3430",
	"sectionNumber": "001-44762",
	"courseTitle": "Theory of Computation",
	"__v": 2, // not important
	"topics": [
		"General"
	],
	"currentTopic": 0,	// index of topics array
	"questions": [Question],
	"students": [
		"userId"
	],
	"teacherAssistants": [
		"userId"
	],
	"teachers": [
		"userId",
		"userId"
	],
	// students/teachers/teacherAssistants hidden from users that are not teacher role
	"role": "student" // or teacher or teacherAssistant
}
```

### `GET /api/v1/classrooms/:classroomId`

This route is used to retrieve a specific classroom by it's `_id`. Useful for getting updates to questions/answers or singular updates. `classroomId` is the `_id` of the classroom. 

### `POST /api/v1/classrooms`

This creates a classroom with the currently authenticated user being the teacher. An existing session must be active and an already valid schoolId must be used to add a classroom to it. Pass the following variables:

| Route                | Request Type | Variables     | Type   | Required (*) |
| -------------------- | ------------ | ------------- | ------ | ------------ |
| `/api/v1/classrooms` | POST         | courseTitle   | String | *            |
|                      |              | courseType    | String |              |
|                      |              | courseNumber  | String |              |
|                      |              | sectionNumber | String |              |
|                      |              | schoolId      | String |              |

This will also return your invitation codes in the following format:

```js
{
    "teachers": String,
    "teacherAssistants": String,
    "students": String
}
```

### `PUT /api/v1/classrooms/id/$id`

This will modify a classroom by the provided `$id` in the request route. An example would be `PUT /api/v1/classrooms/id/1234`. An existing session must be active. Pass the following variables:

| Route                       | Request Type | Variables     | Type   | Required (*) |
| --------------------------- | ------------ | ------------- | ------ | ------------ |
| `/api/v1/classrooms/id/$id` | PUT          | courseTitle   | String | *            |
|                             |              | courseType    | String |              |
|                             |              | courseNumber  | String |              |
|                             |              | sectionNumber | String |              |
|                             |              | schoolId      | String |              |

### `POST /api/v1/classrooms/join`

This will add the currently active user to the classroom referenced by the given invitation code. The return status is based on whether the user successfully **belongs** to the classroom, so the success status is true if the user had previously belonged to the classroom or they were successfully added to the roster. Pass the invitation code in the request:

| Route                     | Request Type | Variables  | Type   | Required (*) |
| ------------------------- | ------------ | ---------- | ------ | ------------ |
| `/api/v1/classrooms/join` | POST         | inviteCode | String | *            |

### `PUT /api/v1/classrooms/:classroomId/code/:type`

This route is used to rotate an invite code for a classroom you are a teacher of. The `type` in the route should be either `teacher`, `teacherAssistant`, or `student`. 

| Route                                    | Request Type | Variables   | Type   | Required (*) |
| ---------------------------------------- | ------------ | ----------- | ------ | ------------ |
| `/api/v1/classrooms/:classroomId/code/:type` | PUT          | classroomId | String | *            |
|                                          |              | type        | String | *            |

### `DELETE /api/v1/classrooms/:classroomId/:type/:userId`

This route is used to remove a user of a specific type from the classroom. The `type` in the route should be either `teacher`, `teacherAssistant`, or `student`.

| Route                                    | Request Type | Variables   | Type   | Required (*) |
| ---------------------------------------- | ------------ | ----------- | ------ | ------------ |
| `/api/v1/classrooms/:classroomId/:type/:userId` | PUT          | classroomId | String | *            |
|                                          |              | type        | String | *            |
|                                          |              | userId      | String | *            |

### `POST /api/v1/classrooms/:classroomId/leave`

This route is used to have the user of this session leave the classroom identified by `classroomId`. Classes **can** be orphaned by this method if the user is the last teacher of the classroom and no invite codes are retained. 

### `POST /api/v1/classrooms/:classroomId/questions`

This route allows you to post questions to a specific classroom. The following JSON body should be provided:

```js
{
  "question":"How do I ask questions?"
}
```

The schema of an `Question` is described in the following JSON. If you would like to get a listing of answers, you would do so by getting the classroom, or `GET /api/v1/classrooms/:classroomId`. 

```js
{
	"ts": 1511037292522,	// timestamp
	"question": "How do you ask questions?",
	"_id": "5a10996c26d846000fbed992",
	"answers": [Answer],
	"votes": [UserId],
	"resolution": -1,	// top-vote / official answer
	"mine": false,	// were you the user who submitted this question
	"isTeacher": true	// was the user who submitted this question a teacher
}
```

### `POST /api/v1/classrooms/:classroomId/question/:questionId/answer`

This route allows you to post answers to a given question in a classroom. The following table describes the route and the JSON body thereafter describes the template that should be provided in the body of the request. 

| Route | Request Type | Variables   | Type   | Required (*) |
| ----- | ------------ | ----------- | ------ | ------------ |
| ^^    | POST         | classroomId | String | *            |
|       |              | questionId  | String | *            |
|       |              | answer      | String | *            |

```js
{
  "answer":"You POST a question to this route"
}
```

The following JSON describes the schema of an `Answer`, which is drastically familiar to the `Question` schema.

```js
{
	"ts": 1511060730584,	// timestamp
	"answer": "Like this you idiot",
	"_id": "5a10f4fa28932a000f1d11a4",
	"votes": [UserId],
	"mine": true,	// whether you submitted this answer
	"isTeacher": false	// where a teacher submitted this answer
}
```

### `PUT /api/v1/classrooms/:classroomId/questions/:questionId`

This route allows you to vote for a question by the given `questionId`. Votes are meant to be used for noting a question as something the user is also hoping for guidance with. The following JSON body should be provided:

```js
{
  "up": true
}
```

### `PUT /api/v1/classrooms/:classroomId/questions/:questionId/answers/:answerId`

This route allows you to vote for an answer, referenced by `answerId`, that belongs to the question referenced by `questionId`.  Votes for answers are meant to note it as being a helpful response. The following JSON body should be provided:

```js
{
  "up": false
}
```

### `GET /api/v1/classrooms/:classroomId/topics`

This route allows you to get the current list of topics for a classroom. It will return a JSON body containing the following:

```js
{
  "success": true,
  "topics": [String],
  "index": 0
}
```

### `GET /api/v1/classrooms/:classroomId/topics/current`

This route returns only the current topic for a classroom, which will be in a JSON body such as the following:

```js
{
  "success": true,
  "topic": "The current classroom topic"
}
```

### `PUT /api/v1/classrooms/:classroomId/topics/:direction`

This route is used for moving the next or previous topic in the classroom. This is meant for use by the teacher only and will have no effect if done by a student or teacher assistant. `direction` is a variable that should be either `next` or `previous`. 

| Route | Request Type | Variable    | Type   | Required (*) |
| ----- | ------------ | ----------- | ------ | ------------ |
| ^^    | PUT          | classroomId | String | *            |
|       |              | direction   | String | *            |

### `POST /api/v1/classrooms/:classroomId/topics`

This route is used to update the topics in a classroom. This is for teachers use only. This will update the topics in the classroom with the array provided in the body property `topics`. If no `topics` is provided, the classroom topics will be emptied and set to the default `["General"]`. The following JSON body is an example of a topics update:

```js
{
  "topics": ["Introduction", "Syllabus", "Exam Details", "Grading"]
}
```

# <a name="api-v1-schools"> /api/v1/schools </a>

### `GET /api/v1/schools`

This returns a listing of all schools in the database. 

| Route             | Request Type | Variables | Type   | Required (*) |
| ----------------- | ------------ | --------- | ------ | ------------ |
| `/api/v1/schools` | GET          | name      | String |              |
|                   |              | address   | String |              |
|                   |              | city      | String |              |
|                   |              | state     | String |              |
|                   |              | country   | String |              |
|                   |              | zip       | String |              |
|                   |              | domain    | String |              |

The returned JSON object is an array of schools with the following structure:

```js
[
    {
        "_id": "schoolId",
        "name": "Oakland University",
        "address": "University Dr",
        "city": "Auburn Hills",
        "state": "MI",
        "country": "USA",
        "zip": 48309,
        "domain": "oakland.edu"
    },
    {
        // ...
    }
]
```

### `GET /api/v1/schools/search/:query`

This route is being added so that schools can be searched and used to create classrooms for. The `query` contains the string to search for in the database, returning any school that matches on a wildcarded search of this string. 

### `POST /api/v1/schools`

This creates a new school in the database.

| Route             | Request Type | Variables | Type   | Required (*) |
| ----------------- | ------------ | --------- | ------ | ------------ |
| `/api/v1/schools` | POST         | name      | String | *            |
|                   |              | address   | String |              |
|                   |              | city      | String | *            |
|                   |              | state     | String | *            |
|                   |              | country   | String | *            |
|                   |              | zip       | String |              |
|                   |              | domain    | String |              |

### `PUT /api/v1/schools/id/$id`

This modifies an existing school in the database matching the given `$id`.

| Route             | Request Type | Variables | Type   | Required (*) |
| ----------------- | ------------ | --------- | ------ | ------------ |
| `/api/v1/schools` | PUT          | schoolId  | String |              |
|                   |              | name      | String |              |
|                   |              | address   | String |              |
|                   |              | city      | String |              |
|                   |              | state     | String |              |
|                   |              | country   | String |              |
|                   |              | zip       | String |              |
|                   |              | domain    | String |              |


