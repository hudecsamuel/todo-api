var bcrypt = require('bcrypt');
var _ = require('underscore');

module.exports = function(sequelize, DataTypes) {

  var user = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    salt: {
      type: DataTypes.STRING
    },
    password_hash: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        len: [7, 100]
      },
      set: function(value) {
        var salt = bcrypt.genSaltSync(10);
        var hashedPassword = bcrypt.hashSync(value, salt);

        this.setDataValue('password', value);
        this.setDataValue('salt', salt);
        this.setDataValue('password_hash', hashedPassword);
      }
    }
  }, {
    hooks: {
      beforeValidate: function(user, options) {
        if(typeof user.email === 'string'){
          user.email = user.email.toLowerCase();
        }
      }
    },
    classMethods: {
      authenticate: function(body){
        return new Promise(function(resolve, reject) {

            if (typeof body.email !== 'string' || typeof body.password !== 'string'){
              var error = new Error({status:400, message: "Invalid email or password field."});
              return reject(error);
            }
          
            body.email = body.email.toLowerCase();


            user.findOne({where: {
              email: body.email
            }}).then(function(user){
              if(!user || !bcrypt.compareSync(body.password, user.get('password_hash'))){
                var error = new Error({status:401, message: "User with specified email not found."});
                return reject(error);
              }

              resolve(user);

            }, function(err){
              var error = new Error({status:500, message: err});
              reject(error);
            });
        });
      }
    },
    instanceMethods: {
      toPublicJSON: function() {
        var json = this.toJSON();
        return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
      }
    }

  });

  return user;

}
