// src/components/Navigation.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Импортируем экраны
import ProductsScreen from '../screens/ProductsScreen';
import DishesScreen from '../screens/DishesScreen';
import CalculatorScreen from '../screens/CalculatorScreen';

const Tab = createBottomTabNavigator();

const Navigation = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Продукты') {
            iconName = focused ? 'nutrition' : 'nutrition-outline';
          } else if (route.name === 'Блюда') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Калькулятор') {
            iconName = focused ? 'calculator' : 'calculator-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Настройки нижней панели
        tabBarStyle: {
          backgroundColor: '#16191d',
          borderTopWidth: 0,
          height: 80 + insets.bottom, // Учитываем нижний отступ безопасной зоны
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: 'bold',
          marginBottom: 5,
        },
        tabBarActiveTintColor: '#bba942',
        tabBarInactiveTintColor: '#888',
        
        // Настройки шапки
        headerStyle: {
          backgroundColor: '#16191d',
          height: 50 + insets.top, // Учитываем верхний отступ безопасной зоны
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          color: '#bba942',
          fontSize: 24,
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
        headerTitleContainerStyle: {
          paddingBottom: 10,
        },
      })}
    >
      <Tab.Screen 
        name="Продукты" 
        component={ProductsScreen}
        options={{ title: 'Мои продукты' }}
      />
      <Tab.Screen 
        name="Блюда" 
        component={DishesScreen}
        options={{ title: 'Мои блюда' }}
      />
      <Tab.Screen 
        name="Калькулятор" 
        component={CalculatorScreen}
        options={{ title: 'Калькулятор КБЖУ' }}
      />
    </Tab.Navigator>
  );
};

export default Navigation;