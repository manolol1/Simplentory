const sqlite3 = require("sqlite3").verbose();

// Create a new SQLite database or open an existing one
const db = new sqlite3.Database("simplentory.db", (err) => {
  if (err) {
    console.error("Failed to connect to the database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Create the categories table
const createCategoriesTableQuery = `
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
`;

// Create the products table with foreign key constraint
const createProductsTableQuery = `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    stock INTEGER NOT NULL,
    categoryId INTEGER NOT NULL,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
  );
`;

// Create the settings table
const createSettingsTableQuery = `
  CREATE TABLE IF NOT EXISTS settings (
    customname TEXT,
    theme TEXT
  );
`;

// Create the default_flags table
const createDefaultFlagsTableQuery = `
  CREATE TABLE IF NOT EXISTS default_flags (
    id INTEGER PRIMARY KEY,
    defaults_added INTEGER NOT NULL DEFAULT 0
  );
`;

// Insert the default row into the settings table if it doesn't exist
db.serialize(() => {
  db.run(createCategoriesTableQuery, (err) => {
    if (err) {
      console.error("Error creating categories table:", err.message);
    } else {
      console.log("Categories table created successfully.");
    }
  });

  db.run(createProductsTableQuery, (err) => {
    if (err) {
      console.error("Error creating products table:", err.message);
    } else {
      console.log("Products table created successfully.");
    }
  });

  db.run(createSettingsTableQuery, (err) => {
    if (err) {
      console.error("Error creating settings table:", err.message);
    } else {
      console.log("Settings table created successfully.");

      // Check if the settings table is empty
      db.get("SELECT COUNT(*) AS count FROM settings", (err, row) => {
        if (err) {
          console.error("Error checking settings table:", err.message);
        } else if (row.count === 0) {
          // Add the default custom name and theme if the table is empty
          const insertDefaultSettingsQuery = `INSERT INTO settings (customname, theme) VALUES (?, ?)`;
          db.run(insertDefaultSettingsQuery, ["Simplentory", "simplentory_green"], (err) => {
            if (err) {
              console.error("Error inserting default settings:", err.message);
            } else {
              console.log("Default settings added successfully.");
            }
          });
        } else {
          console.log("Settings table already contains data.");
        }
      });
    }
  });

  db.run(createDefaultFlagsTableQuery, (err) => {
    if (err) {
      console.error("Error creating default_flags table:", err.message);
    } else {
      console.log("Default_flags table created successfully.");

      // Check if the default values have been added
      db.get("SELECT defaults_added FROM default_flags WHERE id = 1", (err, row) => {
        if (err) {
          console.error("Error checking default_flags:", err.message);
        } else if (!row || row.defaults_added === 0) {
          // Add the default values if they haven't been added
          db.serialize(() => {
            // Add default "General" category
            const insertDefaultCategoryQuery = `INSERT INTO categories (name) VALUES (?)`;
            db.run(insertDefaultCategoryQuery, ["General"], (err) => {
              if (err) {
                console.error("Error inserting default category:", err.message);
              } else {
                console.log("Default category added successfully.");
              }
            });

            // Add default "Example" product
            const insertDefaultProductQuery = `INSERT INTO products (name, stock, categoryId) VALUES (?, ?, ?)`;
            db.run(insertDefaultProductQuery, ["Example", 0, 1], (err) => {
              if (err) {
                console.error("Error inserting default product:", err.message);
              } else {
                console.log("Default product added successfully.");
              }
            });

            // Update the defaults_added flag to indicate the default values have been added
            db.run("INSERT OR REPLACE INTO default_flags (id, defaults_added) VALUES (?, ?)", [1, 1], (err) => {
              if (err) {
                console.error("Error updating default_flags:", err.message);
              } else {
                console.log("Default values added and default_flags updated.");
              }
            });
          });
        } else {
          console.log("Default values have already been added.");
        }
      });
    }
  });
});

module.exports = db;