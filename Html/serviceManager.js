
const serviceManager = {
    services: {
        //David: null,
    },

    connectToService(name, path) {
        if (!this.services[name]) {
            import(path).then(module => {
                this.services[name] = module.default;
                this.services[name].connect();
                this._reportServiceConnected(name, module.default);
            });
        }
    },

    _reportServiceConnected(name, service) {
        if (this.onServiceConnected) {
            this.onServiceConnected(name, service);
        }
    },
};

export default serviceManager;
