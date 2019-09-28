import React, { useState, useEffect } from "react";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";

import L from "leaflet";
import TramPos from "./TramPos";

export default () => {
    const map = {
        lat: 60.152442,
        lng: 24.918126,
        zoom: 14,
        number: 1
    };

    const position = [map.lat, map.lng];

    const [tramPos, setTramPos] = useState([60.152442, 24.918126]);
    const [tramColor, setTramColor] = useState("icon-green");

    const iconTram = new L.Icon({
        iconUrl: require("./img/number7.svg"),
        iconAnchor: null,
        popupAnchor: null,
        shadowUrl: null,
        shadowSize: null,
        shadowAnchor: null,
        iconSize: new L.Point(40, 40),
        className: tramColor
    });

    useEffect(() => {
        const url =
            "https://hsl-tram-congestion.appspot.com/trips/HSL:1007_20190820_Ti_2_2101/congestionRate";
        const fetchData = async () => {
            const result = await fetch(url);
            const data = await result.text();
            const congestionRate = parseFloat(data);
            console.log(congestionRate);

            if (congestionRate > 1) {
                setTramColor("icon-red");
            } else if (congestionRate > 0.5) {
                setTramColor("icon-yellow");
            } else {
                setTramColor("icon-green");
            }
        };
        fetchData();
    }, []);

    return (
        <>
            <TramPos setTramPos={setTramPos} />
            <Map style={{ height: "70vh" }} center={position} zoom={map.zoom}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={tramPos} icon={iconTram}>
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
            </Map>
        </>
    );
};
