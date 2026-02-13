import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

type Location = {
    latitude: number;
    longitude: number;
};

type FilterContextType = {
    filterRadius: number; // in km
    setFilterRadius: (radius: number) => void;
    filterLocation: Location | null;
    setFilterLocation: (location: Location | null) => void;
    locationError: string | null;
    isFiltering: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    activeCategory: string;
    setActiveCategory: (category: string) => void;
    showSoldOut: boolean;
    setShowSoldOut: (show: boolean) => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
    const [filterRadius, setFilterRadius] = useState<number>(30);
    const [filterLocation, setFilterLocation] = useState<Location | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [showSoldOut, setShowSoldOut] = useState<boolean>(false);

    // Initial Location Check & Watcher
    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;

        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLocationError('Permission to access location was denied');
                    // Fallback to Geneva
                    setFilterLocation({ latitude: 46.2044, longitude: 6.1432 });
                    return;
                }

                // Initial Fetch (Fast)
                const location = await Location.getCurrentPositionAsync({});
                setFilterLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });

                // Start Watching (Live Updates)
                subscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 5000, // Update every 5 seconds
                        distanceInterval: 50 // Or every 50 meters
                    },
                    (newLoc) => {
                        setFilterLocation({
                            latitude: newLoc.coords.latitude,
                            longitude: newLoc.coords.longitude
                        });
                    }
                );
            } catch (error) {
                // Silent error
                setLocationError('Could not fetch location');
                // Fallback
                setFilterLocation({ latitude: 46.2044, longitude: 6.1432 });
            }
        })();

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);

    const isFiltering = !!filterLocation && (filterRadius < 50 || activeCategory !== 'All' || showSoldOut);

    return (
        <FilterContext.Provider value={{
            filterRadius,
            setFilterRadius,
            filterLocation,
            setFilterLocation,
            locationError,
            isFiltering,
            searchQuery,
            setSearchQuery,
            activeCategory,
            setActiveCategory,
            showSoldOut,
            setShowSoldOut
        }}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter() {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error('useFilter must be used within a FilterProvider');
    }
    return context;
}
