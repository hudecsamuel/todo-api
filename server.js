var express = require('express');
var app = express();
var PORT = process.env.PORT || 3001;
var bodyParser = require('body-parser');

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
  var matchedTodo;

  todos.forEach(function(todo){
    if(todo.id === todoId){
      matchedTodo = todo;
    }
  });

  if(matchedTodo){
    res.json(matchedTodo);
  } else {
    res.status(404).send();
  }
});

//POST /todos
app.post('/todos', function(req, res){
  var body = req.body;
  body.id = nextTodoId++;
  todos.push(body);

  console.log('description: ' + body.description);
  res.json(body);
});


app.listen(PORT, function(){
  console.log('Express listening on port: ' + PORT);
})
