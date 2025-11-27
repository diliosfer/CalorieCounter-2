// src/screens/DishesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView
} from 'react-native';
import { getDishes, addDish, deleteDish, getProducts } from '../database/db';

const DishesScreen = () => {
  const [dishes, setDishes] = useState([]);
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDish, setNewDish] = useState({
    name: '',
    ingredients: []
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ingredientWeight, setIngredientWeight] = useState('');

  useEffect(() => {
    loadDishes();
    loadProducts();
  }, []);

  const loadDishes = () => {
    const result = getDishes();
    if (result.success) {
      setDishes(result.data);
    }
  };

  const loadProducts = () => {
    const result = getProducts();
    if (result.success) {
      setProducts(result.data);
    }
  };

  // Функция для открытия модального окна с обновлением данных
  const openModal = () => {
    loadProducts(); // Обновляем список продуктов перед открытием
    setModalVisible(true);
  };

  const handleAddDish = () => {
    const { name, ingredients } = newDish;

    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите название блюда');
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert('Ошибка', 'Добавьте хотя бы один ингредиент');
      return;
    }

    const result = addDish(name.trim(), ingredients);

    if (result.success) {
      loadDishes();
      setModalVisible(false);
      setNewDish({ name: '', ingredients: [] });
      setSelectedProduct(null);
      setIngredientWeight('');
      Alert.alert('Успех', 'Блюдо добавлено!');
    } else {
      Alert.alert('Ошибка', 'Не удалось добавить блюдо');
    }
  };

  // Остальные функции остаются без изменений...
  const handleDeleteDish = (dishId, dishName) => {
    Alert.alert(
      'Удаление блюда',
      `Вы уверены, что хотите удалить "${dishName}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            const result = deleteDish(dishId);
            if (result.success) {
              loadDishes();
              Alert.alert('Успех', 'Блюдо удалено');
            } else {
              Alert.alert('Ошибка', 'Не удалось удалить блюдо');
            }
          }
        }
      ]
    );
  };

  const addIngredient = () => {
    if (!selectedProduct || !ingredientWeight || parseFloat(ingredientWeight) <= 0) {
      Alert.alert('Ошибка', 'Выберите продукт и укажите вес');
      return;
    }

    const existingIngredient = newDish.ingredients.find(
      ing => ing.product.id === selectedProduct.id
    );

    if (existingIngredient) {
      Alert.alert('Ошибка', 'Этот продукт уже добавлен в блюдо');
      return;
    }

    setNewDish({
      ...newDish,
      ingredients: [
        ...newDish.ingredients,
        {
          product: selectedProduct,
          weight: parseFloat(ingredientWeight)
        }
      ]
    });

    setSelectedProduct(null);
    setIngredientWeight('');
  };

  const removeIngredient = (productId) => {
    setNewDish({
      ...newDish,
      ingredients: newDish.ingredients.filter(ing => ing.product.id !== productId)
    });
  };

  const calculateDishTotals = () => {
    let totalWeight = 0;
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    newDish.ingredients.forEach(ingredient => {
      totalWeight += ingredient.weight;
      totalCalories += (ingredient.product.calories / 100) * ingredient.weight;
      totalProtein += (ingredient.product.protein / 100) * ingredient.weight;
      totalFat += (ingredient.product.fat / 100) * ingredient.weight;
      totalCarbs += (ingredient.product.carbs / 100) * ingredient.weight;
    });

    return {
      totalWeight,
      totalCalories,
      totalProtein,
      totalFat,
      totalCarbs,
      caloriesPer100: totalWeight > 0 ? (totalCalories / totalWeight) * 100 : 0,
      proteinPer100: totalWeight > 0 ? (totalProtein / totalWeight) * 100 : 0,
      fatPer100: totalWeight > 0 ? (totalFat / totalWeight) * 100 : 0,
      carbsPer100: totalWeight > 0 ? (totalCarbs / totalWeight) * 100 : 0
    };
  };

  const renderDish = ({ item }) => (
    <TouchableOpacity
      style={styles.dishItem}
      onLongPress={() => handleDeleteDish(item.id, item.name)}
    >
      <Text style={styles.dishName}>{item.name}</Text>
      <Text style={styles.dishDetails}>
        Общий вес: {item.total_weight.toFixed(1)}г
      </Text>
      <Text style={styles.dishDetails}>
        Калории: {item.total_calories.toFixed(1)} ккал (всего)
      </Text>
      <Text style={styles.dishDetails}>
        {item.calories_per_100.toFixed(1)} ккал на 100г
      </Text>
      <Text style={styles.dishDetails}>
        Б: {item.protein_per_100.toFixed(1)}г | Ж: {item.fat_per_100.toFixed(1)}г | У: {item.carbs_per_100.toFixed(1)}г (на 100г)
      </Text>
      <Text style={styles.deleteHint}>Нажмите и удерживайте для удаления</Text>
    </TouchableOpacity>
  );

  const totals = calculateDishTotals();

  return (
    <View style={styles.container}>
      <FlatList
        data={dishes}
        renderItem={renderDish}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Нет блюд.{'\n'} Добавьте первое!</Text>
        }
      />

      {/* Изменяем вызов на openModal */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={openModal}
      >
        <Text style={styles.addButtonText}>+ Добавить блюдо</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.scrollContent}>
              <Text style={styles.modalTitle}>Добавить блюдо</Text>

              <TextInput
                style={styles.input}
                placeholder="Название блюда"
                placeholderTextColor="#888"
                value={newDish.name}
                onChangeText={(text) => setNewDish({ ...newDish, name: text })}
              />

              <Text style={styles.sectionTitle}>Добавить ингредиент:</Text>
              
              <View style={styles.ingredientForm}>
                <Text style={styles.label}>Выберите продукт:</Text>
                <View style={styles.productsContainer}>
                  {products.map(product => (
                    <TouchableOpacity
                      key={product.id}
                      style={[
                        styles.productButton,
                        selectedProduct?.id === product.id && styles.productButtonSelected
                      ]}
                      onPress={() => setSelectedProduct(product)}
                    >
                      <Text style={[
                        styles.productButtonText,
                        selectedProduct?.id === product.id && styles.productButtonTextSelected
                      ]}>
                        {product.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Вес (г)"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={ingredientWeight}
                  onChangeText={setIngredientWeight}
                />

                <TouchableOpacity
                  style={styles.addIngredientButton}
                  onPress={addIngredient}
                >
                  <Text style={styles.addIngredientButtonText}>+ Добавить ингредиент</Text>
                </TouchableOpacity>
              </View>

              {newDish.ingredients.length > 0 && (
                <View style={styles.ingredientsList}>
                  <Text style={styles.sectionTitle}>Ингредиенты:</Text>
                  {newDish.ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.ingredientItem}>
                      <Text style={styles.ingredientText}>
                        {ingredient.product.name} - {ingredient.weight}г
                      </Text>
                      <TouchableOpacity
                        style={styles.removeIngredientButton}
                        onPress={() => removeIngredient(ingredient.product.id)}
                      >
                        <Text style={styles.removeIngredientButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {newDish.ingredients.length > 0 && (
                <View style={styles.totalsContainer}>
                  <Text style={styles.sectionTitle}>Расчет КБЖУ:</Text>
                  <Text style={styles.totalsText}>Общий вес: {totals.totalWeight.toFixed(1)}г</Text>
                  <Text style={styles.totalsText}>Калории: {totals.totalCalories.toFixed(1)} ккал</Text>
                  <Text style={styles.totalsText}>Белки: {totals.totalProtein.toFixed(1)}г</Text>
                  <Text style={styles.totalsText}>Жиры: {totals.totalFat.toFixed(1)}г</Text>
                  <Text style={styles.totalsText}>Углеводы: {totals.totalCarbs.toFixed(1)}г</Text>
                  <Text style={styles.totalsText}>На 100г:</Text>
                  <Text style={styles.totalsText}>
                    {totals.caloriesPer100.toFixed(1)} ккал | Б: {totals.proteinPer100.toFixed(1)}г | 
                    Ж: {totals.fatPer100.toFixed(1)}г | У: {totals.carbsPer100.toFixed(1)}г
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewDish({ name: '', ingredients: [] });
                  setSelectedProduct(null);
                  setIngredientWeight('');
                }}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddDish}
              >
                <Text style={styles.modalButtonText}>Сохранить блюдо</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Стили остаются без изменений...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#363635',
    padding: 16,
  },
  list: {
    flex: 1,
  },
  dishItem: {
    backgroundColor: '#16191d',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  dishName: {
    color: '#bba942',
    fontSize: 16,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  dishDetails: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
  },
  deleteHint: {
    color: '#888',
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#bba942',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#16191d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#9e9d9dff',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#363635',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  scrollContent: {
    padding: 20,
  },
  modalTitle: {
    color: '#bba942',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#16191d',
    color: '#fff',
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bba942',
  },
  sectionTitle: {
    color: '#bba942',
    fontSize: 16,
    marginTop: 15,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  ingredientForm: {
    marginBottom: 15,
  },
  label: {
    color: '#fff',
    marginBottom: 10,
    fontSize: 14,
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  productButton: {
    backgroundColor: '#16191d',
    padding: 8,
    borderRadius: 5,
    margin: 4,
    borderWidth: 1,
    borderColor: '#555',
  },
  productButtonSelected: {
    backgroundColor: '#bba942',
    borderColor: '#bba942',
  },
  productButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  productButtonTextSelected: {
    color: '#16191d',
    fontWeight: 'bold',
  },
  addIngredientButton: {
    backgroundColor: '#bba942',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addIngredientButtonText: {
    color: '#16191d',
    fontWeight: 'bold',
  },
  ingredientsList: {
    marginBottom: 15,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16191d',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  ingredientText: {
    color: '#fff',
    flex: 1,
  },
  removeIngredientButton: {
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIngredientButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  totalsContainer: {
    backgroundColor: '#16191d',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  totalsText: {
    color: '#fff',
    marginBottom: 3,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#555',
  },
  modalButton: {
    padding: 12,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  saveButton: {
    backgroundColor: '#bba942',
  },
  modalButtonText: {
    color: '#16191d',
    fontWeight: 'bold',
  },
});

export default DishesScreen;