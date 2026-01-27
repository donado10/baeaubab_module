/**
 * Checks if the browser supports geolocation and attempts to get the user's current position.
 * If geolocation is supported, it calls the showPosition callback with the position data.
 * Otherwise, it alerts the user that geolocation is not supported.
 */

import { useEffect, useState } from "react";

export function useGetLocation() {
	const [coords, setCoords] = useState([0, 0]);

	useEffect(() => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					console.log(position);
					setCoords([position.coords.longitude, position.coords.latitude]);
				},
				(error) => {
					console.error("Error Code = " + error.code + " - " + error.message);
				}
			);
		} else {
			console.log("Geolocation not supported");
		}
	}, []);

	return coords;
}
