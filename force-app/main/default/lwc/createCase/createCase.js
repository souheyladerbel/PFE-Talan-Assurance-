import { LightningElement, track } from 'lwc';
import createCaseAndAttachFile from '@salesforce/apex/CaseController.createCaseAndAttachFile';

export default class CaseForm extends LightningElement {
    @track subject = '';
    @track description = '';
    file;

    handleSubjectChange(event) {
        this.subject = event.target.value;
    }

    handleDescriptionChange(event) {
        this.description = event.target.value;
    }

    handleFileUpload(event) {
        // Store the file
        this.file = event.detail.files[0];
    }

    async handleSubmit() {
        try {
            // Call the Apex method to create a case and attach the file
            await createCaseAndAttachFile({
                subject: this.subject,
                description: this.description,
                file: this.file
            });

            // Show a success message
            this.dispatchEvent(new CustomEvent('showtoast', {
                detail: {
                    title: 'Success',
                    message: 'Case created and file attached successfully.',
                    variant: 'success'
                }
            }));
        } catch (error) {
            // Show an error message
            this.dispatchEvent(new CustomEvent('showtoast', {
                detail: {
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error'
                }
            }));
        }
    }
}