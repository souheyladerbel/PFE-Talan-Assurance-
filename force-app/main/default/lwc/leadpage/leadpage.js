import { LightningElement, track , wire , api  } from 'lwc';
import getLeads from '@salesforce/apex/LeadController.getLeads';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import LEAD_OBJECT from '@salesforce/schema/Lead';

const DELAY = 300;


export default class LeadDataTable extends NavigationMixin(LightningElement) {
    @api objectApiName;
  
    @track error;
   
       @track page = 1;  
       @track startingRecord = 1;
       @track endingRecord = 0; 
       @track pageSize = 8; 
       @track totalRecountCount = 0;
       @track totalPage = 100;
       @track searchKey = '';

       wiredLeadsResult;

    data = [];
    columns = [
        { label: 'First Name', fieldName: 'FirstName', type: 'text' },
        { label: 'Last Name', fieldName: 'LastName', type: 'text' },
        { label: 'Email', fieldName: 'Email', type: 'email' },
        { label: 'Company', fieldName: 'Company', type: 'text' },
        { label: 'Type d\'assurance', fieldName: 'TypeAssurance__c', type: 'Picklist' },
        { label: 'Durée d\'assurance', fieldName: 'Durr_d_assurance__c', type: 'Picklist' },
        { label: 'Lead Source', fieldName: 'LeadSource', type: 'text' },
        { label: 'Country', fieldName: 'Country', type: 'text' },
        { label: 'Mobile Phone', fieldName: 'Phone', type: 'phone' },
        { label: 'Create Date', fieldName: 'CreatedDate', type: 'date' },
        { 
            type: 'action',
            typeAttributes: { rowActions: this.getRowActions },
        }
    ];
    
    loading;
    connectedCallback() {
      //this.loading = true;
      this.stopLoading(500);
    }  
    @track wiredDataResult;
    /**
    * The stopLoading utility is used to control a consistant state experience for the user - it ensures that
    * we don't have a flickering spinner effect when the state is in flux.
    * @param {timeoutValue} timeoutValue
    */
     stopLoading(timeoutValue) {
       setTimeout(() => {
         refreshApex(this.wiredDataResult);
         
         this.loading = false;
       }, timeoutValue);
     }
     @wire(getLeads, { searchKey: '$searchKey' })
     wiredLeads(result) {
         this.wiredLeadsResult = result;
         if (result.data) {
             this.totalRecords = result.data.length;
             this.totalPages = Math.ceil(this.totalRecords / this.pageSize); // Calcul du nombre total de pages
             this.updateData(); // Mise à jour des données affichées initialement
         } else if (result.error) {
             console.error('Error retrieving leads:', result.error);
         }
     }
     
     
    New(){
      
        this[NavigationMixin.Navigate]({
          type: 'standard__objectPage',
          attributes: {
              objectApiName: 'Lead',
              actionName: 'new'
          }
      });
      }

      // Ajoutez cette méthode à votre classe de composant
      updateLead(leadId) {
        if (leadId && /^[a-zA-Z0-9]{15}$|^[a-zA-Z0-9]{18}$/.test(leadId)) {
            // Utilisez la NavigationMixin pour naviguer vers la page de modification du lead
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: leadId,
                    objectApiName: 'Lead',
                    actionName: 'edit' // Changez 'edit' si vous utilisez une action de modification personnalisée
                }
            });
        } else {
            // Gérez le cas où l'leadId n'est pas valide
            console.error('Invalid leadId:', leadId);
            this.showToast('Error', 'Invalid leadId', 'error');
        }
    }
    
  
     /* handleKeyChange(event) {
        // Réinitialiser la pagination à la première page à chaque fois que la recherche change
        this.page = 1;
        
        // Effacer le timeout précédent pour éviter les appels inutiles au serveur
        window.clearTimeout(this.delayTimeout);
        
        // Récupérer la nouvelle valeur de recherche
        const searchKey = event.target.value;
        
        // Définir un nouveau timeout pour limiter les appels au serveur après un délai de 300ms
        this.delayTimeout = setTimeout(() => {
            this.loading = true; // Afficher le spinner de chargement pendant la recherche
            
            // Appeler la méthode Apex avec le terme de recherche
            getLeads({ searchKey: searchKey })
                .then(result => {
                    this.wiredLeadsResult = result;
                    this.updateData(); // Mise à jour des données affichées avec les résultats de la recherche
                })
                .catch(error => {
                    console.error('Error retrieving leads:', error);
                    this.error = error;
                })
                .finally(() => {
                    this.loading = false; // Masquer le spinner de chargement après la recherche
                });
        }, DELAY);
    }*/
    handleKeyChange(event) {
        // Réinitialiser la pagination à la première page à chaque fois que la recherche change
        this.page = 1;
        
        // Effacer le timeout précédent pour éviter les appels inutiles au serveur
        window.clearTimeout(this.delayTimeout);
        
        // Récupérer la nouvelle valeur de recherche et la stocker dans la variable de classe
        this.searchKey = event.target.value;
        
        // Définir un nouveau timeout pour limiter les appels au serveur après un délai de 300ms
        this.delayTimeout = setTimeout(() => {
            this.loading = true; // Afficher le spinner de chargement pendant la recherche
            
            // Appeler la méthode Apex avec le terme de recherche
            getLeads({ searchKey: this.searchKey })
                .then(result => {
                    this.wiredLeadsResult = result;
                    this.totalRecords = result.data.length;
                    this.totalPages = Math.ceil(this.totalRecords / this.pageSize); // Recalcul du nombre total de pages            
                    this.updateData(); // Mise à jour des données affichées avec les résultats de la recherche
                })
                .catch(error => {
                    console.error('Error retrieving leads:', error);
                    this.error = error;
                })
                .finally(() => {
                    this.loading = false; // Masquer le spinner de chargement après la recherche
                });
        }, DELAY);
    }
    
    
    

  getRowActions(row, doneCallback) {
    const actions = [];
    actions.push({ label: 'View', name: 'view' });
    actions.push({ label: 'Edit', name: 'edit' }); // Ajout de l'action de modification
    actions.push({ label: 'delete', name: 'delete' });
    
    // Add more actions as needed
    doneCallback(actions);
}
handleclick(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;

    switch (actionName) {
        case 'view':
            this.navigateToViewPage(row.Id);
            break;
        case 'delete':
            this.deleteLead(row.Id);
        break;
        case 'edit': // Utilisez 'edit' pour correspondre à l'action définie dans getRowActions()
        this.updateLead(row.Id); // Utilisez la méthode updateLead() pour la mise à jour
    break;
        default:
            break;
    }
}

