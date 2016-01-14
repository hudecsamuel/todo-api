var express = require('express');
var app = express();
var PORT = process.env.PORT || 3002;
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware')(db);

var todos = [];
var nextTodoId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res){
  res.send('todo api root')
});

//GET /todos
app.get('/todos', middleware.requireAuthentication, function(req, res){
  var query = req.query;
  var where = {};
  where.userId = req.user.id;

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
app.get('/todos/:id', middleware.requireAuthentication, function(req, res){
  var todoId = parseInt(req.params.id);

  db.todo.findById(todoId).then(function(todo){

    if(!!todo){
      //  res.status(401).json(todo);
      res.status(401).json(todo.toJSON());
    } else {
      res.status(404).json({"error": "Todo not found."})
    }
  }, function(err){
    res.status(500).json({"error": err})
  });

});

//POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res){
  var body = _.pick(req.body, 'description', 'completed');

  db.todo.create(body).then(function(todo){
    req.user.addTodo(todo).then(function(){
      return todo.reload();
    }).then(function(todo){
      res.json(todo.toJSON());
    });
  },function(e){
    res.status(e.status).json(e.message);
  });

});

//DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res){
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
app.put('/todos/:id', middleware.requireAuthentication, function(req, res){
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

//POST /users    ---(register)
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

//POST /users/login
app.post('/users/login', function(req, res){
  var body = _.pick(req.body, 'email', 'password');

  db.user.authenticate(body).then(function(user){
    var token = user.generateToken('authentication');

    if (typeof token !== 'undefined'){
      res.header('Auth', token).json(user.toPublicJSON());
    }

    res.status(401).send();

  }, function(error){
    res.status(401).send();
  });

});

db.sequelize.sync({
  // force: true
}).then(function(){
  app.listen(PORT, function(){
    console.log('Express listening on port: ' + PORT);
  });
});
