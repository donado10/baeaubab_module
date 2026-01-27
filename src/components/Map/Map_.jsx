import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import MapLibreGlDirections, {
	layersFactory,
} from "@maplibre/maplibre-gl-directions";

import "./map.css";
import { useGetLocation } from "@/lib/coordinates";

import mapSpec from "@/utils/map.json";

export default function Map() {
	const mapContainer = useRef(null);
	const map = useRef(null);
	const [points, setPoints] = useState([]);

	const lng = 139.753;
	const lat = 35.6844;
	const zoom = 12;
	const API_KEY = "YOUR_MAPTILER_API_KEY_HERE";

	const coords = useGetLocation();

	useEffect(() => {
		if (map.current) return; // stops map from intializing more than once

		if (Math.abs(coords[0]) && Math.abs(coords[1]) && map) {
			map.current = new maplibregl.Map({
				container: mapContainer.current,
				style: `https://api.tomtom.com/map/1/style/22.2.1-9/2/basic_street-light.json?key=PSxVKm4txiCgAC16MxjhjCEsWfNBiOIA`,
				center: [coords[0], coords[1]],
				zoom: zoom,
			});

			let marker = new maplibregl.Marker({
				color: "#000000",
				draggable: true,
			})
				.setLngLat([coords[0], coords[1]])
				.addTo(map.current);

			map.current.on("click", (e) => {
				if (points.length < 2) {
					setPoints((prev) => [...prev, [e.lngLat.lng, e.lngLat.lat]]);
				}
			});
		}
	}, [API_KEY, coords, zoom]);

	useEffect(() => {
		if (points.length === 2) {
			getRoute(points[0], points[1]);
		}
	}, [points]);

	async function getRoute(start, end) {
		const url = `https://router.project-osrm.org/route/v1/driving/${start.join(",")};${end.join(",")}?overview=full&geometries=geojson`;

		const res = await fetch(url);
		const data = await res.json();

		const route = data.routes[0].geometry;

		if (map.current.getSource("route")) {
			map.current.getSource("route").setData(route);
		} else {
			map.current.addSource("route", {
				type: "geojson",
				data: route,
			});

			map.current.addLayer({
				id: "route",
				type: "line",
				source: "route",
				paint: {
					"line-color": "#3b82f6",
					"line-width": 5,
				},
			});
		}
	}

	return (
		<div className="map-wrap">
			<div ref={mapContainer} className="map" />
		</div>
	);
}
