
// WasteClassifier.tsx

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
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { getToken } from '../utils/authToken';

const { width } = Dimensions.get('window');
const BACKEND_URL = "http://10.0.11.39:8000";


const WASTE_CATEGORIES = [
  { name: 'Biodegradable', icon: 'eco', items: 'food scraps, paper, leaves', color: '#4CAF50' },
  { name: 'Recyclable', icon: 'recycling', items: 'glass, metal, hard plastics', color: '#2196F3' },
  { name: 'Combustible', icon: 'whatshot', items: 'soft plastic, styrofoam', color: '#FF9800' },
  { name: 'Hazardous', icon: 'warning', items: 'batteries, electronics, paint', color: '#F44336' },
  { name: 'General Waste', icon: 'delete', items: 'mixed or unknown items', color: '#9E9E9E' },
];

export default function WasteClassifier() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
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
        if (json.prediction == 'biodegradable') {
          setModalVisible(true);
        }
      } else {
        Alert.alert('Classification Error', json.message || 'Failed to classify image');
      }
    } catch (err: any) {
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
  if (modalVisible) {
    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Sell Waste</Text>
            <Text style={styles.message}>Do you want to sell this waste?</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.yesButton} onPress={handleSell}>
                <Text style={styles.buttonText}>Yes, Sell</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.noButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>No, Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };



