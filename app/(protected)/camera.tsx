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
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { getToken } from '../utils/authToken';

const { width } = Dimensions.get('window');
const BACKEND_URL = "http://10.208.52.54:8000";

const WASTE_CATEGORIES = [
  { name: 'Biodegradable', icon: 'eco', items: 'food scraps, paper, leaves', color: '#4CAF50' },
  { name: 'Recyclable', icon: 'recycling', items: 'glass, metal, hard plastics', color: '#2196F3' },
  { name: 'Combustible', icon: 'whatshot', items: 'soft plastic, styrofoam', color: '#FF9800' },
  { name: 'Hazardous', icon: 'warning', items: 'batteries, electronics, paint', color: '#F44336' },
  { name: 'General Waste', icon: 'delete', items: 'mixed or unknown items', color: '#9E9E9E' },
];

export default function WasteClassifier() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<{ label: string; confidence: string } | null>(null);
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

  const uploadImage = async () => {
    if (!imageUri) return;
    setIsLoading(true);
    setPrediction(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      console.log("my token is : ",token)
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch(`${BACKEND_URL}/api/user/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await response.json();

      if (json.prediction && json.confidence) {
        setPrediction({
          label: json.prediction,
          confidence: `${(parseFloat(json.confidence) * 100).toFixed(1)}%`,
        });
      } else {
        Alert.alert('Classification Error', json.message || 'Failed to classify image');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const retakePhoto = () => {
    setImageUri(null);
    setPrediction(null);
  };

  const handleSell = () => {
    router.push('/sell');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#064e3b" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>WasteWise Classifier</Text>
        <Text style={styles.headerSubtitle}>AI-powered waste sorting</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'classify' && styles.activeTab]}
          onPress={() => setActiveTab('classify')}
        >
          <MaterialIcons name="camera" size={20} color={activeTab === 'classify' ? '#fff' : '#a7f3d0'} />
          <Text style={[styles.tabText, activeTab === 'classify' && styles.activeTabText]}>Classify</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'categories' && styles.activeTab]}
          onPress={() => setActiveTab('categories')}
        >
          <MaterialIcons name="category" size={20} color={activeTab === 'categories' ? '#fff' : '#a7f3d0'} />
          <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>Categories</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'classify' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.imageSection}>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.capturedImage} />
                <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
                  <MaterialIcons name="refresh" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <View style={styles.placeholder}>
                  <MaterialIcons name="photo-camera" size={48} color="#065f46" />
                  <Text style={styles.placeholderTitle}>Capture Waste Item</Text>
                  <Text style={styles.placeholderSubtitle}>Take a photo to classify waste category</Text>
                </View>
              </View>
            )}
          </View>

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
                  <Text style={styles.primaryButtonText}>{imageUri ? 'Recapture' : 'Capture Image'}</Text>
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

              {prediction.label === 'Biodegradable' && (
                <View style={styles.sellSection}>
                  <Text style={styles.sellText}>This waste is useful for farmers. Would you like to sell it?</Text>
                  <TouchableOpacity style={styles.sellButton} onPress={handleSell}>
                    <Text style={styles.sellButtonText}>Yes, Sell Waste</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Waste Categories</Text>
          {WASTE_CATEGORIES.map((cat, idx) => (
            <View key={idx} style={[styles.categoryCard, { borderLeftColor: cat.color }]}>
              <View style={styles.categoryHeader}>
                <MaterialIcons name={cat.icon as any} size={28} color={cat.color} />
                <Text style={styles.categoryName}>{cat.name}</Text>
              </View>
              <Text style={styles.categoryItems}>{cat.items}</Text>
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
  container: { flex: 1, backgroundColor: '#ecfdf5' },
  header: { padding: 16, backgroundColor: '#064e3b' },
  headerTitle: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, color: '#a7f3d0' },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#065f46' },
  tabButton: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  tabText: { marginLeft: 8, color: '#a7f3d0' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#fff' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  content: { padding: 16 },
  imageSection: { alignItems: 'center' },
  imageContainer: { position: 'relative' },
  capturedImage: { width: width * 0.9, height: width * 0.65, borderRadius: 10 },
  retakeButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#064e3b',
    padding: 8,
    borderRadius: 20,
  },
  placeholderContainer: { alignItems: 'center', marginVertical: 20 },
  placeholder: { alignItems: 'center', padding: 16 },
  placeholderTitle: { fontSize: 18, fontWeight: 'bold', color: '#065f46' },
  placeholderSubtitle: { color: '#4b5563' },
  buttonSection: { marginVertical: 20, gap: 12 },
  primaryButton: {
    backgroundColor: '#065f46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
  },
  primaryButtonText: { color: '#fff', marginLeft: 8, fontWeight: 'bold' },
  secondaryButton: {
    borderColor: '#064e3b',
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
  },
  secondaryButtonText: { color: '#064e3b', marginLeft: 8, fontWeight: 'bold' },
  disabledButton: { opacity: 0.6 },
  resultCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
  },
  resultTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#065f46' },
  resultContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultBadge: { backgroundColor: '#22c55e', padding: 8, borderRadius: 6 },
  resultLabel: { color: '#fff', fontWeight: 'bold' },
  confidenceContainer: {},
  confidenceLabel: { fontSize: 12, color: '#4b5563' },
  confidenceValue: { fontSize: 16, fontWeight: 'bold', color: '#16a34a' },
  sellSection: { marginTop: 14 },
  sellText: { color: '#065f46', marginBottom: 8 },
  sellButton: { backgroundColor: '#22c55e', padding: 10, borderRadius: 6, alignItems: 'center' },
  sellButtonText: { color: '#fff', fontWeight: 'bold' },
  categoriesContainer: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#065f46', marginBottom: 12 },
  categoryCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 6,
  },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryName: { fontSize: 16, fontWeight: 'bold' },
  categoryItems: { marginTop: 4, color: '#4b5563' },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  infoText: { color: '#065f46' },
});












// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   Alert,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
//   ActivityIndicator,
//   Dimensions,
//   ScrollView,
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import { MaterialIcons } from '@expo/vector-icons';

// const { width } = Dimensions.get('window');
// const BACKEND_URL = 'http://192.168.1.8:8000';

// const WASTE_CATEGORIES = [
//   { 
//     name: 'Biodegradable', 
//     icon: 'eco', 
//     items: 'food scraps, paper, leaves',
//     color: '#4CAF50'
//   },
//   { 
//     name: 'Recyclable', 
//     icon: 'recycling', 
//     items: 'glass, metal, hard plastics',
//     color: '#2196F3'
//   },
//   { 
//     name: 'Combustible', 
//     icon: 'whatshot', 
//     items: 'soft plastic, styrofoam',
//     color: '#FF9800'
//   },
//   { 
//     name: 'Hazardous', 
//     icon: 'warning', 
//     items: 'batteries, electronics, paint',
//     color: '#F44336'
//   },
//   { 
//     name: 'General Waste', 
//     icon: 'delete', 
//     items: 'mixed or unknown items',
//     color: '#9E9E9E'
//   },
// ];

// export default function WasteClassifier() {
//   const [imageUri, setImageUri] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [prediction, setPrediction] = useState<{label: string, confidence: string} | null>(null);
//   const [activeTab, setActiveTab] = useState('classify');

//   const openCamera = async () => {
//     setIsLoading(true);
//     try {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission Required', 'Camera access is required to capture waste images');
//         return;
//       }
//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         quality: 0.9,
//         aspect: [4, 3],
//       });
//       if (!result.canceled && result.assets?.[0]?.uri) {
//         setImageUri(result.assets[0].uri);
//         setPrediction(null);
//       }
//     } catch {
//       Alert.alert('Camera Error', 'Failed to access camera');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const retakePhoto = () => {
//     setImageUri(null);
//     setPrediction(null);
//   };

//   const uploadImage = async () => {
//     if (!imageUri) return;
//     setIsLoading(true);
//     setPrediction(null);

//     try {
//       const form = new FormData();
//       form.append('image', {
//         uri: imageUri,
//         name: 'photo.jpg',
//         type: 'image/jpeg',
//       } as any);

//       const res = await fetch(`${BACKEND_URL}/api/user/image`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'multipart/form-data' },
//         body: form,
//       });
      
//       const json = await res.json();
//       if (json.confidence && json.prediction) {
//         setPrediction({
//           label: json.prediction,
//           confidence: `${(parseFloat(json.confidence) * 100).toFixed(1)}%`
//         });
//       } else {
//         Alert.alert('Classification Error', json.message || 'Failed to classify waste item');
//       }
//     } catch {
//       Alert.alert('Network Error', 'Could not connect to classification service');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#064e3b" />

//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>WasteWise Classifier</Text>
//         <Text style={styles.headerSubtitle}>AI-powered waste sorting</Text>
//       </View>

//       {/* Tab Navigation */}
//       <View style={styles.tabContainer}>
//         <TouchableOpacity 
//           style={[styles.tabButton, activeTab === 'classify' && styles.activeTab]}
//           onPress={() => setActiveTab('classify')}
//         >
//           <MaterialIcons 
//             name="camera" 
//             size={20} 
//             color={activeTab === 'classify' ? '#fff' : '#a7f3d0'} 
//           />
//           <Text style={[styles.tabText, activeTab === 'classify' && styles.activeTabText]}>
//             Classify
//           </Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           style={[styles.tabButton, activeTab === 'categories' && styles.activeTab]}
//           onPress={() => setActiveTab('categories')}
//         >
//           <MaterialIcons 
//             name="category" 
//             size={20} 
//             color={activeTab === 'categories' ? '#fff' : '#a7f3d0'} 
//           />
//           <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
//             Categories
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {activeTab === 'classify' ? (
//         <ScrollView contentContainerStyle={styles.content}>
//           {/* Image Preview */}
//           <View style={styles.imageSection}>
//             {imageUri ? (
//               <View style={styles.imageContainer}>
//                 <Image 
//                   source={{ uri: imageUri }} 
//                   style={styles.capturedImage} 
//                   resizeMode="cover"
//                 />
//                 <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
//                   <MaterialIcons name="refresh" size={24} color="#fff" />
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <View style={styles.placeholderContainer}>
//                 <View style={styles.placeholder}>
//                   <MaterialIcons name="photo-camera" size={48} color="#065f46" />
//                   <Text style={styles.placeholderTitle}>Capture Waste Item</Text>
//                   <Text style={styles.placeholderSubtitle}>
//                     Take a photo to classify waste category
//                   </Text>
//                 </View>
//               </View>
//             )}
//           </View>

//           {/* Action Buttons */}
//           <View style={styles.buttonSection}>
//             <TouchableOpacity
//               style={[styles.primaryButton, isLoading && styles.disabledButton]}
//               onPress={openCamera}
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <>
//                   <MaterialIcons name="camera-alt" size={24} color="#fff" />
//                   <Text style={styles.primaryButtonText}>
//                     {imageUri ? 'Recapture' : 'Capture Image'}
//                   </Text>
//                 </>
//               )}
//             </TouchableOpacity>

//             {imageUri && (
//               <TouchableOpacity
//                 style={[styles.secondaryButton, isLoading && styles.disabledButton]}
//                 onPress={uploadImage}
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <ActivityIndicator color="#064e3b" />
//                 ) : (
//                   <>
//                     <MaterialIcons name="cloud-upload" size={24} color="#064e3b" />
//                     <Text style={styles.secondaryButtonText}>Classify Waste</Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* Prediction Result */}
//           {prediction && (
//             <View style={styles.resultCard}>
//               <Text style={styles.resultTitle}>Classification Result</Text>
              
//               <View style={styles.resultContent}>
//                 <View style={styles.resultBadge}>
//                   <Text style={styles.resultLabel}>{prediction.label}</Text>
//                 </View>
                
//                 <View style={styles.confidenceContainer}>
//                   <Text style={styles.confidenceLabel}>Confidence:</Text>
//                   <Text style={styles.confidenceValue}>{prediction.confidence}</Text>
//                 </View>
//               </View>
//             </View>
//           )}
//         </ScrollView>
//       ) : (
//         <ScrollView contentContainerStyle={styles.categoriesContainer}>
//           <Text style={styles.sectionTitle}>Waste Categories</Text>
          
//           {WASTE_CATEGORIES.map((category, index) => (
//             <View key={index} style={[styles.categoryCard, { borderLeftColor: category.color }]}>
//               <View style={styles.categoryHeader}>
//                 <MaterialIcons name={category.icon as any} size={28} color={category.color} />
//                 <Text style={styles.categoryName}>{category.name}</Text>
//               </View>
//               <Text style={styles.categoryItems}>{category.items}</Text>
//             </View>
//           ))}
          
//           <View style={styles.infoCard}>
//             <MaterialIcons name="info" size={24} color="#065f46" />
//             <Text style={styles.infoText}>
//               Proper waste sorting helps reduce landfill waste and promotes recycling
//             </Text>
//           </View>
//         </ScrollView>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f0fdf4',
//   },
//   header: {
//     backgroundColor: '#064e3b',
//     paddingVertical: 24,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     elevation: 8,
//   },
//   headerTitle: {
//     fontSize: 26,
//     fontWeight: '700',
//     color: 'white',
//     textAlign: 'center',
//     letterSpacing: 0.5,
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     color: '#d1fae5',
//     textAlign: 'center',
//     marginTop: 8,
//     fontWeight: '500',
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#065f46',
//     marginHorizontal: 20,
//     borderRadius: 12,
//     marginTop: 20,
//     overflow: 'hidden',
//   },
//   tabButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     gap: 8,
//   },
//   activeTab: {
//     backgroundColor: '#047857',
//   },
//   tabText: {
//     color: '#a7f3d0',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   activeTabText: {
//     color: 'white',
//   },
//   content: {
//     flexGrow: 1,
//     padding: 20,
//     paddingBottom: 40,
//   },
//   imageSection: {
//     marginBottom: 24,
//   },
//   imageContainer: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     backgroundColor: '#fff',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//     aspectRatio: 4/3,
//   },
//   capturedImage: {
//     width: '100%',
//     height: '100%',
//   },
//   retakeButton: {
//     position: 'absolute',
//     top: 16,
//     right: 16,
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   placeholderContainer: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     backgroundColor: '#fff',
//     borderWidth: 2,
//     borderColor: '#d1fae5',
//     borderStyle: 'dashed',
//     aspectRatio: 4/3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   placeholder: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#ecfdf5',
//   },
//   placeholderTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#064e3b',
//     marginTop: 16,
//     textAlign: 'center',
//   },
//   placeholderSubtitle: {
//     fontSize: 15,
//     color: '#059669',
//     textAlign: 'center',
//     marginTop: 8,
//     lineHeight: 22,
//   },
//   buttonSection: {
//     gap: 16,
//   },
//   primaryButton: {
//     backgroundColor: '#065f46',
//     borderRadius: 14,
//     paddingVertical: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   secondaryButton: {
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     paddingVertical: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 12,
//     borderWidth: 2,
//     borderColor: '#065f46',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   primaryButtonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   secondaryButtonText: {
//     color: '#064e3b',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   disabledButton: {
//     opacity: 0.7,
//   },
//   resultCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 24,
//     marginTop: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   resultTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#064e3b',
//     marginBottom: 16,
//   },
//   resultContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   resultBadge: {
//     backgroundColor: '#ecfdf5',
//     borderRadius: 12,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderWidth: 1,
//     borderColor: '#a7f3d0',
//   },
//   resultLabel: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#065f46',
//   },
//   confidenceContainer: {
//     alignItems: 'center',
//   },
//   confidenceLabel: {
//     fontSize: 14,
//     color: '#64748b',
//     marginBottom: 4,
//   },
//   confidenceValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#065f46',
//   },
//   categoriesContainer: {
//     padding: 20,
//     paddingBottom: 40,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#064e3b',
//     marginBottom: 20,
//   },
//   categoryCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 16,
//     borderLeftWidth: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   categoryHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 10,
//   },
//   categoryName: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#0f172a',
//   },
//   categoryItems: {
//     fontSize: 15,
//     color: '#475569',
//     lineHeight: 22,
//     paddingLeft: 40,
//   },
//   infoCard: {
//     backgroundColor: '#ecfdf5',
//     borderRadius: 12,
//     padding: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 16,
//     marginTop: 20,
//     borderWidth: 1,
//     borderColor: '#a7f3d0',
//   },
//   infoText: {
//     fontSize: 15,
//     color: '#065f46',
//     flex: 1,
//     lineHeight: 22,
//   },
// });