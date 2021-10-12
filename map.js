"use strict";

let centrepointLocation = null; //centrepoint instance, initiated as null
let newLocation = {}; //after clicking on the map, but not confirmed
let centrepointSet = false;
let markerList = [];
let resultList = [];
let resultInstanceList = [];
let locationConfirmed = true;
let searchRadius = 500; //radius in m to search for
let searchLimit = 5; //number of searches to show
let travelMethod = 'driving';

const APPDATA_KEY = 'appdatakey';
const INCOMPLETE_KEY = 'incompletekey';

//Mapbox Token
const MAPBOX_TOKEN = "pk.eyJ1IjoiYXlhbjAwMjQiLCJhIjoiY2tvMjlpNmhuMDRvdzJ2cDd0YmEydXlvNyJ9.Z_aXI5F08j46RNFcrDuJfQ";
//Opencage Geocode Token
const OPENCAGE_TOKEN = '616df02868e141878736c00fb6840f26';
//Geoapify Token
const GEOAPIFY_TOKEN = '94fc6b02418d4459b2d161af64dd7d27';

//Places API
const PLACES_API = "89c1dc776459400bb23c1c7ec8189025";

// web service request function
function webServiceRequest(url, data) {
    // Build URL parameters from data object.
    let params = "";
    // For each key in data object...
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            if (params.length == 0) {
                // First parameter starts with '?'
                params += "?";
            }
            else {
                // Subsequent parameter separated by '&'
                params += "&";
            }

            let encodedKey = encodeURIComponent(key);
            let encodedValue = encodeURIComponent(data[key]);

            params += encodedKey + "=" + encodedValue;
        }
    }
    let script = document.createElement('script');
    script.src = url + params;
    document.body.appendChild(script);
}

function buildURL(url, data) {
    // Build URL parameters from data object.
    let params = "";
    // For each key in data object...
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            if (params.length == 0) {
                // First parameter starts with '?'
                params += "?";
            }
            else {
                // Subsequent parameter separated by '&'
                params += "&";
            }

            let encodedKey = encodeURIComponent(key);
            let encodedValue = encodeURIComponent(data[key]);

            params += encodedKey + "=" + encodedValue;
        }
    }
    return url + params;
}


//FORWARD GEOCODE
function forwardGeocode() {
    let streetNumber = document.getElementById('street_number').value;
    let street = document.getElementById('street').value;
    let postcode = document.getElementById('postcode').value;
    let state = 'Victoria';
    let region = 'Melbourne';
    let location = `${street}, ${streetNumber}, ${postcode}, ${region}, ${state}`;
    let location_encoded = encodeURI(location);
    let data =
    {
        q: location_encoded,
        key: OPENCAGE_TOKEN,
        countrycode: 'au',
        callback: "showData"
    };
    webServiceRequest('https://api.opencagedata.com/geocode/v1/json', data);
    console.log(location);
}

//Callback function
function getData(result) {
    //console log result
    console.log(result);
    //mapbox token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    //getting data
    let data = result.results[0];

    //editing data
    newLocation =
    {
        lat: data.geometry.lat,
        lng: data.geometry.lng,
        address: data.formatted
    }

    //centre map
    map.setCenter([data.geometry.lng, data.geometry.lat]);

    //set marker position
    let marker = newMarker(data.geometry.lat, data.geometry.lng);
    marker.setLngLat([data.geometry.lng, data.geometry.lat]);

    //popup with formated information
    let popup = new mapboxgl.Popup({ offset: 45 });
    popup.setHTML(`${data.formatted}`);

    //set popup to marker
    marker.setPopup(popup);

    //add marker to map
    marker.addTo(map);

    //add popup to map
    popup.addTo(map);

    let buttonsRef = document.getElementById('buttons');
    let displayButtons = '';
    displayButtons += `<div class="mdl-cell mdl-cell--4-col">`;
    displayButtons += `<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="confirmLocation()">Confirm Centrepoint</button>`;
    displayButtons += `</div>`;
    displayButtons += `<div class="mdl-cell mdl-cell--4-col">`;
    displayButtons += `<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="cancelLocation()">Cancel Centrepoint</button>`;
    displayButtons += `</div>`;
    buttonsRef.innerHTML = displayButtons;
}

