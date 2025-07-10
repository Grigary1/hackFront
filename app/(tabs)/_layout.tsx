import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false, // Hide header for nearby screen since it has its own header
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
            } else {
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
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
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
            headerShown: false, // Let the nearby component handle its own header
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
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
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