import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const BACKEND_URL = 'http://192.168.1.8:8000';

const WASTE_CATEGORIES = [
  { 
    name: 'Biodegradable', 
    icon: 'eco', 
    items: 'food scraps, paper, leaves',
    color: '#4CAF50'
  },
  { 
    name: 'Recyclable', 
    icon: 'recycling', 
    items: 'glass, metal, hard plastics',
    color: '#2196F3'
  },
  { 
    name: 'Combustible', 
    icon: 'whatshot', 
    items: 'soft plastic, styrofoam',
    color: '#FF9800'
  },
  { 
    name: 'Hazardous', 
    icon: 'warning', 
    items: 'batteries, electronics, paint',
    color: '#F44336'
  },
  { 
    name: 'General Waste', 
    icon: 'delete', 
    items: 'mixed or unknown items',
    color: '#9E9E9E'
  },
];

export default function WasteClassifier() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<{label: string, confidence: string} | null>(null);
  const [activeTab, setActiveTab] = useState('classify');

  const openCamera = async () => {
    setIsLoading(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is required to capture waste images');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        aspect: [4, 3],
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setImageUri(result.assets[0].uri);
        setPrediction(null);
      }
    } catch {
      Alert.alert('Camera Error', 'Failed to access camera');
    } finally {
      setIsLoading(false);
    }
  };

  const retakePhoto = () => {
    setImageUri(null);
    setPrediction(null);
  };

  const uploadImage = async () => {
    if (!imageUri) return;
    setIsLoading(true);
    setPrediction(null);

    try {
      const form = new FormData();
      form.append('image', {
        uri: imageUri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      const res = await fetch(`${BACKEND_URL}/api/user/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: form,
      });
      
      const json = await res.json();
      if (json.confidence && json.prediction) {
        setPrediction({
          label: json.prediction,
          confidence: `${(parseFloat(json.confidence) * 100).toFixed(1)}%`
        });
      } else {
        Alert.alert('Classification Error', json.message || 'Failed to classify waste item');
      }
    } catch {
      Alert.alert('Network Error', 'Could not connect to classification service');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#064e3b" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WasteWise Classifier</Text>
        <Text style={styles.headerSubtitle}>AI-powered waste sorting</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'classify' && styles.activeTab]}
          onPress={() => setActiveTab('classify')}
        >
          <MaterialIcons 
            name="camera" 
            size={20} 
            color={activeTab === 'classify' ? '#fff' : '#a7f3d0'} 
          />
          <Text style={[styles.tabText, activeTab === 'classify' && styles.activeTabText]}>
            Classify
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'categories' && styles.activeTab]}
          onPress={() => setActiveTab('categories')}
        >
          <MaterialIcons 
            name="category" 
            size={20} 
            color={activeTab === 'categories' ? '#fff' : '#a7f3d0'} 
          />
          <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
            Categories
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'classify' ? (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Image Preview */}
          <View style={styles.imageSection}>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.capturedImage} 
                  resizeMode="cover"
                />
                <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
                  <MaterialIcons name="refresh" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <View style={styles.placeholder}>
                  <MaterialIcons name="photo-camera" size={48} color="#065f46" />
                  <Text style={styles.placeholderTitle}>Capture Waste Item</Text>
                  <Text style={styles.placeholderSubtitle}>
                    Take a photo to classify waste category
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.disabledButton]}
              onPress={openCamera}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="camera-alt" size={24} color="#fff" />
                  <Text style={styles.primaryButtonText}>
                    {imageUri ? 'Recapture' : 'Capture Image'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {imageUri && (
              <TouchableOpacity
                style={[styles.secondaryButton, isLoading && styles.disabledButton]}
                onPress={uploadImage}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#064e3b" />
                ) : (
                  <>
                    <MaterialIcons name="cloud-upload" size={24} color="#064e3b" />
                    <Text style={styles.secondaryButtonText}>Classify Waste</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Prediction Result */}
          {prediction && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Classification Result</Text>
              
              <View style={styles.resultContent}>
                <View style={styles.resultBadge}>
                  <Text style={styles.resultLabel}>{prediction.label}</Text>
                </View>
                
                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceLabel}>Confidence:</Text>
                  <Text style={styles.confidenceValue}>{prediction.confidence}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Waste Categories</Text>
          
          {WASTE_CATEGORIES.map((category, index) => (
            <View key={index} style={[styles.categoryCard, { borderLeftColor: category.color }]}>
              <View style={styles.categoryHeader}>
                <MaterialIcons name={category.icon as any} size={28} color={category.color} />
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <Text style={styles.categoryItems}>{category.items}</Text>
            </View>
          ))}
          
          <View style={styles.infoCard}>
            <MaterialIcons name="info" size={24} color="#065f46" />
            <Text style={styles.infoText}>
              Proper waste sorting helps reduce landfill waste and promotes recycling
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  header: {
    backgroundColor: '#064e3b',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#d1fae5',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#065f46',
    marginHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#047857',
  },
  tabText: {
    color: '#a7f3d0',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    aspectRatio: 4/3,
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  retakeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d1fae5',
    borderStyle: 'dashed',
    aspectRatio: 4/3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ecfdf5',
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#064e3b',
    marginTop: 16,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 15,
    color: '#059669',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  buttonSection: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#065f46',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#065f46',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#064e3b',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#064e3b',
    marginBottom: 16,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultBadge: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065f46',
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065f46',
  },
  categoriesContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#064e3b',
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  categoryItems: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    paddingLeft: 40,
  },
  infoCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  infoText: {
    fontSize: 15,
    color: '#065f46',
    flex: 1,
    lineHeight: 22,
  },
});



// // components/DisposalMap.js
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   StyleSheet,
//   ActivityIndicator,
//   Text,
//   TouchableOpacity,
//   Modal,
//   TextInput,
//   Alert,
//   SafeAreaView,
// } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
// import * as Location from 'expo-location';
// import axios from 'axios';
// import { Ionicons } from '@expo/vector-icons';

// export default function DisposalMap() {
//   const BACKEND_URL = 'https://hackbackend-0v78.onrender.com';

//   const [location, setLocation] = useState(null);
//   const [centers, setCenters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [newBinName, setNewBinName] = useState('');

//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission Denied', 'Location permission is required.');
//         return;
//       }
//       const { coords } = await Location.getCurrentPositionAsync({});
//       setLocation(coords);
//       setLoading(false);
//     })();
//   }, []);

//   const findNearbyBins = async () => {
//     if (!location) return;
//     try {
//       const { latitude, longitude } = location;
//       const { data } = await axios.post(`${BACKEND_URL}/api/user/dispose`, {
//         latitude,
//         longitude,
//       });
//       if (data.success) setCenters(data.data);
//       else Alert.alert('Error', data.message || 'No bins found.');
//     } catch {
//       Alert.alert('Error', 'Failed to fetch nearby bins.');
//     }
//   };

//   const submitNewBin = async () => {
//     if (!newBinName.trim()) {
//       Alert.alert('Name Required', 'Please enter a name for this bin.');
//       return;
//     }
//     setModalVisible(false);
//     try {
//       const { data } = await axios.post(`${BACKEND_URL}/api/user/bin`, {
//         name: newBinName,
//         type: 'general',
//         latitude: location.latitude,
//         longitude: location.longitude,
//       });
//       if (data.success) {
//         Alert.alert('Success', 'Bin location reported.');
//         await findNearbyBins(); // refresh
//       } else {
//         Alert.alert('Error', data.message || 'Could not report bin.');
//       }
//     } catch {
//       Alert.alert('Error', 'Failed to report bin.');
//     }
//   };

//   if (loading || !location) {
//     return (
//       <View style={styles.loadingWrapper}>
//         <ActivityIndicator size="large" color="#2196F3" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Ionicons name="earth" size={24} color="#fff" />
//         <Text style={styles.headerTitle}>Disposal Centers</Text>
//       </View>

//       {/* Map */}
//       <MapView
//         style={styles.map}
//         initialRegion={{
//           latitude: location.latitude,
//           longitude: location.longitude,
//           latitudeDelta: 0.02,
//           longitudeDelta: 0.02,
//         }}
//         showsUserLocation
//       >
//         {centers.map((c, i) => (
//           <Marker
//             key={i}
//             coordinate={{
//               latitude: c.location.coordinates[1],
//               longitude: c.location.coordinates[0],
//             }}
//             title={c.name}
//             description={c.type}
//             pinColor={
//               c.type === 'recyclable'
//                 ? 'green'
//                 : c.type === 'hazardous'
//                 ? 'red'
//                 : 'gray'
//             }
//           />
//         ))}
//       </MapView>

//       {/* FABs */}
//       <View style={styles.fabContainer}>
//         <TouchableOpacity style={styles.fab} onPress={findNearbyBins}>
//           <Ionicons name="locate" size={24} color="#fff" />
//           <Text style={styles.fabLabel}>Find Bins</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.fab, styles.fabSecondary]}
//           onPress={() => setModalVisible(true)}
//         >
//           <Ionicons name="add-circle" size={24} color="#fff" />
//           <Text style={styles.fabLabel}>Report Bin</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Report Modal */}
//       <Modal visible={modalVisible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>
//             <Text style={styles.modalTitle}>Add a New Bin</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Bin name (e.g. Park Entrance)"
//               value={newBinName}
//               onChangeText={setNewBinName}
//             />
//             <View style={styles.modalActions}>
//               <TouchableOpacity
//                 style={[styles.btn, styles.btnCancel]}
//                 onPress={() => setModalVisible(false)}
//               >
//                 <Text>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.btn, styles.btnSubmit]}
//                 onPress={submitNewBin}
//               >
//                 <Text style={{ color: '#fff' }}>Submit</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   loadingWrapper: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     height: 56,
//     backgroundColor: '#2196F3',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//   },
//   headerTitle: { color: '#fff', fontSize: 18, marginLeft: 8, fontWeight: '600' },
//   map: { flex: 1 },
//   fabContainer: {
//     position: 'absolute',
//     bottom: 24,
//     right: 16,
//     alignItems: 'flex-end',
//   },
//   fab: {
//     backgroundColor: '#2196F3',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 14,
//     borderRadius: 30,
//     marginBottom: 12,
//     elevation: 5,
//   },
//   fabSecondary: { backgroundColor: '#4CAF50' },
//   fabLabel: { color: '#fff', fontSize: 14, marginLeft: 6 },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: '#00000088',
//     justifyContent: 'center',
//     padding: 24,
//   },
//   modalCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     elevation: 6,
//   },
//   modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 6,
//     padding: 10,
//     marginBottom: 20,
//   },
//   modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
//   btn: {
//     flex: 1,
//     alignItems: 'center',
//     padding: 12,
//     borderRadius: 6,
//   },
//   btnCancel: { backgroundColor: '#ddd', marginRight: 8 },
//   btnSubmit: { backgroundColor: '#2196F3' },
// });
