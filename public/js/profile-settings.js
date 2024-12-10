// Fetch user data once the page has loaded
      document.addEventListener("DOMContentLoaded", () => {
        fetch('/api/user-status') // Request logged-in user's data
          .then(response => response.json())
          .then(data => {
            if (data.loggedIn) {
              // Update the DOM with user data
              document.getElementById('user-name').textContent = data.username;
              document.getElementById('profile-picture').src = `/images/${data.profilePicture}`;  // Adjust path
              document.getElementById('profile-name').textContent = data.username;
              document.getElementById('profilePicture').src = `/images/${data.profilePicture}`; // Update profile picture in header
            } else {
              window.location.href = "/login"; // Redirect to login if not logged in
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

	  
	  