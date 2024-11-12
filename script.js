// Show the selected page and hide others
function showPage(pageId) {
    const pages = document.querySelectorAll("section");
    pages.forEach((page) => page.classList.add("hidden"));
    document.getElementById(pageId).classList.remove("hidden");
  }
  
  // Toggle light and dark themes
  function toggleTheme() {
    document.body.classList.toggle("bg-gray-900");
    document.body.classList.toggle("text-gray-100");
  }
  
  // Preview profile image upload
  function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
      const profileImage = document.getElementById("profileImage");
      profileImage.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  }
  
  // Initialize default page view
  showPage('home');
  