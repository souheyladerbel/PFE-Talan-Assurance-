// localisation.js
import { LightningElement, api } from 'lwc';
 
export default class MapComponent extends LightningElement {
    // Définir les marqueurs de carte pour Talan Tunisie
    @api mapMarkers = [{
        location: {
            Latitude:  36.836063230912245,
            Longitude: 10.21002172916114
        },
   
        title: 'Talan Tunisia International'
    }];
 
    // Définir le centre de la carte sur la localisation de Talan Tunisie
    @api mapCenter = {
        location: {
            Latitude: 36.898163,
            Longitude: 10.189644
        }
    };
}