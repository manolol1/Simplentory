const express = require("express");
const ejs = require("ejs");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require('body-parser');
const db = require("./db");
const app = express();
const port = 80;

app.set("view engine", "ejs");
app.use(express.static("static"));
app.use(bodyParser.urlencoded({ extended: true }));

function cleanUpOrphanedProducts() {
  db.all('SELECT id FROM products WHERE categoryId NOT IN (SELECT id FROM categories)', (err, orphanedProductIds) => {
    if (err) {
      console.error(err);
      return;
    }

    if (orphanedProductIds.length > 0) {
      const idsToDelete = orphanedProductIds.map((product) => product.id);
      const deleteQuery = `DELETE FROM products WHERE id IN (${idsToDelete.join(', ')})`;

      db.run(deleteQuery, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`Cleaned up ${orphanedProductIds.length} orphaned products.`);
        }
      });
    }
  });
}

app.get('/', (req, res) => {
  db.all('SELECT * FROM categories', (err, categories) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    db.all('SELECT * FROM products', (err, products) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }

      db.get('SELECT customname, theme FROM settings WHERE rowid = 1', (err, settings) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }

        const customName = settings ? settings.customname : 'Simplentory'; // Set a default custom name if not found
        const theme = settings ? settings.theme : 'simplentory_green'; // Set default theme if not found

        res.render('index', { categories, products, customName, theme }); // Pass both customName and theme
      });
    });
  });
});

// Route to render the settings page
app.get('/settings', (req, res) => {
  // Query the categories from the database
  db.all('SELECT * FROM categories', (err, categories) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    // Query the custom name and theme from the settings table
    db.get('SELECT customname, theme FROM settings WHERE rowid = 1', (err, settings) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }

      // Check if the settings row exists and has the customname and theme properties
      const customName = settings ? settings.customname : 'Simplentory'; // Set a default custom name if not found
      const theme = settings ? settings.theme : 'simplentory_green'; // Set default theme if not found

      // Render the settings.ejs template and pass the categories, custom name, and theme variables
      res.render('settings', { categories, customName, theme });
    });
  });
});



// Route to handle saving the theme
app.post('/saveTheme', (req, res) => {
  const theme = req.body.theme;

  // Update the theme in the settings table
  db.run('UPDATE settings SET theme = ? WHERE rowid = 1', [theme], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    res.redirect('/settings');
  });
});

// Route to handle saving the custom name
app.post('/saveCustomName', (req, res) => {
  const customName = req.body.customName;

  // Update the customname in the settings table
  db.run('UPDATE settings SET customname = ? WHERE rowid = 1', [customName], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    res.redirect('/settings');
  });
});


// Route to handle adding a new category
app.post('/addCategory', (req, res) => {
  const categoryName = req.body.categoryName;

  // Insert the new category into the "categories" table
  db.run('INSERT INTO categories (name) VALUES (?)', [categoryName], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    res.redirect('/settings');
  });
});

// Route to handle deleting a category
app.post('/deleteCategory', (req, res) => {
  const categoryId = parseInt(req.body.categoryId);

  // Delete the category from the "categories" table
  db.run('DELETE FROM categories WHERE id = ?', [categoryId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    res.redirect('/settings');
  });
});

// Route to handle adding a new product to a category
app.post('/addProduct', (req, res) => {
  const categoryId = parseInt(req.body.categoryId);
  const productName = req.body.productName;
  const quantity = parseInt(req.body.quantity);

  // Insert the new product into the "products" table
  db.run('INSERT INTO products (name, stock, categoryId) VALUES (?, ?, ?)', [productName, quantity, categoryId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    res.redirect('/');
  });
});

// Route to handle increasing the quantity of a product
app.post('/increaseQuantity', (req, res) => {
  const productId = parseInt(req.body.productId);

  // Update the quantity by incrementing it by 1 in the "products" table
  db.run('UPDATE products SET stock = stock + 1 WHERE id = ?', [productId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    res.redirect('/');
  });
});

// Route to handle decreasing the quantity of a product
app.post('/decreaseQuantity', (req, res) => {
  const productId = parseInt(req.body.productId);

  // Update the quantity by decrementing it by 1 in the "products" table
  db.run('UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0', [productId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    res.redirect('/');
  });
});

// Route to handle editing the quantity of a product
app.post('/editQuantity', (req, res) => {
  const productId = parseInt(req.body.productId);
  const newQuantity = parseInt(req.body.newQuantity);

  // Update the quantity with the new value in the "products" table
  db.run('UPDATE products SET stock = ? WHERE id = ?', [newQuantity, productId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    res.redirect('/');
  });
});

// Route to handle deleting a product
app.post('/deleteProduct', (req, res) => {
  const productId = parseInt(req.body.productId);

  // Delete the product from the "products" table
  db.run('DELETE FROM products WHERE id = ?', [productId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Simplentory is listening on port ${port}!`);
  cleanUpOrphanedProducts();
});
