async function fetchRecipe() {
  try {
    // Get the recipe ID from the URL parameters
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      throw new Error('Recipe ID is missing in the URL.');
    }

    const response = await fetch(`/api/recipes/${id}`);
    if (!response.ok) {
      throw new Error(`Error fetching recipe: ${response.statusText}`);
    }

    const data = await response.json();

    document.getElementById('title').textContent = data.title;
    document.getElementById('ingredients').textContent = data.ingredients;
    document.getElementById('instructions').textContent = data.instructions;

  } catch (error) {
    console.error('Error:', error);

    document.body.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
	fetchRecipe();
});