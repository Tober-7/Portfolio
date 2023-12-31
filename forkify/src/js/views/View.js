import icons from "url:../../img/icons.svg";

export default class View {
    _data;

    render (data, render = true) {
        if (!data || (Array.isArray(data) && data.length === 0)) return this.renderError();

        this._data = data;

        const recipeHtml = this._getHtml();

        if (!render) return recipeHtml;

        this._clear();
        this._parentElement.insertAdjacentHTML("beforeend", recipeHtml);
    };

    update (data) {
        this._data = data;

        const recipeHtml = this._getHtml();

        const newDOM = document.createRange().createContextualFragment(recipeHtml);

        const newElements = Array.from(newDOM.querySelectorAll("*"));
        const currentElements = Array.from(this._parentElement.querySelectorAll("*"));

        newElements.forEach((newEl, i) => {
            const currentEl = currentElements[i];

            if (!newEl.isEqualNode(currentEl) && newEl.firstChild?.nodeValue.trim() !== "") {
                currentEl.textContent = newEl.textContent;
            }

            if (!newEl.isEqualNode(currentEl)) {
                Array.from(newEl.attributes).forEach(attr => currentEl.setAttribute(attr.name, attr.value))
            }
        });
    };

    _clear () {
        this._parentElement.innerHTML = "";
    };

    renderSpiner () {
        const spinerHtml = `
        <div class="spinner">
          <svg>
            <use href="${icons}#icon-loader"></use>
          </svg>
        </div>
        `;
        this._parentElement.innerHTML = "";
        this._parentElement.insertAdjacentHTML("afterbegin", spinerHtml);
    };

    renderError (message = this._errorMessage) {
        const errorHtml = `
            <div class="error">
                <div>
                <svg>
                    <use href="${icons}#icon-alert-triangle"></use>
                </svg>
                </div>
                <p>${message}</p>
            </div>
        `;
        this._clear();
        this._parentElement.insertAdjacentHTML("afterbegin", errorHtml);
    };

    renderMessage (message = this._message) {
        const messageHtml = `
            <div class="message">
                <div>
                <svg>
                    <use href="${icons}#icon-smile"></use>
                </svg>
                </div>
                <p>${message}</p>
            </div>
        `;
        this._clear();
        this._parentElement.insertAdjacentHTML("afterbegin", messageHtml);
    };
}