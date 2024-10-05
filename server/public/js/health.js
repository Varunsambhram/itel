let map;
let service;

// Function to initialize Google Maps
function initMap() {
    // Initialize map centered on a default location
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 12.9716, lng: 77.5946 }, // Default location: Bangalore
        zoom: 12,
    });

    // Initialize the Places service
    service = new google.maps.places.PlacesService(map);

    // Try to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // Set map center to user's location
                map.setCenter(userLocation);

                // Fetch and display nearby health services
                fetchHealthServices(userLocation);
            },
            (error) => {
                console.error("Error: The Geolocation service failed.", error);
                // Use default location if geolocation fails
                const defaultLocation = { lat: 12.9716, lng: 77.5946 };
                fetchHealthServices(defaultLocation);
            }
        );
    } else {
        console.error("Error: Your browser doesn't support Geolocation.");
    }
}

// Function to fetch and display nearby health services
function fetchHealthServices(location) {
    const request = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: '5000', // 5 km radius
        types: ['hospital', 'pharmacy', 'doctor']
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            displayHealthServices(results);
        } else {
            console.error('Error fetching health services:', status);
        }
    });
}

// Function to display health services on the map and in the list
function displayHealthServices(services) {
    const healthServicesList = document.getElementById("healthServices");
    healthServicesList.innerHTML = '';

    services.forEach(service => {
        // Add marker on the map
        const marker = new google.maps.Marker({
            position: service.geometry.location,
            map: map,
            title: service.name
        });

        // Add info window for service
        const infoWindow = new google.maps.InfoWindow({
            content: `<div><h2>${service.name}</h2><p>Rating: ${service.rating}</p><p>Address: ${service.vicinity}</p></div>`
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });

        // Add service to the list
        const serviceItem = document.createElement("li");
        serviceItem.classList.add("service-item");
        serviceItem.innerHTML = `<strong>${service.name}</strong><br>Rating: ${service.rating}<br>Address: ${service.vicinity}`;
        healthServicesList.appendChild(serviceItem);
    });
}
