
define(['horizons/gameObject'], (GameObject) => {

    class Vessel extends GameObject {
        constructor(initialData) {
            super(initialData);
        }
    }

    if (!GameObject.BaseTypeRegistered('Vessel')) {
        GameObject.RegisterBaseType('Vessel', Vessel);
    }

    return Vessel;
});