
const itemEl = document.querySelector('.food-items') 
const favList = document.querySelector('.fav-list')
const searchBox = document.querySelector('.search-box')
const search = document.querySelector('.search')
const infoContainer = document.querySelector('.info-container')
const closeInfoBtn = document.querySelector('.close-info')
const recipeInfo = document.querySelector('.recipe-info')
const recipePopup = document.querySelector('#recipe-popup')


getRandomMeal();
fetchFavMeals();

async function getRandomMeal () {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
    addMeal(randomMeal, true);
}

async function getMealById (id) {
    const resp = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    const respData = await resp.json();
    const meal = respData.meals[0];
    return meal;
    
}

async function getMealsBySearch (term) {
    const resp = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`)
    const respData = await resp.json();
    const meal = respData.meals;
    return meal;
    
}

function addMeal (meal) {
    console.log(meal)
    const item = document.createElement('div');
    item.classList.add('item')

    item.innerHTML=`

        <div class="item-header">
            
            <img
                src="${meal.strMealThumb}"
                alt="${meal.strMeal}"/>
        </div>
        <div class="item-container">
            <h4>${meal.strMeal}</h4>
            <button class="fav-btn"><i class="fa-regular fa-heart"></i></button>
        </div>
        `


        const btn = item.querySelector(".fa-heart");
        btn.addEventListener('click', () => {
            if (btn.classList.contains('fa-regular')) {
                btn.setAttribute('class', 'fa-solid fa-heart')
                addMealLS(meal.idMeal)
            } else {
                btn.setAttribute('class', 'fa-regular fa-heart')
                removeMealLS(meal.idMeal)
            }
            fetchFavMeals();
        })

        itemEl.appendChild(item)

        item.firstChild.nextSibling.addEventListener('click', () => {
            showMealInfo(meal);
        });

        
}

//add meals to the local storage
function addMealLS (mealID) {
    const mealIds = getMealLS()
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealID]))
}

//remove meals from local storage
function removeMealLS(mealID) {
    const mealIds = getMealLS()
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealID)))
}


// function to store meals in the local storage
function getMealLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));
    return mealIds === null ? [] : mealIds
}

// function to fetch meals from Local storage
async function fetchFavMeals(){
    favList.innerHTML = "";
    const mealsIds = getMealLS();
    const meals = [];
    for(let i=0; i<mealsIds.length; i++){
        const mealID = mealsIds[i];
        meal = await getMealById(mealID)
        addMealToFav(meal)
        meals.push(meal)
    }
}

//add meals to favorite list and render them to the screen
function addMealToFav (meal){
    const favMeal = document.createElement("li")
    favMeal.innerHTML=`
    <img
            src="${meal.strMealThumb}"
            alt="${meal.strMeal}"/><span>${meal.strMeal}</span>
        <button class="clear"><i class="fas fa-window-close"></i></button>`;

        const btn = favMeal.querySelector(".clear");

        btn.addEventListener("click", () => {
            removeMealLS(meal.idMeal);
            

            //adds & removes meal to/from favorite list everytime the heart is pressed
            const heart_btns = document.querySelectorAll('.fa-heart');
            heart_btns.forEach(heart_btn => {
            heart_btn.setAttribute('class', 'fa-regular fa-heart');
        })
            fetchFavMeals();
        });
    
        favMeal.firstChild.nextSibling.addEventListener("click", () => {
            showMealInfo(meal);
        });


    favList.appendChild(favMeal)
}

//popup showing the recipe
function showMealInfo(meal){
    recipeInfo.innerHTML = "";
    const popUp = document.createElement("div");
    const ingredients = [];
//to list ingredients (max = 20 in themealdb api) and measurement side by side
    for (let i = 1; i <= 20; i++) {
        if (meal["strIngredient" + i]) {
            ingredients.push(`${meal["strIngredient" + i]} - ${meal["strMeasure" + i]}`);
        } 
        else {
            break;
        }
    }
    

    popUp.innerHTML=`
    <h1>${meal.strMeal}</h1>
        <img
            src="${meal.strMealThumb}"
            alt="${meal.strMeal}"/>
        <p>${meal.strInstructions}</p>
        <h3>Ingredients:</h3>
        <ul>${ingredients.map((ing) => `<li>${ing}</li>`).join("")}</ul>`;

        recipeInfo.appendChild(popUp);

        recipePopup.classList.remove("hidden");
}

//function to add item to favorite while clicking heart


search.addEventListener('click', async ()=>{
    itemEl.innerHTML="";
    const searchVal = searchBox.value;
    const meals = await getMealsBySearch(searchVal);
    //display all the meals matching the search term
    if(meals){
        meals.forEach(meal=>{
            addMeal(meal)
        })
    }
    else{
        itemEl.innerText='No meals found...'
    }
})


//on closing, the container gets the hidden property, therefore not visible
closeInfoBtn.addEventListener("click", () => {
    recipePopup.classList.add("hidden");
});
