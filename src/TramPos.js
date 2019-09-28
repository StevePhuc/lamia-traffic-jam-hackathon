import React, { useEffect } from "react";

let mqtt = require("mqtt");
let client = mqtt.connect("wss://mqtt.hsl.fi:443/");
let request = require('request-promise-native');
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

async function getTripId(routeId, realtimeDirectionId, departureDate, departureTime) {
    const routingDirectionId = realtimeDirectionId - 1;

    const [hours, minutes] = departureTime.split(':');
    const departureSeconds = hours * 3600 + minutes * 60;

    const query = `
{
  fuzzyTrip(route: "HSL:${routeId}", direction: ${routingDirectionId}, date: "${departureDate}", time: ${departureSeconds}) {
    gtfsId
  }
}
`;

    const response = await request.post(
        'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql',
        {
            body: {
                query,
            },
            json: true,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );

    const trip = response.data.fuzzyTrip;

    return trip ? trip.gtfsId : null;
}

function TramPos({ setTramPos }) {
    // const [longitude, setLongitude] = useState("");
    // const [latitude, setLatitude] = useState("");
    useEffect(() => {
        client.on("message", async function(topic, message) {
            const data = JSON.parse(message);
            const {VP} = data;

            const tripId = await getTripId(VP.route, VP.dir, VP.oday, VP.start);
            console.log(tripId)

            // const { lat, long } = data.VP;
            // console.log(lat, long);
            // setTramPos([lat, long]);
        });
    }, []);

    return <></>;
}

export default TramPos;
