public class assignmentFormCtrl {

    @AuraEnabled(cacheable=true)
    public static Map<String, String> getPicklistValues(String objectName, String fieldName){
        Map<String, String> picklistValues = new Map<String, String>();
        for( Schema.PicklistEntry pickListVal : Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap().get(fieldName).getDescribe().getPicklistValues()){
            picklistValues.put(pickListVal.getValue(), pickListVal.getLabel());
        }
        return picklistValues;
    }
    
    @AuraEnabled
    public static void createAssignment(Assignment__c oAssignment){
        try{
            upsert oAssignment;
        }catch(DMLException dmlex){
            throw new AuraHandledException(dmlex.getDMLMessage(0));
        }catch(Exception ex){
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
}