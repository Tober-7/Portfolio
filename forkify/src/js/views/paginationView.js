import View from "./View.js";

import icons from "url:../../img/icons.svg";

class PaginationView extends View {
    _parentElement = document.querySelector(".pagination");

    _getHtml () {
        const pages = Math.ceil(this._data.results.length / this._data.resultsPerPage);
        const page = this._data.page

        if (page === 1 && pages > 1) {
            return this.getPageButtonRight(page);
        }

        if (page === pages && pages > 1) {
            return this.getPageButtonLeft(page);
        }

        if (page < pages) {
            return `
            ${this.getPageButtonLeft(page)}
            ${this.getPageButtonRight(page)}
            `;
        }

        return "";
    };

    getPageButtonRight (page) {
        return `
        <button data-goto="${page + 1}" class="btn--inline pagination__btn--next">
            <span>Page ${page + 1}</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
        </button>
        `;
    };

    getPageButtonLeft (page) {
        return `
        <button data-goto="${page - 1}" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${page - 1}</span>
        </button>
        `;
    };

    addEventListeners (handler) {
        this._parentElement.addEventListener("click",
        function (e) {
            e.preventDefault();
            handler(e.target.closest("button"));
        });
    };
}

export default new PaginationView();