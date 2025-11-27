// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Импортируем навигацию
import Navigation from './src/components/Navigation';

// Импортируем инициализацию базы данных
import { initDatabase } from './src/database/db';

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Navigation />
        <StatusBar style="light" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}