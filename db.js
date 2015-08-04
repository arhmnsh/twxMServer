var mysql = require('mysql');

var pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'twx',
  debug: false
});

module.exports.getConnection = function(callback) {
  pool.getConnection(function(err, connection) {
    callback(err, connection);
  });
};