return (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#064e3b" />

    <View style={styles.header}>
      <Text style={styles.headerTitle}>WasteWise Classifier</Text>
      <Text style={styles.headerSubtitle}>AI-powered waste sorting</Text>
    </View>

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
    borderWidth: 2,
    borderColor: '#065f46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
  },
  secondaryButtonText: { color: '#064e3b', marginLeft: 8, fontWeight: 'bold' },
  disabledButton: { opacity: 0.6 },
  resultCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginTop: 16 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#065f46' },
  resultContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultBadge: { backgroundColor: '#d1fae5', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  resultLabel: { fontSize: 16, fontWeight: 'bold', color: '#065f46' },
  confidenceContainer: { alignItems: 'flex-end' },
  confidenceLabel: { fontSize: 12, color: '#6b7280' },
  confidenceValue: { fontSize: 16, fontWeight: 'bold', color: '#065f46' },
  sellSection: { marginTop: 16 },
  sellText: { fontSize: 14, color: '#4b5563', marginBottom: 8 },
  sellButton: {
    backgroundColor: '#34d399',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  sellButtonText: { fontWeight: 'bold', color: '#065f46' },
  categoriesContainer: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#065f46' },
  categoryCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  categoryName: { fontSize: 16, fontWeight: 'bold', marginLeft: 8, color: '#111827' },
  categoryItems: { color: '#4b5563' },
  infoCard: {
    marginTop: 16,
    backgroundColor: '#d1fae5',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  infoText: { marginLeft: 8, color: '#065f46', fontWeight: 'bold' },
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
// import { MaterialIcons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// import { useRouter } from 'expo-router';
// import { getToken } from '../utils/authToken';

// const { width } = Dimensions.get('window');
// const BACKEND_URL = "http://10.208.52.54:8000";

// const WASTE_CATEGORIES = [
//   { name: 'Biodegradable', icon: 'eco', items: 'food scraps, paper, leaves', color: '#4CAF50' },
//   { name: 'Recyclable', icon: 'recycling', items: 'glass, metal, hard plastics', color: '#2196F3' },
//   { name: 'Combustible', icon: 'whatshot', items: 'soft plastic, styrofoam', color: '#FF9800' },
//   { name: 'Hazardous', icon: 'warning', items: 'batteries, electronics, paint', color: '#F44336' },
//   { name: 'General Waste', icon: 'delete', items: 'mixed or unknown items', color: '#9E9E9E' },
// ];

// export default function WasteClassifier() {
//   const router = useRouter();
//   const [imageUri, setImageUri] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [prediction, setPrediction] = useState<{ label: string; confidence: string } | null>(null);
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

//   const uploadImage = async () => {
//     if (!imageUri) return;
//     setIsLoading(true);
//     setPrediction(null);

//     try {
//       const token = await getToken();
//       if (!token) {
//         throw new Error('No authentication token available');
//       }
//       console.log("my token is : ",token)
//       const formData = new FormData();
//       formData.append('image', {
//         uri: imageUri,
//         name: 'photo.jpg',
//         type: 'image/jpeg',
//       } as any);

//       const response = await fetch(`${BACKEND_URL}/api/user/image`, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       const json = await response.json();

//       if (json.prediction && json.confidence) {
//         setPrediction({
//           label: json.prediction,
//           confidence: `${(parseFloat(json.confidence) * 100).toFixed(1)}%`,
//         });
//       } else {
//         Alert.alert('Classification Error', json.message || 'Failed to classify image');
//       }
//     } catch (err) {
//       Alert.alert('Error', err.message || 'Something went wrong');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const retakePhoto = () => {
//     setImageUri(null);
//     setPrediction(null);
//   };

//   const handleSell = () => {
//     router.push('/sell');
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#064e3b" />

//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>WasteWise Classifier</Text>
//         <Text style={styles.headerSubtitle}>AI-powered waste sorting</Text>
//       </View>

//       {/* Tabs */}
//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[styles.tabButton, activeTab === 'classify' && styles.activeTab]}
//           onPress={() => setActiveTab('classify')}
//         >
//           <MaterialIcons name="camera" size={20} color={activeTab === 'classify' ? '#fff' : '#a7f3d0'} />
//           <Text style={[styles.tabText, activeTab === 'classify' && styles.activeTabText]}>Classify</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tabButton, activeTab === 'categories' && styles.activeTab]}
//           onPress={() => setActiveTab('categories')}
//         >
//           <MaterialIcons name="category" size={20} color={activeTab === 'categories' ? '#fff' : '#a7f3d0'} />
//           <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>Categories</Text>
//         </TouchableOpacity>
//       </View>

//       {activeTab === 'classify' ? (
//         <ScrollView contentContainerStyle={styles.content}>
//           <View style={styles.imageSection}>
//             {imageUri ? (
//               <View style={styles.imageContainer}>
//                 <Image source={{ uri: imageUri }} style={styles.capturedImage} />
//                 <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
//                   <MaterialIcons name="refresh" size={24} color="#fff" />
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <View style={styles.placeholderContainer}>
//                 <View style={styles.placeholder}>
//                   <MaterialIcons name="photo-camera" size={48} color="#065f46" />
//                   <Text style={styles.placeholderTitle}>Capture Waste Item</Text>
//                   <Text style={styles.placeholderSubtitle}>Take a photo to classify waste category</Text>
//                 </View>
//               </View>
//             )}
//           </View>

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
//                   <Text style={styles.primaryButtonText}>{imageUri ? 'Recapture' : 'Capture Image'}</Text>
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

//               {prediction.label === 'Biodegradable' && (
//                 <View style={styles.sellSection}>
//                   <Text style={styles.sellText}>This waste is useful for farmers. Would you like to sell it?</Text>
//                   <TouchableOpacity style={styles.sellButton} onPress={handleSell}>
//                     <Text style={styles.sellButtonText}>Yes, Sell Waste</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>
//           )}
//         </ScrollView>
//       ) : (
//         <ScrollView contentContainerStyle={styles.categoriesContainer}>
//           <Text style={styles.sectionTitle}>Waste Categories</Text>
//           {WASTE_CATEGORIES.map((cat, idx) => (
//             <View key={idx} style={[styles.categoryCard, { borderLeftColor: cat.color }]}>
//               <View style={styles.categoryHeader}>
//                 <MaterialIcons name={cat.icon as any} size={28} color={cat.color} />
//                 <Text style={styles.categoryName}>{cat.name}</Text>
//               </View>
//               <Text style={styles.categoryItems}>{cat.items}</Text>
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
//   container: { flex: 1, backgroundColor: '#ecfdf5' },
//   header: { padding: 16, backgroundColor: '#064e3b' },
//   headerTitle: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
//   headerSubtitle: { fontSize: 14, color: '#a7f3d0' },
//   tabContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#065f46' },
//   tabButton: { flexDirection: 'row', alignItems: 'center', padding: 12 },
//   tabText: { marginLeft: 8, color: '#a7f3d0' },
//   activeTab: { borderBottomWidth: 2, borderBottomColor: '#fff' },
//   activeTabText: { color: '#fff', fontWeight: 'bold' },
//   content: { padding: 16 },
//   imageSection: { alignItems: 'center' },
//   imageContainer: { position: 'relative' },
//   capturedImage: { width: width * 0.9, height: width * 0.65, borderRadius: 10 },
//   retakeButton: {
//     position: 'absolute',
//     bottom: 10,
//     right: 10,
//     backgroundColor: '#064e3b',
//     padding: 8,
//     borderRadius: 20,
//   },
//   placeholderContainer: { alignItems: 'center', marginVertical: 20 },
//   placeholder: { alignItems: 'center', padding: 16 },
//   placeholderTitle: { fontSize: 18, fontWeight: 'bold', color: '#065f46' },
//   placeholderSubtitle: { color: '#4b5563' },
//   buttonSection: { marginVertical: 20, gap: 12 },
//   primaryButton: {
//     backgroundColor: '#065f46',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 14,
//     borderRadius: 10,
//   },
//   primaryButtonText: { color: '#fff', marginLeft: 8, fontWeight: 'bold' },
//   secondaryButton: {
//     borderColor: '#064e3b',
//     borderWidth: 1.5,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 14,
//     borderRadius: 10,
//   },
//   secondaryButtonText: { color: '#064e3b', marginLeft: 8, fontWeight: 'bold' },
//   disabledButton: { opacity: 0.6 },
//   resultCard: {
//     backgroundColor: '#f0fdf4',
//     borderColor: '#22c55e',
//     borderWidth: 1,
//     borderRadius: 10,
//     padding: 16,
//   },
//   resultTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#065f46' },
//   resultContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   resultBadge: { backgroundColor: '#22c55e', padding: 8, borderRadius: 6 },
//   resultLabel: { color: '#fff', fontWeight: 'bold' },
//   confidenceContainer: {},
//   confidenceLabel: { fontSize: 12, color: '#4b5563' },
//   confidenceValue: { fontSize: 16, fontWeight: 'bold', color: '#16a34a' },
//   sellSection: { marginTop: 14 },
//   sellText: { color: '#065f46', marginBottom: 8 },
//   sellButton: { backgroundColor: '#22c55e', padding: 10, borderRadius: 6, alignItems: 'center' },
//   sellButtonText: { color: '#fff', fontWeight: 'bold' },
//   categoriesContainer: { padding: 16 },
//   sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#065f46', marginBottom: 12 },
//   categoryCard: {
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 12,
//     borderLeftWidth: 6,
//   },
//   categoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   categoryName: { fontSize: 16, fontWeight: 'bold' },
//   categoryItems: { marginTop: 4, color: '#4b5563' },
//   infoCard: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
//   infoText: { color: '#065f46' },
// });

