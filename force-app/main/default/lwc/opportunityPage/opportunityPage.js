import { LightningElement, track, wire, api } from 'lwc';
import getOpportunities from '@salesforce/apex/OpportunityController.getOpportunities';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const DELAY = 300;

export default class OpportunityDataTable extends NavigationMixin(LightningElement) {
    @api objectApiName;
  
    @track error;
   
    @track page = 1;  
    @track startingRecord = 1;
    @track endingRecord = 0; 
    @track pageSize = 8; 
    @track totalRecountCount = 0;
    @track totalPage = 100;
    @track searchKey = '';

    wiredOpportunitiesResult;

    data = [];
    columns = [
        { label: 'Opportunity Name', fieldName: 'Name', type: 'text' },
        { label: 'Amount', fieldName: 'Amount', type: 'currency' },
        { label: 'Close Date', fieldName: 'CloseDate', type: 'date' },
        { label: 'Stage', fieldName: 'StageName', type: 'picklist' },
        { label: 'Account Name', fieldName: 'AccountName', type: 'text' }, // New column for Account Name

        { 
            type: 'action',
            typeAttributes: { rowActions: this.getRowActions },
        }
    ];
    loading;

    connectedCallback() {
        // Affichez le spinner de chargement pendant un court délai
        this.stopLoading(500);
    }  

    stopLoading(timeoutValue) {
        setTimeout(() => {
            refreshApex(this.wiredOpportunitiesResult);
            this.loading = false;
        }, timeoutValue);
    }

    @wire(getOpportunities, { searchKey: '$searchKey' })
    wiredOpportunities(result) {
        this.wiredOpportunitiesResult = result;
        if (result.data) {
            this.totalRecords = result.data.length;
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
            this.updateData();
        } else if (result.error) {
            console.error('Error retrieving opportunities:', result.error);
        }
    }
     
    New(){
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Opportunity',
                actionName: 'new'
            }
        });
    }

    updateOpportunity(opportunityId) {
        if (opportunityId && /^[a-zA-Z0-9]{15}$|^[a-zA-Z0-9]{18}$/.test(opportunityId)) {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: opportunityId,
                    objectApiName: 'Opportunity',
                    actionName: 'edit'
                }
            });
        } else {
            console.error('Invalid opportunityId:', opportunityId);
            this.showToast('Error', 'Invalid opportunityId', 'error');
        }
    }
  
    handleKeyChange(event) {
        const searchKey = event.target.value.trim();
        console.log('Search Key:', searchKey); // Debug: Log the search key
    
        this.searchKey = searchKey;
        this.loading = true;
    
        // Call the wired Apex method to fetch the opportunities based on the search key
        getOpportunities({ searchKey: this.searchKey })
            .then(result => {
                console.log('Search Result:', result); // Debug: Log the result
                this.wiredOpportunitiesResult = result;
                this.updateData();
            })
            .catch(error => {
                console.error('Error retrieving opportunities:', error);
                this.error = error;
            })
            .finally(() => {
                this.loading = false;
            });
    }
    
    
    

    getRowActions(row, doneCallback) {
        const actions = [
            { label: 'View', name: 'view' },
            { label: 'Edit', name: 'edit' },
            { label: 'Delete', name: 'delete' }
        ];
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
                this.deleteOpportunity(row.Id);
                break;
            case 'edit':
                this.updateOpportunity(row.Id);
                break;
            default:
                break;
        }
    }

    navigateToViewPage(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Opportunity',
                actionName: 'view'
            }
        });
    }

    deleteOpportunity(opportunityId) {
        deleteRecord(opportunityId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Opportunity deleted successfully.',
                        variant: 'success'
                    })
                );
                return refreshApex(this.wiredOpportunitiesResult);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting opportunity',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }

    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        if (selectedRows.length > 0) {
            let selectedRecordId = selectedRows[0].Id;
            this.navigateToViewPage(selectedRecordId);
        }
    }

    handleNext() {
        if (this.page < this.totalPages) {
            this.page++;
            this.updateData();
        }
    }

    handlePrevious() {
        if (this.page > 1) {
            this.page--;
            this.updateData();
        }
    }

    updateData() {
        const startIndex = (this.page - 1) * this.pageSize;
        const endIndex = this.page * this.pageSize;
    
        if (this.wiredOpportunitiesResult.data) {
            this.data = this.wiredOpportunitiesResult.data.slice(startIndex, endIndex).map(opportunity => ({
                ...opportunity,
                AccountName: opportunity.Account.Name // Récupérer le nom du compte
            }));
        }
    }
    get isFirstPage() {
        return this.page <= 1;
    }

    get isLastPage() {
        return this.page >= this.totalPages;
    }

    async downloadCSV() {
        try {
            const { data } = this.wiredOpportunitiesResult;
            if (!data || data.length === 0) {
                throw new Error('No data available to download');
            }

            const csvContent = this.convertArrayOfObjectsToCSV(data);
            this.downloadCSVFile(csvContent, 'OpportunityList.csv');
        } catch (error) {
            console.error('Error downloading CSV:', error);
            this.showToast('Error', 'Failed to download CSV: ' + error.message, 'error');
        }
    }

    convertArrayOfObjectsToCSV(data) {
        const headers = Object.keys(data[0]);
        const csvRows = data.map(row => {
            return headers.map(header => row[header]).join(',');
        });
        return headers.join(',') + '\n' + csvRows.join('\n');
    }

    downloadCSVFile(csvContent, fileName) {
        const hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
        hiddenElement.target = '_blank';
        hiddenElement.download = fileName;
        hiddenElement.click();
    }

    showToast(title, message, variant) {
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
