import React, { useState, useEffect } from "react";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";

import L from "leaflet";
// import TramPos from "./TramPos";

let mqtt = require("mqtt");
let client = mqtt.connect("wss://mqtt.hsl.fi:443/");
/*client on connect */

client.on("connect", function() {
    console.log("client is connected");
});
client.subscribe("/hfp/v2/journey/ongoing/vp/tram/+/+/1007/+/#", { qos: 1 }, function(
    error,
    granted
) {
    if (error) {
        console.log(error);
    } else {
        console.log("client connected :", granted);
    }
});

export default () => {
    const map = {
        lat: 60.169282,
        lng: 24.939191,
        zoom: 13,
        number: 1
    };

    const position = [map.lat, map.lng];

    // const [trams, setTrams] = useState([]);
    // const [trams, setTrams] = useState([]);

    // const [tramPos, setTramPos] = useState([60.152442, 24.918126]);
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

    const checkTram = () => {
        let tramsArray = [];
        client.on("message", function(topic, message) {
            const data = JSON.parse(message);
            // console.log(data.VP);
            const { veh, lat, long } = data.VP;
            // console.log("veh:", veh, "lat:", lat, "long:", long);
            const existTram = trams.find(tram => {
                return tram.veh === veh;
            });
            console.log(trams);
            if (!existTram) {
                console.log("add tram", veh);
                trams = [...trams, { veh, lat, long }];
                // setTrams([...trams, { veh, lat, long }]);
            } else {
                trams.map(tram => (tram.veh == veh ? { veh, lat, long } : tram));
            }
            //
        });
    };
    useEffect(() => {
        checkTram();
    }, []);
    // useEffect(() => {
    //     const url =
    //         "https://hsl-tram-congestion.appspot.com/trips/HSL:1007_20190820_Ti_2_2101/congestionRate";
    //     const fetchData = async () => {
    //         const result = await fetch(url);
    //         const data = await result.text();
    //         const congestionRate = parseFloat(data);
    //         console.log(congestionRate);

    //         if (congestionRate > 1) {
    //             setTramColor("icon-red");
    //         } else if (congestionRate > 0.5) {
    //             setTramColor("icon-yellow");
    //         } else {
    //             setTramColor("icon-green");
    //         }
    //     };
    //     fetchData();
    // }, []);

    return (
        <>
            {/* <TramPos checkTram={checkTram} /> */}
            <Map style={{ height: "70vh" }} center={position} zoom={map.zoom}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* {trams.map(tram => {
                    return <Marker position={tram.number} icon={iconTram}></Marker>;
                })} */}
            </Map>
        </>
    );
};
