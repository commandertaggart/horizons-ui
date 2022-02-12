
import Session from '/horizons/session.js';

import HzUIIcon from '/widgets/ui/icon/index.js';

export default async function HzUIScreenHeader(hzWidget) {
    await Promise.all([
        hzWidget.setTemplate('/widgets/screen/header/template.html'),
        hzWidget.addStyles('/widgets/screen/header/style.css')
    ]);

    let roles = {};

    Session.addEventListener('Roles', ({ value }) => {
        const newRoles = Object.keys(value);
        if (newRoles.length != Object.keys(roles).length) {
            hzWidget.createFromTemplate('role-status', newRoles.length, (el, _tid, idx) => {
                roles[newRoles[idx]] = el;
            });
        }

        newRoles.forEach(roleName => {
            const role = value[roleName];
            const el = roles[roleName];
            el.innerHTML = role.Abbr;
            el.setAttribute('data-role', roleName);
            el.classList.toggle('in-use', role.InUse);
        });
    });

    Session.addEventListener('ConnectionStatus', ({ value }) => {
        hzWidget.setStyleClass('socket-indicator', 'online', value);
    });

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    hzWidget.setAttribute('input-indicator', 'image', isTouch ? 'touch' : 'mouse');

    hzWidget.addEvent('settings-button', 'click', () => {});
    hzWidget.addEvent('fullscreen-button', 'click', () => {});
}