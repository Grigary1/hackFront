import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, TextInput, Button, Text, Title, useTheme, ActivityIndicator } from 'react-native-paper';
import * as Location from 'expo-location';
import { useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

type Params = {
  category: string;
};

export default function IndexScreen() {
  const theme = useTheme();
  const route = useRoute();
  const { category } = route.params as Params;
  const BACKEND_URL = "http://10.0.11.39:8000";

  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current location
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setIsLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Allow location access to continue.');
          setIsLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);

        const addressResult = await Location.reverseGeocodeAsync(loc.coords);
        if (addressResult.length > 0) {
          const addr = addressResult[0];
          setAddress(`${addr.street}, ${addr.city}, ${addr.region}`);
        }
      } catch (err) {
        Alert.alert('Error', 'Could not fetch location');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, []);

  const handleSubmit = async () => {
    if (!name || !number || !quantity || !location) {
      Alert.alert('Missing Data', 'Please fill all fields and allow location access.');
      return;
    }

    if (parseFloat(quantity) < 1) {
      Alert.alert('Invalid Quantity', 'Minimum 1 kg of waste is required.');
      return;
    }

    const payload = {
      name,
      number,
      quantity,
      category,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address,
      },
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/user/disposenon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type') || '';

      if (response.ok) {
        const data = contentType.includes('application/json')
          ? await response.json()
          : await response.text();

        Alert.alert('Submitted', 'Your waste listing has been submitted successfully!');
        setName('');
        setNumber('');
        setQuantity('');
        setLocation(null);
        setAddress('');
      } else {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        Alert.alert('Error', 'Server responded with an error.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialIcons name="recycling" size={28} color="#1B5E20" />
              <Title style={styles.title}>Sell {category}</Title>
              <MaterialIcons name="recycling" size={28} color="#1B5E20" />
            </View>

            <Text style={styles.subtitle}>List your waste for recycling companies to purchase</Text>

            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              style={styles.input}
              outlineColor="#388E3C"
              activeOutlineColor="#1B5E20"
              disabled={isSubmitting}
            />

            <TextInput
              label="Phone Number"
              value={number}
              onChangeText={setNumber}
              mode="outlined"
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" />}
              style={styles.input}
              outlineColor="#388E3C"
              activeOutlineColor="#1B5E20"
              disabled={isSubmitting}
            />

            <View style={styles.row}>
              <TextInput
                label="Quantity (kg)"
                value={quantity}
                onChangeText={setQuantity}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
                left={<TextInput.Icon icon="weight" />}
                outlineColor="#388E3C"
                activeOutlineColor="#1B5E20"
                disabled={isSubmitting}
              />
              <View style={[styles.categoryBox, styles.halfInput]}>
                <Text style={styles.categoryLabel}>Category</Text>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            </View>

            <View style={styles.locationContainer}>
              <Text style={styles.sectionTitle}>Location Details</Text>

              {isLoading ? (
                <ActivityIndicator size="small" color="#1B5E20" style={styles.loader} />
              ) : (
                <>
                  <View style={styles.coordinateRow}>
                    <MaterialIcons name="gps-fixed" size={20} color="#1B5E20" />
                    <Text style={styles.coordinateText}>
                      Latitude: {location?.latitude.toFixed(5)}
                    </Text>
                  </View>

                  <View style={styles.coordinateRow}>
                    <MaterialIcons name="gps-fixed" size={20} color="#1B5E20" />
                    <Text style={styles.coordinateText}>
                      Longitude: {location?.longitude.toFixed(5)}
                    </Text>
                  </View>

                  {address ? (
                    <View style={styles.coordinateRow}>
                      <MaterialIcons name="location-on" size={20} color="#1B5E20" />
                      <Text style={styles.addressText}>{address}</Text>
                    </View>
                  ) : (
                    <Text style={styles.warningText}>Address not available</Text>
                  )}
                </>
              )}
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              buttonColor="#1B5E20"
              textColor="#FFFFFF"
              icon="send"
              loading={isSubmitting}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? "Submitting..." : "List Waste for Sale"}
            </Button>

            <View style={styles.infoBox}>
              <MaterialIcons name="info" size={18} color="#1B5E20" />
              <Text style={styles.infoText}>Recycling companies will contact you within 24 hours</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  card: {
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#1B5E20',
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 16,
    color: '#4CAF50',
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  categoryBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 4,
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 12,
    color: '#2E7D32',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  locationContainer: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
  },
  coordinateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  coordinateText: {
    marginLeft: 8,
    color: '#2E7D32',
  },
  addressText: {
    marginLeft: 8,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  warningText: {
    color: 'red',
  },
  submitButton: {
    marginTop: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 4,
  },
  infoText: {
    color: '#1B5E20',
  },
});


// import React, { useEffect, useState } from 'react';
// import { View, ScrollView, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
// import { Card, TextInput, Button, Text, Title, useTheme, ActivityIndicator } from 'react-native-paper';
// import * as Location from 'expo-location';
// import { useRoute } from '@react-navigation/native';
// import { MaterialIcons } from '@expo/vector-icons';

// type Params = {
//   category: string;
// };

// export default function IndexScreen() {
//   const theme = useTheme();
//   const route = useRoute();
//   const { category } = route.params as Params;
//   const BACKEND_URL = "http://10.0.11.39:8000";

//   const [name, setName] = useState('');
//   const [number, setNumber] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
//   const [address, setAddress] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Get current location
//   useEffect(() => {
//     const fetchLocation = async () => {
//       try {
//         setIsLoading(true);
//         let { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== 'granted') {
//           Alert.alert('Permission denied', 'Allow location access to continue.');
//           setIsLoading(false);
//           return;
//         }

//         const loc = await Location.getCurrentPositionAsync({});
//         setLocation(loc.coords);
        
//         // Get human-readable address
//         const addressResult = await Location.reverseGeocodeAsync(loc.coords);
//         if (addressResult.length > 0) {
//           const addr = addressResult[0];
//           setAddress(`${addr.street}, ${addr.city}, ${addr.region}`);
//         }
//       } catch (err) {
//         Alert.alert('Error', 'Could not fetch location');
//         console.error(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchLocation();
//   }, []);

//   const handleSubmit = async () => {
//     if (!name || !number || !quantity || !location) {
//       Alert.alert('Missing Data', 'Please fill all fields and allow location access.');
//       return;
//     }

//     if (parseFloat(quantity) < 1) {
//       Alert.alert('Invalid Quantity', 'Minimum 1 kg of waste is required.');
//       return;
//     }

//     const payload = {
//       name,
//       number,
//       quantity,
//       category,
//       location: {
//         latitude: location.latitude,
//         longitude: location.longitude,
//         address
//       },
//     };

//     setIsSubmitting(true);
    
//     try {
//       const response = await fetch(`${BACKEND_URL}/api/user/disposenon`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();
      
//       if (response.ok) {
//         Alert.alert('Submitted', 'Your waste listing has been submitted successfully!');
//         setName('');
//         setNumber('');
//         setQuantity('');
//       } else {
//         Alert.alert('Error', data.message || 'Submission failed');
//       }
//     } catch (error) {
//       console.error('Submission error:', error);
//       Alert.alert('Error', 'Network error. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={styles.container}
//     >
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <Card style={styles.card}>
//           <Card.Content>
//             <View style={styles.header}>
//               <MaterialIcons name="recycling" size={28} color="#1B5E20" />
//               <Title style={styles.title}>Sell {category}</Title>
//               <MaterialIcons name="recycling" size={28} color="#1B5E20" />
//             </View>
            
//             <Text style={styles.subtitle}>List your waste for recycling companies to purchase</Text>

//             <TextInput
//               label="Full Name"
//               value={name}
//               onChangeText={setName}
//               mode="outlined"
//               left={<TextInput.Icon icon="account" />}
//               style={styles.input}
//               outlineColor="#388E3C"
//               activeOutlineColor="#1B5E20"
//               disabled={isSubmitting}
//             />

//             <TextInput
//               label="Phone Number"
//               value={number}
//               onChangeText={setNumber}
//               mode="outlined"
//               keyboardType="phone-pad"
//               left={<TextInput.Icon icon="phone" />}
//               style={styles.input}
//               outlineColor="#388E3C"
//               activeOutlineColor="#1B5E20"
//               disabled={isSubmitting}
//             />

//             <View style={styles.row}>
//               <TextInput
//                 label="Quantity (kg)"
//                 value={quantity}
//                 onChangeText={setQuantity}
//                 mode="outlined"
//                 keyboardType="numeric"
//                 style={[styles.input, styles.halfInput]}
//                 left={<TextInput.Icon icon="weight" />}
//                 outlineColor="#388E3C"
//                 activeOutlineColor="#1B5E20"
//                 disabled={isSubmitting}
//               />
              
//               <View style={[styles.categoryBox, styles.halfInput]}>
//                 <Text style={styles.categoryLabel}>Category</Text>
//                 <Text style={styles.categoryText}>{category}</Text>
//               </View>
//             </View>

//             <View style={styles.locationContainer}>
//               <Text style={styles.sectionTitle}>Location Details</Text>
              
//               {isLoading ? (
//                 <ActivityIndicator size="small" color="#1B5E20" style={styles.loader} />
//               ) : (
//                 <>
//                   <View style={styles.coordinateRow}>
//                     <MaterialIcons name="gps-fixed" size={20} color="#1B5E20" />
//                     <Text style={styles.coordinateText}>
//                       Latitude: {location?.latitude.toFixed(5)}
//                     </Text>
//                   </View>
                  
//                   <View style={styles.coordinateRow}>
//                     <MaterialIcons name="gps-fixed" size={20} color="#1B5E20" />
//                     <Text style={styles.coordinateText}>
//                       Longitude: {location?.longitude.toFixed(5)}
//                     </Text>
//                   </View>
                  
//                   {address ? (
//                     <View style={styles.coordinateRow}>
//                       <MaterialIcons name="location-on" size={20} color="#1B5E20" />
//                       <Text style={styles.addressText}>{address}</Text>
//                     </View>
//                   ) : (
//                     <Text style={styles.warningText}>Address not available</Text>
//                   )}
//                 </>
//               )}
//             </View>

//             <Button
//               mode="contained"
//               onPress={handleSubmit}
//               style={styles.submitButton}
//               buttonColor="#1B5E20"
//               textColor="#FFFFFF"
//               icon="send"
//               loading={isSubmitting}
//               disabled={isSubmitting || isLoading}
//             >
//               {isSubmitting ? "Submitting..." : "List Waste for Sale"}
//             </Button>
            
//             <View style={styles.infoBox}>
//               <MaterialIcons name="info" size={18} color="#1B5E20" />
//               <Text style={styles.infoText}>
//                 Recycling companies will contact you within 24 hours
//               </Text>
//             </View>
//           </Card.Content>
//         </Card>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#E8F5E9',
//   },
//   scrollContainer: {
//     padding: 16,
//     paddingBottom: 40,
//   },
//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 8,
//   },
//   title: {
//     color: "#1B5E20",
//     fontWeight: "bold",
//     marginHorizontal: 10,
//     fontSize: 22,
//   },
//   subtitle: {
//     textAlign: "center",
//     color: "#757575",
//     marginBottom: 20,
//     fontSize: 14,
//   },
//   input: {
//     marginBottom: 16,
//     backgroundColor: "#F1F8E9",
//   },
//   halfInput: {
//     flex: 1,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 12,
//   },
//   categoryBox: {
//     backgroundColor: '#E8F5E9',
//     borderRadius: 4,
//     borderWidth: 1,
//     borderColor: '#C8E6C9',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     justifyContent: 'center',
//     height: 56,
//   },
//   categoryLabel: {
//     color: '#757575',
//     fontSize: 12,
//   },
//   categoryText: {
//     color: '#1B5E20',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   locationContainer: {
//     backgroundColor: '#F1F8E9',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     color: '#1B5E20',
//     fontWeight: 'bold',
//     marginBottom: 12,
//     fontSize: 16,
//   },
//   coordinateRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   coordinateText: {
//     color: '#2E7D32',
//     marginLeft: 8,
//     fontSize: 14,
//   },
//   addressText: {
//     color: '#2E7D32',
//     marginLeft: 8,
//     flex: 1,
//     fontSize: 14,
//   },
//   warningText: {
//     color: '#D32F2F',
//     fontStyle: 'italic',
//   },
//   loader: {
//     marginVertical: 10,
//   },
//   submitButton: {
//     marginTop: 8,
//     borderRadius: 8,
//     paddingVertical: 6,
//     elevation: 2,
//   },
//   infoBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#E8F5E9",
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 20,
//   },
//   infoText: {
//     color: "#2E7D32",
//     marginLeft: 8,
//     flex: 1,
//     fontSize: 13,
//   },
// });