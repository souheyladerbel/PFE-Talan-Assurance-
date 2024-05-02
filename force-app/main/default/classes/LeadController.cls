public with sharing class LeadController {
    @AuraEnabled(cacheable=true)
    public static List<Lead> getLeads(String searchKey) {
        String searchQuery = '%' + searchKey + '%';
        // Ajout de l'ordre par date de création (descending)
        return [SELECT Id, FirstName, LastName, Email, Company, Country, LeadSource, Phone, TypeAssurance__c, Durr_d_assurance__c ,CreatedDate
                FROM Lead 
                WHERE (FirstName LIKE :searchQuery OR LastName LIKE :searchQuery) 
                ORDER BY CreatedDate DESC];
    }   
}




