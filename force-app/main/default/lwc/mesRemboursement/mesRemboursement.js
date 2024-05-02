import { LightningElement, wire } from 'lwc';
import getCasesForCurrentUser from '@salesforce/apex/CaseController.getCasesForCurrentUser';

const columns = [
    { label: 'Type de remboursement', fieldName: 'Type_de_remboursement__c', type: 'text' },
    { label: 'Status', fieldName: 'Status', type: 'text' },
    { label: 'Description', fieldName: 'Description', type: 'text' },
    { label: 'Montant (DT)', fieldName: 'Montant_DT__c', type: 'text' },
    { label: 'Date de remboursement', fieldName: 'CreatedDate', type: 'text' },
    { label: 'Numéro Remboursement', fieldName: 'CaseNumber', type: 'button', typeAttributes: { label: { fieldName: 'CaseNumber' } } },

];

export default class CaseList extends LightningElement {
    cases;
    columns = columns;

    @wire(getCasesForCurrentUser)
    wiredCases({ error, data }) {
        if (data) {
            this.cases = data;
            console.log(this.cases);
            console.log(data);
        } else if (error) {
            console.error('Error retrieving cases:', error);
        }
    }
}
