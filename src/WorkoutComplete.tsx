import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTracking } from './context/TrackingContext';
import MetricCard from './components/MetricCard';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';

const WorkoutComplete = () => {
  const { points, startTime, endTime, distance } = useTracking();
  const duration = startTime && endTime ? (endTime - startTime) / 1000 : 0;   // seconds
  const pace = duration > 0 ? distance / duration : 0; // meters per second

  // Convert meters/second to km/h:
  // 1 m/s = (3600/1000) km/h = 3.6 km/h
  const speed = pace * 3.6; // km/h 

  // Using MET value of 7.0 for running at moderate pace (7 mph)
  // Calories = MET * weight(kg) * time(hours)
  // Assuming 80kg person (DEV weight), converting distance to approximate time at 7mph pace
  const MET = 7.0;
  const WEIGHT_KG = 80;
  // 1.60934 is the conversion factor from miles to kilometers (1 mile = 1.60934 km)
  // So 7 mph * 1.60934 = 11.26538 km/h
  const timeInHours = (distance / 1000) / (7 * 1.60934); // Convert distance to hours at 7mph
  const calories = MET * WEIGHT_KG * timeInHours;

  return (
    <View style={styles.flex_1}>
      <MapView
        style={styles.flex_1}
        showsUserLocation
        followsUserLocation
        region={{
          latitude: points[points.length - 1].latitude,
          longitude: points[points.length - 1].longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {points?.length > 0 && (
          <>
            <Polyline coordinates={points} strokeWidth={4} strokeColor="#ff3b30" />
            <Marker coordinate={points[points.length - 1]} />
          </>
        )}
      </MapView>
      <View style={styles.metricContainer}>
        <View style={styles.metricRow}>
          <MetricCard label="Time" value={`${duration.toFixed(2)} sec`} />
          <MetricCard label="Distance" value={`${distance.toFixed(2)} m`} />
          <MetricCard label="Pace" value={`${pace.toFixed(2)} m/s`} />
        </View>
        <View style={styles.metricRow}>
          <MetricCard label="Speed" value={`${speed.toFixed(2)} km/h`} />
          <MetricCard label="Calories" value={`${calories.toFixed(2)} calories`} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex_1: {
    flex: 1,
  },
  metricContainer: {
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  metricRow: {
    flexDirection: 'row',
  }
});

export default WorkoutComplete;
