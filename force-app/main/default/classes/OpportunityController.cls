public with sharing class OpportunityController {
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunities(String searchKey) {
        String key = '%' + searchKey + '%';
        return [SELECT Name, StageName, CloseDate, Amount,Account.Name FROM Opportunity WHERE Name LIKE :key ORDER BY CreatedDate DESC];
    }
}
