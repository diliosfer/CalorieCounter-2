// src/database/db.js
import * as SQLite from 'expo-sqlite';

// Открываем базу данных
const database = SQLite.openDatabaseSync('calories.db');

// Инициализация базы данных
export const initDatabase = () => {
  try {
    // Таблица продуктов
    database.execSync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        protein REAL NOT NULL DEFAULT 0,
        fat REAL NOT NULL DEFAULT 0,
        carbs REAL NOT NULL DEFAULT 0,
        calories REAL NOT NULL DEFAULT 0
      );
    `);

    // Таблица блюд
    database.execSync(`
      CREATE TABLE IF NOT EXISTS dishes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        total_weight REAL NOT NULL DEFAULT 0,
        total_calories REAL NOT NULL DEFAULT 0,
        total_protein REAL NOT NULL DEFAULT 0,
        total_fat REAL NOT NULL DEFAULT 0,
        total_carbs REAL NOT NULL DEFAULT 0,
        calories_per_100 REAL NOT NULL DEFAULT 0,
        protein_per_100 REAL NOT NULL DEFAULT 0,
        fat_per_100 REAL NOT NULL DEFAULT 0,
        carbs_per_100 REAL NOT NULL DEFAULT 0
      );
    `);

    // Таблица ингредиентов блюд
    database.execSync(`
      CREATE TABLE IF NOT EXISTS dish_ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dish_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        weight REAL NOT NULL DEFAULT 0,
        FOREIGN KEY (dish_id) REFERENCES dishes (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id)
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Функции для работы с продуктами
export const addProduct = (name, protein, fat, carbs) => {
  try {
    const calories = (protein * 4) + (fat * 9) + (carbs * 4);
    
    const result = database.runSync(
      'INSERT INTO products (name, protein, fat, carbs, calories) VALUES (?, ?, ?, ?, ?)',
      [name, protein, fat, carbs, calories]
    );
    
    return { success: true, id: result.lastInsertRowId };
  } catch (error) {
    console.error('Error adding product:', error);
    return { success: false, error };
  }
};

export const getProducts = () => {
  try {
    const result = database.getAllSync('SELECT * FROM products ORDER BY name');
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting products:', error);
    return { success: false, error };
  }
};

export const deleteProduct = (id) => {
  try {
    database.runSync('DELETE FROM products WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error };
  }
};

// Функции для работы с блюдами
export const addDish = (name, ingredients) => {
  try {
    // Рассчитываем общие показатели блюда
    let totalWeight = 0;
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    ingredients.forEach(ingredient => {
      totalWeight += ingredient.weight;
      totalCalories += (ingredient.product.calories / 100) * ingredient.weight;
      totalProtein += (ingredient.product.protein / 100) * ingredient.weight;
      totalFat += (ingredient.product.fat / 100) * ingredient.weight;
      totalCarbs += (ingredient.product.carbs / 100) * ingredient.weight;
    });

    // Рассчитываем показатели на 100г
    const caloriesPer100 = (totalCalories / totalWeight) * 100;
    const proteinPer100 = (totalProtein / totalWeight) * 100;
    const fatPer100 = (totalFat / totalWeight) * 100;
    const carbsPer100 = (totalCarbs / totalWeight) * 100;

    // Добавляем блюдо в базу
    const dishResult = database.runSync(
      `INSERT INTO dishes (name, total_weight, total_calories, total_protein, total_fat, total_carbs, 
       calories_per_100, protein_per_100, fat_per_100, carbs_per_100) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, totalWeight, totalCalories, totalProtein, totalFat, totalCarbs, 
       caloriesPer100, proteinPer100, fatPer100, carbsPer100]
    );

    const dishId = dishResult.lastInsertRowId;

    // Добавляем ингредиенты
    ingredients.forEach(ingredient => {
      database.runSync(
        'INSERT INTO dish_ingredients (dish_id, product_id, weight) VALUES (?, ?, ?)',
        [dishId, ingredient.product.id, ingredient.weight]
      );
    });

    return { success: true, id: dishId };
  } catch (error) {
    console.error('Error adding dish:', error);
    return { success: false, error };
  }
};

export const getDishes = () => {
  try {
    const result = database.getAllSync('SELECT * FROM dishes ORDER BY name');
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting dishes:', error);
    return { success: false, error };
  }
};

export const deleteDish = (id) => {
  try {
    database.runSync('DELETE FROM dishes WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    console.error('Error deleting dish:', error);
    return { success: false, error };
  }
};

// Функция для получения ингредиентов блюда
export const getDishIngredients = (dishId) => {
  try {
    const result = database.getAllSync(`
      SELECT di.*, p.name, p.protein, p.fat, p.carbs, p.calories 
      FROM dish_ingredients di 
      JOIN products p ON di.product_id = p.id 
      WHERE di.dish_id = ?
    `, [dishId]);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting dish ingredients:', error);
    return { success: false, error };
  }
};

export default database;