// import { Tabs } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { StatusBar } from 'expo-status-bar';
// import { Platform } from 'react-native';

// export default function TabsLayout() {
//   return (
//     <>
//       <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
//       <Tabs
//         screenOptions={({ route }) => ({
//           headerShown: false, // Hide header for nearby screen since it has its own header
//           tabBarStyle: {
//             backgroundColor: '#ffffff',
//             borderTopWidth: 1,
//             borderTopColor: '#e5e7eb',
//             paddingBottom: Platform.OS === 'ios' ? 34 : 8,
//             paddingTop: 8,
//             height: Platform.OS === 'ios' ? 88 : 70,
//             elevation: 10,
//             shadowColor: '#000',
//             shadowOffset: { width: 0, height: -2 },
//             shadowOpacity: 0.1,
//             shadowRadius: 8,
//           },
//           tabBarActiveTintColor: '#10b981',
//           tabBarInactiveTintColor: '#64748b',
//           tabBarLabelStyle: {
//             fontSize: 12,
//             fontWeight: '600',
//             marginTop: 4,
//           },
//           tabBarIconStyle: {
//             marginTop: 4,
//           },
//           tabBarIcon: ({ color, size, focused }) => {
//             let iconName;
//             let iconSize = focused ? size + 2 : size;

//             if (route.name === 'home') {
//               iconName = focused ? 'home' : 'home-outline';
//             } else if (route.name === 'camera') {
//               iconName = focused ? 'camera' : 'camera-outline';
//             } else if (route.name === 'nearby') {
//               iconName = focused ? 'location' : 'location-outline';
//             } else {
//               iconName = focused ? 'menu' : 'menu-outline';
//             }

//             return (
//               <Ionicons 
//                 name={iconName} 
//                 size={iconSize} 
//                 color={color}
//                 style={{
//                   transform: focused ? [{ scale: 1.1 }] : [{ scale: 1 }],
//                   opacity: focused ? 1 : 0.8,
//                 }}
//               />
//             );
//           },
//         })}
//       >
//         <Tabs.Screen 
//           name="home" 
//           options={{ 
//             title: 'Home',
//             headerShown: true,
//             headerTitle: '🏠 Home',
//             headerStyle: {
//               backgroundColor: '#065f46',
//               elevation: 8,
//               shadowColor: '#000',
//               shadowOffset: { width: 0, height: 4 },
//               shadowOpacity: 0.3,
//               shadowRadius: 8,
//               borderBottomLeftRadius: 30,
//               borderBottomRightRadius: 30,
//               height: Platform.OS === 'ios' ? 120 : 100,
//             },
//             headerTitleStyle: {
//               fontSize: 28,
//               fontWeight: 'bold',
//               color: '#ffffff',
//               letterSpacing: 0.5,
//             },
//             headerTitleAlign: 'center',
//           }} 
//         />
//         <Tabs.Screen 
//           name="camera" 
//           options={{ 
//             title: 'Scan',
//             headerShown: false,
//           }} 
//         />
//         <Tabs.Screen 
//           name="nearby" 
//           options={{ 
//             title: 'Nearby',
//             headerShown: false, // Let the nearby component handle its own header
//           }} 
//         />
//         <Tabs.Screen 
//           name="index" 
//           options={{ 
//             title: 'WasteHub',
//             headerShown: true,
//             headerTitle: '⚙️ More',
//             headerStyle: {
//               backgroundColor: '#065f46',
//               elevation: 8,
//               shadowColor: '#000',
//               shadowOffset: { width: 0, height: 4 },
//               shadowOpacity: 0.3,
//               shadowRadius: 8,
//               borderBottomLeftRadius: 30,
//               borderBottomRightRadius: 30,
//               height: Platform.OS === 'ios' ? 120 : 100,
//             },
//             headerTitleStyle: {
//               fontSize: 28,
//               fontWeight: 'bold',
//               color: '#ffffff',
//               letterSpacing: 0.5,
//             },
//             headerTitleAlign: 'center',
//           }} 
//         />
//       </Tabs>
//     </>
//   );
// }




