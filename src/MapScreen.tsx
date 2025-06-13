import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { check, request, RESULTS, PERMISSIONS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import { useTracking } from './context/TrackingContext';

// PERSMISSIONS
const ANDROID_PERMISSION = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
const IOS_PERMISSION = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

const MapScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [mapRegion, setMapRegion] = useState<Region>();

  const watchId = useRef<number | null>(null);
  const hasCenteredOnce = useRef(false);

  // get values from context
  const { points, isTracking, startTime, distance, start, stop, addPoint } = useTracking();

  const requestPermissions = async () => {
    // TODO: Implement permission request functionality
    const permission = Platform.OS === 'android' ? ANDROID_PERMISSION : IOS_PERMISSION;

    let status = await check(permission);
    if (status !== RESULTS.GRANTED) status = await request(permission);
    console.log(status);
    if (status !== RESULTS.GRANTED) {
      Alert.alert(
        'Permission needed',
        'We need your location to track your workout route.',
      );
    }

    return status === RESULTS.GRANTED;
  };

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        // request permissions
        const hasPermission = await requestPermissions();
        // if no permission, return
        if (!hasPermission) return;

        // get current location
        Geolocation.getCurrentPosition(
          ({ coords, timestamp }) => {
            // set map region to current location
            const { latitude, longitude } = coords;
            setMapRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
            addPoint({ ...coords, timestamp });
          },
          (error) => {
            console.warn('Error getting location:', error);
            Alert.alert('Error', 'Could not get your current location');
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } catch (error) {
        console.warn('Error in getCurrentLocation:', error);
      }
    };

    getCurrentLocation();
  }, []);

  const startTracking = async () => {
    if (!(await requestPermissions())) return;

    start();  // flip Context flag

    watchId.current = Geolocation.watchPosition(
      ({ coords, timestamp }) => {
        addPoint({ ...coords, timestamp });

        /* centre the map on the very first point to give feedback */
        if (!hasCenteredOnce.current) {
          setMapRegion(r => ({
            ...r!,
            latitude: coords.latitude,
            longitude: coords.longitude,
          }));
          hasCenteredOnce.current = true;
        }
      },
      err => console.warn('GPS error', err),
      { enableHighAccuracy: true, distanceFilter: 5, interval: 1000 }
    );
  };

  const stopTracking = () => {
    stop();                                        // flip Context flag
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);     // cleanup
      watchId.current = null;
    }
    navigation.navigate('WorkoutComplete');
  };

  return (
    <SafeAreaView
      style={styles.flex_1}
    >
      <MapView
        style={styles.flex_1}
        showsUserLocation
        followsUserLocation
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
      >
        {points?.length > 0 && (
          <>
            <Polyline coordinates={points} strokeWidth={4} strokeColor="#ff3b30" />
            <Marker coordinate={points[points.length - 1]} />
          </>
        )}
      </MapView>
      {/* Start tracking button */}
      {isTracking ? (
        <Button title="Stop & Save" onPress={stopTracking} />
      ) : (
        <Button title="Start Tracking" onPress={startTracking} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex_1: {
    flex: 1,
  }
});

export default MapScreen;
