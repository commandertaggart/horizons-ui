
requirejs.config({
    baseUrl: 'Taggart/',
    paths: {
        'jquery': 'lib/jquery-3.6.0.min',
        'jsviews': 'lib/jsviews',
        'three': 'lib/three.min',
        'text': 'lib/text',
        'rxjs': 'lib/rxjs.umd'
    },
    config: {
        text: {
            useXhr: () => true
        }
    }
});

// This finds all undefined elements whose tag name starts with 'hydra-', and attempts to load a script for that element from the widgets directory.
define(['hydra/net', 'jquery', 'jsviews', 'text'], (HydraNet) => {
    const HORIZONS_WIDGET_PREFIX = 'hz-';
    let undefinedElements = document.querySelectorAll(':not(:defined)');
    let requireList = [... undefinedElements]
        .filter((el) => el.localName.startsWith(HORIZONS_WIDGET_PREFIX))
        .map((el) => `widgets/${el.localName.substring(HORIZONS_WIDGET_PREFIX.length).replace('-','/')}`);
    require(requireList, () => (void (0)),
        (err) => {
            if (err.requireModules) {
                console.log(err);
                console.error(`Could not load scripts for hydra widgets: ${ err.requireModules.join(' ,') }`);
            }
        }
    );

    if (typeof(HydraVersion) !== 'undefined') {
        HydraNet.Connect(HydraVersion);
        window.addEventListener('unload', () => {
            HydraNet.Disconnect();
        })
    }
})
