// components/DisposalMap.js
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function DisposalMap() {
  const BACKEND_URL = 'https://hackbackend-0v78.onrender.com';

  const [location, setLocation] = useState(null);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBinName, setNewBinName] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      setLocation(coords);
      setLoading(false);
    })();
  }, []);

  const findNearbyBins = async () => {
    if (!location) return;
    try {
      const { latitude, longitude } = location;
      const { data } = await axios.post(`${BACKEND_URL}/api/user/dispose`, {
        latitude,
        longitude,
      });
      if (data.success) setCenters(data.data);
      else Alert.alert('Error', data.message || 'No bins found.');
    } catch {
      Alert.alert('Error', 'Failed to fetch nearby bins.');
    }
  };

  const submitNewBin = async () => {
    if (!newBinName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for this bin.');
      return;
    }
    setModalVisible(false);
    try {
      const { data } = await axios.post(`${BACKEND_URL}/api/user/bin`, {
        name: newBinName,
        type: 'general',
        latitude: location.latitude,
        longitude: location.longitude,
      });
      console.log("Data ",data);
      if (data.success) {
        Alert.alert('Success', 'Bin location reported.');
        await findNearbyBins(); // refresh
      } else {
        Alert.alert('Error', data.message || 'Could not report bin.');
      }
    } catch {
      Alert.alert('Error', 'Failed to report bin.');
    }
  };

  if (!location) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="earth" size={24} color="#fff" />
        <Text style={styles.headerTitle}>Disposal Centers</Text>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
      >
        {centers.map((c, i) => (
          <Marker
            key={i}
            coordinate={{
              latitude: c.location.coordinates[1],
              longitude: c.location.coordinates[0],
            }}
            title={c.name}
            description={c.type}
            pinColor={
              c.type === 'recyclable'
                ? 'green'
                : c.type === 'hazardous'
                ? 'red'
                : 'gray'
            }
          />
        ))}
      </MapView>

      {/* FABs */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={findNearbyBins}>
          <Ionicons name="locate" size={24} color="#fff" />
          <Text style={styles.fabLabel}>Find Bins</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, styles.fabSecondary]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.fabLabel}>Report Bin</Text>
        </TouchableOpacity>
      </View>

      {/* Report Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add a New Bin</Text>
            <TextInput
              style={styles.input}
              placeholder="Bin name (e.g. Park Entrance)"
              value={newBinName}
              onChangeText={setNewBinName}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSubmit]}
                onPress={submitNewBin}
              >
                <Text style={{ color: '#fff' }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 56,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: { color: '#fff', fontSize: 18, marginLeft: 8, fontWeight: '600' },
  map: { flex: 1 },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    alignItems: 'flex-end',
  },
  fab: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 30,
    marginBottom: 12,
    elevation: 5,
  },
  fabSecondary: { backgroundColor: '#4CAF50' },
  fabLabel: { color: '#fff', fontSize: 14, marginLeft: 6 },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 6,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
  },
  btnCancel: { backgroundColor: '#ddd', marginRight: 8 },
  btnSubmit: { backgroundColor: '#2196F3' },
});