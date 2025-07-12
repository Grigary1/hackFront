import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Linking
} from 'react-native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

export default function Nearby() {
  const [selectedType, setSelectedType] = useState<'biodegradable' | 'nonBiodegradable' | 'manure'>('biodegradable');
  const [manureList, setManureList] = useState([]);
  const [nonBiodegradableList, setNonBiodegradableList] = useState([]);
  const [loading, setLoading] = useState(false);

  const wasteLocations = {
    biodegradable: [
      {
        id: 1,
        type: 'Food Waste',
        distance: '0.2 km',
        address: 'MG Road',
        amount: '2.5 kg',
        time: '2 hours ago',
        priority: 'high'
      },
      {
        id: 2,
        type: 'Garden Waste',
        distance: '0.5 km',
        address: 'Green Park Avenue',
        amount: '1.8 kg',
        time: '4 hours ago',
        priority: 'medium'
      }
    ]
  };

  useEffect(() => {
    if (selectedType === 'manure') {
      setLoading(true);
      axios
        .get('http://10.0.11.39:8000/api/user/nearby?longitude=77.5946&latitude=12.9716&distanceKm=5')
        .then(res => setManureList(res.data))
        .catch(err => console.error('Manure fetch error:', err))
        .finally(() => setLoading(false));
    } else if (selectedType === 'nonBiodegradable') {
      setLoading(true);
      axios
        .get('http://10.0.11.39:8000/api/user/showdisposenon')
        .then(res => setNonBiodegradableList(res.data.data))
        .catch(err => console.error('Non-biodegradable fetch error:', err))
        .finally(() => setLoading(false));
    }
  }, [selectedType]);

  const getTheme = () => {
    switch (selectedType) {
      case 'biodegradable':
        return { primary: '#10b981', secondary: '#ecfdf5', accent: '#065f46' };
      case 'nonBiodegradable':
        return { primary: '#3b82f6', secondary: '#eff6ff', accent: '#1e40af' };
      case 'manure':
        return { primary: '#a16207', secondary: '#fefce8', accent: '#78350f' };
    }
  };

  const getWasteIcon = (type: string) => {
    const icons: Record<string, string> = {
      'Food Waste': '🍎',
      'Garden Waste': '🌿',
      'Plastic Bottles': '🍼',
      'Paper Waste': '📄',
      'Manure': '💩'
    };
    return icons[type] || '♻️';
  };

  const theme = getTheme();

  const currentLocations =
    selectedType === 'manure'
      ? manureList
      : selectedType === 'nonBiodegradable'
      ? nonBiodegradableList
      : wasteLocations[selectedType];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.accent }]}>
        <Text style={styles.headerTitle}>
          {selectedType === 'manure' ? 'Nearby Manure Listings' : 'Nearby Waste Collection'}
        </Text>
        <Text style={styles.headerSubtitle}>Help clean your community 🌍</Text>
      </View>

      <View style={styles.toggleContainer}>
        {[ 'nonBiodegradable', 'manure'].map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.toggleButton,
              selectedType === type && [styles.toggleButtonActive, { backgroundColor: theme.primary }]
            ]}
            onPress={() => setSelectedType(type as typeof selectedType)}
          >
            <Text style={styles.toggleText}>
              {type === 'biodegradable'
                ? '🌱 Biodegradable'
                : type === 'nonBiodegradable'
                ? '♻️ Non-Biodegradable'
                : '💩 Manure'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.listWrapper} contentContainerStyle={{ paddingBottom: 60 }}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
        ) : currentLocations.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#6b7280' }}>No data available.</Text>
        ) : (
          currentLocations.map((loc: any, index: number) => {
            const isManure = selectedType === 'manure';
            const isNonBio = selectedType === 'nonBiodegradable';
            const location = loc?.location?.address || loc?.address;
            const lat = loc?.location?.coordinates?.[1];
            const lon = loc?.location?.coordinates?.[0];

            return (
              <View key={loc._id || index} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: theme.accent }]}>
                    {isManure ? loc.sellerName : isNonBio ? loc.name : loc.type}
                  </Text>
                  {loc.phoneNumber || loc.number ? (
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${loc.phoneNumber || loc.number}`)}>
                      <Text style={styles.cardPhone}>📞 Call</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <Text style={styles.cardText}>
                  {isManure
                    ? `₹ ${loc.pricePerKg}/kg`
                    : loc.quantity
                    ? `${loc.quantity} kg`
                    : loc.amount}
                </Text>

                <Text style={styles.cardText}>
                  {isManure
                    ? `Quantity: ${loc.quantity} kg`
                    : loc.distance && loc.time
                    ? `${loc.distance} • ${loc.time}`
                    : loc.number
                    ? `Contact: ${loc.number}`
                    : ''}
                </Text>

                <Text style={styles.cardText}>
                  📍{' '}
                  {typeof location === 'string'
                    ? location
                    : lat && lon
                    ? `${lat}, ${lon}`
                    : 'Location unavailable'}
                </Text>

                {loc.landmark && <Text style={styles.cardText}>🏞️ Landmark: {loc.landmark}</Text>}

                <TouchableOpacity
                  style={[styles.collectBtn, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    if (lat && lon) {
                      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`);
                    }
                  }}
                >
                  <Text style={styles.collectText}>
                    {isManure ? '🛒 Buy Manure' : '🚚 Collect Now'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, paddingTop: 50, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  headerSubtitle: { fontSize: 14, color: '#f0fdf4', opacity: 0.9 },
  toggleContainer: {
    flexDirection: 'row', margin: 16, backgroundColor: '#e5e7eb', borderRadius: 12, padding: 4,
  },
  toggleButton: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8,
  },
  toggleButtonActive: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2,
    shadowRadius: 4, elevation: 3,
  },
  toggleText: {
    fontSize: 13, fontWeight: '600', color: '#374151',
  },
  listWrapper: { paddingHorizontal: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardPhone: { fontSize: 14, color: '#3b82f6', fontWeight: 'bold' },
  cardText: { fontSize: 14, color: '#4b5563', marginBottom: 4 },
  collectBtn: {
    marginTop: 10, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
  },
  collectText: {
    fontSize: 14, fontWeight: 'bold', color: '#fff',
  },
});