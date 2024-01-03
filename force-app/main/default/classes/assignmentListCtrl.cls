public class assignmentListCtrl {

    @AuraEnabled(cacheable=true)
    public static List<Assignment__c> getAssignments(String searchKey, Integer limitSize, Integer offset){
        List<Assignment__c> lstAssignment = new List<Assignment__c>();
        String sSOQL = 'SELECT Id, Name, Title__c, Status__c, Description__c, DueDate__c FROM Assignment__c ';
        if(String.isNotBlank(searchKey)){
            sSOQL += 'WHERE ( Name like \'%'+searchKey+'%\' OR Title__c like \'%'+searchKey+'%\' OR Status__c like \'%'+searchKey+'%\')';
        }
        sSOQL += 'ORDER BY DueDate__c ASC LIMIT :limitSize OFFSET :offset';
        return database.query(sSOQL);
    }
    
    @AuraEnabled
    public static void deleteAssignments(String recordId){
        try{
            Assignment__c oAssignment = new Assignment__c(Id=recordId);
            delete oAssignment;
        }catch(DMLException dmlex){
            throw new AuraHandledException(dmlex.getDMLMessage(0));
        }catch(Exception ex){
            throw new AuraHandledException(ex.getMessage());
        }
    }

}