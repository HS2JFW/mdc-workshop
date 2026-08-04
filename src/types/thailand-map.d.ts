declare module '@svg-maps/thailand' {
  export interface Location {
    name: string;
    id: string;
    path: string;
  }
  export interface ThailandMap {
    label: string;
    viewBox: string;
    locations: Location[];
  }
  const map: ThailandMap;
  export default map;
}
