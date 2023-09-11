import View from './View.js';
import previewView from "./previewView.js";

class ResultsView extends View {
    _parentElement = document.querySelector(".results");
    _errorMessage = "No recipes found for you query. Try again!";
    _message = "";

    _getHtml () {
        return this._data.map(res => previewView.render(res, false)).join("");
    };
}

export default new ResultsView();