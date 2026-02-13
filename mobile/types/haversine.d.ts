declare module 'haversine' {
    interface Coordinate {
        latitude: number;
        longitude: number;
    }

    interface Options {
        unit?: 'km' | 'mile' | 'meter' | 'nmi';
        threshold?: number;
        format?: '[lat,lon]' | '[lon,lat]' | '{lat,lon}' | '{lon,lat}';
    }

    function haversine(
        start: Coordinate,
        end: Coordinate,
        options?: Options
    ): number;

    export default haversine;
}
