import React, { useState } from "react";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";

import L from "leaflet";

const iconPerson = new L.Icon({
    iconUrl: require("./img/number7.svg"),
    iconAnchor: null,
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null,
    iconSize: new L.Point(40, 40),
    className: "icon-green"
});

export default () => {
    const map = {
        lat: 60.152442,
        lng: 24.918126,
        zoom: 14,
        number: 1
    };

    const position = [map.lat, map.lng];

    const [tram, setTram] = useState([60.152442, 24.918126]);

    return (
        <Map style={{ height: "70vh" }} center={position} zoom={map.zoom}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={tram} icon={iconPerson}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
        </Map>
    );
};
