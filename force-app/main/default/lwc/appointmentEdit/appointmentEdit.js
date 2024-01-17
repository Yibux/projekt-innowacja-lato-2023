import { api, LightningElement, wire, track } from 'lwc';
import getDoctors from '@salesforce/apex/AppointmentController.getAllDoctorsWorkingInCurrentFacility';
import getSpecialization from '@salesforce/apex/AppointmentController.getAllSpecializationsFromDoctorsWorkingInAFacility';
import getFacilities from '@salesforce/apex/AppointmentController.getAllFacilities';
import editAppointment from '@salesforce/apex/AppointmentController.updateAppointment';
import getAppointmentStatusPicklistValues from '@salesforce/apex/AppointmentController.getAppointmentStatusPicklistValues';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AppointmentEdit extends LightningElement {
    @api recordId;

    @track doctors = [];
    @track facilities = [];
    @track specializations = [];
    @track appointmentStatusOptions = [];
    picklistOptions = [
        { label: "Online", value: "Online" },
        { label: "On-Site", value: "On-Site" }
    ];

    @track selectedDoctorId = null;
    @track selectedFacilityId = null;
    @track selectedSpecializationId = null;
    @track selectedSpecializationLabel = null;
    @track selectedPicklistValue = null;
    @track selectedAppointmentStatus = null;
    @track dateTimeString = null;

    
    @wire(getAppointmentStatusPicklistValues)
    wiredAppointmentStatusOptions({ error, data }) {
        if (data) {
            this.appointmentStatusOptions = data.map(value => ({
                label: value,
                value: value
            }));
        } else if (error) {
            console.error('Error fetching appointment status picklist values', error);
        }
    }


    @wire(getFacilities)
    wiredFacilities({ error, data }) {
        if (data) {
            this.facilities = data.map(facilitiy => ({
                label: facilitiy.Name,
                value: facilitiy.Id
            }));
        } else if (error) {
            console.error('Błąd pobierania danych o placówkach', error);
        }
    }

    @wire(getSpecialization, { facilityId: "$selectedFacilityId" })
    wiredSpecialization({ error, data }) {
        if (data) {
            this.specializations = data.map(specialization => ({
                label: specialization.Specialization__c,
                value: specialization.Specialization__c
            }));
        } else if (error) {
            console.error('Błąd pobierania specjalizacji', error);
        }
    }
    
    @wire(getDoctors, { facilityId: "$selectedFacilityId", specialization: "$selectedSpecializationId" })
    wiredDoctors({ error, data }) {
        if (data) {
            this.doctors = data.map(doctor => ({
                label: doctor.Last_Name__c + " " + doctor.Name,
                value: doctor.Id
            }));
        } else if (error) {
            console.error('Błąd pobierania danych lekarzy', error);
        }
    }

    handleFacilityChange(event) {
        this.selectedFacilityId = event.detail.value;
        this.selectedSpecializationId = null;
        this.selectedDoctorId = null;
        this.doctors = [];
    }

    handleSpecializationChange(event) {
        this.selectedSpecializationId = event.detail.value;
    }

    handleDoctorChange(event) {
        this.selectedDoctorId = event.detail.value;
    }

    handlePicklistChange(event) {
        this.selectedPicklistValue = event.detail.value;
    }

    handleDateTimeChange(event) {
        this.dateTimeString = event.target.value;
    }

    handleAppointmentStatusChange(event) {
        this.selectedAppointmentStatus = event.detail.value;
    }

    handleAppointmentBooking() {
        console.log('id: ' + this.selectedFacilityId)
        editAppointment({
            appointmentId: this.recordId,
            facilityId: this.selectedFacilityId,
            doctorId: this.selectedDoctorId,
            isOnline: this.selectedPicklistValue,
            dateTimeString: this.dateTimeString,
            appointmentStatus: this.selectedAppointmentStatus
        }).then(() => {
                this.selectedFacilityId = null
                this.selectedDoctorId = null
                this.selectedPicklistValue = null

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Appointment edited successfully!',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                console.log(JSON.stringify(error))
                console.log(JSON.stringify(error.body))
                if (error.body.pageErrors === undefined) {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Record has not been updated',
                            variant: 'error'
                        })
                    );
                } else {
                    const errorMessage = error.body.pageErrors[0].message
                    this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: errorMessage,
                        variant: 'error'
                    })
                );
                }
                
            })
    }

    get facilitiesOptions() {
        return this.facilities;
    }

    get specializationOptions() {
        return this.specializations;
    }

    get doctorOptions() {
        return this.doctors.sort((a, b) => a.label.localeCompare(b.label));
    }

    get appointmentStatusPicklistOptions() {
        return this.appointmentStatusOptions;
    }

    get isSpecializationDisabled() {
        return !this.selectedFacilityId;
    }

    get isDoctorDisabled() {
        return !this.selectedSpecializationId || !this.selectedFacilityId;
    }

    get isBookDisabled() {
        return (
            this.selectedFacilityId === null &&
            this.selectedSpecializationId === null &&
            this.selectedDoctorId === null &&
            this.selectedAppointmentStatus === null &&
            this.dateTimeString === null
        );
    }   
}