// src/screens/ProductsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { getProducts, addProduct, deleteProduct } from '../database/db';

const ProductsScreen = () => {
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    protein: '',
    fat: '',
    carbs: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const result = getProducts();
    if (result.success) {
      setProducts(result.data);
    }
  };

  const handleAddProduct = () => {
    const { name, protein, fat, carbs } = newProduct;

    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите название продукта');
      return;
    }

    const result = addProduct(
      name.trim(),
      parseFloat(protein) || 0,
      parseFloat(fat) || 0,
      parseFloat(carbs) || 0
    );

    if (result.success) {
      loadProducts();
      setModalVisible(false);
      setNewProduct({ name: '', protein: '', fat: '', carbs: '' });
      Alert.alert('Успех', 'Продукт добавлен!');
    } else {
      Alert.alert('Ошибка', 'Не удалось добавить продукт');
    }
  };

  const handleDeleteProduct = (productId, productName) => {
    Alert.alert(
      'Удаление продукта',
      `Вы уверены, что хотите удалить "${productName}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            const result = deleteProduct(productId);
            if (result.success) {
              loadProducts();
              Alert.alert('Успех', 'Продукт удален');
            } else {
              Alert.alert('Ошибка', 'Не удалось удалить продукт');
            }
          }
        }
      ]
    );
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onLongPress={() => handleDeleteProduct(item.id, item.name)}
    >
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productDetails}>
        Калории: {item.calories.toFixed(1)} ккал
      </Text>
      <Text style={styles.productDetails}>
        Б: {item.protein}г | Ж: {item.fat}г | У: {item.carbs}г
      </Text>
      <Text style={styles.productSubtext}>(на 100 грамм)</Text>
      <Text style={styles.deleteHint}>Нажмите и удерживайте для удаления</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Нет продуктов.{'\n'} Добавьте первый!</Text>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Добавить продукт</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Добавить продукт</Text>

            <TextInput
              style={styles.input}
              placeholder="Название продукта"
              placeholderTextColor="#888"
              value={newProduct.name}
              onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Белки (г на 100г)"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={newProduct.protein}
              onChangeText={(text) => setNewProduct({ ...newProduct, protein: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Жиры (г на 100г)"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={newProduct.fat}
              onChangeText={(text) => setNewProduct({ ...newProduct, fat: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Углеводы (г на 100г)"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={newProduct.carbs}
              onChangeText={(text) => setNewProduct({ ...newProduct, carbs: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddProduct}
              >
                <Text style={styles.modalButtonText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#363635',
    padding: 16,
  },
  list: {
    flex: 1,
  },
  productItem: {
    backgroundColor: '#16191d',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  productName: {
    color: '#bba942',
    fontSize: 16,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  productDetails: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
  },
  productSubtext: {
    color: '#888',
    fontSize: 12,
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
    padding: 20,
    borderRadius: 10,
    width: '80%',
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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

export default ProductsScreen;