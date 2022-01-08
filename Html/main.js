
requirejs.config({
    baseUrl: '/',
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
    let undefinedElements = document.querySelectorAll(':not(:defined)');
    let requireList = [... undefinedElements]
        .map((el) => el.localName.split('-'))
        .filter((parts) => parts[0] in window.CustomElementPrefixes)
        .map((parts) => {
            parts[0] = window.CustomElementPrefixes[parts[0]];
            return parts.join('/');
        });
    require(requireList, () => (void (0)),
        (err) => {
            if (err.requireModules) {
                console.log(err);
                console.error(`Could not load scripts for hydra widgets: ${ err.requireModules.join(' ,') }`);
            }
        }
    );

    if (typeof(HydraVersion) !== 'undefined') {
        HydraNet.Connect(Window.ScreenName, HydraVersion, HydraNet.ClientType.INLINE, /* subscribe to all */ true);
        window.addEventListener('unload', () => {
            HydraNet.Disconnect();
        })
    }
})
