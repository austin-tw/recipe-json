let currentUnitSystem = "metric";

(async function () {
  const result = await fetch("./recipes.json");
  const recipes = await result.json();

  // Recall localStorage recipeIndex, if none saved, then use index[0]
  const lastRecipeIndex = localStorage.getItem("lastRecipeIndex");
  const RecipeIndex = lastRecipeIndex ? lastRecipeIndex : 0;
  showRecipe(recipes[RecipeIndex]);

  // Create options dropdown menu
  const dishDropdown = document.getElementById("dishDropdown");
  for (let i = 0; i < recipes.length; i++) {
    const dishOption = document.createElement("option");
    dishOption.value = i;
    dishOption.innerHTML = recipes[i].name;
    dishDropdown.appendChild(dishOption);
  }

  // Add event listener to the dropdown menu
  dishDropdown.addEventListener("change", (event) => {
    const selectedRecipeIndex = event.target.value;
    showRecipe(recipes[selectedRecipeIndex]);
    localStorage.setItem("lastRecipeIndex", selectedRecipeIndex); // Save RecipeIndex to localStorage
  });

  // Event listeners for adjusting servings buttons
  document
    .getElementById("x2Button")
    .addEventListener("click", () => adjustServings(2));
  document
    .getElementById("plus1Button")
    .addEventListener("click", () => plusMinus1Serving(1));
  document
    .getElementById("minus1Button")
    .addEventListener("click", () => plusMinus1Serving(-1));
  document
    .getElementById("unitToggleButton")
    .addEventListener("click", toggleUnits);
  document.getElementById("resetButton").addEventListener("click", resetPage);
})();

function showRecipe(x) {
  currentRecipe = x;
  recipeName.innerHTML = x.name;
  description.innerHTML = x.description;
  cuisine.innerHTML = x.cuisine;
  foodImage.src = x.image;
  foodImage.alt = "An image of " + x.name;
  prepTime.innerHTML = formatTime(x.prepTime);
  cookTime.innerHTML = formatTime(x.cookTime);
  servings.innerHTML = x.servings;
  difficulty.innerHTML = x.difficulty;
  calories.innerHTML = x.nutritionalInfo.calories.toFixed(2);

  changeNutritionalInfo(x.nutritionalInfo);
  showIngredients(x.ingredients);
  showInstructions(x.instructions);
  showTags(x.tags);
}

function resetPage() {
  location.reload();
}

function showIngredients(y) {
  document.getElementById("ingredientsList").innerHTML = "";
  for (let j = 0; j < y.length; j++) {
    let ingredientAmount = y[j].amount;
    let ingredientUnit = y[j].unit;

    // Convert the amount if the unit system is imperial
    if (currentUnitSystem === "imperial") {
      ingredientAmount = convertToImperial(ingredientAmount, ingredientUnit);
      if (ingredientUnit === "grams") ingredientUnit = "oz";
      else if (ingredientUnit === "milliliters") ingredientUnit = "fl oz";
      else if (ingredientUnit === "kilograms") ingredientUnit = "lbs";
      else if (ingredientUnit === "liters") ingredientUnit = "gallons";
    }
    // Convert oz to lbs if >= 16 oz
    if (ingredientUnit === "oz" && ingredientAmount >= 16) {
      ingredientAmount = (ingredientAmount / 16).toFixed(2);
      ingredientUnit = "lbs";
    }

    const ingredient = document.createElement("li");
    ingredient.innerHTML = `${y[j].item} - ${ingredientAmount} ${ingredientUnit}`;
    document.getElementById("ingredientsList").appendChild(ingredient);
  }
}

function showInstructions(z) {
  document.getElementById("instructionsList").innerHTML = "";
  for (let k = 0; k < z.length; k++) {
    const instruction = document.createElement("li");
    instruction.innerHTML = z[k].step + ". " + z[k].text;
    document.getElementById("instructionsList").appendChild(instruction);
  }
}

function showTags(w) {
  document.getElementById("tagsList").innerHTML = "";
  for (let l = 0; l < w.length; l++) {
    const tag = document.createElement("li");
    tag.innerHTML = w[l];
    document.getElementById("tagsList").appendChild(tag);
  }
}

function adjustServings(factor) {
  currentRecipe.servings *= factor;
  currentRecipe.nutritionalInfo.calories *= factor;
  currentRecipe.nutritionalInfo.protein *= factor;
  currentRecipe.nutritionalInfo.carbohydrates *= factor;
  currentRecipe.nutritionalInfo.fat *= factor;

  currentRecipe.ingredients.forEach((ingredient) => {
    ingredient.amount = (ingredient.amount * factor).toFixed(2);
  });

  showRecipe(currentRecipe);
}

function plusMinus1Serving(one) {
  const newServings = currentRecipe.servings + one;
  if (newServings < 1) return;
  const factor = newServings / currentRecipe.servings;
  currentRecipe.nutritionalInfo.calories *= factor;
  currentRecipe.nutritionalInfo.protein *= factor;
  currentRecipe.nutritionalInfo.carbohydrates *= factor;
  currentRecipe.nutritionalInfo.fat *= factor;

  currentRecipe.ingredients.forEach((ingredient) => {
    ingredient.amount = (ingredient.amount * factor).toFixed(2);
  });
  currentRecipe.servings = newServings;
  showRecipe(currentRecipe);
}

function formatTime(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} hr ${remainingMinutes} min`;
}

function toggleUnits() {
  if (currentUnitSystem === "metric") {
    currentUnitSystem = "imperial";
    document.getElementById("unitToggleButton").innerHTML = "Switch to Metric";
  } else {
    currentUnitSystem = "metric";
    document.getElementById("unitToggleButton").innerHTML =
      "Switch to Imperial";
  }
  showRecipe(currentRecipe);
}

function convertToImperial(amount, unit) {
  switch (unit) {
    case "grams":
      return (amount * 0.03527).toFixed(2);
    case "milliliters":
      return (amount * 0.03381).toFixed(2);
    case "liters":
      return (amount * 0.26417).toFixed(2);
    case "kilograms":
      return (amount * 2.20462).toFixed(2);
    default:
      return amount; // If no conversion needed, just return original amount
  }
}

// Change nutritional info unit
function changeNutritionalInfo(nutritionalInfo) {
  let protein = nutritionalInfo.protein.toFixed(2);
  let carbohydrates = nutritionalInfo.carbohydrates.toFixed(2);
  let fat = nutritionalInfo.fat.toFixed(2);
  let unit = "grams";
  if (currentUnitSystem === "imperial") {
    protein = convertToImperial(protein, "grams");
    carbohydrates = convertToImperial(carbohydrates, "grams");
    fat = convertToImperial(fat, "grams");
    unit = "oz";
  }
  document.getElementById("protein").innerHTML = `${protein} ${unit}`;
  document.getElementById(
    "carbohydrates"
  ).innerHTML = `${carbohydrates} ${unit}`;
  document.getElementById("fat").innerHTML = `${fat} ${unit}`;
}
