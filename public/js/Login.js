document.addEventListener("DOMContentLoaded", () => {
  // Find the form and input fields
  const loginForm = document.querySelector("#login-form");
  const emailInput = document.querySelector(".enter-your-email");
  const passwordInput = document.querySelector(".create-a-password");

  // If elements are not found, log an error and stop execution
  if (!loginForm || !emailInput || !passwordInput) {
    console.error("Required elements not found in the DOM.");
    return;
  }

  // Add submit event listener to the form
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validate input
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      // Send a POST request to the server
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        // Login successful, redirect to homepage
        alert(`Login successful! Welcome, ${result.username}. Redirecting...`);
        window.location.href = "/";
      } else {
        // Handle login failure
        alert(result.error || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again.");
    }
  });
});