function getDataEdit(result) {
    //console log result
    console.log(result);
    //mapbox token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    //getting data
    let data = result.results[0];

    //editing data
    newLocation =
    {
        lat: data.geometry.lat,
        lng: data.geometry.lng,
        address: data.formatted
    }

    //centre map
    map.setCenter([data.geometry.lng, data.geometry.lat]);

    let marker = markerList[markerList.length - 1];
    //set marker position
    marker.setLngLat([data.geometry.lng, data.geometry.lat]);

    //popup with formated information
    let popup = new mapboxgl.Popup({ offset: 45 });
    popup.setHTML(`${data.formatted}`);

    //set popup to marker
    marker.setPopup(popup);

    //add marker to map
    marker.addTo(map);

    //add popup to map
    popup.addTo(map);

    //updateList();
}

//might change or get rid of
function getDataSearch(result) {
    //console log result
    console.log(result);
    //mapbox token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    //getting data
    let data = result.results[0];

    //editing data
    newLocation =
    {
        lat: data.geometry.lat,
        lng: data.geometry.lng,
        address: data.formatted
    }

    //centre map
    map.setCenter([data.geometry.lng, data.geometry.lat]);

    //set marker position
    let marker = resultMarker(data.geometry.lat, data.geometry.lng);
    marker.setLngLat([data.geometry.lng, data.geometry.lat]);

    //popup with formated information
    let popup = new mapboxgl.Popup({ offset: 45 });
    popup.setHTML(`${data.formatted}`);

    //set popup to marker
    marker.setPopup(popup);

    //add marker to map
    marker.addTo(map);

    //add popup to map
    popup.addTo(map);

    let buttonsRef = document.getElementById('buttons');
    let displayButtons = '';
    displayButtons += `<div class="mdl-cell mdl-cell--4-col">`;
    displayButtons += `<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="confirmLocation()">Confirm Centrepoint</button>`;
    displayButtons += `</div>`;
    displayButtons += `<div class="mdl-cell mdl-cell--4-col">`;
    displayButtons += `<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="cancelLocation()">Cancel Centrepoint</button>`;
    displayButtons += `</div>`;
    buttonsRef.innerHTML = displayButtons;
}

//Displaying searach results
function displaySearchResults(result) //result should be an instance of SearchResult
{
    let name = result.name;
    let lat = result.lat;
    let lng = result.lng;
    let address = result.formatted;
    let categories = result.categories;
    //Show Marker
    let geojson = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
            },
        ]
    };
    for (const { geometry, properties } of geojson.features) {
        // create a HTML element for each feature
        const el = document.createElement('div');
        el.className = 'marker';

        // make a marker for each feature and add to the map
        let marker = new mapboxgl.Marker(el).setLngLat(geometry.coordinates);
        //popup with formated information
        let popup = new mapboxgl.Popup({ offset: 45 });
        // <button type="button" onclick="bookmarkSearchResult(${result._position})">Bookmark</button>
        popup.setHTML(`
        <div id='popup-location'>
        <b>${name} <br><i style="color:gray">${Math.round(result.getTimeTaken())} min away<i></b>
        <button onclick="bookmarkSearchResult(${result._position})" id='bookmarkList'>
                    <i class="fas fa-bookmark" style="font-size: 1.5em; color: white;"></i>
                    <p>Bookmark<p>
        </button>
        <button type="button" onclick="reviewSearchResult(${result._position})" id='bookmarkList'>
            <i class="fas fa-award" style="font-size: 1.5em; color: white;"></i>
            <p>Review <p>
        </button>
        </div>
        
        <div class="review" id="review">
        </div>
        
        `);

        //set popup to marker
        marker.setPopup(popup);

        //add marker to map
        marker.addTo(map);

        //add popup to map
        popup.addTo(map);
    }
}

