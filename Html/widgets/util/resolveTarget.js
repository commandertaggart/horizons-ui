
import Vessel from '/horizons/vessel.js';
import Contacts from '/horizons/contacts.js';

export default function resolveTarget(targetString) {
    if (!targetString || targetString === '$none') {
        return null;
    }
    if (targetString === '$vessel') {
        return Vessel;
    }

    const target = Contacts.getObjectById(targetString) || Contacts.getObjectByName(targetString);
    return target;
}