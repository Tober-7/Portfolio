import View from './View.js';
import previewView from "./previewView.js";

class BookmarksView extends View {
    _parentElement = document.querySelector(".bookmarks__list");
    _errorMessage = "No bookmarks. Find a nice recipe and bookmark it!";
    _message = "";

    _getHtml () {
        return this._data.map(bookmark => previewView.render(bookmark, false)).join("");
    };

    addEventListeners (handler) {
        window.addEventListener("load", handler);
    }
}

export default new BookmarksView();