import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet + React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Component to handle map centering when location changes
const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
};

const LocationMap = ({ lat, lng, interactive = false, className = "" }) => {
  const position = [lat || 12.9716, lng || 77.5946];
  const isValidLocation = lat !== 0 && lng !== 0;

  return (
    <div className={`w-full h-full ${className || 'rounded-[2.5rem] border-4 border-slate-800 shadow-inner'} overflow-hidden`}>
      <MapContainer 
        center={position} 
        zoom={isValidLocation ? 15 : 13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        scrollWheelZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {isValidLocation && (
          <>
            <Marker position={position} />
            <ChangeView center={position} />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default LocationMap;
