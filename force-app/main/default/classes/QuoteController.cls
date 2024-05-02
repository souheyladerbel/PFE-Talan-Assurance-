public with sharing class QuoteController {
    @AuraEnabled(cacheable=true)
    public static List<Schema.Quote> getRelatedQuote(String searchKey){
        String key = '%' + searchKey + '%';
        return  [select Name ,Opportunity.Name, Status , ExpirationDate , Subtotal , TotalPrice from Quote where Status LIKE :key ];
        
        
    }
    @AuraEnabled
    public static void QuoteController(String Id ) {
             System.debug('test1'+Id);

       // String key = '%' + Id + '%';
        List <Schema.Quote> ls = new List<Schema.Quote>();
        ls = [SELECT Id FROM Quote];
        for ( Schema.Quote c : ls ){
            if (c.Id == Id)
            c.Status='Accepted' ;

        }
    // c.Status='Approved' ;
    // System.debug('test1'+c);
     update ls ;
   
    }

}
