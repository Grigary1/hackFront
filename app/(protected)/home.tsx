import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Linking } from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [manureList, setManureList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManureData = async () => {
      try {
        const response = await axios.get('http://10.0.11.39:8000/api/user/nearby?longitude=77.5946&latitude=12.9716&distanceKm=5');
        setManureList(response.data);
      } catch (err) {
        console.error("Failed to fetch manure listings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchManureData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Welcome to DropIt 👋</Text>
        <Text style={styles.subheading}>Smart Waste Management at Your Fingertips</Text>
      </View>

      {/* Stat Cards */}
      <View style={styles.cardRow}>
        <View style={styles.squareCardLeft}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🌱</Text>
            <Text style={styles.statValue}>2.3 kg</Text>
            <Text style={styles.statLabel}>Waste Sorted</Text>
            <Text style={styles.statSubtext}>Today</Text>
          </View>
        </View>

        <View style={styles.squareCardRight}>
          <View style={styles.scoreContent}>
            <Text style={styles.scoreIcon}>🏆</Text>
            <Text style={styles.scoreValue}>89%</Text>
            <Text style={styles.scoreLabel}>Recycling Score</Text>
            <Text style={styles.scoreSubtext}>You're in the top 10%</Text>
          </View>
          <View style={styles.scoreGradient} />
        </View>
      </View>

      {/* Eco Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Daily Eco Challenge</Text>
        <TouchableOpacity style={styles.ecoButton} onPress={() => navigation.navigate('Tips')}>
          <View style={styles.buttonContent}>
            <View style={styles.buttonIcon}>
              <Text style={styles.buttonEmoji}>💡</Text>
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Eco-Friendly Tips</Text>
              <Text style={styles.buttonSubtitle}>Discover new ways to help the planet</Text>
            </View>
            <Text style={styles.buttonArrow}>→</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Achievement Banner */}
      <View style={styles.achievementBanner}>
        <Text style={styles.achievementText}>🎉 You've saved 15kg of waste this month!</Text>
        <Text style={styles.achievementSubtext}>Keep up the amazing work</Text>
      </View>

      {/* Manure Upload Section */}
      <View style={styles.manureSection}>
        <Text style={styles.manureHeading}>Uploaded Manure Listings</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#3c763d" />
        ) : (
          manureList.map((item, index) => (
            <View key={item._id || index} style={styles.manureCard}>
              <Text style={styles.manureTitle}>{item.sellerName}</Text>
              <Text style={styles.manurePrice}>₹ {item.pricePerKg}/kg</Text>
              <Text style={styles.manureUser}>Quantity: {item.quantity} kg</Text>
              <Text style={styles.manureUser}>
                Location: {typeof item.location === 'string' ? item.location : `${item.location.coordinates[1]}, ${item.location.coordinates[0]}`}
              </Text>
              {item.landmark ? (
                <Text style={styles.manureUser}>Landmark: {item.landmark}</Text>
              ) : null}

              <View style={styles.manureButtonRow}>
                <TouchableOpacity style={styles.manureBuyButton} activeOpacity={0.8}>
                  <Text style={styles.manureButtonText}>Buy</Text>
                </TouchableOpacity>
                <TouchableOpacity
  style={styles.manureContactButton}
  activeOpacity={0.8}
  onPress={() => {
    if (item.phoneNumber) {
      Linking.openURL(`tel:${item.phoneNumber}`);
    } else {
      alert('Phone number not available');
    }
  }}
>
  <Text style={styles.manureButtonText}>Call</Text>
</TouchableOpacity>

              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5e6cc',
  },
  headerContainer: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: 25,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 25,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 22,
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  statSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  scoreCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  scoreContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  scoreIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  scoreSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  scoreGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 80,
    height: 80,
    backgroundColor: '#fef3c7',
    borderRadius: 40,
    opacity: 0.3,
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  ecoButton: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  buttonEmoji: {
    fontSize: 28,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  buttonArrow: {
    fontSize: 20,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  achievementBanner: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  achievementText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementSubtext: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
  },
  manureSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  manureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  manureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  manureDesc: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
  },
  manureUser: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#065f46',
  },

  cardRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  marginBottom: 30,
},

squareCardLeft: {
  width: (width - 60) / 2, // 20 padding + 10 margin between = 30
  height: (width - 60) / 2,
  backgroundColor: '#ffffff',
  borderRadius: 20,
  padding: 15,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
  marginRight: 10,
},

squareCardRight: {
  width: (width - 60) / 2,
  height: (width - 60) / 2,
  backgroundColor: '#ffffff',
  borderRadius: 20,
  padding: 15,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
},



manureSection: {
  paddingHorizontal: 30,
  marginBottom: 30,
},

manureHeading: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#065f46',
  marginBottom: 20,
  textAlign: 'center',
},

manureCard: {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 16,
  padding: 20,
  marginBottom: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
},

manureTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#1e293b',
  marginBottom: 4,
},

manurePrice: {
  fontSize: 16,
  fontWeight: '600',
  color: '#047857',
  marginBottom: 4,
},

manureUser: {
  fontSize: 14,
  fontStyle: 'italic',
  color: '#6b7280',
  marginBottom: 10,
},

manureButtonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},

manureBuyButton: {
  flex: 1,
  backgroundColor: '#10b981',
  paddingVertical: 10,
  borderRadius: 12,
  alignItems: 'center',
  marginRight: 6,
  elevation: 3,
},

