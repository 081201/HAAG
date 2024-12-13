
const signupForm = document.querySelector("form");
const nameInput = document.querySelector(".enter-your-name");
const emailInput = document.querySelector(".enter-your-email");
const passwordInput = document.querySelector(".create-a-password");


signupForm.addEventListener("submit", async (event) => {
  event.preventDefault(); 

 
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

 
  if (!name || !email || !password) {
    alert("Please fill in all required fields.");
    return;
  }

  if (password.length < 8) {
    alert("Password must be at least 8 characters.");
    return;
  }

  try {
    const response = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: name, email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Signup successful! Redirecting to login...");
      window.location.href = "/login"; 
    } else {
      alert(result.error || "Signup failed. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
});

document.querySelector('.log-in-button').addEventListener('click', function(event) {
  event.preventDefault();
  const userConfirmed = confirm("Are you sure you want to log in?");
  if (userConfirmed) {
    window.location.href = '/login'; 
  }
});

