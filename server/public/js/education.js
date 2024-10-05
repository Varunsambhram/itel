document.addEventListener('DOMContentLoaded', function() {
    let map;
    let userLocationMarker;

    function initMap(lat, lng) {
        const userLocation = { lat: lat, lng: lng };
        map = new google.maps.Map(document.getElementById('map'), {
            center: userLocation,
            zoom: 14
        });
        userLocationMarker = new google.maps.Marker({
            position: userLocation,
            map: map,
            title: "Your Location"
        });
    }

    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    function showPosition(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log("Latitude: " + latitude + " Longitude: " + longitude);
        
        initMap(latitude, longitude);

        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBCe1gG8Zyz7yDyRdqea5q7BgsX9_u5kik`;
        console.log("Geocode URL:", geocodeUrl);

        fetch(geocodeUrl)
            .then(response => response.json())
            .then(data => {
                const locationElement = document.getElementById('userLocation');
                if (data.results && data.results.length > 0) {
                    locationElement.textContent = data.results[0].formatted_address;
                } else {
                    locationElement.textContent = "Location not found";
                }
            })
            .catch(error => {
                console.error('Error fetching location:', error);
            });
    }

    getUserLocation();

    function fetchEducationalInstitutions(course, board) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                const serviceDetailsElement = document.getElementById('serviceDetails');

                let type = 'school'; // Default to school for younger students
                if (course === 'UG' || course === 'PG') {
                    type = 'university';
                }

                const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=${type}&keyword=${course}${board ? '&keyword=' + board : ''}&key=AIzaSyBCe1gG8Zyz7yDyRdqea5q7BgsX9_u5kik`;
                console.log("Places URL:", placesUrl);

                fetch(placesUrl)
                    .then(response => response.json())
                    .then(data => {
                        if (data.results && data.results.length > 0) {
                            data.results.forEach(institution => {
                                const marker = new google.maps.Marker({
                                    position: {
                                        lat: institution.geometry.location.lat,
                                        lng: institution.geometry.location.lng
                                    },
                                    map: map,
                                    title: institution.name
                                });
                            });
                        } else {
                            serviceDetailsElement.textContent = "No institutions found nearby.";
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching institutions:', error);
                    });
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    function handleAcademicsSelection() {
        const nameForm = document.createElement('form');
        nameForm.innerHTML = `
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required><br>
            <button type="submit">Submit</button>
        `;
        const serviceDetailsElement = document.getElementById('serviceDetails');
        serviceDetailsElement.innerHTML = ''; // Clear previous content
        serviceDetailsElement.appendChild(nameForm);

        nameForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            console.log("Name: " + name);

            const classDropdown = document.createElement('select');
            classDropdown.id = 'classDropdown';
            classDropdown.innerHTML = `
                <option value="" disabled selected>Select class</option>
                <option value="Kindergarten">Kindergarten</option>
                <option value="1 to 10">1 to 10</option>
                <option value="PUC">PUC</option>
                <option value="UG">UG</option>
                <option value="PG">PG</option>
            `;
            serviceDetailsElement.innerHTML = ''; // Clear previous content
            serviceDetailsElement.appendChild(classDropdown);

            classDropdown.addEventListener('change', function() {
                const selectedClass = this.value;
                console.log("Selected class: " + selectedClass);
                serviceDetailsElement.innerHTML = '';
                serviceDetailsElement.appendChild(classDropdown);

                if (selectedClass === 'Kindergarten' || selectedClass === '1 to 10' || selectedClass === 'PUC') {
                    const boardDropdown = document.createElement('select');
                    boardDropdown.id = 'boardDropdown';
                    boardDropdown.innerHTML = `
                        <option value="" disabled selected>Select board</option>
                        <option value="State">State</option>
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                    `;
                    serviceDetailsElement.appendChild(boardDropdown);

                    boardDropdown.addEventListener('change', function() {
                        const selectedBoard = this.value;
                        console.log("Selected board: " + selectedBoard);
                        serviceDetailsElement.innerHTML = '';
                        serviceDetailsElement.appendChild(classDropdown);
                        serviceDetailsElement.appendChild(boardDropdown);

                        if (selectedClass === 'PUC') {
                            const marksForm = document.createElement('form');
                            marksForm.innerHTML = `
                                <label for="tenthMarks">10th Marks:</label>
                                <input type="number" id="tenthMarks" name="tenthMarks" required><br>
                                <label for="totalMarks">Total Marks:</label>
                                <input type="number" id="totalMarks" name="totalMarks" required><br>
                                <button type="submit">Submit</button>
                            `;
                            serviceDetailsElement.appendChild(marksForm);

                            marksForm.addEventListener('submit', function(event) {
                                event.preventDefault();
                                const tenthMarks = document.getElementById('tenthMarks').value;
                                const totalMarks = document.getElementById('totalMarks').value;
                                console.log("10th Marks: " + tenthMarks + ", Total Marks: " + totalMarks);

                                const suggestedCourse = suggestPUCCourse(tenthMarks, totalMarks);
                                console.log("Suggested Course: " + suggestedCourse);

                                const courseDropdown = document.createElement('select');
                                courseDropdown.id = 'courseDropdown';
                                courseDropdown.innerHTML = `
                                    <option value="" disabled selected>Select course</option>
                                `;
                                if (suggestedCourse === 'Science') {
                                    courseDropdown.innerHTML += `
                                        <option value="PCMB">PCMB</option>
                                        <option value="PCMC">PCMC</option>
                                    `;
                                } else if (suggestedCourse === 'Commerce') {
                                    courseDropdown.innerHTML += `
                                        <option value="EBCS">EBCS</option>
                                        <option value="CSCB">CSCB</option>
                                    `;
                                } else if (suggestedCourse === 'Arts') {
                                    courseDropdown.innerHTML += `
                                        <option value="English">English</option>
                                        <option value="Kannada">Kannada</option>
                                    `;
                                }
                                serviceDetailsElement.appendChild(courseDropdown);

                                courseDropdown.addEventListener('change', function() {
                                    const selectedCourse = this.value;
                                    console.log("Selected Course: " + selectedCourse);
                                    fetchEducationalInstitutions(selectedCourse, selectedBoard);
                                });
                            });
                        } else {
                            boardDropdown.addEventListener('change', function() {
                                const selectedBoard = this.value;
                                console.log("Selected board: " + selectedBoard);
                                fetchEducationalInstitutions(selectedClass, selectedBoard);
                            });
                        }
                    });
                } else if (selectedClass === 'UG') {
                    const ugForm = document.createElement('form');
                    ugForm.innerHTML = `
                        <label for="pucStream">PUC Stream:</label>
                        <select id="pucStream" name="pucStream" required>
                            <option value="" disabled selected>Select PUC Stream</option>
                            <option value="Science">Science</option>
                            <option value="Commerce">Commerce</option>
                            <option value="Arts">Arts</option>
                        </select><br>
                        <label for="pucMarks">PUC Marks:</label>
                        <input type="number" id="pucMarks" name="pucMarks" required><br>
                        <button type="submit">Submit</button>
                    `;
                    serviceDetailsElement.appendChild(ugForm);

                    ugForm.addEventListener('submit', function(event) {
                        event.preventDefault();
                        const pucStream = document.getElementById('pucStream').value;
                        const pucMarks = document.getElementById('pucMarks').value;
                        console.log("PUC Stream: " + pucStream + ", PUC Marks: " + pucMarks);

                        const suggestedCourses = suggestUGCourses(pucStream, pucMarks);
                        console.log("Suggested UG Courses: " + suggestedCourses);

                        const courseDropdown = document.createElement('select');
                        courseDropdown.id = 'ugCourseDropdown';
                        courseDropdown.innerHTML = `
                            <option value="" disabled selected>Select course</option>
                        `;
                        suggestedCourses.forEach(course => {
                            courseDropdown.innerHTML += `<option value="${course}">${course}</option>`;
                        });
                        serviceDetailsElement.appendChild(courseDropdown);

                        courseDropdown.addEventListener('change', function() {
                            const selectedCourse = this.value;
                            console.log("Selected UG Course: " + selectedCourse);
                            fetchEducationalInstitutions(selectedCourse, null);
                        });
                    });
                } else if (selectedClass === 'PG') {
                    const pgForm = document.createElement('form');
                    pgForm.innerHTML = `
                        <label for="ugDetails">UG Details:</label>
                        <input type="text" id="ugDetails" name="ugDetails" required><br>
                        <button type="submit">Submit</button>
                    `;
                    serviceDetailsElement.appendChild(pgForm);

                    pgForm.addEventListener('submit', function(event) {
                        event.preventDefault();
                        const ugDetails = document.getElementById('ugDetails').value;
                        console.log("UG Details: " + ugDetails);

                        const suggestedPGCourses = suggestPGCourses(ugDetails);
                        console.log("Suggested PG Courses: " + suggestedPGCourses);

                        const pgCourseDropdown = document.createElement('select');
                        pgCourseDropdown.id = 'pgCourseDropdown';
                        pgCourseDropdown.innerHTML = `
                            <option value="" disabled selected>Select course</option>
                        `;
                        suggestedPGCourses.forEach(course => {
                            pgCourseDropdown.innerHTML += `<option value="${course}">${course}</option>`;
                        });
                        serviceDetailsElement.appendChild(pgCourseDropdown);

                        pgCourseDropdown.addEventListener('change', function() {
                            const selectedCourse = this.value;
                            console.log("Selected PG Course: " + selectedCourse);
                            fetchEducationalInstitutions(selectedCourse, null);
                        });
                    });
                }
            });
        });
    }

    function handleTuitionsSelection() {
        const tuitionCategories = ['1 to 5', '5 to 8', '9 to 10', 'PUC', 'Competitive Exams'];
        const categoryDropdown = document.createElement('select');
        categoryDropdown.id = 'categoryDropdown';
        categoryDropdown.innerHTML = `
            <option value="" disabled selected>Select category</option>
        `;
        tuitionCategories.forEach(category => {
            categoryDropdown.innerHTML += `<option value="${category}">${category}</option>`;
        });
        const serviceDetailsElement = document.getElementById('serviceDetails');
        serviceDetailsElement.innerHTML = '';
        serviceDetailsElement.appendChild(categoryDropdown);

        categoryDropdown.addEventListener('change', function() {
            const selectedCategory = this.value;
            console.log("Selected Tuition Category: " + selectedCategory);
            fetchEducationalInstitutions(selectedCategory, 'tuitions');
        });
    }

    function handleCoCurricularSelection() {
        const coCurricularCategories = ['Singing', 'Dancing', 'Martial Arts', 'Sports'];
        const categoryDropdown = document.createElement('select');
        categoryDropdown.id = 'categoryDropdown';
        categoryDropdown.innerHTML = `
            <option value="" disabled selected>Select category</option>
        `;
        coCurricularCategories.forEach(category => {
            categoryDropdown.innerHTML += `<option value="${category}">${category}</option>`;
        });
        const serviceDetailsElement = document.getElementById('serviceDetails');
        serviceDetailsElement.innerHTML = '';
        serviceDetailsElement.appendChild(categoryDropdown);

        categoryDropdown.addEventListener('change', function() {
            const selectedCategory = this.value;
            console.log("Selected Co-curricular Category: " + selectedCategory);
            fetchEducationalInstitutions(selectedCategory, 'co-curricular');
        });
    }

    function suggestUGCourses(pucStream, pucMarks) {
        const courses = {
            Science: ['Engineering', 'Medical', 'B.Sc'],
            Commerce: ['B.Com', 'BBA', 'BBM'],
            Arts: ['BA', 'BFA', 'B.Ed']
        };
        if (pucMarks >= 85) {
            return courses[pucStream];
        } else if (pucMarks >= 70) {
            return courses[pucStream].slice(1);
        } else {
            return courses[pucStream].slice(2);
        }
    }

    function suggestPGCourses(ugDetails) {
        const courses = {
            Engineering: ['M.Tech', 'M.E', 'MBA'],
            Medical: ['M.D', 'M.S', 'M.Sc (Medical)'],
            'B.Sc': ['M.Sc', 'MBA'],
            'B.Com': ['M.Com', 'MBA'],
            'BBA': ['MBA', 'MMS'],
            'BBM': ['MBA', 'MMS'],
            'BA': ['MA', 'MFA'],
            'BFA': ['MFA', 'M.Ed'],
            'B.Ed': ['M.Ed', 'MA (Education)']
        };
        return courses[ugDetails] || [];
    }

    function suggestPUCCourse(tenthMarks, totalMarks) {
        const percentage = (tenthMarks / totalMarks) * 100;
        if (percentage >= 90) {
            return 'Science';
        } else if (percentage >= 75) {
            return 'Commerce';
        } else {
            return 'Arts';
        }
    }

    document.getElementById('educationType').addEventListener('change', function() {
        const selectedOption = this.value;
        const serviceDetailsElement = document.getElementById('serviceDetails');
        serviceDetailsElement.innerHTML = ''; // Clear previous content

        if (selectedOption === 'academics') {
            handleAcademicsSelection();
        } else if (selectedOption === 'tuitions') {
            handleTuitionsSelection();
        } else if (selectedOption === 'co-curricular') {
            handleCoCurricularSelection();
        }
    });
});
