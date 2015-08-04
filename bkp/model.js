var DB = require('./db').DB;

var User = DB.Model.extend({
  tableName: 'users',
  idAttribute: 'user_id'
});

module.exports = {
  User: User
};
