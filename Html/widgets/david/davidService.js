const davidService = {
    values: {},
    connect() {
        setTimeout(() => {
            this.values = {
                testValue1: 100,
            };
        }, 1000);
    }
};

export default davidService;
