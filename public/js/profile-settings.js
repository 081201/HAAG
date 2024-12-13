// Fetch user data once the page has loaded
      document.addEventListener("DOMContentLoaded", () => {
        fetch('/api/user-status') 
          .then(response => response.json())
          .then(data => {
            if (data.loggedIn) {
              document.getElementById('user-name').textContent = data.username;
              document.getElementById('profile-picture').src = `/images/${data.profilePicture}`;  
              document.getElementById('profile-name').textContent = data.username;
              document.getElementById('profilePicture').src = `/images/${data.profilePicture}`; 
            } else {
              window.location.href = "/login"; 
            }
          })
          .catch(err => {
            console.error("Error fetching user data:", err);
            alert("Failed to load user data.");
          });

        // Handle name change
        document.getElementById('change-name-btn').addEventListener('click', () => {
          const newName = prompt("Enter your new name:");
          if (newName) {
            fetch('/api/update-name', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: newName })
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                document.getElementById('user-name').textContent = newName; 
                document.getElementById('profile-name').textContent = newName;
              }
            });
          }
        });

        // Handle profile picture change
        document.getElementById('change-profile-btn').addEventListener('click', () => {
          document.getElementById('profile-picture-input').click(); 
        });

        // Handle file input change
        document.getElementById('profile-picture-input').addEventListener('change', (event) => {
          const file = event.target.files[0];  
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              // Display the selected image as the profile picture
              document.getElementById('profile-picture').src = reader.result;
              document.getElementById('profilePicture').src = reader.result; 
            };
            reader.readAsDataURL(file);  
          }
        });
      });
	  
document.addEventListener("DOMContentLoaded", () => {
  const recipesButton = document.getElementById('your-recipes-btn');
  if (recipesButton) {
    recipesButton.addEventListener('click', () => {
      window.location.href = '/profile page.html'; 
    });
  }
});

// Search functionality
 const searchInput = document.querySelector('input[type="text"][placeholder="Search"]'); 
 const searchDropdown = document.getElementById('search-dropdown'); 
 if (searchInput) { searchInput.addEventListener('keypress', function(event) { if (event.key === 'Enter') { event.preventDefault(); 
 searchRecipes(); 
 } else { searchRecipes(); 
 } }); 
 } document.addEventListener('click', function(event) { 
 if (searchInput && searchDropdown && !searchInput.contains(event.target) && !searchDropdown.contains(event.target)) { searchDropdown.style.display = 'none'; 
 } }); if (searchDropdown) { searchDropdown.addEventListener('click', function(event) { event.stopPropagation(); 
 }); 
 }; 
 
 function searchRecipes() { 
 const query = document.querySelector('input[type="text"][placeholder="Search"]').value; 
 fetch(`/search?q=${encodeURIComponent(query)}`) .then(response => { 
 if (!response.ok) { throw new Error('Network response was not ok'); 
 } return response.json(); 
 }) .then(data => displayResults(data)) 
 .catch(error => console.error('Error:', error)); 
 } function displayResults(data) { const dropdown = document.getElementById('search-dropdown'); 
 dropdown.innerHTML = ''; 
 if (data.length === 0) { dropdown.style.display = 'none'; 
 return; 
 } data.forEach(recipe => { const recipeElement = document.createElement('div'); 
 recipeElement.textContent = `${recipe.title} - ${recipe.category_name}`; 
 recipeElement.onclick = () => selectRecipe(recipe); 
 dropdown.appendChild(recipeElement); 
 }); 
 dropdown.style.display = 'block'; 
 } 
 
 function selectRecipe(recipe) { 
 const searchInput = document.querySelector('input[type="text"][placeholder="Search"]'); 
 searchInput.value = recipe.title; 
 document.getElementById('search-dropdown').style.display = 'none'; 
 }

	  
	  