import { LightningElement, wire } from 'lwc';

import getContacts from "@salesforce/apex/contactListViewHelper.getContacts"
import searchContact from "@salesforce/apex/contactListViewHelper.searchContact"
import deleteContacts from "@salesforce/apex/contactListViewHelper.deleteContacts"

import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';


const COLS = [{label: 'Name', fieldName: 'link', type: 'url', typeAttributes: {label: {fieldName: 'FullName'}}},
            {label: 'Title', fieldName: 'Title'},
            {label: 'Email', fieldName: 'Email'},
            {label: 'Account', fieldName: "accountLink", type: 'url', typeAttributes: {label: {fieldName: 'AccountName'}}},
            {label: "Mailing Address", fieldName: 'MailingAddress'},
            { type: "button", typeAttributes: {  
                label: 'View',  
                name: 'View',  
                title: 'View',  
                disabled: false,  
                value: 'view',  
                iconPosition: 'left'  
            } },  
            { type: "button", typeAttributes: {  
                label: 'Edit',  
                name: 'Edit',  
                title: 'Edit',  
                disabled: false,  
                value: 'edit',  
                iconPosition: 'left'  
            } } , 
            { type: "button", typeAttributes: {  
                label: 'Delete',  
                name: 'Delete',  
                title: 'Delete',  
                disabled: false,  
                value: 'delete',  
                iconPosition: 'left'  
            } }

];

export default class ContactListView extends NavigationMixin(LightningElement) {
    
    cols = COLS;
    contacts;
    wiredContacts;
    selectedContacts;
    baseData;
    

    get selectedContactsLen() {
        if(this.selectedContacts == undefined) return 0;
        return this.selectedContacts.length
    }

    @wire(getContacts)
    contactsWire(result){
        this.wiredContacts = result;
        if(result.data){
            this.contacts = result.data.map((row) => {
                return this.mapContacts(row);
            })
            this.baseData = this.contacts;
        }
        if(result.error){
            console.error(result.error);
        }
    }

    mapContacts(row){
        var accountName = '';
        var accountLink = '';
        if(row.AccountId != undefined){
            accountLink = `/${row.AccountId}`;
            accountName = row.Account['Name'];
        }

        var street = row.MailingStreet
        if(row.MailingStreet == undefined){
            street = ''
        }
        var city = row.MailingCity
        if(row.MailingCity == undefined){
            city = ''
        }
        var state = row.MailingState 
        if(row.MailingState == undefined){
            state = ''
        }
        var country = row.MailingCountry 
        if(row.MailingCountry == undefined){
            country = ''
        }
        var zipCode = row.MailingPostalCode
        if(row.MailingPostalCode == undefined){
            zipCode = ''
        }

        return {...row,
            FullName: `${row.FirstName} ${row.LastName}`,
            link: `/${row.Id}`,
            accountLink: accountLink,
            AccountName: accountName,
            MailingAddress: `${street} ${city} ${state} ${zipCode} ${country}`
        };
    }

    handleRowSelection(event){
        this.selectedContacts = event.detail.selectedRows;
    }

    async handleSearch(event){
        if(event.target.value == ""){
            this.contacts = this.baseData
        }else if(event.target.value.length > 1){
            const searchContacts = await searchContact({searchString: event.target.value})

            this.contacts = searchContacts.map(row => {
                return this.mapContacts(row);
            })
        }
    }

    navigateToNewRecordPage() {

        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Contact',
                actionName: 'new'
            }
        });
    }

    handleRowAction(event) {
        const recId = event.detail.row.Id;  
        const actionName = event.detail.action.name;  
        if (actionName === 'Edit') {  
            this[NavigationMixin.Navigate]({  
                type: 'standard__recordPage',  
                attributes: {  
                    recordId: recId,  
                    objectApiName: 'Contact',  
                    actionName: 'edit'  
                }  
            })  
        } else if (actionName === 'View') {  
            this[NavigationMixin.Navigate]({  
                type: 'standard__recordPage',  
                attributes: {  
                    recordId: recId,  
                    objectApiName: 'Contact',  
                    actionName: 'view'  
                }  
            })  
        } else if (actionName === 'Delete') {  // Ajout de la condition pour l'action de suppression
            this.deleteSelectedContact(recId);
        }
    }
    
        
        deleteSelectedContacts() {
            const idList = this.selectedContacts.map(row => row.Id);
            if(idList.length === 0) {
                return; // Rien à supprimer
            }
            deleteContacts({ contactIds: idList })
                .then(() => {
                    // Actualisation des données après la suppression
                    return refreshApex(this.wiredContacts);
                })
                .then(() => {
                    // Réinitialisation de la sélection et de la liste des contacts
                    this.template.querySelector('lightning-datatable').selectedRows = [];
                    this.selectedContacts = undefined;
                })
                .catch(error => {
                    // Gérer les erreurs de suppression
                    console.error('Erreur lors de la suppression des contacts : ', error);
                    this.showToast('Erreur', 'Une erreur s\'est produite lors de la suppression des contacts.', 'error');
                });
        }
        
             

        
        
        showToast(title, message, variant){
            const toastEvent = new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            });
            this.dispatchEvent(toastEvent);
        }
        

    refresh() {
        // Reload the current page
        location.reload();
    }

      downloadCSVFile() {   
        let rowEnd = '\n';
    let csvString = '';
    // this set elminates the duplicates if have any duplicate keys
    let rowData = new Set();

    // getting keys from data
    this.contacts.forEach(function (record) {
        Object.keys(record).forEach(function (key) {
            rowData.add(key);
        });
    });

    // Array.from() method returns an Array object from any object with a length property or an iterable object.
    rowData = Array.from(rowData).filter(key => key !== "Account" && key !== "accountLink" && key !== "Link");

    // splitting using ','
    csvString += rowData.join(',');
    csvString += rowEnd;

    // main for loop to get the data based on key value
    for(let i=0; i < this.contacts.length; i++){
        let colValue = 0;

        // validating keys in data
        for(let key in rowData) {
            if(rowData.hasOwnProperty(key)) {
                // Key value 
                // Ex: Id, Name
                let rowKey = rowData[key];
                // add , after every value except the first.
                if(colValue > 0){
                    csvString += ',';
                }
                // If the column is undefined, it as blank in the CSV file.
                let value = this.contacts[i][rowKey] === undefined ? '' : this.contacts[i][rowKey];
                csvString += '"'+ value +'"';
                colValue++;
            }
        }
        csvString += rowEnd;
    }

    // Creating anchor element to download
    let downloadElement = document.createElement('a');

    // This  encodeURI encodes special characters, except: , / ? : @ & = + $ # (Use encodeURIComponent() to encode these characters).
    downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
    downloadElement.target = '_self';
    // CSV File Name
    downloadElement.download = 'Contacts.csv';
    // below statement is required if you are using firefox browser
    document.body.appendChild(downloadElement);
    // click() Javascript function to download CSV file
    downloadElement.click(); 
    }
    
    navigateToDataImporter() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: 'https://talan-9a-dev-ed.develop.lightning.force.com/lightning/setup/DataManagementDataImporter/home',
            }
        });
    }   
    
}