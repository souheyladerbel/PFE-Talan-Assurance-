import { LightningElement, track, wire, api } from 'lwc';
import getProducts from '@salesforce/apex/ProductController.getProducts';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class ProductPage extends NavigationMixin(LightningElement) {
    @api objectApiName;

    @track error;
    @track page = 1;
    @track pageSize = 8;
    @track totalRecords = 0;
    @track totalPages = 0;
    @track searchKey = '';
    @track data = [];
    @track columns = [
        { label: 'Product Name', fieldName: 'Name', type: 'text' },
        { label: 'Product Code', fieldName: 'ProductCode', type: 'text' },
        { label: 'Active', fieldName: 'IsActive', type: 'boolean' },
        { 
            type: 'action',
            typeAttributes: { rowActions: this.getRowActions },
        }
    ];
    loading = false;
    wiredProductsResult;

    connectedCallback() {
        // Affichez le spinner de chargement pendant un court délai
        this.stopLoading(300);
    }

    stopLoading(timeoutValue) {
        setTimeout(() => {
            refreshApex(this.wiredProductsResult);
            this.loading = false;
        }, timeoutValue);
    }

    @wire(getProducts, { searchKey: '$searchKey' })
    wiredProducts(result) {
        this.wiredProductsResult = result;
        if (result.data) {
            this.totalRecords = result.data.length;
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
            this.updateData();
        } else if (result.error) {
            console.error('Error retrieving products:', result.error);
        }
    }

    handleKeyChange(event) {
        const searchKey = event.target.value.trim();
        console.log('Search Key:', searchKey); // Debug: Log the search key

        this.searchKey = searchKey;
        this.loading = true;

        // Call the wired Apex method to fetch the Product based on the search key
        getProducts({ searchKey: this.searchKey })
            .then(result => {
                console.log('Search Result:', result); // Debug: Log the result
                this.wiredProductsResult = result;
                this.updateData();
            })
            .catch(error => {
                console.error('Error retrieving Product:', error);
                this.error = error;
            })
            .finally(() => {
                this.loading = false;
            });
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
        if (this.wiredProductsResult.data) {
            this.data = this.wiredProductsResult.data.slice(startIndex, endIndex);
        }
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
                this.deleteProduct(row.Id);
                break;
            case 'edit':
                this.updateProduct(row.Id);
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
                objectApiName: 'Product2',
                actionName: 'view'
            }
        });
    }

    deleteProduct(productId) {
        deleteRecord(productId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Product deleted successfully.',
                        variant: 'success'
                    })
                );
                return refreshApex(this.wiredProductsResult);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting Product',
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

    updateProduct(productId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: productId,
                objectApiName: 'Product2',
                actionName: 'edit'
            }
        });
    }

    async downloadCSV() {
        try {
            // Retrieve product data from the wired result
            const { data } = this.wiredProductsResult;
    
            // Check if there is data to download
            if (!data || data.length === 0) {
                throw new Error('No data available to download');
            }
    
            // Convert product data to CSV format
            const csvContent = this.convertArrayOfObjectsToCSV(data);
    
            // Download CSV file
            this.downloadCSVFile(csvContent, 'ProductList.csv');
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
    
    
    New() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Product2',
                actionName: 'new'
            }
        });
    }
    
}
