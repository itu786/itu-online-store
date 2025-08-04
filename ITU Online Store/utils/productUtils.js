const db = require('./db');

// Fetch all products
function getAllProducts(callback) {
  const query = 'SELECT * FROM products';
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching products:', err.message);
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
}

module.exports = { getAllProducts };
