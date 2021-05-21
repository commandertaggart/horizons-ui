
define(['horizons/gameObject', 'three'], (GameObject, THREE) => {

    class Planet extends GameObject {
        constructor(initialData) {
            super(initialData);
        }

        _instrumentData(data) {
            super._instrumentData(data);

            if ('StarPosition' in data) {
                data.StarPosition = new THREE.Vector3(
                    data.StarPosition.X,
                    data.StarPosition.Z, // !!
                    data.StarPosition.Y  // !!
                );
            }

            if ('Name' in data) {
                data.ID = `Planet:${data.Name}`;
                data.Texture = `/Planet.${data.Name}.spng`;
            }
        }

        get Scale() { return this._data.Scale; }
        get Name() { return this._data.Name; }
        get StarPosition() { return thhis._data.StarPosition; }
        get Texture() { return this._data.Texture; }
    }

    if (!GameObject.BaseTypeRegistered('Planet')) {
        GameObject.RegisterBaseType('Planet', Planet);
    }

    return Planet;
});