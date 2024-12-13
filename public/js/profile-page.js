document.addEventListener("DOMContentLoaded", () => {
  fetch('/api/user-status')
    .then(response => response.json())
    .then(data => {
      if (data.loggedIn) {
        // Update profile picture dynamically
        const profilePicture = document.getElementById('profilePicture');
        profilePicture.src = `/images/${data.profilePicture}`; // Adjust the path based on your image location
        profilePicture.alt = `${data.username}'s Profile Picture`;
      } else {
        window.location.href = "/login"; // Redirect to login if not logged in
      }
    })
    .catch(err => {
      console.error("Error fetching user data:", err);
      alert("Failed to load user data.");
    });
});
