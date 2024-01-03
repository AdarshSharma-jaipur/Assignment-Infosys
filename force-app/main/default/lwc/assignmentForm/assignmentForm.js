import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getPicklistValues from "@salesforce/apex/assignmentFormCtrl.getPicklistValues";
import createAssignment from "@salesforce/apex/assignmentFormCtrl.createAssignment";

export default class AssignmentForm extends LightningElement {
    showSpinner = false;
    statusOptions = [];
    @wire(getPicklistValues, {objectName:'Assignment__c', fieldName:'Status__c'})
    handlePicklistResult({ error, data }) {
        this.statusOptions = [];
        this.statusOptions.push({value:'', label:'-None-'});
        if (data) {
            for(var key in data){
                this.statusOptions.push({value:data[key], label:key});
            }
        }else if (error) {
            console.error(error);
        }
    }

    @api selectedAssignment;
    
    get header(){
        return (this.selectedAssignment && this.selectedAssignment != undefined)?'Edit '+this.selectedAssignment.Name:'New Assignment';
    } 

    get title(){
        return (this.selectedAssignment && this.selectedAssignment != undefined)?this.selectedAssignment.Title__c:'';
    }

    get dueDate(){
        return (this.selectedAssignment && this.selectedAssignment != undefined)?this.selectedAssignment.DueDate__c:null;
    }

    get description(){
        return (this.selectedAssignment && this.selectedAssignment != undefined)?this.selectedAssignment.Description__c:'';
    }

    get status(){
        return (this.selectedAssignment && this.selectedAssignment != undefined)?this.selectedAssignment.Status__c:'';
    }

    handleSave(event){
        let isValid = true;
        let obj = {'sobjecttype':'Assignment__c'};
        let inputFields = this.template.querySelectorAll('.validate');
        inputFields.forEach(inputField => {
            if(!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
            obj[inputField.name] = inputField.value;
        });
        if(isValid){
            let inputTextAreaFields = this.template.querySelectorAll('lightning-textarea');
            inputTextAreaFields.forEach(inputField => {
                obj[inputField.name] = inputField.value;
            });
            
            if(this.selectedAssignment && this.selectedAssignment != undefined && this.selectedAssignment.Id != undefined){
                obj['Id'] = this.selectedAssignment.Id;
            }
            console.log('OUTPUT : '+JSON.stringify(obj));
            this.showSpinner = true;
            createAssignment({ oAssignment: obj }).then(result => {
                this.showSpinner = false;
                let message = 'Record created successfully.';
                if(this.selectedAssignment && this.selectedAssignment != undefined){
                    message = 'Record updated successfully.';
                }
                this.showToast('Success', message, 'success');
                this.dispatchEvent(new CustomEvent("close"));
            }).catch(error => {
                this.showSpinner = false;
                this.showToast('Error', error.body.message, 'error');
            });
        }
    }

    handleClose(event){
        this.dispatchEvent(new CustomEvent("close"));
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }


}