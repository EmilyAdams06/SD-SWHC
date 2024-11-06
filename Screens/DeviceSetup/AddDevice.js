import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Button, Modal, TextInput, StyleSheet, FlatList } from 'react-native';
import {
  ESPProvisionManager,
  ESPDevice,
  ESPTransport,
  ESPSecurity,
} from '@orbital-systems/react-native-esp-idf-provisioning';
import { useUser } from '../../context/userContext';
import { getDatabase, ref, onValue, update, database } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';

const AddDevice = () => {
    const { user, loading } = useUser();
    const [devices, setDevices] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation(); 

    const scanForDevices = async () => {
        try {
          setIsScanning(true);
          const prefix = '';
          const transport = ESPTransport.ble;
          const security = ESPSecurity.secure2;
    
          const foundDevices = await ESPProvisionManager.searchESPDevices(prefix, transport, security);
    
          if (foundDevices.length === 0) {
            Alert.alert('No Devices Found', 'No BLE devices found.');
          } else {
          //  console.log('Found devices:', foundDevices);
            setDevices(foundDevices);
          }
        } catch (error) {
          console.error(error);
          Alert.alert('Error', `Failed to scan for devices: ${error.message}`);
        } finally {
          setIsScanning(false);
        }
      };

    const connectToDevice = async () => {
    if (!selectedDevice) return;

      // Add user.uid to the payload
      await selectedDevice.disconnect();
      const uid = user?.uid;
      console.log("Sending UID to ESP32:", uid);
      await sendUIDToESP32(uid);
    };

      const sendUIDToESP32 = async (uid) => {
        const data = { uid: uid };
        try {
            const response = await fetch(`http://esp32.local/receiveUID`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            // Log the raw response for debugging
            const responseText = await response.text(); // Get the raw response text
            console.log("Raw response from ESP32:", responseText); // Log raw response
    
            if (response.ok) {
                const responseBody = JSON.parse(responseText); // Parse the JSON response
                console.log("Response from ESP32:", responseBody);
                // Navigate back to Home Screen after successful connection
                const deviceId = responseBody.deviceId;
                navigation.navigate('DeviceInfo', { deviceId: deviceId});
            } else {
                console.error("Failed to send UID. Status:", response.status);
            }
        } catch (error) {
            console.error("Error sending UID to ESP32:", error);
        }
    };

    const showWifiDialog = (device) => {
        setSelectedDevice(device);
        setModalVisible(true);
      };
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Add a New Device</Text>
              <Text style={styles.subtitle}>Scan and connect to nearby ESP32 devices</Text>
            </View>

            <TouchableOpacity
              style={styles.scanButton}
              onPress={scanForDevices}
              disabled={isScanning}
            >
              <View style={styles.scanButtonContent}>
                {isScanning ? (
                  <ActivityIndicator color="#ffffff" style={styles.scanButtonIcon} />
                ) : (
                  <Feather name="bluetooth" size={24} color="#ffffff" style={styles.scanButtonIcon} />
                )}
                <Text style={styles.scanButtonText}>
                  {isScanning ? 'Scanning...' : 'Scan for Devices'}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        }
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.deviceItem}
            onPress={() => showConfirmDialog(item)}
          >
            <View style={styles.deviceInfo}>
              <Ionicons name="hardware-chip-outline" size={24} color="#3498db" style={styles.deviceIcon} />
              <View>
                <Text style={styles.deviceName}>{item.name}</Text>
            
              </View>
            </View>
            <Feather name="chevron-right" size={24} color="#bdc3c7" />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.flatListContent}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Connect to Device</Text>
            <Text style={styles.modalText}>
              Do you want to connect to {selectedDevice?.name}?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={connectToDevice}
              >
                <Text style={styles.modalButtonText}>Connect</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b252d',
  },
  header: {
    marginBottom: 30,
    marginTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  scanButton: {
    backgroundColor: '#3498db',
    borderRadius: 15,
    marginBottom: 30,
    overflow: 'hidden',
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  scanButtonIcon: {
    marginRight: 10,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  flatListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    marginBottom: 15,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    marginRight: 15,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  deviceId: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#34495e',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 25,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#2ecc71',
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    marginLeft: 10,
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddDevice;