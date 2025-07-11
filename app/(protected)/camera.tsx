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
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const BACKEND_URL = 'http://192.168.1.8:8000';

export default function CameraExample() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);

  const openCamera = async () => {
    setIsLoading(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is required.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsEditing: true,
        aspect: [4, 3],
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setImageUri(result.assets[0].uri);
        setPrediction(null);
      }
    } catch {
      Alert.alert('Error', 'Failed to open camera.');
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
      console.log("json :",json)
      if (json.confidence && json.prediction) {
        //const conf = json.confidence != null ? ` (${json.confidence})` : '';
        setPrediction(`${json.prediction}${json.confidence}`);
      } else {
        Alert.alert('Error', json.message || 'Prediction failed');
      }
    } catch {
      Alert.alert('Error', 'Could not send image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Platform.OS === 'android' ? '#065f46' : undefined}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>📸 Photo Capture</Text>
        <Text style={styles.headerSubtitle}>Take amazing photos instantly</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.imageSection}>
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.capturedImage} />
              <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
                <Text style={styles.retakeText}>🔄 Retake</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <View style={styles.placeholder}>
                <Text style={styles.placeholderIcon}>📷</Text>
                <Text style={styles.placeholderTitle}>No Photo Yet</Text>
                <Text style={styles.placeholderSubtitle}>
                  Tap the camera button below to capture your first photo
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.cameraButton, isLoading && styles.disabledButton]}
            onPress={openCamera}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonIcon}>{isLoading ? '⏳' : '📸'}</Text>
            <Text style={styles.buttonText}>
              {isLoading
                ? 'Opening Camera...'
                : imageUri
                ? 'Take Another Photo'
                : 'Open Camera'}
            </Text>
          </TouchableOpacity>

          {imageUri && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={uploadImage}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonIcon}>📤</Text>
              <Text style={styles.secondaryButtonText}>Send Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {prediction && (
          <View style={styles.predictionContainer}>
            <Text style={styles.predictionTitle}>Prediction:</Text>
            <Text style={styles.predictionText}>{prediction}</Text>
          </View>
        )}

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✂️</Text>
              <Text style={styles.featureText}>Auto crop & edit</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎨</Text>
              <Text style={styles.featureText}>High quality capture</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureText}>Smart flash detection</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5e6cc' },
  header: {
    backgroundColor: '#065f46',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  content: { flex: 1 },
  contentContainer: { padding: 20 },
  imageSection: { marginBottom: 30 },
  imageContainer: {
    position: 'relative',
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 },
      android: { elevation: 15 },
    }),
  },
  capturedImage: { width: width - 40, height: (width - 40) * 0.75, borderRadius: 25 },
  retakeButton: {
    position: 'absolute', top: 15, right: 15,
    backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20,
  },
  retakeText: { color: 'white', fontSize: 14, fontWeight: '600' },
  placeholderContainer: { height: (width - 40) * 0.75, borderRadius: 25, overflow: 'hidden' },
  placeholder: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#f5e6cc', borderRadius: 25, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed', padding: 20,
  },
  placeholderIcon: { fontSize: 80, marginBottom: 20 },
  placeholderTitle: { fontSize: 22, fontWeight: 'bold', color: '#64748b', marginBottom: 10 },
  placeholderSubtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center', lineHeight: 22 },
  buttonSection: { marginBottom: 30, gap: 15 },
  cameraButton: {
    backgroundColor: '#ef4444',
    borderRadius: 25,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10 },
      android: { elevation: 8 },
    }),
  },
  disabledButton: { backgroundColor: '#9ca3af' },
  buttonIcon: { fontSize: 24, marginRight: 12 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#6366f1',
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5 },
      android: { elevation: 3 },
    }),
  },
  secondaryButtonIcon: { fontSize: 24, marginRight: 12 },
  secondaryButtonText: { color: '#6366f1', fontSize: 18, fontWeight: 'bold' },
  predictionContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 30,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6 },
      android: { elevation: 4 },
    }),
  },
  predictionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#065f46' },
  predictionText: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', textAlign: 'center' },
  featuresSection: {
    backgroundColor: '#f5e6cc',
    borderRadius: 20,
    padding: 25,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 5 },
    }),
  },
  featuresTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 20, textAlign: 'center' },
  featuresList: { gap: 15 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  featureIcon: { fontSize: 20 },
  featureText: { fontSize: 16, color: '#4b5563', fontWeight: '500' },
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
//   Platform,
//   Dimensions,
//   ScrollView,
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';

// const { width, height } = Dimensions.get('window');

// const BACKEND_URL='http://192.168.1.8:8000';

// export default function CameraExample() {
//   const [imageUri, setImageUri] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const openCamera = async () => {
//     setIsLoading(true);

//     try {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert(
//           'Permission Required',
//           'Camera access is required to capture photos.',
//           [{ text: 'OK', style: 'default' }]
//         );
//         setIsLoading(false);
//         return;
//       }

//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         quality: 0.9,
//         allowsEditing: true,
//         aspect: [4, 3],
//       });

//       if (!result.canceled && result.assets && result.assets[0]) {
//         setImageUri(result.assets[0].uri);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to open camera. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const retakePhoto = () => {
//     setImageUri(null);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar
//         barStyle="light-content"
//         backgroundColor={Platform.OS === 'android' ? '#065f46' : undefined}
//       />
      
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>📸 Photo Capture</Text>
//         <Text style={styles.headerSubtitle}>Take amazing photos instantly</Text>
//       </View>

//       <ScrollView 
//         style={styles.content}
//         contentContainerStyle={styles.contentContainer}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Image Display Area */}
//         <View style={styles.imageSection}>
//           {imageUri ? (
//             <View style={styles.imageContainer}>
//               <Image source={{ uri: imageUri }} style={styles.capturedImage} />
//               <TouchableOpacity
//                 style={styles.retakeButton}
//                 onPress={retakePhoto}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.retakeText}>🔄 Retake</Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <View style={styles.placeholderContainer}>
//               <View style={styles.placeholder}>
//                 <Text style={styles.placeholderIcon}>📷</Text>
//                 <Text style={styles.placeholderTitle}>No Photo Yet</Text>
//                 <Text style={styles.placeholderSubtitle}>
//                   Tap the camera button below to capture your first photo
//                 </Text>
//               </View>
//             </View>
//           )}
//         </View>

//         {/* Action Buttons */}
//         <View style={styles.buttonSection}>
//           <TouchableOpacity
//             style={[styles.cameraButton, isLoading && styles.disabledButton]}
//             onPress={openCamera}
//             disabled={isLoading}
//             activeOpacity={0.8}
//           >
//             <Text style={styles.buttonIcon}>
//               {isLoading ? '⏳' : '📸'}
//             </Text>
//             <Text style={styles.buttonText}>
//               {isLoading ? 'Opening Camera...' : imageUri ? 'Take Another Photo' : 'Open Camera'}
//             </Text>
//           </TouchableOpacity>

//           {imageUri && (
//             <TouchableOpacity
//               style={styles.secondaryButton}
//               onPress={() => Alert.alert('Success', 'Photo captured successfully!')}
//               activeOpacity={0.8}
//             >
//               <Text style={styles.secondaryButtonIcon}>✅</Text>
//               <Text style={styles.secondaryButtonText}>Save Photo</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Features */}
//         <View style={styles.featuresSection}>
//           <Text style={styles.featuresTitle}>Features</Text>
//           <View style={styles.featuresList}>
//             <View style={styles.featureItem}>
//               <Text style={styles.featureIcon}>✂️</Text>
//               <Text style={styles.featureText}>Auto crop & edit</Text>
//             </View>
//             <View style={styles.featureItem}>
//               <Text style={styles.featureIcon}>🎨</Text>
//               <Text style={styles.featureText}>High quality capture</Text>
//             </View>
//             <View style={styles.featureItem}>
//               <Text style={styles.featureIcon}>⚡</Text>
//               <Text style={styles.featureText}>Smart flash detection</Text>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5e6cc', // Updated to match HomeScreen
//   },
//   header: {
//     backgroundColor: '#065f46',
//     paddingTop: Platform.OS === 'ios' ? 20 : 40,
//     paddingBottom: 30,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 8,
//       },
//     }),
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: 'white',
//     textAlign: 'center',
//     marginBottom: 5,
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     color: 'rgba(255, 255, 255, 0.8)',
//     textAlign: 'center',
//   },
//   content: {
//     flex: 1,
//   },
//   contentContainer: {
//     padding: 20,
//   },
//   imageSection: {
//     marginBottom: 30,
//   },
//   imageContainer: {
//     position: 'relative',
//     borderRadius: 25,
//     overflow: 'hidden',
//     backgroundColor: '#fff',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 10 },
//         shadowOpacity: 0.3,
//         shadowRadius: 15,
//       },
//       android: {
//         elevation: 15,
//       },
//     }),
//   },
//   capturedImage: {
//     width: width - 40,
//     height: (width - 40) * 0.75,
//     borderRadius: 25,
//   },
//   retakeButton: {
//     position: 'absolute',
//     top: 15,
//     right: 15,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   retakeText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   placeholderContainer: {
//     height: (width - 40) * 0.75,
//     borderRadius: 25,
//     overflow: 'hidden',
//   },
//   placeholder: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5e6cc', // Updated to match container
//     borderRadius: 25,
//     borderWidth: 2,
//     borderColor: '#e2e8f0',
//     borderStyle: 'dashed',
//     padding: 20,
//   },
//   placeholderIcon: {
//     fontSize: 80,
//     marginBottom: 20,
//   },
//   placeholderTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#64748b',
//     marginBottom: 10,
//   },
//   placeholderSubtitle: {
//     fontSize: 16,
//     color: '#94a3b8',
//     textAlign: 'center',
//     lineHeight: 22,
//   },
//   buttonSection: {
//     marginBottom: 30,
//     gap: 15,
//   },
//   cameraButton: {
//     backgroundColor: '#ef4444',
//     borderRadius: 25,
//     paddingVertical: 20,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 6 },
//         shadowOpacity: 0.3,
//         shadowRadius: 10,
//       },
//       android: {
//         elevation: 8,
//       },
//     }),
//   },
//   disabledButton: {
//     backgroundColor: '#9ca3af',
//   },
//   buttonIcon: {
//     fontSize: 24,
//     marginRight: 12,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   secondaryButton: {
//     backgroundColor: 'white',
//     borderRadius: 25,
//     borderWidth: 2,
//     borderColor: '#6366f1',
//     paddingVertical: 18,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 3 },
//         shadowOpacity: 0.1,
//         shadowRadius: 5,
//       },
//       android: {
//         elevation: 3,
//       },
//     }),
//   },
//   secondaryButtonIcon: {
//     fontSize: 24,
//     marginRight: 12,
//   },
//   secondaryButtonText: {
//     color: '#6366f1',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   featuresSection: {
//     backgroundColor: '#f5e6cc', // Updated to match container
//     borderRadius: 20,
//     padding: 25,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 5 },
//         shadowOpacity: 0.1,
//         shadowRadius: 10,
//       },
//       android: {
//         elevation: 5,
//       },
//     }),
//   },
//   featuresTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#1f2937',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   featuresList: {
//     gap: 15,
//   },
//   featureItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 15,
//   },
//   featureIcon: {
//     fontSize: 20,
//   },
//   featureText: {
//     fontSize: 16,
//     color: '#4b5563',
//     fontWeight: '500',
//   },
// });