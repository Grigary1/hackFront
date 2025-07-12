import React from 'react';
import { Linking, View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerGlass}>
          <Text style={styles.title}>Welcome to DropIt 👋</Text>
          <Text style={styles.subtitle}>Smart Waste Management at Your Fingertips</Text>
        </View>
      </View>

      {/* Learning Hub */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Learning Hub</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            {
              title: 'What is Waste Segregation?',
              url: 'https://youtu.be/K6ppCC3lboU',
              color: '#a1c4fd',
            },
            {
              title: 'How to Segregate Waste at Home',
              url: 'https://youtu.be/A8udcpxDLtc',
              color: '#c2e9fb',
            },
            {
              title: 'Biodegradable vs Non-Biodegradable',
              url: 'https://youtu.be/Gboh2yaAinM',
              color: '#fbc2eb',
            },
          ].map((video, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, { backgroundColor: video.color + '40' }]}
              onPress={() => Linking.openURL(video.url)}
              activeOpacity={0.85}
            >
              <Text style={styles.cardTitle}>{video.title}</Text>
              <Text style={styles.cardLink}>Watch →</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Eco Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌿 Eco Tips</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            {
              icon: '♻️',
              title: 'Reuse Glass Jars',
              description: 'Clean jars and reuse them for spices or storage.',
              color: '#fdfbfb',
            },
            {
              icon: '🛍️',
              title: 'Carry Reusable Bags',
              description: 'Say no to plastic. Use jute or cloth bags.',
              color: '#e0c3fc',
            },
            {
              icon: '📦',
              title: 'Repurpose Boxes',
              description: 'Use cardboard to organize or donate.',
              color: '#fefcea',
            },
            {
              icon: '🧺',
              title: 'Recycle Clothes',
              description: 'Old clothes? Use as rags or donate.',
              color: '#d4fc79',
            },
            {
              icon: '🌿',
              title: 'Compost Waste',
              description: 'Veggie peels can nourish your plants.',
              color: '#a1ffce',
            },
          ].map((tip, index) => (
            <View key={index} style={[styles.tipCard, { backgroundColor: tip.color + '80' }]}>
              <Text style={styles.tipEmoji}>{tip.icon}</Text>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Achievement Banner */}
      <View style={styles.achievementBanner}>
        <Text style={styles.achievementText}>🎉Thought</Text>
        <Text style={styles.achievementSubtext}>Cleanliness is next to Godliness ❤️</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    backgroundColor: '#ffffffcc',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#aaa',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  headerGlass: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  card: {
    width: width * 0.75,
    padding: 20,
    borderRadius: 16,
    marginRight: 15,
    backgroundColor: '#ffffffcc',
    shadowColor: '#bbb',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
  },
  cardLink: {
    fontSize: 14,
    color: '#007aff',
    fontWeight: '500',
  },
  tipCard: {
    width: width * 0.68,
    padding: 20,
    borderRadius: 16,
    marginRight: 15,
    backgroundColor: '#ffffffcc',
    shadowColor: '#aaa',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    justifyContent: 'center',
  },
  tipEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
  },
  tipDescription: {
    fontSize: 15,
    color: '#555',
  },
  achievementBanner: {
    marginTop: 40,
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#e6f5ea',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  achievementText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementSubtext: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});