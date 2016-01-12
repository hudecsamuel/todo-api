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

});

//DELETE /todos/:id
app.delete('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id);

  db.todo.destroy({where:{
    id: todoId
  }}).then(function(rowsDeleted){
    if(rowsDeleted === 0) {
      res.status(404).json({"error": "No todo with specified id found"});
    } else {
      res.status(204).send();
    }
  }, function(err){
    res.status(err.status).json({"error": err.message});
  });

});

//PUT /todos/:id
app.put('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id);
  var body = _.pick(req.body, 'description', 'completed');
  var attributes = {};

  if(body.hasOwnProperty('completed')){
    attributes.completed = body.completed;
  }

  if(body.hasOwnProperty('description')){
    attributes.description = body.description;
  }

  db.todo.findById(todoId)
  .then(function(todo){
    if(todo){
      todo.update(attributes).then(function(todo){
        res.json(todo.toJSON());
      }, function(err){
        res.status(err.status).json({"error": err.message});
      });
    } else {
      res.status(404).json({"error": "Todo with specified id not found."})
    }
  }, function(err){
    res.status(err.status).json({"error": err.message});
  });

});

app.post('/users', function(req, res){
  var body = _.pick(req.body, 'email', 'password');

  db.user.create({
    email: body.email,
    password: body.password
  }).then(function(user){
    res.json(user.toPublicJSON());
  },function(e){
    res.status(400).json(e);
  });

});

db.sequelize.sync().then(function(){
  app.listen(PORT, function(){
    console.log('Express listening on port: ' + PORT);
  });
});
