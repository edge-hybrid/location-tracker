import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from './src/MapScreen.tsx';
import WorkoutComplete from './src/WorkoutComplete.tsx';
import { NavigationContainer } from '@react-navigation/native';
import { TrackingProvider } from './src/context/TrackingContext.tsx';

const App = () => {
  return (
    <TrackingProvider>
      <NavigationContainer>
        <Router />
      </NavigationContainer>
    </TrackingProvider>
  );
};

const Router = () => {
  const RootStack = createNativeStackNavigator();

  return (
    <RootStack.Navigator>
      <RootStack.Screen name="Map" component={MapScreen} />
      <RootStack.Screen name="WorkoutComplete" component={WorkoutComplete} />
    </RootStack.Navigator>
  );
};

export default App;