/*function resultRoadDistance()
{
    for (let i = 0; i < resultInstanceList.length; i++)
    {
        resultInstanceList[i].getRoadDistance(centrepointLocation);
    }
}*/


//Initialising map
let mapStyle = 'osm-carto'

mapboxgl.accessToken = MAPBOX_TOKEN;
let map = new mapboxgl.Map(
    {
        container: 'map',
        style: `https://maps.geoapify.com/v1/styles/${mapStyle}/style.json?apiKey=${GEOAPIFY_TOKEN}`, // stylesheet location
        center: [144.9626398, -37.8104191], // starting position [lng, lat]
        zoom: 17 // starting zoom
    });
globalThis.map;

//MAP ON CLICK
map.on('style.load', function () {
    map.on('click', function (click) {
        if (locationConfirmed) {
            let coordinates = click.lngLat;
            centrepointLocation = coordinates;
            let x = coordinates.lat;
            let y = coordinates.lng;
            reverseGeocode(x, y);
        }
        locationConfirmed = false;
    });
});

//Initialising buttons
let buttonsRef = document.getElementById('buttons');
let displayButtons = '';
buttonsRef.innerHTML = displayButtons;


//NEW MARKERS
function newMarker(x, y) {
    let marker = new mapboxgl.Marker({ draggable: true, color: '#3FB1CE' });
    marker.setLngLat([y, x]);
    console.log(`New marker at (${x}, ${y}).`)
    marker.on('dragend', onDragEnd);
    markerList.push(marker);
    return marker;
}

//STATIC MARKERS
function staticMarker(x, y) {
    let marker = new mapboxgl.Marker({ draggable: false, color: '#4AE961' });
    marker.setLngLat([y, x]);
    return marker;
}

//RESULT MARKERS
function resultMarker(x, y) {
    let marker = new mapboxgl.Marker({ draggable: false, color: '#e71e28' });
    marker.setLngLat([y, x]);
    return marker;
}

//REVERSE GEOCODE
function reverseGeocode(x, y, search = false, edit = false) {
    let coordinates = `${x}+${y}`;
    let data =
    {
        q: coordinates,
        key: OPENCAGE_TOKEN,
        callback: 'getData'
    }
    if (edit) {
        data.callback = 'getDataEdit'
    }
    if (search) {
        data.callback = 'getDataSearch'
    }
    webServiceRequest('https://api.opencagedata.com/geocode/v1/json', data);
}

function onDragEnd(marker) {
    let coordinates = marker.target._lngLat;
    centrepointLocation = coordinates;
    reverseGeocode(coordinates.lat, coordinates.lng, false, true);
}

//REFRESH MAP
function refreshMap() {
    //refresh map
    let mapCentre = map.getCenter();
    let mapZoom = map.getZoom();
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map = new mapboxgl.Map(
        {
            container: 'map',
            style: `https://maps.geoapify.com/v1/styles/${mapStyle}/style.json?apiKey=${GEOAPIFY_TOKEN}`, // stylesheet location
            center: [mapCentre.lng, mapCentre.lat], // starting position [lng, lat]
            zoom: mapZoom // starting zoom
        });

    globalThis.map;

    map.on('style.load', function () {
        //make sure that the map is clickable if there is no centrepoint
        if (!centrepointSet && locationConfirmed) {
            map.on('click', function (click) {
                locationConfirmed = false;
                let coordinates = click.lngLat;
                let x = coordinates.lat;
                let y = coordinates.lng;
                reverseGeocode(x, y);
            });
        }
        else {
            //recreate centrepoint location
            let marker = staticMarker(centrepointLocation.lat, centrepointLocation.lng); //change based on class

            //add marker to map
            marker.addTo(map);

            //popup with formated information
            let popup = new mapboxgl.Popup({ offset: 45 });
            popup.setHTML(`<p>${centrepointLocation.address}</p><button type="button" onclick="bookmarkCentrepoint()">Bookmark</button>`);

            //set popup to marker
            marker.setPopup(popup);

            //add popup to map
            popup.addTo(map);
        }

        //recreate result locations
        for (let i = 0; i < resultList.length; i++) {
            //initiate marker
            let markerResult = resultMarker(resultList[i].lat, resultList[i].lng);

            //add marker to map
            markerResult.addTo(map);

            //popup with formated information
            let popup = new mapboxgl.Popup({ offset: 45 });
            popup.setHTML('INSERT INFORMATION HERE');

            //set popup to marker
            markerResult.setPopup(popup);

            //add popup to map
            popup.addTo(map);
        }
    });
}

