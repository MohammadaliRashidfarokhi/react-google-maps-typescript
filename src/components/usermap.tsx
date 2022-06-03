import './usermap.css';
import React, { useCallback, useEffect, useState } from 'react';
// import { ImLocation2 } from "react-icons/im";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: "100%",
    maxWidth: "100%",
    height: "100%",
    maxHeight: "100%",
    margin: "0 auto",
};

const options = {
    disableDefaultUI: true,
    zoomControl: true,
};

// const AnyReactComponent = ({ text } : { text: String}) => <div style={{ fontSize: 90 }}> <ImLocation2 style={{ fontSize: 17, color: 'red' }} /> {text}</div>;

const Usermap = () => {

    const [userlocation, setLocation] = useState<{lat: number, lng: number} | undefined>(undefined)
    const [coordinates, setCoordinate] = useState({lat: 6, lng: 3})
    const [visitedLocation, setVisitedLocation] = useState<string[]>([]);

    // const googleApiKey = "AIzaSyCyuZD8vq3_-3NrILwzq71hEAG39LcZsPA";
    const googleApiKey = "AIzaSyBRTM6nImxb0TzwminocLyh0OqGGkY3xxI";

    const convertToAddress = useCallback((lat: number, long: number, googleKey: string) => {
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${googleKey}`)
            .then((res) =>
                res.json()
            )
            .then((data) => {
                // console.log(data)
                setLocation(data['results'][0].geometry.location);
                const thislocation = JSON.stringify(data['results'][0].geometry.location);

                if (!visitedLocation.includes(thislocation)) {
                    setVisitedLocation([...visitedLocation, thislocation])
                }

            })
    }, [visitedLocation])

    const run = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition((val) => {
                setCoordinate({
                    lat: val.coords.latitude,
                    lng: val.coords.longitude
                })

                convertToAddress(val.coords.latitude, val.coords.longitude, googleApiKey)

            }, errorCallback)
        }
    }, [convertToAddress])

    useEffect(() => {
        run()
    }, [run])

    const errorCallback = (error: object | any) => {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                alert("User denied the request for Geolocation.")
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Location information is unavailable.")
                break;
            case error.TIMEOUT:
                alert("The request to get user location timed out.")
                break;
            case error.UNKNOWN_ERROR:
                alert("An unknown error occurred.")
                break;
        }
    }

    const randomLocation = () => {
        let minlat = -90
        let maxlat = 90
        let randomlat = Math.floor(Math.random() * (maxlat - minlat + 1) + (minlat))

        let minlng = -180
        let maxlng = 180
        let randomlng = Math.floor(Math.random() * (maxlng - minlng + 1) + (minlng))

        setCoordinate({
            lat: randomlat,
            lng: randomlng
        })

        convertToAddress(randomlat, randomlng, googleApiKey)
    }

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyBRTM6nImxb0TzwminocLyh0OqGGkY3xxI"
    })

    const [ , setMap] = useState<google.maps.Map>()

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, [])

    const onUnmount = useCallback(function callback() {
        setMap(undefined);
    }, [])

    return (
        <div className='map-container'>
            <h3>Map project</h3>
            <div className='map-body' >
                {
                    (userlocation && isLoaded) ? (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={coordinates}
                            options={options}
                            zoom={10}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                        >
                            <Marker position={coordinates} />
                        </GoogleMap>
                    ) : (
                        <div className="loading">Loading...</div>
                    )
                }

                <div className='button-container' >
                    <button onClick={() => {
                        randomLocation()
                        setLocation(undefined)
                    }} >Teleport me to somewhere random</button>
                    <button onClick={() => {
                        setLocation(undefined)
                        run()
                    }} >Bring me back home</button>
                </div>
            </div>
            <h4>Latitude :{coordinates.lat}, Longitude :{coordinates.lng}</h4>
        </div>
    )
}

export default Usermap;
