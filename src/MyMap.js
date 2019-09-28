import React, { useState, useEffect } from "react";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

let request = require("request-promise-native");
async function getTripId(routeId, realtimeDirectionId, departureDate, departureTime) {
    const routingDirectionId = realtimeDirectionId - 1;

    const [hours, minutes] = departureTime.split(":");
    const departureSeconds = hours * 3600 + minutes * 60;

    const query = `
        {
        fuzzyTrip(route: "HSL:${routeId}", direction: ${routingDirectionId}, date: "${departureDate}", time: ${departureSeconds}) {
            gtfsId
        }
        }
        `;

    const response = await request.post(
        "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql",
        {
            body: {
                query
            },
            json: true,
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    console.log(response);

    const trip = response.data.fuzzyTrip;

    return trip ? trip.gtfsId : null;
}

let trams = [];
let mqtt = require("mqtt");
let client = mqtt.connect("wss://mqtt.hsl.fi:443/");
/*client on connect */

client.on("connect", function() {
    console.log("client is connected");
});
client.subscribe("/hfp/v2/journey/ongoing/vp/tram/+/+/+/+/#", { qos: 1 }, function(error, granted) {
    if (error) {
        console.log(error);
    } else {
        console.log("client connected :", granted);
    }
});

client.on("message", async function(topic, message) {
    const data = JSON.parse(message);
    // console.log(data.VP);
    const { desi, veh, lat, long } = data.VP;
    // console.log("veh:", veh, "lat:", lat, "long:", long);
    const existTram = trams.find(tram => {
        return tram.veh === veh;
    });
    //
    if (!existTram) {
        trams = [...trams, { desi, veh, lat, long }];
        const { VP } = data;
        console.log(VP);

        const tripId = await getTripId(VP.route, VP.dir, VP.oday, VP.start);
        console.log("tripId", tripId);
        // console.log(data.VP);
    } else {
        if (!lat || !long) {
            return;
        }
        trams = trams.map(tram => (tram.veh == veh ? { desi, veh, lat, long } : tram));
    }
    //
});

export default () => {
    const map = {
        lat: 60.169282,
        lng: 24.939191,
        zoom: 14,
        number: 1
    };

    const position = [map.lat, map.lng];

    const [tramsArray, setTramsArray] = useState([]);

    const [tramColor, setTramColor] = useState("icon-green");

    useEffect(() => {
        setInterval(() => {
            // console.log(trams);
            setTramsArray(trams);
        }, 1000);
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
            <Map
                style={{ height: "80vh" }}
                center={position}
                zoom={map.zoom}
                zoomControl={false}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {tramsArray.map(tram => {
                    const tramPosition = [tram.lat, tram.long];
                    return (
                        <Marker
                            key={tram.veh}
                            position={tramPosition}
                            icon={L.divIcon({
                                className: `my-div-icon vh-${tram.veh} route desi-${tram.desi} `
                            })}
                            opacity={0.8}
                        ></Marker>
                    );
                })}
            </Map>
        </>
    );
};
