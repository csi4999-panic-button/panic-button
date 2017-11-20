# Socket.io Documentation

The following entries describe the events available to socket.io clients connected to a `panicd` server.

After first connecting, the client socket must emit an event to login to the service. This event is called `login`, which will simply be a string containing the users API token.

After sending this event, the socket should expect a `login_success` event, whose body will be a boolean of whether the user was successfully logged in.

Once the `login_success` event has been received containing `true`, the client is ready to listen for and emit events to the `panicd` server. 

## Socket.io Event Index

These events include (and are generally related row-wise):

| Client emits                      | Server emits                             |
| --------------------------------- | ---------------------------------------- |
| [`login`](#login)                 | [`login_success`](#login_success)        |
| [`panic`](#panic)                 | [`panic`](#panic)                        |
|                                   | [`panic_state_change`](#panic_state_change) |
| [`topic_change`](#topic_change)   | [`topic_change`](#topic_change)          |
|                                   | [`new_question`](#new_question)          |
|                                   | [`new_answer`](#new_answer)              |
| [`question_vote`](#question_vote) | [`question_vote_change`](#question_vote_change) |
|                                   | [`question_vote`](#question_vote)        |
| [`answer_vote`](#answer_vote)     | [`answer_vote_change`](#answer_vote_change) |
|                                   | [`answer_vote`](#answer_vote)            |

## Socket.io Event Specification

The following specifications give detail to what user roles should use emit or listen for which events.

### login

**[Client]** The `login` event is used by the client to initiate a socket connection with the server. The body of the event should contain **only a string**, the `apiToken`. See REST documentation for `/api/v1/authenticate` to retrieve your API token:

```json
"exampleUserApiToken"
```

### login_success

**[Server]** The `login_success` event is used by the server after receiving a "login" event from a client. Upon verifying the user ID associated with the API token, the server will hook the socket connection to the existing socket if one has been created previously, as well as joining the user to all classroom sockets they belong to and further server-side logic for socket management internally. If the API token is associated with a user ID, the `login_success` will return a boolean of `true`, otherwise it will return `false`.

```json
true
```

### panic

**[Client/Server]** The `panic` event is used by both client-side and server-side. It is used by clients to notify the server of their current panic state. From the client-side, the emitted event should contain the body:

```json
{
    "classroom": "classroomId",
    "state": true
}
```

It is used by the server to notify all users belonging to the classroom of the current number of users in a panic state. From the server side, the emitted event should contain a body like:

```json
{
    "classroom": "classroomId",
    "panicNumber": 12
}
```

### panic\_state\_change

**[Server]** The `panic_state_change` event is used by the server to notify the client that their panic state has been changed. This can be a result of the user having emitted a `panic` event containing a `true` state or by the classrooms timeout feature. **This is the suggested method of handling client-side state variables**. The body of the event contains:

```json
{
    "classroom": "classroomId",
    "state": true
}
```

### topic_change

**[Client/Server]** The `topic_change` event is used by both the client and server. However, the only clients that can successfully perform the topic change are users who are teachers of the classroom. The client would emit an event with body like:

```json
{
    "classroom": "classroomId",
    "next": false,
    "previous": true
}
```

The server sends `topic_change` events to notify clients of the current topic in the classroom. Clients should expect the body of the emitted event to contain:

```json
{
    "classroom": "classroomId",
    "topic": "Second Class Topic",
    "first": false,
    "last": false
}
```

### new_question

**[Server]** The `new_question` event is used by the server to notify clients in the classroom of an update to the question listing. The returned body will also contain the total number of questions in the database, so in the case of the client containing the incorrect number of question in their list, the client can initiate a request to get the full list by requesting `GET /api/v1/classrooms/:classroomId`, which will contain the `questions` array which can be used to update their full list. An example body of the response would be:

```json
{
    "classroom": "classroomId",
    "questionId": "questionId",
    "questionStr": "How do you put your pants on in the morning?",
    "numberOfQuestions": 4
}
```

### new_answer

**[Server]** The `new_answer` event is used by the server to notify clients in the classroom of an update to the answer listing. The returned body will also contain the total number of answers in the database, so in the case of the client containing the incorrect number of answer in their list, the client can initiate a request to get the full list by requesting `GET /api/v1/classrooms/:classroomId`, which will contain the `questions` array which can be used to update their full list. An example body of the response would be:

```json
{
    "classroom": "classroomId",
    "questionId": "questionId",
    "answerId": "answerId",
    "answerStr": "One leg at a time, boys",
    "numberOfQuestions": 4
}
```

### question_vote

**[Client/Server]** The `question_vote` event is used by the client to tell the server to vote a specific way towards a question. The body of the event should contain an `up` property that says whether the user agrees with the question. This is used as a mean of determining what areas students are struggling in and also how many. **There is not a downvote system in place, users can simply agree on an area of confusion or not**. An example of the client-side body would be:

```json
{
    "classroom": "classroomId",
    "question": "questionId",
    "up": true
}
```

On the server-side, the `question_vote` event is used to notify all users of the classroom of the current total of votes on a specific question. An example server event would be:

```json
{
    "classroom": "classroomId",
    "question": "questionId",
    "votes": 12
}
```

### question\_vote\_change

**[Server]** The server will also emit a `question_vote_change` event back to a user after they update their vote state on a question. The body of this event would contain:

```json
{
    "classroom": "classroomId",
    "question": "questionId",
    "state": true
}
```

### answer_vote

**[Client/Server]** The `answer_vote` event is used by the client to tell the server to vote a specific way towards a question. The body of the event should contain an `up` property that says whether the user agrees with the question. This is used as a mean of determining what areas students are struggling in and also how many. **There is not a downvote system in place, users can simply agree on an area of confusion or not**. An example of the client-side body would be:

```json
{
    "classroom": "classroomId",
    "question": "questionId",
    "answer": "answerId",
    "up": false
}
```

On the server-side, the `answer_vote` event is used to notify all users of the classroom of the current total of votes on a specific question. An example server event would be:

```json
{
    "classroom": "classroomId",
    "question": "questionId",
    "answer": "answerId",
    "votes": 0
}
```

### answer\_vote\_change

**[Server]** The server will also emit a `answer_vote_change` event back to a user after they update their vote state on a answer. The body of this event would contain:

```json
{
    "classroom": "classroomId",
    "question": "questionId",
    "answer": "answerId",
    "state": false
}
```