'use client';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibWdlcmExIiwiYSI6ImNtdXU1eGsweDAxMHkyenB4ZWp4b3E2bXkifQ.nH8KeDVpmnJiP3qOCoU6vQ';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      center: [-122.335, 47.615],
      zoom: 12,
      style: 'mapbox://styles/mapbox/streets-v12'
    });

    new mapboxgl.Marker({ color: '#1e3a8a' })
      .setLngLat([-122.3394, 47.6185])
      .setPopup(new mapboxgl.Popup().setHTML('<h3>Ruhamah LuggageStore</h3><p>2801 1st Ave Ste A</p>'))
      .addTo(map.current);
  }, []);

  return <div ref={mapContainer} className="w-full h-96 rounded-lg shadow-lg" />;
}