
export default class WidgetEvent extends Event {
    constructor({
        property,
        value
    }) {
        super(property);
        this.property = property;
        this.value = value;
        this.updatedValue = value;
    }
}