// Custom Google Maps style to hide all POIs and keep map clean
export const cleanMapStyle = [
    {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
    },
    {
        featureType: 'poi.business',
        stylers: [{ visibility: 'off' }]
    },
    {
        featureType: 'poi.park',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
    },
    {
        featureType: 'transit',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }]
    },
    {
        featureType: 'transit.station',
        stylers: [{ visibility: 'off' }]
    }
];