navigateToEditPage(recordId) {
    this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: recordId,
            objectApiName: 'Lead',
            actionName: 'edit'
        }
    });
}


deleteLead(leadId) {
    deleteRecord(leadId)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Lead deleted successfully.',
                    variant: 'success'
                })
            );
            // Rafraîchir les données pour mettre à jour la liste des leads
            return refreshApex(this.wiredLeadsResult);
        })
        .then(() => {
            this.updateData(); // Refresh your displayed data after the Apex refresh
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error deleting lead',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
}

navigateToViewPage(recordId) {
    this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: recordId,
            objectApiName: 'Lead',
            actionName: 'view'
        }
    });
}

handleRowSelection(event) {
    const selectedRows = event.detail.selectedRows;
    if (selectedRows.length > 0) {
        let selectedRecordId = selectedRows[0].Id;
        this.navigateToViewPage(selectedRecordId);
    }
}
refrech() {
    this[NavigationMixin.Navigate]({
        type: 'standard__navItemPage',
        attributes: {
            apiName: 'leadPage'
     },
 });
   }
   refresh() {
    // Appeler la méthode Apex pour récupérer à nouveau les leads
    getLeads()
        .then(result => {
            console.log('Leads retrieved:', result);
            // Rafraîchir les données mises en cache dans le filaire Apex
            return refreshApex(this.wiredLeads);
        })
        .then(result => {
            // Mettre à jour les données avec les nouveaux leads
            this.data = result.map(lead => ({ ...lead }));
            // Afficher un message de succès
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Leads refreshed successfully.',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            console.error('Error refreshing leads:', error);
            // Afficher un message d'erreur
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error refreshing leads: ' + error,
                    variant: 'error'
                })
            );
        });
}

updateData() {
    // Calcul des indices pour le slicing des données
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = this.page * this.pageSize; // Juste la limite supérieure pour le slice

    if (this.wiredLeadsResult.data) {
        // Assurer que seulement les données existantes sont prises
        this.data = this.wiredLeadsResult.data.slice(startIndex, endIndex);
    }
}



handleNext() {
    console.log(`Current page: ${this.page}, Total pages: ${this.totalPages}`);
    if (this.page < this.totalPages) {
        this.page++;
        this.updateData();
    }
}

handlePrevious() {
    console.log(`Current page: ${this.page}`);
    if (this.page > 1) {
        this.page--;
        this.updateData();
    }
}

get isNextEnabled() {
    return this.page < this.totalPages;
}



displayRecordPerPage(page) {
    // Calculer les index de début et de fin en fonction de la page et de la taille de la page
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalRecountCount);
    
    // Mettre à jour les enregistrements à afficher en fonction de la page
    this.data = this.data.slice(startIndex, endIndex);

    // Mettre à jour les variables startingRecord et endingRecord
    this.startingRecord = startIndex + 1;
    this.endingRecord = endIndex;

    // Mettre à jour la page actuelle
    this.page = page;
}

get isFirstPage() {
    return this.page <= 1;
}

get isLastPage() {
    return this.page >= this.totalPages;
}
get isNextEnabled() {
    return this.page < this.totalPages;
}


// telecharger sous forme CSV !!! 
async downloadCSV() {
    try {
        // Retrieve lead data from the wired result
        const { data } = this.wiredLeadsResult;

        // Check if there is data to download
        if (!data || data.length === 0) {
            throw new Error('No data available to download');
        }

        // Convert lead data to CSV format
        const csvContent = this.convertArrayOfObjectsToCSV(data);

        // Download CSV file
        this.downloadCSVFile(csvContent, 'LeadList.csv');
    } catch (error) {
        // Handle errors
        console.error('Error downloading CSV:', error);
        this.showToast('Error', 'Failed to download CSV: ' + error.message, 'error');
    }
}

convertArrayOfObjectsToCSV(data) {
    // Extract headers from the first object in data
    const headers = Object.keys(data[0]);
    
    // Convert data rows to CSV rows
    const csvRows = data.map(row => {
        return headers.map(header => row[header]).join(',');
    });

    // Combine headers and rows into CSV content
    return headers.join(',') + '\n' + csvRows.join('\n');
}

downloadCSVFile(csvContent, fileName) {
    // Create a hidden link element to trigger the download
    const hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
    hiddenElement.target = '_blank';
    hiddenElement.download = fileName;
    hiddenElement.click();
}

showToast(title, message, variant) {
    // Show a toast message
    const event = new ShowToastEvent({
        title: title,
        message: message,
        variant: variant
    });
    this.dispatchEvent(event);
}
navigateToDashboard() {
    this[NavigationMixin.Navigate]({
        type: 'standard__navItemPage',
        attributes: {
            apiName: 'Dashboard_Name' // Remplacez 'Dashboard_Name' par le nom API de votre tableau de bord
        }
    });
}


}
