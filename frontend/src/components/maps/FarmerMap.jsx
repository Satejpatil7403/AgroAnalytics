import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const FarmerMap = ({ farmers }) => {
    // Safety check for undefined or null farmers
    if (!farmers || !Array.isArray(farmers)) {
        return <div className="text-center p-4">No data available for map</div>;
    }

    // Calculate center based on farmers data or default to Maharashtra
    const center = farmers.length > 0
        ? [farmers[0].latitude, farmers[0].longitude]
        : [18.5204, 73.8567];

    return (
        <div className="map-container" style={{ height: '400px', width: '100%', borderRadius: '1rem', overflow: 'hidden', zIndex: 0 }}>
            <MapContainer
                center={center}
                zoom={9}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {farmers.map((farmer) => (
                    <Marker
                        key={farmer.id}
                        position={[farmer.latitude, farmer.longitude]}
                    >
                        <Popup>
                            <div className="map-popup">
                                <strong>{farmer.farmer_name}</strong><br />
                                {farmer.village_name}<br />
                                {farmer.crop_type} ({farmer.area_acres} acres)
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default FarmerMap;
