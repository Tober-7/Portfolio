import * as model from "./model.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";

import { UPLOAD_WINDOW_CLOSE_TIME } from "./config.js";

import "core-js/stable";
import "regenerator-runtime/runtime";

// if (module.hot) {
//   module.hot.accept();
// }

function init () {
  bookmarksView.addEventListeners(controlBookmarks);
  recipeView.addEventListeners(controlRecipes);
  recipeView.addEventListenerServings(controlServings);
  recipeView.addEventListenerBookmark(controlBookmark);
  searchView.addEventListeners(controlSearchResults);
  paginationView.addEventListeners(controlPagination);
  addRecipeView.addEventListenerSubmit(controlAddRecipe);
};

async function controlRecipes () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    recipeView.renderSpiner();

    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    await model.loadRecipe(id);
    recipeView.render(model.state.recipe);

  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
};

async function controlSearchResults () {
  try {
    resultsView.renderSpiner();

    const query = searchView.getQuery();
    
    if (!query) return;

    await model.loadSearchResults(query);

    //resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

function controlPagination (button) {

  if (!button) return;

  resultsView.render(model.getSearchResultsPage(+button.dataset.goto));
  paginationView.render(model.state.search);
};

function controlServings (servingsChangeValue) {
  if ((+model.state.recipe.servings + +servingsChangeValue) > 0) {
    model.updateServings(+model.state.recipe.servings + +servingsChangeValue);
    recipeView.update(model.state.recipe);
  }
};

function controlBookmark () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.removeBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);
};

function controlBookmarks () {
  bookmarksView.render(model.state.bookmarks);
};

async function controlAddRecipe (newRecipe) {
  try {
    addRecipeView.renderSpiner();

    await model.uploadRecipe(newRecipe);
  
    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    setTimeout(function() {
      addRecipeView.toggleWindow();
    }, UPLOAD_WINDOW_CLOSE_TIME * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

init();