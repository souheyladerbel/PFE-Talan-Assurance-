public with sharing class contactListViewHelper {
    
  /*  @AuraEnabled(cacheable=True)
    public static List<Contact> getContacts(){
        return [SELECT Id, firstName, lastName, accountId, 
                account.name, mailingStreet, mailingCity, mailingState, mailingPostalCode, mailingCountry, email, Title,Account_Name__c 
                FROM Contact
                WHERE Title != 'client' AND Title != 'Rh'
                ORDER BY CreatedDate DESC
                LIMIT 1000];
    }*/

    @AuraEnabled(cacheable=true)
public static List<Contact> getContacts() {
    // Query contacts associated with closed-won opportunities
    List<Contact> contactsClosedWonOpportunity = [SELECT Id, firstName, lastName, accountId, account.name, mailingStreet, 
                                                        mailingCity, mailingState, mailingPostalCode, mailingCountry, email, Title, Account_Name__c 
                                                  FROM Contact 
                                                  WHERE AccountId IN (SELECT AccountId 
                                                                      FROM Opportunity 
                                                                      WHERE StageName = 'Closed Won')];
    
    return contactsClosedWonOpportunity;
}

  @AuraEnabled(cacheable=true)
    public static Contact getContactPlafond() {
        Id currentUserId = UserInfo.getUserId();

        return [SELECT 	Plafond__c FROM Contact
                WHERE OwnerId = :currentUserId];
                
    } 

   /*  @AuraEnabled(cacheable=true)
    public static List<Contact> getRelatedContactsByName(String searchKey){
        String key = '%' + searchKey + '%';
        return [select Name, Phone, Email, Title , account.name,Account_Name__c, accountId from Contact 
        where Name LIKE :key 
        and (Title = 'client' 
        or Title ='Rh')
        order by CreatedDate DESC];
    }*/


    @AuraEnabled(cacheable=true)
    public static List<Contact> getRelatedContactsByName(String searchKey){
        String key = '%' + searchKey + '%';
        return [select Name, Phone, Email, Title , account.name,Account_Name__c, accountId from Contact 
        where Name LIKE :key 
        and  AccountId IN (SELECT AccountId 
        FROM Opportunity 
        WHERE StageName = 'Closed Won')];
    }



    

    @AuraEnabled(cacheable=true)
    public static List<Contact> searchContact(String searchString){
        List<List<SObject>> contacts = [FIND :searchString IN ALL FIELDS RETURNING Contact(FirstName, LastName, Email, Title, mailingStreet,
        mailingCity, mailingCountry, mailingPostalCode, account.Name)];

        return (List<Contact>) contacts[0];
    }

    @AuraEnabled
    public static void deleteContacts(List<Id> contactIds){
        if(contactIds.size() > 0 ){
            delete [SELECT Id FROM Contact WHERE Id in: contactIds];
        }
    }

    @AuraEnabled
    public static list<Contact> readCSVFileContact(Id idContentDocument){
        list<Contact> lstAccsToInsert = new list<Contact>();
        if(idContentDocument != null) {
            
            // getting File Data based on document id 
            ContentVersion objVersion = [SELECT Id, VersionData FROM ContentVersion WHERE ContentDocumentId =:idContentDocument];
            // split the file data
            list<String> lstCSVLines = objVersion.VersionData.toString().split('\n');

            for(Integer i = 1; i < lstCSVLines.size(); i++){
                Contact objAcc = new Contact();
                list<String> csvRowData = lstCSVLines[i].split(',');
                System.debug('csvRowData====> '+csvRowData);
                
                objAcc.LastName = csvRowData[0]; // accName
                objAcc.Phone = csvRowData[1];
                objAcc.Email = csvRowData[2];
              

               
            
                lstAccsToInsert.add(objAcc);
            }

            try{    
                if(!lstAccsToInsert.isEmpty()) {
                    insert lstAccsToInsert;
                }
            }   
            catch (Exception ex) {
                throw new AuraHandledException(ex.getMessage());
            } 
        }
        return lstAccsToInsert;    
    }
   /* public static Decimal getContactPlafond(String contactId) {
        Contact contactWithPlafond = [SELECT Plafond__c FROM Contact WHERE Id = :contactId];
        return contactWithPlafond.Plafond__c;
    }*/

}