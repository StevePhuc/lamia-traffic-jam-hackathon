import React from "react";
import MyMap from "./MyMap";
import "./App.css";

function App() {
    // const position = [51.505, -0.09];
    return (
        <div>
            <h1>Tram Jam project - Lamia Flow HSL Hackathon</h1>
            <p>
                Tram Jam project, in which the broad idea is to estimate tram congestion (ie. how
                full of people a tram is) based on tram stop times and other real-time data.
            </p>
            <MyMap />
        </div>
    );
}

export default App;
