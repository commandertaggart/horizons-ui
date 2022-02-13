
import Vessel from '/horizons/vessel.js';
import resolveTarget from '/widgets/util/resolveTarget.js';

function __headingFromOrientation(o) {
    //Heading from Pitch/Yaw/Roll
    if (!o) return "000 + 00";

    var hdg = 0;
    var p = 0;
    var p2 = 0;
    var sign = "-";
    hdg = Math.abs(o.Yaw).toFixed(0);
    p = o.Pitch;

    p2 = Math.abs(p).toFixed(0);

    if (p2 > 270) {
        // Pitch Down
        p2 = 90 - p2 % 270;
        sign = "-";
    } else if (p2 > 180) {
        p2 = 90 - p2 % 180;
        sign = "-";
    } else if (p2 > 90) {
        p2 = 90 - p2 % 90;
        sign = "+";
    } else if (p2 > 0) {
        sign = "+";
    } else {
        sign = "-";
    }

    return `${hdg.toString().padStart(3, '0')} ${sign} ${p2.toString().padStart(2, '0')}`;
}

export default function HzVesselHeading(hzWidget) {
    
    hzWidget.setParameters = {
        'target': { defaultValue: '$vessel' }
    };

    let currentTarget = null;

    const removeTarget = () => {
        updateTarget(null)
    }

    const updateTarget = (newTarget) => {
        if (currentTarget && currentTarget.removeEventListener) {
            currentTarget.removeEventListener('destroy', removeTarget);
        }

        currentTarget = resolveTarget(newTarget);
        if (currentTarget && currentTarget.Orientation) {
            currentTarget.addEventListener('destroy', removeTarget);
            currentTarget.addEventListener('Orientation', ({ value }) => hzWidget.setValue('heading', __headingFromOrientation(value)));
        }
        else {
            currentTarget = null;
            hzWidget.setValue('heading', __headingFromOrientation(undefined));
        }
    }

    hzWidget.setContent(/*html*/`<div id="heading" class="hz-display-text"></div>`).then(() => {
        hzWidget.addEventListener('target', updateTarget);
    });
}
