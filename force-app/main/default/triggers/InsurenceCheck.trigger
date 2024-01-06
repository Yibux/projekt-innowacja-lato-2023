trigger InsurenceCheck on Medical_Appointment__c (before insert,before update) {

    Set<String> patientInsured = new Set<String>();
    for(Medical_Insurance__c insurance : [SELECT Insured_Person__r.Name, Insured_Person__r.Last_Name__c FROM Medical_Insurance__c]) { 
        patientInsured.add(insurance.Insured_Person__r.Name + ' ' + insurance.Insured_Person__r.Last_Name__c);
    }

	Set<String> patientNames = new Set<String>();
    for(Medical_Appointment__c appointment : [SELECT Medical_Appointment__c.Patient__r.Name,Medical_Appointment__c.Patient__r.Last_Name__c 
    FROM Medical_Appointment__c WHERE Medical_Appointment__c.Medical_Facility__r.Type__c = 'Hospital']) {
            patientNames.add(appointment.Patient__r.Name + ' ' + appointment.Patient__r.Last_Name__c);
            for(String patient : patientInsured) {
                if (!patientnames.contains(patient)) {
                    
                    appointment.addError('You can\'t add patient without Insurance to the appointment in Hospital facility!');
                }
            }
    }
    
   

    


}