//SELECT CENTREPOINT FROM CENTREPOINT BOOKMARK LIST
function selectCentrepointBookmark(position)
{
    if (locationConfirmed && !centrepointSet)
    {
        locationConfirmed = false;
        reverseGeocode(centrepointBookmarkList.list[position].lat, centrepointBookmarkList.list[position].lng, false, false)
    }
}

//CONFIRM LOCATION
function confirmLocation() {
    centrepointLocation = new Centrepoint(newLocation.lat, newLocation.lng, newLocation.address);
    centrepointSet = true;
    locationConfirmed = true;

    //refresh map
    refreshMap();

    /*//remove buttons
    let buttonsRef = document.getElementById('buttons');
    let displayButtons = '';
    buttonsRef.innerHTML = displayButtons;*/

    //delete location button
    let buttonsRef = document.getElementById('buttons');
    let displayButtons = '';
    displayButtons += `<div class="mdl-cell mdl-cell--4-col">`;
    displayButtons += `</div>`;
    displayButtons += `<div class="mdl-cell mdl-cell--4-col">`;
    displayButtons += `<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="cancelLocation()">Remove Centrepoint</button>`;
    displayButtons += `</div>`;
    buttonsRef.innerHTML = displayButtons;
}

//CANCEL LOCATION AND DELETE LOCATION
function cancelLocation() {
    centrepointLocation = {};
    centrepointSet = false;
    locationConfirmed = true;

    //refresh map
    refreshMap();

    //remove buttons
    let buttonsRef = document.getElementById('buttons');
    let displayButtons = '';
    buttonsRef.innerHTML = displayButtons;
}

/*//Displaying searach results
function displaySearchResults(result) //result should be an instance of SearchResult
{
    let name = result.name;
    let lat = result.lat;
    let lng = result.lng;
    let address = result.formatted;
    let categories = result.categories;
    
    //Show Marker
    //set marker position
    let marker = resultMarker(lat, lng);
    marker.setLngLat([lng, lat]);

    //popup with formated information
    let popup = new mapboxgl.Popup({ offset: 45 });
    popup.setHTML(`<p>${name}</p><button type="button" onclick="bookmarkSearchResult(${result._position})">Bookmark</button>`);

    //set popup to marker
    marker.setPopup(popup);

    //add marker to map
    marker.addTo(map);

    //add popup to map
    popup.addTo(map);
}*/


