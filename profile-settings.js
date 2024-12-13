document.getElementById('profile-form').addEventListener('submit', async (event) => {
    event.preventDefault(); 
  
    const name = document.getElementById('name').value.trim();
    const profilePicFile = document.getElementById('profile-pic').files[0];
    const darkMode = document.getElementById('dark-mode').checked;
  
    const formData = new FormData();
    formData.append('name', name);
    formData.append('darkMode', darkMode);
  
    if (profilePicFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64ProfilePic = reader.result.split(',')[1]; 
        formData.append('profilePic', base64ProfilePic); 
  
        try {
          const response = await fetch('/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: name,
              darkMode: darkMode,
              profilePic: base64ProfilePic,
            }),
          });
  
          const result = await response.json();
  
          if (response.ok) {
            alert('Profile updated successfully!');
            window.location.href = '/profile'; 
          } else {
            alert(result.error || 'An error occurred. Please try again.');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred. Please try again.');
        }
      };
      reader.readAsDataURL(profilePicFile); 
    } else {
      try {
        const response = await fetch('/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: name,
            darkMode: darkMode,
          }),
        });
  
        const result = await response.json();
  
        if (response.ok) {
          alert('Profile updated successfully!');
          window.location.href = '/profile'; 
        } else {
          alert(result.error || 'An error occurred. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    }
  });
  