public with sharing class CaseController {
    @AuraEnabled(cacheable=true)
    public static List<Case> getCasesByCurrentUser() {
        return [SELECT CaseNumber, Type_de_remboursement__c, Status, CreatedDate, ContactId, AccountId FROM Case WHERE OwnerId = :UserInfo.getUserId() ORDER BY CreatedDate DESC LIMIT 4];
    }

    @AuraEnabled(cacheable=true)
    public static List<Case> getAllCases() {
        return [SELECT CaseNumber, Type_de_remboursement__c, Status, CreatedDate, ContactId, AccountId FROM Case WHERE OwnerId = :UserInfo.getUserId() ORDER BY CreatedDate DESC ];
    }
        @AuraEnabled(cacheable=true)
        public static List<Schema.Case> getRelatedCases(String searchKey){
            String key = '%' + searchKey + '%';
            return [select 	CaseNumber,Subject,Status,Priority,	AccountName__c,ContactName__c,CreatedDate, type_de_remboursement__c 
            from Case  WHERE Status !='New' and Status !='closed' 
            ORDER BY CreatedDate DESC];
        } 

        @AuraEnabled
        public static void CaseController(String Id ) {
                 System.debug('test1'+Id);
    
           // String key = '%' + Id + '%';
            List <Schema.Case> ls = new List<Schema.Case>();
            ls = [SELECT Id FROM Case];
            for ( Schema.Case c : ls ){
                if (c.Id == Id)
                c.Status='Working' ;
    
            }
        // c.Status='Approved' ;
        // System.debug('test1'+c);
         update ls ;
       
        }

        @AuraEnabled(cacheable=true)
        public static List<Case> getCasesForCurrentUser() {
            // Get the current user's Id
            Id currentUserId = UserInfo.getUserId();
    
            // Query Cases for the current user
            List<Case> cases = [SELECT CaseNumber,Type_de_remboursement__c, Status,Description,Montant_DT__c,CreatedDate
                                FROM Case
                                WHERE OwnerId = :currentUserId];
    
            return cases;
        }
    
}