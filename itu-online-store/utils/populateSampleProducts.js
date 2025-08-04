const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '../database/itu_store.sqlite'));

const sampleProducts = [
  { name: 'Gaming Laptop', price: 1200, category: 'Laptops', image: 'laptop1.jpg' },
  { name: 'Ultrabook', price: 900, category: 'Laptops', image: 'laptop2.jpg' },
  { name: 'Mechanical Keyboard', price: 150, category: 'Accessories', image: 'keyboard1.jpg' },
  { name: 'Gaming Mouse', price: 80, category: 'Accessories', image: 'mouse1.jpg' },
  { name: '4K Monitor', price: 300, category: 'Monitors', image: 'monitor1.jpg' },
  { name: '1080p Monitor', price: 150, category: 'Monitors', image: 'monitor2.jpg' },
  { name: 'Gaming Chair', price: 250, category: 'Furniture', image: 'chair1.jpg' },
  { name: 'Office Chair', price: 200, category: 'Furniture', image: 'chair2.jpg' },
  { name: 'External SSD', price: 100, category: 'Storage', image: 'ssd1.jpg' },
  { name: 'External HDD', price: 80, category: 'Storage', image: 'hdd1.jpg' }
];

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, price REAL, category TEXT, image TEXT)');

  const stmt = db.prepare('INSERT INTO products (name, price, category, image) VALUES (?, ?, ?, ?)');
  sampleProducts.forEach(product => {
    stmt.run(product.name, product.price, product.category, product.image);
  });
  stmt.finalize();

  console.log('Sample products added to the database.');
});

db.close();
