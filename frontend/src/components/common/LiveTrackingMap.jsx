import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Fix default icons for react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: iconShadow
});

// Custom marker icons
const beneficiaryIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const volunteerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to recenter map when volunteer moves
function MapUpdater({ beneficiaryLocation, volunteerLocation }) {
    const map = useMap();
    useEffect(() => {
        if (beneficiaryLocation && volunteerLocation) {
            const bounds = L.latLngBounds([beneficiaryLocation, volunteerLocation]);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        } else if (beneficiaryLocation) {
            map.setView(beneficiaryLocation, 15);
        } else if (volunteerLocation) {
            map.setView(volunteerLocation, 15);
        }
    }, [beneficiaryLocation, volunteerLocation, map]);
    return null;
}

export default function LiveTrackingMap({ beneficiaryLocation, volunteerLocation }) {
    const defaultCenter = [30.0444, 31.2357]; // Cairo fallback
    const center = beneficiaryLocation || volunteerLocation || defaultCenter;

    return (
        <div
            className="w-full relative z-0 rounded-2xl overflow-hidden border border-glass-border"
            style={{
                height: '420px',
                boxShadow: '0 0 30px rgba(37, 99, 235, 0.08), 0 8px 32px rgba(0,0,0,0.5)',
            }}
        >
            {/* Premium map inner-glow overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl ring-1 ring-inset ring-white/5" />

            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {beneficiaryLocation && (
                    <Marker position={beneficiaryLocation} icon={beneficiaryIcon}>
                        <Popup>
                            <span className="font-bold text-gray-800" dir="rtl">📍 موقع المستفيد</span>
                        </Popup>
                    </Marker>
                )}

                {volunteerLocation && (
                    <Marker position={volunteerLocation} icon={volunteerIcon}>
                        <Popup>
                            <span className="font-bold text-gray-800" dir="rtl">🚗 المتطوع (مباشر)</span>
                        </Popup>
                    </Marker>
                )}

                <MapUpdater beneficiaryLocation={beneficiaryLocation} volunteerLocation={volunteerLocation} />
            </MapContainer>
        </div>
    );
}
