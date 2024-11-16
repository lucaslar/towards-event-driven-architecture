import { tileLayer } from 'leaflet';
import { environment } from '../../environments/environment';

const layerUrl = environment.tilesUrl;
const attribution = '© OpenStreetMap Contributors';

export const mapLayer = () => tileLayer(layerUrl, { attribution });