import React, { useState, useEffect } from 'react';
import { Tabs, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function TabsLayout() {
  const segments = useSegments();
  const isNearbyScreen = segments[segments.length - 1] === 'nearby';
  
  // Nearby screen state
  const [selectedWasteType, setSelectedWasteType] = useState('biodegradable');
  
  // Sample waste locations data for nearby screen
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

  const getTypeTheme = () => {
    return selectedWasteType === 'biodegradable' 
      ? { primary: '#10b981', secondary: '#ecfdf5', accent: '#065f46' }
      : { primary: '#3b82f6', secondary: '#eff6ff', accent: '#1e40af' };
  };

  const theme = getTypeTheme();

  const handleToggleChange = (wasteType) => {
    setSelectedWasteType(wasteType);
  };

  // Custom header component for nearby screen
  const NearbyHeader = () => (
    <View style={[nearbyStyles.header, { backgroundColor: theme.accent }]}>
      <Text style={nearbyStyles.headerTitle}>Nearby Waste Collection</Text>
      <Text style={nearbyStyles.headerSubtitle}>Help clean your community 🌍</Text>
      <View style={nearbyStyles.statsContainer}>
        <View style={nearbyStyles.statItem}>
          <Text style={nearbyStyles.statNumber}>{currentLocations.length}</Text>
          <Text style={nearbyStyles.statLabel}>Locations</Text>
        </View>
        <View style={nearbyStyles.statDivider} />
        <View style={nearbyStyles.statItem}>
          <Text style={nearbyStyles.statNumber}>
            {currentLocations.reduce((sum, loc) => sum + parseFloat(loc.amount), 0).toFixed(1)}
          </Text>
          <Text style={nearbyStyles.statLabel}>Total kg</Text>
        </View>
      </View>
      
      {/* Toggle Switch */}
      <View style={nearbyStyles.toggleContainer}>
        <TouchableOpacity
          style={[
            nearbyStyles.toggleButton,
            selectedWasteType === 'biodegradable' && [nearbyStyles.toggleButtonActive, { backgroundColor: theme.primary }]
          ]}
          onPress={() => handleToggleChange('biodegradable')}
        >
          <Text style={nearbyStyles.toggleIcon}>🌱</Text>
          <Text style={[
            nearbyStyles.toggleText,
            selectedWasteType === 'biodegradable' && nearbyStyles.toggleTextActive
          ]}>
            Biodegradable
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            nearbyStyles.toggleButton,
            selectedWasteType === 'nonBiodegradable' && [nearbyStyles.toggleButtonActive, { backgroundColor: theme.primary }]
          ]}
          onPress={() => handleToggleChange('nonBiodegradable')}
        >
          <Text style={nearbyStyles.toggleIcon}>♻️</Text>
          <Text style={[
            nearbyStyles.toggleText,
            selectedWasteType === 'nonBiodegradable' && nearbyStyles.toggleTextActive
          ]}>
            Non-Biodegradable
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar 
        style={isNearbyScreen ? "light" : "dark"} 
        backgroundColor={isNearbyScreen ? theme.accent : "#ffffff"} 
        translucent={false} 
      />
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: route.name === 'nearby' ? true : (route.name === 'camera' ? false : true),
          header: route.name === 'nearby' ? () => <NearbyHeader /> : undefined,
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            paddingBottom: Platform.OS === 'ios' ? 34 : 8,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 88 : 70,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          tabBarActiveTintColor: '#10b981',
          tabBarInactiveTintColor: '#64748b',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
          tabBarIcon: ({ color, size, focused }) => {
            let iconName;
            let iconSize = focused ? size + 2 : size;

            if (route.name === 'home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'camera') {
              iconName = focused ? 'camera' : 'camera-outline';
            } else if (route.name === 'nearby') {
              iconName = focused ? 'location' : 'location-outline';
            } else if (route.name === 'index') {
              iconName = focused ? 'menu' : 'menu-outline';
            }

            return (
              <Ionicons 
                name={iconName} 
                size={iconSize} 
                color={color}
                style={{
                  transform: focused ? [{ scale: 1.1 }] : [{ scale: 1 }],
                  opacity: focused ? 1 : 0.8,
                }}
              />
            );
          },
        })}
      >
        <Tabs.Screen 
          name="home" 
          options={{ 
            title: 'Home',
            headerShown: true,
            headerTitle: '🏠 Home',
            headerStyle: {
              backgroundColor: '#065f46',
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              height: Platform.OS === 'ios' ? 120 : 100,
            },
            headerTitleStyle: {
              fontSize: 28,
              fontWeight: 'bold',
              color: '#ffffff',
              letterSpacing: 0.5,
            },
            headerTitleAlign: 'center',
          }} 
        />
        <Tabs.Screen 
          name="camera" 
          options={{ 
            title: 'Scan',
            headerShown: false,
          }} 
        />
        <Tabs.Screen 
          name="nearby" 
          options={{ 
            title: 'Nearby',
            headerShown: true,
          }} 
        />
        <Tabs.Screen 
          name="index" 
          options={{ 
            title: 'More',
            headerShown: true,
            headerTitle: '⚙️ More',
            headerStyle: {
              backgroundColor: '#065f46',
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              height: Platform.OS === 'ios' ? 120 : 100,
            },
            headerTitleStyle: {
              fontSize: 28,
              fontWeight: 'bold',
              color: '#ffffff',
              letterSpacing: 0.5,
            },
            headerTitleAlign: 'center',
          }} 
        />
      </Tabs>
    </>
  );
}

const nearbyStyles = StyleSheet.create({
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
    marginBottom: 20,
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 4,
    opacity: 0.9,
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
});