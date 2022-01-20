
import HorizonsWidget from "/widgets/horizons-widget.js";

export default class HzUtilTest extends HorizonsWidget {
    constructor() {
        super({
            template: '/widgets/util/test/template.html',
            styles: [
                '/widgets/util/test/style.css'
            ]
        })
    }
}

HorizonsWidget.register('hz-util-test', HzUtilTest);
