import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { RefreshEvent } from 'lightning/refresh';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAssignments from "@salesforce/apex/assignmentListCtrl.getAssignments";
import deleteAssignments from "@salesforce/apex/assignmentListCtrl.deleteAssignments";

const DELAY = 300;

export default class AssignmentList extends NavigationMixin(LightningElement) {
    searchKey = "";
    limitSize = 25;
    offset = 0;
    @track showSpinner = false;
    @track showAssigmentPopup = false;
    @track selectedAssignment;
    @track columns = [
        {
            label: 'Name', fieldName: 'assignmentName', type: 'url',
            typeAttributes: {
                label: { fieldName: 'Name' },
                target: '_blank',
                tooltip: { fieldName: 'Name' }
            }
        },
        { label: 'Title', fieldName: 'Title__c', type: 'text' },
        { label: 'Description', fieldName: 'Description__c', type: 'text' },
        {
            label: 'Due Date', fieldName: 'DueDate__c', type: 'date',
            typeAttributes: {
                day: "numeric",
                month: "numeric",
                year: "numeric"
            }
        },
        { label: 'Status', fieldName: 'Status__c', type: 'text' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [{ label: 'Edit', name: 'edit' }, { label: 'Delete', name: 'delete' }],
                menuAlignment: 'right'
            }
        }
    ];

    @track wiredAssignmentList = [];
    @track assignments = [];
    @wire(getAssignments, {searchKey: "$searchKey", limitSize:"$limitSize", offset:"$offset"})
    handleResult(result) {
        this.wiredAssignmentList = result
        if (result.data) {
            let tempRecs = [];
            result.data.forEach((record) => {
                let tempRec = Object.assign({}, record);
                tempRec.assignmentName = '/' + tempRec.Id;
                tempRecs.push(tempRec);

            });
            if(this.offset != 0){
                let tempAssignment = [...this.assignments, ...tempRecs];
                this.assignments = tempAssignment;
            }else{
                this.assignments = tempRecs;
            }
        } else {
            console.error(result.error);
            this.showToast('Error', result.error, 'error');
            //this.error = result.error;
        }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'edit':
                this.selectedAssignment = row;
                this.showAssigmentPopup = true;
                break;
            case 'delete':
                this.deleteRecord(row.Id);
                break;
        }
    }

    deleteRecord(recordId) {
        this.showSpinner = true;
        deleteAssignments({ recordId: recordId }).then(result => {
            this.showSpinner = false;
            this.showToast('Success', 'Record deleted successfully.', 'success');
            this.offset = 0;
            refreshApex(this.wiredAssignmentList);
            this.dispatchEvent(new RefreshEvent());
        }).catch(error => {
            this.showSpinner = false;
            this.showToast('Error', error.body.message, 'error');
        });
    }

    handleSearchRecords(event){
        let searchKey = event.detail.value;
        if(searchKey && searchKey.length>2){
            window.clearTimeout(this.delayTimeout);
            this.delayTimeout = setTimeout(() => {
                this.searchKey = searchKey;
                this.offset = 0;
            }, DELAY);
        }else{
            this.searchKey = '';
            this.offset = 0;
        }
    }

    handleNewAssignment(event){
        this.selectedAssignment = null;
        this.showAssigmentPopup = true;
    }

    handleClose(event){
        this.selectedAssignment = null;
        this.showAssigmentPopup = false;
        this.offset = 0;
        refreshApex(this.wiredAssignmentList);
    }

    handleLoadMoreData(event){
        window.clearTimeout(this.delayTimeout);
        this.delayTimeout = setTimeout(() => {
            this.offset = this.offset + this.limitSize;
        }, DELAY);
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }

}