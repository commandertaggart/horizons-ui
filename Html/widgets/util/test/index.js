
import Test from '/horizons/test.js';

export default async function HzTestWidget(hzWidget) {
    await hzWidget.setTemplate('/widgets/util/test/template.html');

    hzWidget.bindSystem(Test, {
        testBool: { onUpdate: 'setLabel', onclick: () => Test.testBool = !Test.testBool }, 
        testNumber: { onUpdate: 'setLabel', onclick: () => ++Test.testNumber }, 
        testString: [
            { onUpdate: 'setValue' }, 
            { elementId: 'newString', onkeyup: ({ target }) => Test.testString = target.value }
        ]
    });
}
