import { LightningElement, wire } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import CONTACT_ID from "@salesforce/schema/User.ContactId";
import CONTACT_NAME from "@salesforce/schema/Contact.Name";
import CONTACT_PLAFOND from "@salesforce/schema/Contact.Plafond__c";

// This gets you the logged-in user
import USER_ID from "@salesforce/user/Id";

export default class MontantRestant extends LightningElement {
  @wire(getRecord, { recordId: USER_ID, fields: [CONTACT_ID] })
  user;

  @wire(getRecord, { recordId: "$contactId", fields: [CONTACT_NAME, CONTACT_PLAFOND] })
  contact;

  get contactId() {
    return getFieldValue(this.user.data, CONTACT_ID);
  }

  get contactName() {
    return getFieldValue(this.contact.data, CONTACT_NAME);
  }

  get plafond() {
    return getFieldValue(this.contact.data, CONTACT_PLAFOND);
  }

  get formattedPlafond() {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TND" }).format(this.plafond);
  }

  get showUsageMessage() {
    return this.plafond <= 0;
  }

  get usageMessage() {
    return "Tout le montant a été utilisé. Veuillez contacter votre RH.";
  }
}
