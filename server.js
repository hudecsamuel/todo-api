var express = require('express');
var app = express();
var PORT = process.env.PORT || 3001;
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var todos = [];
var nextTodoId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res){
  res.send('todo api root')
});

//GET /todos
app.get('/todos', function(req, res){
  var query = req.query;
  var where = {};

  if(query.hasOwnProperty('completed') && query.completed === 'true'){
    where.completed = true;
  } else if(query.hasOwnProperty('completed') && query.completed === 'false'){
    where.completed = false;
  }

  if(query.hasOwnProperty('q') && query.q.length > 0){
    where.description = {
      $like: '%' + query.q + '%'
    };
  }

  db.todo.findAll({where: where}).then(function(todos){
    if(!!todos){
      res.json(todos);
    } else {
      res.status(404).json({"error": "Todo not found."})
    }

  }, function(err){
    res.status(500).json({"error": err});
  });

});

//GET /todos/:id
app.get('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id);

  db.todo.findById(todoId).then(function(todo){
    
    if(!!todo){
      //  res.status(401).json(todo);
      res.json(todo.toJSON());
    } else {
      res.status(404).json({"error": "Todo not found."})
    }
  }, function(err){
    res.status(500).json({"error": err})
  });

});

//POST /todos
app.post('/todos', function(req, res){
  var body = _.pick(req.body, 'description', 'completed');

  db.todo.create({
    description: body.description,
    completed: body.completed
  }).then(function(todo){
    res.json(todo.toJSON());
  },function(e){
    res.status(e.status).json(e.message);
  });

  // if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
  //   return res.status(400).json({"error": "Invalid data in requested fields"});
  // }
  //
  // body.description = body.description.trim();
  // body.id = nextTodoId++;
  // todos.push(body);
  //
  // console.log('description: ' + body.description);
  // res.json(body);
});

//DELETE /todos/:id
app.delete('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if(matchedTodo){
    todos = _.without(todos, matchedTodo);
    res.json(matchedTodo);
  } else {
    res.status(404).json({"error": "No todo with specified id found"});
  }

});

//PUT /todos/:id
app.put('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if(!matchedTodo){
    return res.status(404).json({"error": "No todo with specified id found"});
  }

  var body = _.pick(req.body, 'description', 'completed');
  var validAttributes = {};

  if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
    validAttributes.completed = body.completed;
  } else if(body.hasOwnProperty('completed')){
    return res.status(400).json({"error": "Invalid data in 'completed' field"});
  }

  if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
    validAttributes.description = body.description.trim();
  } else if(body.hasOwnProperty('description')){
    return res.status(400).json({"error": "Invalid data in 'description' field"});
  }

  _.extend(matchedTodo, validAttributes);

  res.json(matchedTodo);

});

db.sequelize.sync().then(function(){
  app.listen(PORT, function(){
    console.log('Express listening on port: ' + PORT);
  });
});
