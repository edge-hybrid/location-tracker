// Tracking context

import React, { FC, useState, PropsWithChildren, createContext, useContext } from 'react';
import haversine from 'haversine';

// Point interface
export interface Point {
  latitude: number;
  longitude: number;
  timestamp: number;
}

// State interface
type State = {
  points: Point[];
  isTracking: boolean;
  startTime: number | null;
  endTime: number | null;
  distance: number;          // metres
};

// Actions interface
type Actions = {
  start(): void;
  stop(): void;
  addPoint(p: Point): void;
};

const TrackingContext = createContext<State & Actions>(null!);

export const TrackingProvider: FC<PropsWithChildren> = ({ children }) => {

  // Points for the map
  const [points, setPoints] = useState<Point[]>([]);
  // Is tracking
  const [isTracking, setIsTracking] = useState(false);
  // Start time
  const [startTime, setStartTime] = useState<number | null>(null);
  // End time
  const [endTime, setEndTime] = useState<number | null>(null);
  // Distance
  const [distance, setDistance] = useState(0);

  // Actions
  const addPoint = (p: Point) => {
    setPoints(prev => {
      if (prev.length) {
        setDistance(d => d + haversine(prev[prev.length - 1], p, { unit: 'meter' }));
      }
      return [...prev, p];
    });
  };

  const start = () => {
    // reset values
    setPoints([]); setDistance(0); setStartTime(Date.now()); setIsTracking(true);
  };

  const stop = () => {
    setIsTracking(false);
    setEndTime(Date.now());
  }

  return (
    <TrackingContext.Provider value={{ points, isTracking, startTime, endTime, distance, start, stop, addPoint }}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => useContext(TrackingContext);