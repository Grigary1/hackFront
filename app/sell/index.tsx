import React, { useEffect, useState } from "react";
import { View, ScrollView, Alert, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import * as Location from "expo-location";
import { TextInput, Button, Card, Title, Text, useTheme, ProgressBar, ActivityIndicator } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

export default function WasteSellForm() {
  const theme = useTheme();
  const BACKEND_URL = "http://10.0.11.39:8000";
  
  const [locationText, setLocationText] = useState("");
  const [coords, setCoords] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState({
    sellerName: "",
    quantity: "",
    pricePerKg: "",
    phoneNumber: "",
    landmark: "",
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        setLoadingLocation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync(loc.coords);
      const addr = address[0];
      const formatted = `${addr.name}, ${addr.street}, ${addr.city}`;
      setLocationText(formatted);
      setCoords(loc.coords);
      setLoadingLocation(false);
    })();
  }, []);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setProgress(0.3);

    const { sellerName, quantity, pricePerKg, phoneNumber, landmark } = formData;

    if (!sellerName || !quantity || !pricePerKg || !phoneNumber || !locationText || !coords) {
      Alert.alert("Error", "All fields except landmark are required.");
      setIsSubmitting(false);
      return;
    }

    if (parseFloat(quantity) < 1) {
      Alert.alert("Invalid Quantity", "Minimum 1 kg of waste is required.");
      setIsSubmitting(false);
      return;
    }

    const finalPayload = {
      sellerName,
      quantity: parseFloat(quantity),
      pricePerKg: parseFloat(pricePerKg),
      phoneNumber,
      landmark,
      location: {
        address: locationText,
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
    };

    try {
      setProgress(0.6);
      const response = await fetch(`${BACKEND_URL}/api/user/submitwaste`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalPayload),
      });

      const data = await response.json();
      setProgress(0.9);

      if (response.ok) {
        Alert.alert("Success", data.message || "Waste info submitted!");
        setFormData({
          sellerName: "",
          quantity: "",
          pricePerKg: "",
          phoneNumber: "",
          landmark: "",
        });
      } else {
        Alert.alert("Error", data.message || "Submission failed");
      }
    } catch (err) {
      console.error("Submission error:", err);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
      setProgress(0);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialIcons name="recycling" size={28} color="#1B5E20" />
              <Title style={styles.title}>Sell Your Waste</Title>
              <MaterialIcons name="recycling" size={28} color="#1B5E20" />
            </View>

            <Text style={styles.subtitle}>Fill details to list your waste materials</Text>

            {isSubmitting && <ProgressBar progress={progress} color="#4CAF50" style={styles.progressBar} />}

            <View style={styles.formContainer}>
              <TextInput
                label="Seller Name"
                value={formData.sellerName}
                onChangeText={(text) => handleChange("sellerName", text)}
                mode="outlined"
                left={<TextInput.Icon icon="account" />}
                style={styles.input}
                outlineColor="#388E3C"
                activeOutlineColor="#1B5E20"
                disabled={isSubmitting}
              />

              <View style={styles.row}>
                <TextInput
                  label="Quantity (kg)"
                  value={formData.quantity}
                  onChangeText={(text) => handleChange("quantity", text)}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                  left={<TextInput.Icon icon="weight" />}
                  outlineColor="#388E3C"
                  activeOutlineColor="#1B5E20"
                  disabled={isSubmitting}
                />
                <TextInput
                  label="Price/Kg"
                  value={formData.pricePerKg}
                  onChangeText={(text) => handleChange("pricePerKg", text)}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                  left={<TextInput.Icon icon="cash" />}
                  outlineColor="#388E3C"
                  activeOutlineColor="#1B5E20"
                  disabled={isSubmitting}
                />
              </View>

              <TextInput
                label="Location"
                value={locationText}
                onChangeText={setLocationText}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="map-marker" />}
                right={
                  loadingLocation
                    ? <TextInput.Icon icon={() => <ActivityIndicator size="small" color="#1B5E20" />} />
                    : <TextInput.Icon icon="crosshairs-gps" />
                }
                outlineColor="#388E3C"
                activeOutlineColor="#1B5E20"
                multiline
                disabled={true}
              />

              <TextInput
                label="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(text) => handleChange("phoneNumber", text)}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                left={<TextInput.Icon icon="phone" />}
                outlineColor="#388E3C"
                activeOutlineColor="#1B5E20"
                disabled={isSubmitting}
              />

              <TextInput
                label="Landmark (optional)"
                value={formData.landmark}
                onChangeText={(text) => handleChange("landmark", text)}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="home-map-marker" />}
                outlineColor="#388E3C"
                activeOutlineColor="#1B5E20"
                disabled={isSubmitting}
              />

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                buttonColor="#1B5E20"
                textColor="#FFFFFF"
                icon="send"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Submit Waste Info"}
              </Button>

              <View style={styles.infoBox}>
                <MaterialIcons name="info" size={18} color="#1B5E20" />
                <Text style={styles.infoText}>
                  Your waste will be listed for recycling companies to purchase
                </Text>
              </View>
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
    backgroundColor: "#E8F5E9",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    color: "#1B5E20",
    fontWeight: "bold",
    marginHorizontal: 10,
    fontSize: 24,
  },
  subtitle: {
    textAlign: "center",
    color: "#757575",
    marginBottom: 20,
    fontSize: 14,
  },
  formContainer: {
    marginTop: 10,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#F1F8E9",
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 6,
    elevation: 2,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginVertical: 10,
    backgroundColor: "#E0E0E0",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  infoText: {
    color: "#2E7D32",
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
  },
});
