
trigger InsurenceCheck on Medical_Appointment__c (after insert,after update) {
   List<Medical_Appointment__c> newAppointments = [ 
       SELECT Patient__c
       FROM Medical_Appointment__c
       WHERE (Id IN :Trigger.new 
       AND Medical_Facility__r.Type__c = 'hospital' )
   ];

   Set<Id> patientIds = new Set<Id>();
   for (Medical_Appointment__c appointment : newAppointments) {
       patientIds.add(appointment.Patient__c);  
   }

   List<Medical_Insurence__c> newInsurances=[
    SELECT Insured_Person__c
    FROM Medical_Insurence__c
    WHERE Insured_Person__c IN :patientIds
   ];
   
   Set<Id> insuredPatients = new Set<Id>();
   for (Medical_Insurence__c insurance : newInsurances) {
       insuredPatients.add(insurance.Insured_Person__c);
   }

   if( insuredPatients.IsEmpty() && !patientIds.IsEmpty()){
    for (Medical_Appointment__c appointment : Trigger.new) {
        appointment.addError('Cannot add patient without insurance!');
    }
   }else{
   for (Medical_Appointment__c appointment : newAppointments) {

       if (!insuredPatients.contains(appointment.Patient__c)  ) { 
           appointment.addError('Cannot add patient without insurance!');
       }
   }}
}


   