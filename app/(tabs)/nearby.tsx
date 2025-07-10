import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Nearby() {
  const [selectedWasteType, setSelectedWasteType] = useState('biodegradable');

  // Sample waste locations data
  const wasteLocations = {
    biodegradable: [
      { id: 1, type: 'Food Waste', distance: '0.2 km', address: 'MG Road, Sector 1', amount: '2.5 kg', time: '2 hours ago', priority: 'high' },
      { id: 2, type: 'Garden Waste', distance: '0.5 km', address: 'Green Park Avenue', amount: '1.8 kg', time: '4 hours ago', priority: 'medium' },
      { id: 3, type: 'Kitchen Scraps', distance: '0.8 km', address: 'Market Street', amount: '3.2 kg', time: '6 hours ago', priority: 'high' },
      { id: 4, type: 'Organic Waste', distance: '1.1 km', address: 'Residency Road', amount: '1.5 kg', time: '8 hours ago', priority: 'low' },
    ],
    nonBiodegradable: [
      { id: 5, type: 'Plastic Bottles', distance: '0.3 km', address: 'Commercial Complex', amount: '0.8 kg', time: '1 hour ago', priority: 'medium' },
      { id: 6, type: 'Paper Waste', distance: '0.6 km', address: 'Office District', amount: '2.1 kg', time: '3 hours ago', priority: 'high' },
      { id: 7, type: 'Glass Items', distance: '0.9 km', address: 'Shopping Mall', amount: '1.4 kg', time: '5 hours ago', priority: 'medium' },
      { id: 8, type: 'Metal Cans', distance: '1.2 km', address: 'Industrial Area', amount: '0.9 kg', time: '7 hours ago', priority: 'low' },
    ]
  };

  const currentLocations = wasteLocations[selectedWasteType];

  const getWasteIcon = (type) => {
    const icons = {
      'Food Waste': '🍎', 'Garden Waste': '🌿', 'Kitchen Scraps': '🥬', 'Organic Waste': '🌱',
      'Plastic Bottles': '🍼', 'Paper Waste': '📄', 'Glass Items': '🍾', 'Metal Cans': '🥫'
    };
    return icons[type] || '📦';
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getTypeTheme = () => {
    return selectedWasteType === 'biodegradable' 
      ? { primary: '#10b981', secondary: '#ecfdf5', accent: '#065f46' }
      : { primary: '#3b82f6', secondary: '#eff6ff', accent: '#1e40af' };
  };

  const theme = getTypeTheme();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.accent }]}>
        <Text style={styles.headerTitle}>Nearby Waste Collection</Text>
        <Text style={styles.headerSubtitle}>Help clean your community 🌍</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{currentLocations.length}</Text>
            <Text style={styles.statLabel}>Locations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {currentLocations.reduce((sum, loc) => sum + parseFloat(loc.amount), 0).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Total kg</Text>
          </View>
        </View>
      </View>

      {/* Toggle Switch */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            selectedWasteType === 'biodegradable' && [styles.toggleButtonActive, { backgroundColor: theme.primary }]
          ]}
          onPress={() => setSelectedWasteType('biodegradable')}
        >
          <Text style={styles.toggleIcon}>🌱</Text>
          <Text style={[
            styles.toggleText,
            selectedWasteType === 'biodegradable' && styles.toggleTextActive
          ]}>
            Biodegradable
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            selectedWasteType === 'nonBiodegradable' && [styles.toggleButtonActive, { backgroundColor: theme.primary }]
          ]}
          onPress={() => setSelectedWasteType('nonBiodegradable')}
        >
          <Text style={styles.toggleIcon}>♻️</Text>
          <Text style={[
            styles.toggleText,
            selectedWasteType === 'nonBiodegradable' && styles.toggleTextActive
          ]}>
            Non-Biodegradable
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View style={[styles.mapContainer, { backgroundColor: theme.secondary }]}>
        <View style={styles.mapHeader}>
          <Text style={styles.mapTitle}>📍 Collection Points</Text>
          <TouchableOpacity style={styles.mapViewButton}>
            <Text style={styles.mapViewText}>🗺️ Full Map</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapEmoji}>🗺️</Text>
          <Text style={styles.mapLabel}>Interactive Map View</Text>
          
          {/* Simulated Map Pins */}
          <View style={styles.pinContainer}>
            {currentLocations.slice(0, 3).map((location, index) => (
              <View 
                key={location.id} 
                style={[
                  styles.mapPin, 
                  { 
                    top: 20 + (index * 25), 
                    left: 40 + (index * 35),
                    backgroundColor: theme.primary
                  }
                ]}
              >
                <Text style={styles.pinText}>{getWasteIcon(location.type)}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Locations List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Available Collections</Text>
          <TouchableOpacity style={[styles.sortButton, { borderColor: theme.primary }]}>
            <Text style={[styles.sortText, { color: theme.primary }]}>📍 Sort by Distance</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.locationsList} showsVerticalScrollIndicator={false}>
          {currentLocations.map((location) => (
            <TouchableOpacity key={location.id} style={styles.locationCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.locationIcon, { backgroundColor: theme.secondary }]}>
                  <Text style={styles.locationEmoji}>{getWasteIcon(location.type)}</Text>
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationType}>{location.type}</Text>
                  <Text style={styles.locationAddress}>{location.address}</Text>
                </View>
                <View style={styles.locationMeta}>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(location.priority) }]}>
                    <Text style={styles.priorityText}>{location.priority.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>📏</Text>
                  <Text style={styles.detailText}>{location.distance}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>⚖️</Text>
                  <Text style={styles.detailText}>{location.amount}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>🕐</Text>
                  <Text style={styles.detailText}>{location.time}</Text>
                </View>
              </View>
              
              <TouchableOpacity style={[styles.collectButton, { backgroundColor: theme.primary }]}>
                <Text style={styles.collectButtonText}>🚚 Collect Now</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#ffffff',
    opacity: 0.3,
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  toggleButtonActive: {
    backgroundColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  mapContainer: {
    margin: 20,
    borderRadius: 16,
    padding: 16,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  mapViewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  mapViewText: {
    fontSize: 12,
    color: '#6b7280',
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  mapLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  pinContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mapPin: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pinText: {
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationsList: {
    flex: 1,
  },
  locationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationEmoji: {
    fontSize: 24,
  },
  locationInfo: {
    flex: 1,
  },
  locationType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#64748b',
  },
  locationMeta: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#64748b',
  },
  collectButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  collectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});