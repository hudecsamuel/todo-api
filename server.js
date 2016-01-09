var express = require('express');
var app = express();
var PORT = process.env.PORT || 3001;
var bodyParser = require('body-parser');
var _ = require('underscore');

var todos = [];
var nextTodoId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res){
  res.send('todo api root')
});

//GET /todos
app.get('/todos', function(req, res){
  res.json(todos);
});

//GET /todos/:id
app.get('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if(matchedTodo){
    res.json(matchedTodo);
  } else {
    res.status(404).send();
  }
});

//POST /todos
app.post('/todos', function(req, res){
  var body = req.body;
  body = _.pick(body, 'description', 'completed');
  if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
    return res.status(400).send();
  }

  body.description = body.description.trim();
  body.id = nextTodoId++;
  todos.push(body);

  console.log('description: ' + body.description);
  res.json(body);
});


app.listen(PORT, function(){
  console.log('Express listening on port: ' + PORT);
})
