import { LightningElement,api,wire,track } from 'lwc';
import  getRelatedContracts from '@salesforce/apex/CaseController.getRelatedCases';
import  CaseController from '@salesforce/apex/CaseController.CaseController';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
const DELAY = 300;

const columns = [
{ label: 'Case Number', fieldName: 'CaseNumber' },
{ label: 'Type de remboursement', fieldName: 'Type_de_remboursement__c' },
{ label: 'Status', fieldName: 'Status', type: '	picklist' },
{ label: 'Account Name', fieldName: 'AccountName__c' },
{ label: 'Contact Name', fieldName: 'ContactName__c' },
{ label: 'Date/Time Opened', fieldName: 'CreatedDate', type: 'Date/Time' },





{
  label: 'Action',
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

export default class RelatedCase extends NavigationMixin(LightningElement) {

  // delete 
  
  @api objectApiName;
  
  @track error;
     
   @track page = 1;  
   @track startingRecord = 1;
   @track endingRecord = 0; 
   @track pageSize = 8; 
   @track totalRecountCount = 0;
   @track totalPage = 0;
  
   @track items = []; 
 
 
   
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
 
 
 
 
 
   searchKey = '';
 @track data ;
     @track allActivitiesData;
     @track columns = columns;
     @wire(getRelatedContracts,{searchKey: '$searchKey'})
     contacts(result) {
       this.loading = true;
         this.stopLoading(500);
       this.wiredDataResult = result;
       if (result.data) 
       {
           console.log("test");
         this.allActivitiesData = result.data;
            
            this.items = this.allActivitiesData ;
            this.totalRecountCount = this.allActivitiesData.length; 
            this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
            
           this.allActivitiesData = this.items.slice(0,this.pageSize); 
            this.endingRecord = this.pageSize;
            this.columns = columns;
         }
      else if (result.error) {
              this.error = result.error;
              this.columns = undefined;
          }
      
     }
 
     previousHandler() {
       if (this.page > 1) {
           this.page = this.page - 1; //decrease page by 1
           this.displayRecordPerPage(this.page);
       }
     }
     
     //clicking on next button this method will be called
     nextHandler() {
       if((this.page<this.totalPage) && this.page !== this.totalPage){
           this.page = this.page + 1; //increase page by 1
           this.displayRecordPerPage(this.page);            
       }             
     }
     
     //this method displays records page by page
       displayRecordPerPage(page){
     
       this.startingRecord = ((page -1) * this.pageSize) ;
       this.endingRecord = (this.pageSize * page);
     
       this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                           ? this.totalRecountCount : this.endingRecord; 
     
        this.allActivitiesData = this.items.slice(this.startingRecord, this.endingRecord);
     
       this.startingRecord = this.startingRecord + 1;
     }    
        
 
 
     @track recordId ; 
 
     handleclick(event){
       const row = event.detail.row ;
       const actionName = event.detail.action.name;  
       if ( actionName === 'view_details' ){
       this[NavigationMixin.Navigate]({
         type: 'standard__recordPage',
         attributes: {
             objectApiName: 'Case',
             recordId: row.Id,
             actionName: 'view'
         }
     });
     }else if ( actionName === 'delete') {
       const row = event.detail.row;
     
     
       console.log('test2'+row.Id);
     
       deleteRecord(row.Id)
                 .then(() => {
                   this.loading = true;
                   this.stopLoading(500);
                     this.dispatchEvent(
                         new ShowToastEvent({
                             title: 'Success',
                             message: 'Record deleted',
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
                                 apiName: 'Cases'
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
         
     }else if ( actionName === 'Escalated') {
    const row = event.detail.row.Id;
  
  
    console.log('test2'+row.Id);
    CaseController({Id: row}).then(result => {
      this.loading = true;
      this.stopLoading(800);
    }).then(() => {
      this.dispatchEvent(
          new ShowToastEvent({
              title: 'Success',
              message: 'Case Escalated To The Technical Department With all the details',
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
                  apiName: 'Cases'
           },
       });
  })
  .catch(error => {
      this.dispatchEvent(
          new ShowToastEvent({
              title: 'Error Escalated Case',
              message: error.body.message,
              variant: 'error'
          })
      );
  });
}
}
 
 
     handleKeyChange(event) {
       
       window.clearTimeout(this.delayTimeout);
       const searchKey = event.target.value;
       this.delayTimeout = setTimeout(() => {
           this.searchKey = searchKey;
       }, DELAY);
   }
 
   New(){
     
     this[NavigationMixin.Navigate]({
       type: 'standard__objectPage',
       attributes: {
           objectApiName: 'Case',
           actionName: 'new'
       }
   });
   }
 
   refrech() {
    window.location.href = 'https://talan-9a-dev-ed.develop.lightning.force.com/lightning/n/case_page';
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
     downloadElement.download = 'Cases Data.csv';
     // below statement is required if you are using firefox browser
     document.body.appendChild(downloadElement);
     // click() Javascript function to download CSV file
     downloadElement.click(); 
 }
 
 
 statuss() {
   // Navigate to the Account home page
   this[NavigationMixin.Navigate]({
      //type: 'standard__objectPage',
      // attributes: {
           //objectApiName: 'Account',
           //actionName: 'new',
 
          type: 'standard__navItemPage',
          attributes: {
              apiName: 'Transactions_Contracts'
       },
   });
 }
 
 report() {
   // Navigate to the Account home page
   this[NavigationMixin.Navigate]({
       type: 'standard__recordPage',
       attributes: {
           objectApiName: 'Dashboard',
           recordId: '01Z8e000000bwebEAA',
           actionName: 'view',
       },
   });
 }

}