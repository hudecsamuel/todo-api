var express = require('express');
var app = express();
var PORT = process.env.PORT || 3001;

var todos = [
  {
  id: 1,
  description: 'Meet mon for lunch',
  completed: false
},
{
  id: 2,
  description: 'Meet mom for lunch',
  completed: false
}];

app.get('/', function(req, res){
  res.send('todo api root')
});

app.listen(PORT, function(){
  console.log('Express listening on port: ' + PORT);
})
