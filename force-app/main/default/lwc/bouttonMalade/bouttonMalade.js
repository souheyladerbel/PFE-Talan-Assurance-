import { LightningElement } from 'lwc';

export default class BouttonMalade extends LightningElement {
    clickedButtonLabel;

    handleClick(event) {
        this.clickedButtonLabel = event.target.label;
    }
}



