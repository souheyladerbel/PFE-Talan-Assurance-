import { LightningElement, track } from 'lwc';

export default class InsuranceForm extends LightningElement {
    @track duration;
    @track price;

    handleDurationChange(event) {
        this.duration = event.target.value;
    }

    handlePriceChange(event) {
        this.price = event.target.value;
    }

    handleSave() {
        // Logique de sauvegarde ou envoi des données ici
        console.log('Durée:', this.duration);
        console.log('Prix:', this.price);
        // Réinitialisation des champs après la sauvegarde
        this.duration = '';
        this.price = '';
    }
}
