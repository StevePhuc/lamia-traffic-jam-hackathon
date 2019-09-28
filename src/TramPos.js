import React, { useEffect } from "react";

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

function TramPos({ checkTram }) {
    // useEffect(() => {
    client.on("message", function(topic, message) {
        const data = JSON.parse(message);
        // console.log(data.VP);
        checkTram(data.VP);
    });
    // }, []);

    return <></>;
}

export default TramPos;
