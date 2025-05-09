import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from "react-native";
import { fetchAllPlanes } from "../../services/opensky";

const HomeScreen = () => {
  const [planes, setPlanes] = useState<any[]>([]);
  const [filteredPlanes, setFilteredPlanes] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [minAltitude, setMinAltitude] = useState<string>("");
  const [callsign, setCallsign] = useState<string>("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [altitudeModalVisible, setAltitudeModalVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  useEffect(() => {
    const loadPlanes = async () => {
      try {
        const data = await fetchAllPlanes();
        setPlanes(data.states || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadPlanes();
  }, []);

  useEffect(() => {
    const filtered = planes.filter((plane) => {
      const countryMatch = !selectedCountry || plane[2] === selectedCountry;
      const altitudeMatch =
        !minAltitude ||
        (plane[7] !== null && plane[7] >= parseFloat(minAltitude));
      const callsignMatch =
        !callsign || plane[1]?.toLowerCase().includes(callsign.toLowerCase());
      return countryMatch && altitudeMatch && callsignMatch;
    });
    setFilteredPlanes(filtered);
  }, [planes, selectedCountry, minAltitude, callsign]);

  const uniqueCountries = Array.from(
    new Set(planes.map((p) => p[2]).filter(Boolean))
  ).sort();

  const filteredCountries = uniqueCountries.filter((country) =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const resetFilters = () => {
    setSelectedCountry(null);
    setMinAltitude("");
    setCountrySearch("");
    setCallsign("");
    setShowFilterPanel(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>OpenSky Tracker</Text>
        <View style={styles.controlsRow}>
          <TextInput
            style={styles.callsignInput}
            placeholder="Callsign"
            value={callsign}
            onChangeText={setCallsign}
          />
          <TouchableOpacity
            onPress={() => setShowFilterPanel(!showFilterPanel)}
          >
            <Text style={styles.filterIcon}>🛠️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showFilterPanel && (
        <View style={styles.filterPanel}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setCountryModalVisible(true)}
          >
            <Text style={styles.filterButtonText}>
              {selectedCountry ? `Страна: ${selectedCountry}` : "Страна"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setAltitudeModalVisible(true)}
          >
            <Text style={styles.filterButtonText}>
              {minAltitude ? `Мин. высота: ${minAltitude}` : "Мин. высота"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton} onPress={resetFilters}>
            <Text style={styles.filterButtonText}>Сбросить фильтры</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={countryModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Выберите страну</Text>
          <TextInput
            placeholder="Поиск..."
            style={styles.searchInput}
            value={countrySearch}
            onChangeText={setCountrySearch}
          />
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedCountry(item);
                  setCountryModalVisible(false);
                }}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            onPress={() => setCountryModalVisible(false)}
            style={styles.closeButton}
          >
            <Text>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={altitudeModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Минимальная высота (м)</Text>
          <TouchableOpacity
            style={styles.altitudeButton}
            onPress={() => {
              setMinAltitude("1000");
              setAltitudeModalVisible(false);
            }}
          >
            <Text>1000 м</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.altitudeButton}
            onPress={() => {
              setMinAltitude("5000");
              setAltitudeModalVisible(false);
            }}
          >
            <Text>5000 м</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.altitudeButton}
            onPress={() => {
              setMinAltitude("10000");
              setAltitudeModalVisible(false);
            }}
          >
            <Text>10000 м</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setAltitudeModalVisible(false)}
            style={styles.closeButton}
          >
            <Text>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <ScrollView>
        {filteredPlanes.slice(0, 10).map((plane, idx) => (
          <View key={idx} style={styles.planeBox}>
            <Text>Позывной: {plane[1] || "N/A"}</Text>
            <Text>Страна: {plane[2]}</Text>
            <Text>Широта: {plane[6]}</Text>
            <Text>Долгота: {plane[5]}</Text>
            <Text>Высота: {plane[7]}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterIcon: {
    fontSize: 24,
  },
  callsignInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 8,
    width: "80%",
  },
  filterPanel: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  filterButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterButtonText: { color: "#fff" },
  planeBox: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 10,
  },
  modalContainer: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, marginBottom: 10 },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  altitudeButton: {
    backgroundColor: "#f0ad4e",
    paddingVertical: 10,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default HomeScreen;