manureContactButton: {
  flex: 1,
  backgroundColor: '#3b82f6',
  paddingVertical: 10,
  borderRadius: 12,
  alignItems: 'center',
  marginLeft: 6,
  elevation: 3,
},

manureButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},





});


// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

// const { width } = Dimensions.get('window');

// export default function HomeScreen({ navigation }) {
//   return (
//     <ScrollView style={styles.container}>
//       {/* Header Section */}
//       <View style={styles.headerContainer}>
//         <Text style={styles.heading}>Welcome to DropIt 👋</Text>
//         <Text style={styles.subheading}>Smart Waste Management at Your Fingertips</Text>
//       </View>

//       {/* Stats Cards */}
//       <View style={styles.cardContainer}>
//         <View style={styles.statsCard}>
//           <View style={styles.statItem}>
//             <Text style={styles.statIcon}>🌱</Text>
//             <Text style={styles.statValue}>2.3 kg</Text>
//             <Text style={styles.statLabel}>Waste Sorted Today</Text>
//             <Text style={styles.statSubtext}>Great job! Keep reducing</Text>
//           </View>
//         </View>

//         <View style={styles.scoreCard}>
//           <View style={styles.scoreContent}>
//             <Text style={styles.scoreIcon}>🏆</Text>
//             <Text style={styles.scoreValue}>89%</Text>
//             <Text style={styles.scoreLabel}>Recycling Score</Text>
//             <Text style={styles.scoreSubtext}>You're in the top 10%</Text>
//           </View>
//           <View style={styles.scoreGradient} />
//         </View>
//       </View>

//       {/* Eco Tips Section */}
//       <View style={styles.tipsSection}>
//         <Text style={styles.sectionTitle}>Daily Eco Challenge</Text>
//         <TouchableOpacity 
//           style={styles.ecoButton} 
//           onPress={() => navigation.navigate('Tips')}
//         >
//           <View style={styles.buttonContent}>
//             <View style={styles.buttonIcon}>
//               <Text style={styles.buttonEmoji}>💡</Text>
//             </View>
//             <View style={styles.buttonTextContainer}>
//               <Text style={styles.buttonTitle}>Eco-Friendly Tips</Text>
//               <Text style={styles.buttonSubtitle}>Discover new ways to help the planet</Text>
//             </View>
//             <Text style={styles.buttonArrow}>→</Text>
//           </View>
//         </TouchableOpacity>
//       </View>

//       {/* Achievement Banner */}
//       <View style={styles.achievementBanner}>
//         <Text style={styles.achievementText}>🎉 You've saved 15kg of waste this month!</Text>
//         <Text style={styles.achievementSubtext}>Keep up the amazing work</Text>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5e6cc',
//   },
//   headerContainer: {
//     backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//     padding: 25,
//     paddingTop: 40,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     marginBottom: 25,
//   },
//   heading: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#1e293b',
//     marginBottom: 8,
//   },
//   subheading: {
//     fontSize: 16,
//     color: '#64748b',
//     lineHeight: 22,
//   },
//   cardContainer: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
    
//   },
//   statsCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 20,
//     padding: 25,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 5,
//     borderLeftWidth: 4,
//     borderLeftColor: '#10b981',
//   },
//   statItem: {
//     alignItems: 'center',
//   },
//   statIcon: {
//     fontSize: 32,
//     marginBottom: 10,
//   },
//   statValue: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#10b981',
//     marginBottom: 5,
//   },
//   statLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: 5,
//   },
//   statSubtext: {
//     fontSize: 14,
//     color: '#6b7280',
//     textAlign: 'center',
//   },
//   scoreCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 20,
//     padding: 25,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 5,
//     position: 'relative',
//     overflow: 'hidden',
//   },
//   scoreContent: {
//     alignItems: 'center',
//     zIndex: 1,
//   },
//   scoreIcon: {
//     fontSize: 32,
//     marginBottom: 10,
//   },
//   scoreValue: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     color: '#f59e0b',
//     marginBottom: 5,
//   },
//   scoreLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: 5,
//   },
//   scoreSubtext: {
//     fontSize: 14,
//     color: '#6b7280',
//     textAlign: 'center',
//   },
//   scoreGradient: {
//     position: 'absolute',
//     top: 0,
//     right: 0,
//     width: 80,
//     height: 80,
//     backgroundColor: '#fef3c7',
//     borderRadius: 40,
//     opacity: 0.3,
//   },
//   tipsSection: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#1e293b',
//     marginBottom: 15,
//   },
//   ecoButton: {
//     backgroundColor: '#ffffff',
//     borderRadius: 20,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 5,
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//   },
//   buttonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   buttonIcon: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: '#dbeafe',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 15,
//   },
//   buttonEmoji: {
//     fontSize: 28,
//   },
//   buttonTextContainer: {
//     flex: 1,
//   },
//   buttonTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1e293b',
//     marginBottom: 4,
//   },
//   buttonSubtitle: {
//     fontSize: 14,
//     color: '#6b7280',
//     lineHeight: 20,
//   },
//   buttonArrow: {
//     fontSize: 20,
//     color: '#3b82f6',
//     fontWeight: 'bold',
//   },
//   achievementBanner: {
//     marginHorizontal: 20,
//     marginBottom: 30,
//     backgroundColor: '#ecfdf5',
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#d1fae5',
//   },
//   achievementText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#065f46',
//     marginBottom: 4,
//     textAlign: 'center',
//   },
//   achievementSubtext: {
//     fontSize: 14,
//     color: '#047857',
//     textAlign: 'center',
//   },
// });