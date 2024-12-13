const API_ENDPOINTS = {
    categories: '/categories',
    userStatus: '/api/user-status',
    signup: '/signup',
};

// Fetch categories and populate the list
async function fetchCategories() {
    try {
        const response = await fetch(API_ENDPOINTS.categories);
        const categories = await response.json();

        if (categories.length > 0) {
            const categoriesList = document.querySelector('.depth-4-frame-1-parent');
            if (!categoriesList) return;

            categoriesList.innerHTML = ''; // Clear any existing content

            categories.forEach(category => {
                const categoryButton = document.createElement('button');
                categoryButton.classList.add('depth-4-frame-12');

                const categoryLink = document.createElement('a');
                categoryLink.textContent = category.name;
                categoryLink.classList.add('category'); // Styling class
                categoryButton.appendChild(categoryLink);

                categoriesList.appendChild(categoryButton);
            });
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        alert('Unable to load categories. Please try again later.');
    }
}

// Fetch user status and update the UI
async function fetchUserStatus() {
    try {
        const response = await fetch(API_ENDPOINTS.userStatus);
        const data = await response.json();
        const authButtons = document.getElementById('auth-buttons');
        const exploreButton = document.querySelector('.depth-7-frame-1');

        if (data.loggedIn) {
            // Hide the "Sign Up and Explore More" button if logged in
            if (exploreButton) {
                exploreButton.style.display = 'none';
            }

            // Update the auth buttons with profile dropdown
            authButtons.innerHTML = `
                <div class="profile-menu-container">
                    <img src="/public/images/${data.profilePicture}" 
                         alt="${data.username}'s profile picture" 
                         class="profile-picture" 
                         onclick="toggleProfileDropdown()">
                    <div id="profile-dropdown" class="profile-dropdown hidden">
                        <a href="/profile-settings">Profile Settings</a>
                        <a href="/add-recipe">Add Recipe</a>
                        <a href="/your-recipes">Your Recipes</a>
                        <button onclick="handleLogout()">Logout</button>
                    </div>
                </div>
            `;
        } else {
            // Show the "Sign Up and Explore More" button if not logged in
            if (exploreButton) {
                exploreButton.style.display = 'block';
            }

            // Render login/register buttons
            authButtons.innerHTML = `
                <div class="auth-buttons-container">
                    <button class="depth-4-frame-2">
                        <a href="/login" class="log-in">Log in</a>
                    </button>
                    <button class="depth-4-frame-1">
                        <a href="/signup" class="register">Register</a>
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching user status:', error);
        alert('Unable to fetch user status. Please try again later.');
    }
}



// Handle signupandexplorebtn
async function handleSignupAndExplore() {
    try {
        // Redirect user to the signup page
        window.location.href = '/signup';
    } catch (error) {
        console.error('Error redirecting to signup page:', error);
    }
}

async function handleLogout() {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            alert('Successfully logged out!');
            window.location.reload(); // Refresh page to reflect logout state
        } else {
            const error = await response.json();
            alert(`Logout failed: ${error.message}`);
        }
    } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred while logging out.');
    }
}


function toggleProfileDropdown() {
    const dropdown = document.getElementById('profile-dropdown');
    dropdown.classList.toggle('hidden');
}


document.querySelector('.depth-7-frame-1').addEventListener('click', handleSignupAndExplore);


document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchUserStatus();
});

document.getElementById('search-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        searchRecipes(); 
    } else {
        searchRecipes(); 
    }
});

function searchRecipes() {
    const query = document.getElementById('search-input').value;
    fetch(`/search?q=${encodeURIComponent(query)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => displayResults(data))
        .catch(error => console.error('Error:', error));
}

function displayResults(data) {
    const dropdown = document.getElementById('search-dropdown');
    dropdown.innerHTML = ''; 

    if (data.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    data.forEach(recipe => {
        const recipeElement = document.createElement('div');
        recipeElement.textContent = `${recipe.title} - ${recipe.category_name}`;
        recipeElement.onclick = () => selectRecipe(recipe); 
        dropdown.appendChild(recipeElement);
    });

    dropdown.style.display = 'block'; 
}

function selectRecipe(recipe) {
    console.log(`Selected recipe: ${recipe.title}`);
    document.getElementById('search-input').value = recipe.title;
    document.getElementById('search-dropdown').style.display = 'none';
}

document.addEventListener('click', function(event) {
    const searchInput = document.getElementById('search-input');
    const dropdown = document.getElementById('search-dropdown');
    if (!searchInput.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

document.getElementById('search-dropdown').addEventListener('click', function(event) {
    event.stopPropagation();
});
