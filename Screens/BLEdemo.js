import React, { useState } from 'react';
import { View, Text, Alert, Button, Modal, TextInput, StyleSheet, FlatList } from 'react-native';
import {
  ESPProvisionManager,
  ESPDevice,
  ESPTransport,
  ESPSecurity,
} from '@orbital-systems/react-native-esp-idf-provisioning';
import { useUser } from "../context/userContext";

const BLEdemo = () => {
  const { user, loading } = useUser();
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');

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
        console.log('Found devices:', foundDevices);
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

    try {
      console.log("trying to connect");
      await selectedDevice.connect("abcd1234");
      console.log(ssid + " " + password);
      await selectedDevice.provision(ssid, password);
      Alert.alert('Success', 'Wi-Fi credentials sent successfully!');

      await selectedDevice.disconnect();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', `Failed to provision device: ${error.message}`);
    }
  };

  const showWifiDialog = (device) => {
    setSelectedDevice(device);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BLE Device Scanner</Text>
      <Button title={isScanning ? 'Scanning...' : 'Scan for Devices'} onPress={scanForDevices} disabled={isScanning} />
      <FlatList
        data={devices}
        keyExtractor={(item, index) => `${item.identifier}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.deviceItem}>
            <Text style={styles.deviceText}>{item.name || 'Unnamed Device'}</Text>
            <Text style={styles.deviceText}>ID: {item.identifier}</Text>
            <Button title="Connect" onPress={() => showWifiDialog(item)} />
          </View>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Enter Wi-Fi Credentials</Text>
          <TextInput
            style={styles.textInput}
            placeholder="SSID"
            value={ssid}
            onChangeText={setSsid}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
          <Button title="Submit" onPress={() => { connectToDevice(); setModalVisible(false); }} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  deviceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  deviceText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  textInput: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});

export default BLEdemo;
