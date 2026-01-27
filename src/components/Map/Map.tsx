"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import MapLibreGlDirections, {
    layersFactory,
} from "@maplibre/maplibre-gl-directions";


import style from "@/utils/map2.json";
import DirectionArrowImageUrl from "@/assets/images/direction-arrow.png";
import { useGetLocation } from "@/lib/coordinates";

export const examples = [
    {
        slug: "directions",
        name: "Directions",
        index: 1,
        sourceUrl:
            "https://github.com/maplibre/maplibre-gl-directions/tree/main/demo/src/examples/01 Directions.svelte",
    },
    {
        slug: "routing-with-arrows",
        name: "Routing With Arrows",
        index: 2,
        sourceUrl:
            "https://github.com/maplibre/maplibre-gl-directions/tree/main/demo/src/examples/02 Routing With Arrows.svelte",
    },
];


export default function MapDirectionsPage() {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const directionsRef = useRef<MapLibreGlDirections | null>(null);

    const pathname = usePathname();
    const meta = examples.find((example) => example.sourceUrl === pathname);
    const coords = useGetLocation();


    useEffect(() => {
        if (!mapRef.current) return;

        const map = new maplibregl.Map({
            container: mapRef.current,
            style: style,
            center: coords,
            zoom: 11,
            attributionControl: false,
        });

        map.addControl(
            new maplibregl.AttributionControl({
                customAttribution:
                    "<a href='http://project-osrm.org/' target='_blank' rel='noopener noreferrer'>&copy; OSRM</a>",
            })
        );

        // Load direction arrow image
        map.loadImage(DirectionArrowImageUrl).then((image) => {
            if (image && !map.hasImage("direction-arrow")) {
                map.addImage("direction-arrow", image.data);
            }
        });

        const layers = layersFactory();

        layers.push({
            id: "maplibre-gl-directions-routeline-direction-arrow",
            type: "symbol",
            source: "maplibre-gl-directions",
            layout: {
                "symbol-placement": "line-center",
                "icon-image": "direction-arrow",
                "icon-size": [
                    "interpolate",
                    ["exponential", 1.5],
                    ["zoom"],
                    12,
                    0.85,
                    18,
                    1.4,
                ],
            },
            paint: {
                "icon-opacity": 0.5,
            },
            filter: ["==", ["get", "route"], "SELECTED"],
        });

        map.on("load", () => {
            directionsRef.current = new MapLibreGlDirections(map, {
                requestOptions: {
                    alternatives: "true",
                },
                layers,
            });

            directionsRef.current.interactive = true;
        });

        return () => {
            map.remove();
        };
    }, [coords]);

    return (
        <div className="flex w-full h-full">
            {/*  <>
                <span className="block text-lg font-semibold">
                    {meta?.name}
                </span>

                <p>
                    Another example that demonstrates the ease of extending the original
                    styles provided by the plugin.
                </p>

                <p>
                    This time a <strong>symbol</strong> layer is added that shows the
                    direction the selected route goes in.
                </p>

                <small>
                    <strong>Note:</strong> You must manually load and add images used by
                    custom layers.
                </small>
            </> */}

            <div
                ref={mapRef}
                className="w-full h-full shadow-xl "
            />
        </div>
    );
}
