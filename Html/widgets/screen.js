
define([], () => {
    class HzScreen extends HTMLElement {
        constructor() {
            super();
        }
    
        connectedCallback() {
        }
    }
    
    customElements.define('hz-screen', HzScreen);
});