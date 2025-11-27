// src/screens/CalculatorScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Добавляем этот хук
import { getProducts, getDishes } from '../database/db';

const CalculatorScreen = () => {
  const [products, setProducts] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0
  });

  // Используем useFocusEffect для обновления данных при каждом открытии экрана
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = () => {
    const productsResult = getProducts();
    const dishesResult = getDishes();

    if (productsResult.success) {
      setProducts(productsResult.data);
    }
    if (dishesResult.success) {
      setDishes(dishesResult.data);
    }
  };

  useEffect(() => {
    calculateTotals();
  }, [selectedItems]);

  const addProductToCalculator = (product) => {
    const newItem = {
      id: `product_${product.id}_${Date.now()}`,
      type: 'product',
      name: product.name,
      weight: 100,
      caloriesPer100: product.calories,
      proteinPer100: product.protein,
      fatPer100: product.fat,
      carbsPer100: product.carbs,
      calculatedCalories: product.calories,
      calculatedProtein: product.protein,
      calculatedFat: product.fat,
      calculatedCarbs: product.carbs
    };

    setSelectedItems(prevItems => [...prevItems, newItem]);
  };

  const addDishToCalculator = (dish) => {
    const newItem = {
      id: `dish_${dish.id}_${Date.now()}`,
      type: 'dish',
      name: dish.name,
      weight: 100,
      caloriesPer100: dish.calories_per_100,
      proteinPer100: dish.protein_per_100,
      fatPer100: dish.fat_per_100,
      carbsPer100: dish.carbs_per_100,
      calculatedCalories: dish.calories_per_100,
      calculatedProtein: dish.protein_per_100,
      calculatedFat: dish.fat_per_100,
      calculatedCarbs: dish.carbs_per_100
    };

    setSelectedItems(prevItems => [...prevItems, newItem]);
  };

  const updateItemWeight = (itemId, newWeight) => {
    setSelectedItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const weight = parseFloat(newWeight) || 0;
          return {
            ...item,
            weight,
            calculatedCalories: (item.caloriesPer100 / 100) * weight,
            calculatedProtein: (item.proteinPer100 / 100) * weight,
            calculatedFat: (item.fatPer100 / 100) * weight,
            calculatedCarbs: (item.carbsPer100 / 100) * weight
          };
        }
        return item;
      })
    );
  };

  const removeItem = (itemId) => {
    setSelectedItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const calculateTotals = () => {
    const newTotals = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    };

    selectedItems.forEach(item => {
      newTotals.calories += item.calculatedCalories || 0;
      newTotals.protein += item.calculatedProtein || 0;
      newTotals.fat += item.calculatedFat || 0;
      newTotals.carbs += item.calculatedCarbs || 0;
    });

    setTotals(newTotals);
  };

  const clearAll = () => {
    Alert.alert(
      'Очистка',
      'Очистить все выбранные продукты и блюда?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: () => setSelectedItems([])
        }
      ]
    );
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => addProductToCalculator(item)}
    >
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemDetails}>
        {item.calories?.toFixed(1) || 0} ккал на 100г
      </Text>
    </TouchableOpacity>
  );

  const renderDish = ({ item }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => addDishToCalculator(item)}
    >
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemDetails}>
        {item.calories_per_100?.toFixed(1) || 0} ккал на 100г
      </Text>
    </TouchableOpacity>
  );

  const renderSelectedItem = ({ item }) => (
    <View style={styles.selectedItem}>
      <View style={styles.selectedItemInfo}>
        <Text style={styles.selectedItemName}>{item.name}</Text>
        <Text style={styles.selectedItemDetails}>
          {item.calculatedCalories?.toFixed(1) || 0} ккал
        </Text>
      </View>
      <View style={styles.weightControl}>
        <TextInput
          style={styles.weightInput}
          value={item.weight?.toString() || '0'}
          keyboardType="numeric"
          onChangeText={(text) => updateItemWeight(item.id, text)}
        />
        <Text style={styles.weightLabel}>г</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item.id)}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Секция итогов */}
      <View style={styles.totalsSection}>
        <Text style={styles.totalsTitle}>ИТОГО ЗА ДЕНЬ:</Text>
        <Text style={styles.totalsText}>
          Калории: {totals.calories.toFixed(1)} ккал
        </Text>
        <Text style={styles.totalsText}>
          Б: {totals.protein.toFixed(1)}г | Ж: {totals.fat.toFixed(1)}г | У: {totals.carbs.toFixed(1)}г
        </Text>
        {selectedItems.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
            <Text style={styles.clearButtonText}>Очистить всё</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Секция выбранных продуктов */}
      {selectedItems.length > 0 && (
        <View style={styles.selectedSection}>
          <Text style={styles.sectionTitle}>Выбранные продукты и блюда:</Text>
          <FlatList
            data={selectedItems}
            renderItem={renderSelectedItem}
            keyExtractor={item => item.id}
            style={styles.selectedList}
          />
        </View>
      )}

      {/* Секция выбора продуктов */}
      <View style={styles.selectionSection}>
        <Text style={styles.sectionTitle}>Добавить продукт:</Text>
        {products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
          />
        ) : (
          <Text style={styles.emptyText}>Нет доступных продуктов</Text>
        )}
      </View>

      {/* Секция выбора блюд */}
      <View style={styles.selectionSection}>
        <Text style={styles.sectionTitle}>Добавить блюдо:</Text>
        {dishes.length > 0 ? (
          <FlatList
            data={dishes}
            renderItem={renderDish}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
          />
        ) : (
          <Text style={styles.emptyText}>Нет доступных блюд</Text>
        )}
      </View>
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
  totalsSection: {
    backgroundColor: '#16191d',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  totalsTitle: {
    color: '#bba942',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  totalsText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  clearButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 5,
    marginTop: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedSection: {
    marginBottom: 16,
  },
  selectionSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#bba942',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectedList: {
    maxHeight: 200,
  },
  horizontalList: {
    marginBottom: 8,
  },
  itemCard: {
    backgroundColor: '#16191d',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 140,
    height: 70,
    justifyContent: 'center',
  },
  itemName: {
    color: '#bba942',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDetails: {
    color: '#fff',
    fontSize: 12,
  },
  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16191d',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedItemInfo: {
    flex: 1,
  },
  selectedItemName: {
    color: '#bba942',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedItemDetails: {
    color: '#fff',
    fontSize: 12,
  },
  weightControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightInput: {
    backgroundColor: '#363635',
    color: '#fff',
    padding: 4,
    borderRadius: 4,
    width: 60,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#bba942',
  },
  weightLabel: {
    color: '#fff',
    marginLeft: 4,
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#9e9d9dff',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 18,
  },
});

export default CalculatorScreen;