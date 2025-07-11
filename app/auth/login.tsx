import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import { saveToken } from './../utils/authToken';


const BACKEND_URL = 'https://hackbackend-0v78.onrender.com'

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(`${BACKEND_URL}/api/user/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const token = response.data.token;
        if (token) {
          console.log("token ",token)
          await saveToken(token);
        }

        Alert.alert('Login Successful', 'Welcome back!');
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Something went wrong';
      Alert.alert('Login Failed', message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
