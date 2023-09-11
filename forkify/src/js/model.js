import { async } from "regenerator-runtime";
import { API_URL, KEY, RESULTS_PER_PAGE } from "./config.js";
import { AJAX } from "./helpers.js";

export const state = {
    recipe: {},
    search: {
        query: "",
        results: [],
        resultsPerPage: RESULTS_PER_PAGE,
        page: 1,
    },
    bookmarks: [

    ],
};

function createRecipeObject (data) {
    const { recipe } = data.data;
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && { key: recipe.key }),
    };
}

export async function loadRecipe (id) {
    try {
        const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

        state.recipe = createRecipeObject(data);

        state.recipe.bookmarked = state.bookmarks.some(bookmark => bookmark.id === id);
    }
    catch (err) {
        throw err;
    }
};

export async function loadSearchResults (query) {
    try {
        state.search.query = query;
        state.search.page = 1;

        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

        state.search.results = data.data.recipes.map(recipe => {
            return {
                id: recipe.id,
                title: recipe.title,
                publisher: recipe.publisher,
                image: recipe.image_url,
                ...(recipe.key && { key: recipe.key }),
            };
        });
    } catch (err) {
        throw err;
    }
};

export function getSearchResultsPage (page = state.search.page) {
    state.search.page = page;

    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;

    return state.search.results.slice(start, end);
};

export function updateServings (servings) {
    state.recipe.ingredients.forEach(ing => ing.quantity *= servings / state.recipe.servings);
    state.recipe.servings = servings;
};

function persistBookmarks () {
    localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
};

export function addBookmark (recipe) {
    state.bookmarks.push(recipe);

    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

    persistBookmarks();
};

export function removeBookmark (id) {
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);

    if (id === state.recipe.id) state.recipe.bookmarked = false;

    persistBookmarks();
};

function init () {
    const storage = localStorage.getItem("bookmarks");

    if (!storage) return;

    state.bookmarks = JSON.parse(storage);
};

init();

function clearBookmarks () {
    localStorage.clear('bookmarks');
};
//clearBookmarks();

export async function uploadRecipe (newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe).filter(entry => entry[0]
        .startsWith("ingredient") && entry[1] !== "")
        .map(ing => {
            const ingArr = ing[1].split(",").map(el => el.trim());

            if (ingArr.length !== 3) throw new Error("Wrong ingredient format.");

            const [quantity, unit, description] = ingArr;
            return { quantity: quantity ? +quantity : null, unit, description };
        });

        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        };

        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        state.recipe = createRecipeObject(data);

        addBookmark(state.recipe);
    } catch (err) {
        throw err;
    }
};