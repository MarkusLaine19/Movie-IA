document.addEventListener('DOMContentLoaded', () => {
    const theaterSelect = document.getElementById('theater-select'); // Haetaan teatterivalinta dropdown
    const movieList = document.getElementById('movie-list'); // Haetaan elokuvien listaelementti

    // Function to fetch theater data
    function fetchTheaterData() {
        const theaterDataURL = "https://www.finnkino.fi/xml/TheatreAreas/"; // Teatteritietojen API-osoite
        return fetch(theaterDataURL) // Haetaan teatteritiedot
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "text/xml");
                const theaters = xmlDoc.getElementsByTagName("TheatreArea");
                // Muunnetaan XML-tiedot käyttökelpoiseen muotoon
                const theaterData = Array.from(theaters).map(theater => {
                    const id = theater.querySelector("ID").textContent;
                    const name = theater.querySelector("Name").textContent;
                    return { id, name };
                });
                return theaterData;
            })
            .catch(error => {
                console.error('Error fetching theater data:', error);
                throw error;
            });
    }

    // Function to fetch movie data for the selected theater
    function fetchMovieData(theaterId) {
        const movieDataURL = `https://www.finnkino.fi/xml/Schedule/?area=${theaterId}`; // Elokuvatietojen API-osoite
        return fetch(movieDataURL) // Haetaan elokuvatiedot
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "text/xml");
                const movies = xmlDoc.getElementsByTagName("Show");
                // Muunnetaan XML-tiedot käyttökelpoiseen muotoon
                const movieData = Array.from(movies).map(movie => {
                    const title = movie.querySelector("Title").textContent;
                    const startTime = movie.querySelector("dttmShowStart").textContent;
                    const imageUrl = movie.querySelector("EventSmallImagePortrait").textContent;
                    return { title, startTime, imageUrl };
                });
                return movieData;
            })
            .catch(error => {
                console.error('Error fetching movie data:', error);
                throw error;
            });
    }

    // Function to display movies in the UI
    function displayMovies(movies) {
        movieList.innerHTML = ''; // Clear previous movie list
        // Käydään läpi jokainen elokuva ja lisätään se listaan
        movies.forEach(movie => {
            const listItem = document.createElement("li");
            listItem.classList.add("movie-item");

            const image = document.createElement("img");
            image.src = movie.imageUrl;
            image.alt = movie.title;
            image.classList.add("movie-image");

            const infoDiv = document.createElement("div");
            infoDiv.classList.add("movie-info");

            const title = document.createElement("h2");
            title.textContent = movie.title;

            const startTime = document.createElement("p");
            startTime.textContent = "Start Time: " + movie.startTime;

            infoDiv.appendChild(title);
            infoDiv.appendChild(startTime);

            listItem.appendChild(image);
            listItem.appendChild(infoDiv);

            movieList.appendChild(listItem);
        });
    }

    // Event listener for theater selection change
    theaterSelect.addEventListener("change", () => {
        const selectedTheaterId = theaterSelect.value;
        console.log("Selected theater ID:", selectedTheaterId);
        if (selectedTheaterId) {
            fetchMovieData(selectedTheaterId)
                .then(movieData => displayMovies(movieData))
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    });

    // Initialize the page
    fetchTheaterData()
        .then(theaterData => {
            theaterData.forEach(theater => {
                const option = document.createElement("option");
                option.value = theater.id;
                option.textContent = theater.name;
                theaterSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

