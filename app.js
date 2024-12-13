document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('login-form')) {
        initLogin();
    }

    if (document.getElementById('signup-form')) {
        initRegister();
    }

    if (document.getElementById('recipe-form')) {
        initRecipeManager();
    }
});


function initLogin() {
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const loginEmail = document.getElementById('login-email').value;
        const loginPassword = document.getElementById('login-password').value;

        if (loginEmail === '' || loginPassword === '') {
            alert('Please fill in both fields to log in.');
        } else {
            alert(`Logging in as: ${loginEmail}`);
            window.location.href = 'home.html'; 
        }
    });

    document.getElementById('register-btn').addEventListener('click', function() {
        window.location.href = 'register.html';
    });
}

function initRegister() {
    document.getElementById('signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const signupUsername = document.getElementById('username').value;
        const signupEmail = document.getElementById('signup-email').value;
        const signupPassword = document.getElementById('signup-password').value;
        const profilePicture = document.getElementById('profile-picture').files[0];

        if (signupUsername === '' || signupEmail === '' || signupPassword === '' || !profilePicture) {
            alert('Please fill in all fields to register.');
        } else {
            alert(`Registered as: ${signupUsername}`);
            window.location.href = 'home.html'; 
        }
    });
}

function initRecipeManager() {
    const recipes = [];
    const recipeForm = document.getElementById('recipe-form');
    const recipesContainer = document.getElementById('recipes-container');
    let editIndex = null;

    recipeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('recipe-title').value;
        const ingredients = document.getElementById('recipe-ingredients').value;

        if (editIndex !== null) {
            recipes[editIndex] = { title, ingredients };
            editIndex = null;
        } else {
            recipes.push({ title, ingredients });
        }

        recipeForm.reset();
        displayRecipes();
    });

    function displayRecipes() {
        recipesContainer.innerHTML = '';
        recipes.forEach((recipe, index) => {
            const recipeItem = document.createElement('li');
            recipeItem.className = 'recipe-item';
            recipeItem.innerHTML = `
                <h3>${recipe.title}</h3>
                <p>${recipe.ingredients}</p>
                <button onclick="editRecipe(${index})">Edit</button>
                <button onclick="deleteRecipe(${index})">Delete</button>
            `;
            recipesContainer.appendChild(recipeItem);
        });
    }

    window.editRecipe = function(index) {
        const recipe = recipes[index];
        document.getElementById('recipe-title').value = recipe.title;
        document.getElementById('recipe-ingredients').value = recipe.ingredients;
        editIndex = index;
    }

    window.deleteRecipe = function(index) {
        recipes.splice(index, 1);
        displayRecipes();
    }
}
