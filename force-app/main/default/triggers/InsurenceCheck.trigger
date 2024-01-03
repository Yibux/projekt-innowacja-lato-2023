trigger InsurenceCheck on Medical_Appointment__c (before insert,before update) {
	    Set<String> patientNames = new Set<String>();
    for(Medical_Appointment__c appointment : Trigger.new) {
        if(appointment.Medical_Facility__r.Type__c == 'Hospital') {
            patientNames.add(appointment.Patient__r.Name + ' ' + appointment.Patient__r.Last_Name__c);
        }
    }
    
    Set<String> patientInsured = new Set<String>();
    for(Medical_Insurence__c insurance : [SELECT Insured_Person__r.Name, Insured_Person__r.Last_Name__c FROM Medical_Insurence__c]) { ///InsurEnce!
        patientInsured.add(insurance.Insured_Person__r.Name + ' ' + insurance.Insured_Person__r.Last_Name__c);
    }

    for(String patient : patientNames) {
        if (!patientInsured.contains(patient)) {
            
            Trigger.newMap.get(patient).addError('You can\'t add patient without Insurance to the appointment in Hospita facility!');
        }
    }


}