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

    const trip = response.data.fuzzyTrip;
    // console.log("response", response);
    // console.log("trip", trip);

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
    if (!lat || !long) {
        return;
    }
    if (!existTram) {
        trams = [...trams, { desi, veh, lat, long }];
        const { VP } = data;
        // console.log("veh", veh, ": ", VP);

        const tripId = await getTripId(VP.route, VP.dir, VP.oday, VP.start);

        if (tripId) {
            console.log("veh", veh, ": ", "tripId", tripId);
            trams = trams.map(tram => (tram.veh == veh ? { ...tram, tripId } : tram));
        } else {
            console.log("trip Null VP:", VP);
        }

        // console.log(data.VP);
    } else {
        trams = trams.map(tram => (tram.veh == veh ? { ...tram, desi, veh, lat, long } : tram));
    }
    //
});

const refreshCongestion = () => {
    console.log("check Congestion");
    // console.log(trams);
    trams.forEach(tram => {
        if (tram.tripId) {
            checkCongestion(tram.veh, tram.tripId);
        }
    });
};

const checkCongestion = async (veh, tripId) => {
    const url = `https://hsl-tram-congestion.appspot.com/trips/${tripId}/congestionRate`;
    // `https://hsl-tram-congestion.appspot.com/trips/HSL:1007_20190820_Ti_2_2101/congestionRate`;
    const result = await fetch(url);
    const data = await result.text();
    const congestionRate = parseFloat(data);
    // console.log(veh, ": ", congestionRate);
    if (congestionRate > 1) {
        // setTramColor("icon-red");
        changeTrams(veh, { congestionRate, color: "icon-red" });
    } else if (congestionRate > 0.5) {
        changeTrams(veh, { congestionRate, color: "icon-yellow" });
    } else {
        changeTrams(veh, { congestionRate, color: "icon-green" });
    }
};

const changeTrams = (veh, newObjec) => {
    trams = trams.map(tram => (tram.veh === veh ? { ...tram, ...newObjec } : tram));
};

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
            setTramsArray(trams);
        }, 1000);
        setInterval(() => {
            refreshCongestion();
        }, 5000);
    }, []);

    return (
        <>
            {/* <TramPos checkTram={checkTram} /> */}
            <Map
                style={{ height: "80vh" }}
                center={position}
                zoom={map.zoom}
                // zoomControl={false}
                // scrollWheelZoom={false}
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
                                className: `${tram.color} my-div-icon vh-${tram.veh} route desi-${tram.desi} `
                            })}
                            opacity={0.8}
                        >
                            <Popup>
                                {`Tram Number:${tram.veh}`}
                                <br />
                                {`Congestion Rate:${Math.round(tram.congestionRate * 100) / 100}`}
                            </Popup>
                        </Marker>
                    );
                })}
            </Map>
        </>
    );
};
