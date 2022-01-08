
const ErrorWidget = {
    name: 'ErrorWidget',
    template: /*html*/`<div 
        class="hz-bits-icon"
        v-bind:style="{
            '--hz-icon-content': 'H',
            'font-size': size + 'px'
        }"
    ></div>`,
    props: {
        size: { default: 48 }
    }
}

export default ErrorWidget;