// Review Search Result
function reviewSearchResult(resultPosition) { // result is an instance of SearchResult
    console.log("Review Search Result")
    document.getElementById("review").innerHTML = `

    <div class="review-header">
        <div class="title">Reviews</div>
    </div>
    <div class="review-body">
        Please rate your experience!
        <div class="wrapper">
            <input type="radio" name="rate" id="r1" value="1" onclick="addingReviews(${resultPosition})">
            <label for="r1">&#10038;</label>
            <input type="radio" name="rate" id="r2" value="2" onclick="addingReviews(${resultPosition})">
            <label for="r2">&#10038;</label>
            <input type="radio" name="rate" id="r3" value="3" onclick="addingReviews(${resultPosition})">
            <label for="r3">&#10038;</label>
            <input type="radio" name="rate" id="r4" value="4" onclick="addingReviews(${resultPosition})">
            <label for="r4">&#10038;</label>
            <input type="radio" name="rate" id="r5" value="5" onclick="addingReviews(${resultPosition})">
            <label for="r5">&#10038;</label>
        </div>
    </div>
    `;
    if(reviewList.list.length){
        let reviewVal;
        for(let i = 0; i < reviewList.list.length; i ++){
            if (reviewList.list[i].address == resultInstanceList[resultPosition].address){
                reviewVal = reviewList.list[i].review;
            }
        }
        console.log(reviewVal);
        switch(reviewVal) {
            case 1:
                document.getElementById("r1").checked = true;
                break;
            case 2:
                document.getElementById("r2").checked = true;
              // code block
              break;
            case 3:
                document.getElementById("r3").checked = true;
                break;
            case 4:
                document.getElementById("r4").checked = true;
                break;
            case 5:
                document.getElementById("r5").checked = true;
                break;
            default:
              // code block
          }
    }

}

function addingReviews(resultPosition) {
    var reviewValue;
    console.log(resultInstanceList[resultPosition]._name)
    var ele = document.getElementsByName('rate');
    for (var i = 0; i < ele.length; i++) {
        if (ele[i].checked) {
            reviewValue = ele[i].value;
        }
    }
    reviewValue = parseInt(reviewValue);
    var sm = resultInstanceList[resultPosition]
    sm.addReview(reviewValue);
    console.log(sm)


}

//Bookmark Search Result
function bookmarkSearchResult(resultPosition) //result is an instance of SearchResult
{
    for (let i = 0; i < searchResultBookmarkList.list.length; i++) {
        if (searchResultBookmarkList.list[i].address == resultInstanceList[resultPosition].address) {
            window.alert('Place already bookmarked.');
            return;
        }
    }
    resultInstanceList[resultPosition]._bookmarked = true;
    searchResultBookmarkList.addSearchResult(resultInstanceList[resultPosition]);
    setLocalStorage(SEARCH_RESULT_BOOKMARK_LIST_KEY, searchResultBookmarkList);
    console.log(`${resultInstanceList[resultPosition]._address} has been bookmarked.`);
    displaySearchResultBookmark();
}

//Bookmark Centrepoint
function bookmarkCentrepoint() {
    for (let i = 0; i < centrepointBookmarkList.list.length; i++) {
        if (centrepointBookmarkList.list[i].address == centrepointLocation.address) {
            window.alert('Centrepoint already bookmarked.');
            return;
        }
    }
    centrepointLocation.bookmarked = true;
    centrepointBookmarkList.addCentrepoint(centrepointLocation);
    setLocalStorage(CENTREPOINT_LIST_KEY, centrepointBookmarkList);
    console.log(`${centrepointLocation.address} has been bookmarked.`);
    displayCentrepointBookmark();
}

//Display Centrepoint Bookmark List
function displayCentrepointBookmark()
{
    let bookmarkCentrepointRef = document.getElementById('bookmarkCentrepointList')
    //Display Bookmarked Centrepoints
    let listCentrepoints = '<span><i class="fas fa-bookmark"></i></span><br><p>Bookmarked Centrepoints:\n</p>';
    for (let i = 0; i < centrepointBookmarkList._list.length; i++)
    {
        let name = i
        listCentrepoints += `<p>${centrepointBookmarkList._list[i].address}</p>
                            <a onClick="removeCentrepointBookmark(${name})" class="delete">Delete</a>`;
    }
    //console.log(bookmarkRef);
    bookmarkCentrepointRef.innerHTML = listCentrepoints;
}

