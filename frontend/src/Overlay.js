import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';

import './Overlay.css';
import { Loader } from '@googlemaps/js-api-loader';
import OriginsData from "./food_manufacturers_champaign.json";
import originPoints from "./originPoints.json";
import $ from "jquery";

const Overlay = (props) => {
    let [imgUrl, setImgUrl] = useState("");
    let google = useRef(null);
    // var origins = GetOriginsPoints(props, props.countyName, props.stateName);

    const loadDirections = (g) => {
        const directionsService = new g.maps.DirectionsService();
        directionsService.route(
            {
                destination: "232 Burwash Ave, Savoy, IL",
                origin: "201 N Goodwin Ave, Urbana, IL",
                travelMode: "DRIVING"
            },
            (results, status) => {
                // console.log(results);
                // console.log(status);
                let location = `${props.countyName}, ${props.stateName}`;
                console.log(results.routes[0].overview_polyline);
                setImgUrl("https://maps.googleapis.com/maps/api/staticmap?center=" + location
                + "&zoom=10&size=400x400"
                + "&path=weight:3%7Ccolor:blue%7Cenc:" + results.routes[0].overview_polyline
                + "&key=" + process.env.REACT_APP_API_KEY);
                console.log(imgUrl);
            }
        );
    };

    const getOriginsPoints = (county, state) => {
        var result = undefined;
        if(county === "Champaign") {
            $.ajaxSetup({
                async: false
            });
            
            Promise.all(OriginsData.map((elem) => {
                // if (elem.ADDRESS != "915 W Marketview Dr") {
                //     return Promise.resolve();
                // }
                let http_addr = `${elem.ADDRESS} ${elem.CITY} ${state}&key=${process.env.REACT_APP_API_KEY}`;
                let link = `https://maps.googleapis.com/maps/api/geocode/json?address=${http_addr.replaceAll(" ", "%20")}`;
                console.log(link);
                // return fetch(link);
                return link;
                // return a.results.geometry.location
            })).then((responses) => {
                Promise.all(
                    responses.map(async (response) => {
                        if (response === undefined) {
                            return {};
                        }
                        const data = await response.json();
                        try {
                            return data.results[0].geometry.location;
                        } catch {
                            console.log(data);
                            return undefined;
                        }
                    })
                ).then((result) => {console.log(result)});
            });
        }
        $.ajaxSetup({
            async: true
        });
        return result;
    }
    
    useEffect(
        () => {
            //console.log("ss");
            /*if (!props.visible) {
                return;
            }*/
            // console.log("he");
            const fetchLoader = async () => {
                const loader = new Loader({apiKey: process.env.REACT_APP_API_KEY});
                google.current = await loader.load();
                loadDirections(google.current);
            }
            fetchLoader().catch(console.error);
        }, []
    );

    useEffect(() => {
        if (props.visible && google.current) {
            console.log(props);
            loadDirections(google.current);
            // getOriginsPoints(props.countyName, props.stateName);
        }
    }, [props.visible]);

    const cssDisplay = props.visible ? "flex" : "none";
    return (
        <div id="overlay-background" style={{ display: cssDisplay }} onClick={props.onClick}>
            <div id="overlay" style={{ display: cssDisplay }}>
                <img src={imgUrl} />
                {props.countyName}
            </div>
        </div>
    );
};

export default Overlay;