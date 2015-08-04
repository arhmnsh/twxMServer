var BookShelf = require('bookshelf');

var config = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'twx',
  charset: 'UTF8_GENERAL_CI'
};

var DB = BookShelf.initialize({
  client: 'mysql',
  connection: config
});

module.exports.DB = DB;