//Display Search Result Bookmark List
function displaySearchResultBookmark()
{
    let bookmarkRef = document.getElementById('bookmarkList')
    let list = '<span><i class="fas fa-bookmark"></i></span><br><p>Bookmarked Places:\n</p>';
    for (let i = 0; i < searchResultBookmarkList.list.length; i++)
    {
        let name = i
        list += `<p>${searchResultBookmarkList.list[i].address}</p>
                 <a onClick="removeSearchResultBookmark(${name})" class="delete">Delete</a>`;
    }
    console.log(bookmarkRef);
    bookmarkRef.innerHTML = list;

function removeCentrepointBookmark(itemIndex)
{
    console.log(itemIndex)

    
        
        
    centrepointBookmarkList.list.splice(itemIndex,1);
        
    



    /*for (let n = 0; n < searchResultBookmarkList.list.length; n++)
    /{
        searchResultBookmarkList.addSearchResult(searchResultBookmarkList.list[n]);
        
    }
    */
    setLocalStorage(CENTREPOINT_LIST_KEY, centrepointBookmarkList);

    displayCentrepointBookmark()
    
    

}

function removeCentrepointBookmark(itemIndex)
{
    console.log(itemIndex)

    
        
        
    centrepointBookmarkList.list.splice(itemIndex,1)
        
    



    /*for (let n = 0; n < searchResultBookmarkList.list.length; n++)
    /{
        searchResultBookmarkList.addSearchResult(searchResultBookmarkList.list[n]);
        
    }
    */
    setLocalStorage(CENTREPOINT_LIST_KEY, centrepointBookmarkList);

    displayCentrepointBookmark()
    
    

}
function removeSearchResultBookmark(itemIndex)
{
    console.log(itemIndex)

    
        
        
    searchResultBookmarkList.list.splice(itemIndex,1);
        
    



    /*for (let n = 0; n < searchResultBookmarkList.list.length; n++)
    /{
        searchResultBookmarkList.addSearchResult(searchResultBookmarkList.list[n]);
        
    }
    */
    setLocalStorage(SEARCH_RESULT_BOOKMARK_LIST_KEY, searchResultBookmarkList);

    displaySearchResultBookmark()   
}

function sortCentrepointBookmark(a,b)
{
    let value = "address";

    if (value == "name")
    {
        if (a.name < b.name)
        {
            return -1;
        }
        if (a.name > b.name)
        {
            return 1;
        }
        return 0;
    }
    else if (value == "address")
    {
        if (a.address < b.address)
        {
            return -1;
        }
        if (a.address > b.address)
        {
            return 1;
        }
        return 0;
    }
}

function sortSearchResultBookmarks(a,b)
{
    let value = "address";

    if (value == "name")
    {
        if (a.name < b.name)
        {
            return -1;
        }
        if (a.name > b.name)
        {
            return 1;
        }
        return 0;
    }
    else if (value == "address")
    {
        if (a.address < b.address)
        {
            return -1;
        }
        if (a.address > b.address)
        {
            return 1;
        }
        return 0;
    }

}

//CURRENT LOCATION
function getCurrentLocation() {
    // Before getting current location, make sure no center point has been confirmed
    cancelLocation()
    if ('geolocation' in navigator) {
        console.log('Geolocation is available.')
        if (!centrepointSet && locationConfirmed) {
            locationConfirmed = false;
            navigator.geolocation.getCurrentPosition((position) => {
                reverseGeocode(position.coords.latitude, position.coords.longitude);
            });
        }
        else {
            alert('Current centrepoint is already set. Cannot use current location for centrepoint.')
        }
    }
    else {
        console.log('Geolocation is not available.')
    }
}

//CHANGE MAP STYLE
function changeMapStyle(style) {
    mapStyle = style;
    refreshMap();
}

const layerList = document.getElementById('menu');
const inputs = layerList.getElementsByTagName('input');

for (const input of inputs) {
    input.onclick = (layer) => {
        const layerId = layer.target.id;
        map.setStyle('mapbox://styles/mapbox/' + layerId);
    };
}
