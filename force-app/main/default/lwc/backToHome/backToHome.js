import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class BackToHome extends NavigationMixin(LightningElement) {
    handleHomeButtonClick() {
        // Naviguer vers la page d'accueil
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'home'
            }
        });
    }
}
