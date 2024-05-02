public with sharing class ProductController {
    @AuraEnabled(cacheable=true)
    public static List<Product2> getProducts(String searchKey) {
        String key = '%' + searchKey + '%';
        return [SELECT Id, Name,  ProductCode, IsActive FROM Product2 WHERE Name LIKE :key];
    }
}
