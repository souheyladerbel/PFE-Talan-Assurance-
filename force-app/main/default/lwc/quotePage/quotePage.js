import { LightningElement, track ,wire , api} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRelatedQuote from '@salesforce/apex/QuoteController.getRelatedQuote';
import { refreshApex } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';
const DELAY = 300;
const columns = [
    { label: 'Ouote Name', fieldName: 'Name', type: 'text' },
    { label: 'Opportunity Name', fieldName: 'Opportunity.Name', type: 'Object' },
    { label: 'Status', fieldName: 'Status', type: 'picklist' },
    { label: 'Expiration Date', fieldName: 'ExpirationDate', type: 'date' },
    { label: 'Subtotal', fieldName: 'Subtotal', type: '	currency' },
    { label: 'Total Price', fieldName: 'TotalPrice', type: 'currency' },
   
    
    {
     
      type: 'button',
      typeAttributes: {
          label: 'View details',
          name: 'view_details'
      }
    },
   
    {
    type: 'button',
      typeAttributes: {
        name : 'delete',
        label: 'Delete',
        title: 'Delete',
        variant: 'destructive',
        class: 'scaled-down',

        
      }
    },
];




export default class quotePage  extends  NavigationMixin(LightningElement) {// delete 
  
    @api objectApiName;
    
    @track error;
    @track wiredDataResult;
    loading;
    searchKey = '';
    @api recordId;
    @track data ;
      @track allActivitiesData;
      @track columns = columns;
    
      @wire(getRelatedQuote,{searchKey: '$searchKey'}) 
      quotes(result) {
        this.loading = true;
          this.stopLoading(500);
        this.wiredDataResult=result;
        if (result.data) 
        {
           this.allActivitiesData =  result.data.map(
       record => Object.assign(
        
         { "Opportunity.Name": record.Opportunity.Name},
         record
         
           ));
         }
         
       
     else if (result.error) {
             this.error = result.error;
             this.columns = undefined;
         }
      }
   
  
      handleclick(event){
        const row = event.detail.row ;
        const actionName = event.detail.action.name;  
        if ( actionName === 'view_details' ) {
        this[NavigationMixin.Navigate]({
          type: 'standard__recordPage',
          attributes: {
              objectApiName: 'Quote',
              recordId: row.Id,
              actionName: 'view'
          }
      });
      //@wire(getObjectAuditUpdate , { objet: '$objet' })
  } else if ( actionName === 'delete') {
  
  
  
    console.log('test2'+row.Id);
    deleteRecord(row.Id)
              .then(() => {
                this.loading = true;
                this.stopLoading(500);
                  this.dispatchEvent(
                      new ShowToastEvent({
                          title: 'Success',
                          message: 'Quote deleted',
                          variant: 'success'
                      })
                  );
                  // Navigate to a record home page after
                  // the record is deleted, such as to the
                  // contact home page
                  this[NavigationMixin.Navigate]({
                      //type: 'standard__objectPage',
                      // attributes: {
                           //objectApiName: 'Account',
                           //actionName: 'new',
                 
                          type: 'standard__navItemPage',
                          attributes: {
                              apiName: 'Quotes'
                       },
                   });
              })
              .catch(error => {
                  this.dispatchEvent(
                      new ShowToastEvent({
                          title: 'Error deleting record',
                          message: error.body.message,
                          variant: 'error'
                      })
                  );
              });
      
  }
  }
  connectedCallback() {
    //this.loading = true;
    this.stopLoading(500);
  }   
    /**
     * The stopLoading utility is used to control a consistant state experience for the user - it ensures that
     * we don't have a flickering spinner effect when the state is in flux.
     * @param {timeoutValue} timeoutValue
     */
    stopLoading(timeoutValue) {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      refreshApex(this.wiredDataResult);
      
      this.loading = false;
    }, timeoutValue);
  }
  
  
  handleKeyChange(event) {
        
    window.clearTimeout(this.delayTimeout);
    const searchKey = event.target.value;
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.delayTimeout = setTimeout(() => {
        this.searchKey = searchKey;
    }, DELAY);
  }
  
  downloadCSVFile() {   
    let rowEnd = '\n';
    let csvString = '';
    // this set elminates the duplicates if have any duplicate keys
    let rowData = new Set();
  
    // getting keys from data
    this.allActivitiesData.forEach(function (record) {
        Object.keys(record).forEach(function (key) {
            rowData.add(key);
        });
    });
  
    // Array.from() method returns an Array object from any object with a length property or an iterable object.
    rowData = Array.from(rowData);
    
    // splitting using ','
    csvString += rowData.join(',');
    csvString += rowEnd;
  
    // main for loop to get the data based on key value
    for(let i=0; i < this.allActivitiesData.length; i++){
        let colValue = 0;
  
        // validating keys in data
        for(let key in rowData) {
            // eslint-disable-next-line no-prototype-builtins
            if(rowData.hasOwnProperty(key)) {
                // Key value 
                // Ex: Id, Name
                let rowKey = rowData[key];
                // add , after every value except the first.
                if(colValue > 0){
                    csvString += ',';
                }
                // If the column is undefined, it as blank in the CSV file.
                let value = this.allActivitiesData[i][rowKey] === undefined ? '' : this.allActivitiesData[i][rowKey];
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
    downloadElement.download = 'Quotes Data.csv';
    // below statement is required if you are using firefox browser
    document.body.appendChild(downloadElement);
    // click() Javascript function to download CSV file
    downloadElement.click(); 
  }
  
  navigateToObjectHome() {
    // Navigate to the Account home page
    this[NavigationMixin.Navigate]({
       type: 'standard__objectPage',
        attributes: {
            objectApiName: 'Quote',
            actionName: 'new',
  
          // type: 'standard__navItemPage',
          // attributes: {
              // apiName: 'export'
        },
    });
  }
  
  report() {
    // Navigate to the Account home page
    this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            objectApiName: 'Dashboard',
            recordId: '01Z4L000000J2eFUAS',
            actionName: 'view',
        },
    });
  }
  }
  