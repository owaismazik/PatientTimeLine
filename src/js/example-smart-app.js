(function (window) {
    var list = [];
    var patientConditionGlobal = [];
    var patientObservationGlobal = [];
    var patientCarePlanGlobal = [];
    var patientDeviceGlobal = [];
    var patientProcedureGlobal = [];
    var patientProcedureRequestGlobal = [];
    var patientAppointmentGlobal = [];
    var patientMedicationGlobal = [];
    var patientGoalGlobal = [];
    var patientEncounterGlobal = [];
    var patientAllergyGlobal = [];
    window.extractData = function () {
        var ret = $.Deferred();

        function onError() {
            console.log('Loading error', arguments);
            ret.reject();
        }

        function onReady(smart) {
            if (smart.hasOwnProperty('patient')) {
                var patient = smart.patient;
                var pt = patient.read();
                var obv = smart.patient.api.fetchAll({
                    type: 'Observation',
                    query: {
                        code: {
                            $or: ['http://loinc.org|8302-2', 'http://loinc.org|8462-4',
                                'http://loinc.org|8480-6', 'http://loinc.org|2085-9',
                                'http://loinc.org|2089-1', 'http://loinc.org|55284-4']
                        }
                    }
                });

                $.when(pt, obv).fail(onError);

                $.when(pt, obv).done(function (patient, obv) {                    
                    $("#patietid").val(patient.id);
                    var byCodes = smart.byCodes(obv, 'code');
                    var gender = patient.gender;

                    var fname = '';
                    var lname = '';
                    var phone = '';
                    var email = '';

                    if (typeof patient.name[0] !== 'undefined') {
                        fname = patient.name[0].given.join(' ');
                        lname = patient.name[0].family.join(' ');
                    }

                    if (typeof patient.telecom[0] !== 'undefined') {
                        phone = patient.telecom[0].value;
                    }
                    if (typeof patient.telecom[1] !== 'undefined') {
                        email = patient.telecom[1].value;
                    }

                    var height = byCodes('8302-2');
                    var systolicbp = getBloodPressureValue(byCodes('55284-4'), '8480-6');
                    var diastolicbp = getBloodPressureValue(byCodes('55284-4'), '8462-4');
                    var hdl = byCodes('2085-9');
                    var ldl = byCodes('2089-1');

                    var p = defaultPatient();
                    p.birthdate = patient.birthDate;
                    p.gender = gender;
                    p.fname = fname;
                    p.lname = lname;
                    p.phone = phone;
                    p.email = email;
                    p.height = getQuantityValueAndUnit(height[0]);

                    if (typeof systolicbp != 'undefined') {
                        p.systolicbp = systolicbp;
                    }

                    if (typeof diastolicbp != 'undefined') {
                        p.diastolicbp = diastolicbp;
                    }

                    p.hdl = getQuantityValueAndUnit(hdl[0]);
                    p.ldl = getQuantityValueAndUnit(ldl[0]);

                    ret.resolve(p);

                    //CreatePatient(patient.id);

                    if (obv != null) {
                        if (obv.length > 0) {
                            for (var i = 0; i <= 10; i++) {
                                if (obv[i] != null) {
                                    if (obv[i] != undefined) {
                                        var patientObservation = {};
                                        var title = obv[i].code.coding[0].display;
                                        var recordeddate = obv[i].issued;
                                        //CreateObservation(obv[i].id, $("#CRMpatietid").val(), "Observation - " + title, recordeddate);
                                        patientObservation.Externalemrid = obv[i].id;
                                        patientObservation.Description = obv[i].code.text;
                                        patientObservation.description = "Observation - " + title;
                                        patientObservation.patientId = $("#CRMpatietid").val();
                                        patientObservation.IssuedDate = recordeddate;
                                        patientObservationGlobal[i] = patientObservation;
                                        var dataSet = patientObservationGlobal[i];
                                        var item = {};

                                        if (dataSet.hasOwnProperty('ObservationID')) {
                                            item.id = dataSet.ObservationID;
                                        }
                                        item.name = dataSet.Description;

                                        if (dataSet.hasOwnProperty('IssuedDate')) {
                                            item.date = moment.utc(dataSet.IssuedDate).format('MM/DD/YYYY');
                                            item.dateTime = moment.utc(dataSet.IssuedDate).format('YYYY-MM-DD HH:mm:ss');
                                        }
                                        item.type = 12;
                                        item.entity = "Observation";
                                        list.push(item);
                                    }
                                }
                            }
                        }
                    }


                    var alrgy = smart.patient.api.fetchAll({
                        type: 'AllergyIntolerance',
                        query: {
                            patient: patient.id
                        }
                    });

                    $.when(alrgy).done(function (Allergy) {
                        
                        if (Allergy != null) {
                            if (Allergy.length > 0) {
                                for (var i = 0; i <= Allergy.length; i++) {
                                    if (Allergy[i] != null) {
                                        if (Allergy[i] != undefined) {
                                            var title = Allergy[i].substance.text;
                                            var recordeddate = Allergy[i].recordedDate;
                                            //CreateAllergy(Allergy[i].id, $("#CRMpatietid").val(), "Allergy - " + title, recordeddate);
                                            var patientAllergy = {}
                                            patientAllergy.Externalemrid = Allergy[i].id;
                                            patientAllergy.name = "Allergy - " + title;
                                            patientAllergy.patientId = $("#CRMpatietid").val();
                                            patientAllergy.RecordedDate = recordeddate;
                                            patientAllergyGlobal = patientAllergy;
                                        }
                                    }
                                }
                            }
                        }                        
                    });

                    var cond = smart.patient.api.fetchAll({
                        type: 'Condition',
                        query: {
                            patient: patient.id
                        }
                    });

                    $.when(cond).done(function (condition) {        
           
                        if (condition != null) {
                            if (condition.length > 0) {
                                for (var i = 0; i <= condition.length; i++) {
                                    if (condition[i] != null) {
                                        if (condition[i] != undefined) {
                                            var title = "";
                                            if(condition[i].code.coding != undefined){
                                                title = condition[i].code.coding[0].display;
                                            }
                                            var recordeddate = condition[i].onsetDateTime;
                                            //CreateCondition(condition[i].id, $("#CRMpatietid").val(), "Condition - " + title, recordeddate);
                                            var patientCondition = {}
                                            patientCondition.Externalemrid = condition[i].id;
                                            patientCondition.Title = "Condition - " + title;
                                            patientCondition.RecordedDate = recordeddate;
                                            patientCondition.PatientID = $("#CRMpatietid").val();
                                            patientConditionGlobal[i] = patientCondition;

                                            var dataSet = patientConditionGlobal[i];
                                            var item = {};

                                            if (dataSet.hasOwnProperty('ConditionID')) {
                                                item.id = dataSet.ConditionID;
                                            }
                                            item.name = dataSet.Title;

                                            if (dataSet.hasOwnProperty('RecordedDate')) {
                                                item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
                                                item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
                                            }
                                            item.type = 8;
                                            item.entity = "Condition";
                                            list.push(item);

                                        }
                                    }
                                }
                            }
                        }
                    });                    

                    var proc = smart.patient.api.fetchAll({
                        type: 'Procedure',
                        query: {
                            patient: patient.id
                        }
                    });

                    $.when(proc).done(function (procedure) {
                        if (procedure != null) {
                            if (procedure.length > 0) {
                                for (var i = 0; i <= procedure.length; i++) {
                                    if (procedure[i] != null) {
                                        if (procedure[i] != undefined) {
                                            var title = procedure[i].code.coding[0].display;
                                            var recordeddate = '';

                                            if (procedure[i].hasOwnProperty("performedDateTime")) {
                                                recordeddate = procedure[i].performedDateTime;
                                            }
                                            if (procedure[i].hasOwnProperty("performedPeriod")) {
                                                recordeddate = procedure[i].performedPeriod.start;
                                            }

                                            //CreateProcedure(procedure[i].id, $("#CRMpatietid").val(), "Procedure - " + title, recordeddate);
                                            var patientProcedure = {}
                                            patientProcedure.Externalemrid = procedure[i].id;
                                            patientProcedure.Title = "Procedure - " + title;
                                            patientProcedure.RecordedDate = recordeddate;
                                            patientProcedure.PatientID = $("#CRMpatietid").val();
                                            patientProcedureGlobal = patientProcedure;
                                            var dataSet = patientProcedureGlobal[i];
                                            var item = {};

                                            //TODO commented for testing
                                            if (dataSet.hasOwnProperty('ProcedureID')) {
                                                item.id = dataSet.ProcedureID;
                                            }
                                            item.name = dataSet.Title;

                                            if (dataSet.hasOwnProperty('RecordedDate')) {
                                                item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
                                                item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
                                            }
                                            item.type = 7;
                                            item.entity = "Procedure";
                                            list.push(item);
                                        }
                                    }
                                }
                            }
                        }
                    });

                    var procReq = smart.patient.api.fetchAll({
                        type: 'ProcedureRequest',
                        query: {
                            patient: patient.id
                        }
                    });

                    $.when(procReq).done(function (procedureRequest) {
                        if (procedureRequest != null) {
                            if (procedureRequest.length > 0) {
                                for (var i = 0; i <= procedureRequest.length; i++) {
                                    if (procedureRequest[i] != null) {
                                        if (procedureRequest[i] != undefined) {
                                            var title = procedureRequest[i].code.text;
                                            var recordeddate = procedureRequest[i].scheduledDateTime;                                            
                                            //CreateProcedureRequest(procedureRequest[i].id, $("#CRMpatietid").val(), "procedureRequest - " + title, recordeddate);
                                            var patientProcedure = {}
                                            patientProcedure.Externalemrid = procedureRequest[i].id;
                                            patientProcedure.Title = "procedureRequest - " + title;
                                            patientProcedure.RecordedDate = recordeddate;
                                            patientProcedure.PatientID = $("#CRMpatietid").val();
                                            patientProcedureRequestGlobal = patientProcedure;
                                        }
                                    }
                                }
                            }
                        }
                    });

                    var enco = smart.patient.api.fetchAll({
                        type: 'Encounter',
                        query: {
                            patient: patient.id
                        }
                    });

                    $.when(enco).done(function (encounter) {
                        if (encounter != null) {
                            if (encounter.length > 0) {
                                for (var i = 0; i <= encounter.length; i++) {
                                    if (encounter[i] != null) {
                                        if (encounter[i] != undefined) {
                                            var title = encounter[i].type[0].text;
                                            // var recordeddate = encounter[i].period.start;
                                            var recordeddate = encounter[i].meta.lastUpdated;
                                            //CreateEncounter(encounter[i].id, $("#CRMpatietid").val(), "Encounter - " + title, recordeddate);
                                            var patientEncounter = {}
                                            patientEncounter.Externalemrid = encounter[i].id;
                                            patientEncounter.Title = "Encounter - " + title;
                                            patientEncounter.RecordedDate = recordeddate;
                                            patientEncounter.PatientID = $("#CRMpatietid").val();
                                            patientEncounterGlobal = patientEncounter;
                                                var dataSet = patientEncounterGlobal[i];
                                                var item = {};

                                                //if (dataSet.hasOwnProperty('EncounterId')) {
                                                //    item.id = dataSet.EncounterId;
                                                //}
                                                item.name = dataSet.Title;

                                                if (dataSet.hasOwnProperty('RecordedDate')) {
                                                    item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
                                                    item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
                                                }
                                                item.type = 6;
                                                item.entity = "Encounter";
                                                list.push(item);
                                        }
                                    }
                                }
                            }
                        }
                    });

                    var devi = smart.patient.api.fetchAll({
                        type: 'Device',
                        query: {
                            patient: patient.id
                        }
                    });

                    $.when(devi).done(function (device) {
                        if (device != null) {
                            if (device.length > 0) {
                                for (var i = 0; i <= device.length; i++) {
                                    if (device[i] != null) {
                                        if (device[i] != undefined) {
                                            var title = device[i].type.text;
                                            var recordeddate = device[i].meta.lastUpdated;
                                            //CreateDevice(device[i].id, $("#CRMpatietid").val(), "Device - " + title, recordeddate);
                                            var patientDevice = {}
                                            patientDevice.Externalemrid = device[i].id;
                                            patientDevice.Title = "Device - " + title;
                                            patientDevice.RecordedDate = recordeddate;
                                            patientDevice.PatientID = $("#CRMpatietid").val();
                                            patientDeviceGlobal = patientDevice;
                                        }
                                    }
                                }
                            }
                        }
                    });

                    var cp = smart.patient.api.fetchAll({
                        type: 'CarePlan',
                        query: {
                            patient: patient.id
                            //,category: 'assess-plan'
                        }
                    });

                    $.when(cp).done(function (careplan) {
                        if (careplan != null) {
                            if (careplan.length > 0) {
                                for (var i = 0; i <= 10; i++) {
                                    if (careplan[i] != null) {
                                        if (careplan[i] != undefined) {
                                            //CreateCarePlan(careplan[i].id, $("#CRMpatietid").val(), fname + " " + lname + " Care Plan", fname + " " + lname + " Care Plan", careplan[i].period.start, careplan[i].period.start);
                                            //id, patientid, title, desc, startdate, enddate
                                            var patientCarePlan = {}
                                            patientCarePlan.Externalemrid = careplan[i].id;
                                            patientCarePlan.Title =  fname + " " + lname + " Care Plan";
                                            patientCarePlan.Description = fname + " " + lname + " Care Plan";
                                            patientCarePlan.STartDate = careplan[i].period.start;
                                            patientCarePlan.EndDate = careplan[i].period.start;
                                            patientCarePlan.PatientID = $("#CRMpatietid").val();
                                            patientCarePlanGlobal = patientCarePlan;
                                        }
                                    }
                                }
                            }
                        }
                    });


                    setTimeout(function () {
                        $("#timeline").show();
                        timeline();
                    }, 1000);  //7000                 

                });

                // var medicationAdministration = smart.patient.api.fetchAll({
                //     type: 'MedicationAdministration',
                //     query: {
                //         patient: patient.id
                //     }
                // });

                // $.when(medicationAdministration).done(function (MedicationAdministration) {

                //     if (MedicationAdministration != null) {
                //         if (MedicationAdministration.length > 0) {
                //             for (var i = 0; i <= MedicationAdministration.length; i++) {
                //                 if (MedicationAdministration[i] != null) {
                //                     if (MedicationAdministration[i] != undefined) {
                //                         // var title = Slot[i].substance.coding[0].display;
                //                         // var recordeddate = Allergy[i].recordedDate
                //                         //Alert("ABC");
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // });


                var goal = smart.patient.api.fetchAll({
                    type: 'Goal',
                    query: {
                        patient: patient.id
                    }
                });

                $.when(goal).done(function (Goal) {

                    if (Goal != null) {
                        if (Goal.length > 0) {
                            for (var i = 0; i <= Goal.length; i++) {
                                if (Goal[i] != null) {
                                    if (Goal[i] != undefined) {

                                        var externalEmrId = Goal[i].id;
                                        var startdate = Goal[i].startDate;
                                        var targetdate = Goal[i].targetDate;
                                        var category = Goal[i].category[0].text;
                                        var description = Goal[i].description;
                                        //CreateGoal(externalEmrId, $("#CRMpatietid").val(), startdate, targetdate, category, description);
                                        var Goal = {}
                                        Goal.Externalemrid = externalEmrId;
                                        Goal.Patientid = $("#CRMpatietid").val();
                                        Goal.Startdate = startdate;
                                        Goal.TargetDate = targetdate;
                                        Goal.Category = category;
                                        Goal.Description = description;
                                        patientGoalGlobal = Goal;
                                    }
                                }
                            }
                        }
                    }
                });


                // var relatedPerson = smart.patient.api.fetchAll({
                //     type: 'RelatedPerson',
                //     query: {
                //         patient: patient.id
                //     }
                // });

                // $.when(relatedPerson).done(function (RelatedPerson) {

                //     if (RelatedPerson != null) {
                //         if (RelatedPerson.length > 0) {
                //             for (var i = 0; i <= RelatedPerson.length; i++) {
                //                 if (RelatedPerson[i] != null) {
                //                     if (RelatedPerson[i] != undefined) {

                //                       //  var externalEmrId = RelatedPerson[i].id;
                //                        // var startdate = RelatedPerson[i].identifier[6].period.start;
                //                        // var family = RelatedPerson[i].name[2].family[0];
                //                        // var given = RelatedPerson[i].name[3].given[0];
                //                         CreateRelatedPerson(externalEmrId, $("#CRMpatietid").val(), startdate, given, family);
                //                     }
                //                 }
                //             }
                //         }
                //     }
                //     var externalEmrId = 5796399;
                //     var startdate = "2016-11-01T10:00:00.000Z";
                //     var family = "PETERS";
                //     var given = "TIMOTHY";
                //     CreateRelatedPerson(externalEmrId, $("#CRMpatietid").val(), startdate, given, family);
                    
                // });

            } else {
                onError();
            }
        }

        FHIR.oauth2.ready(onReady, onError);
        return ret.promise();

    };

    function defaultPatient() {
        return {
            fname: { value: '' },
            lname: { value: '' },
            phone: { value: '' },
            email: { value: '' },
            gender: { value: '' },
            birthdate: { value: '' },
            height: { value: '' },
            systolicbp: { value: '' },
            diastolicbp: { value: '' },
            ldl: { value: '' },
            hdl: { value: '' },
        };
    }

    function getBloodPressureValue(BPObservations, typeOfPressure) {
        var formattedBPObservations = [];
        BPObservations.forEach(function (observation) {
            var BP = observation.component.find(function (component) {
                return component.code.coding.find(function (coding) {
                    return coding.code == typeOfPressure;
                });
            });
            if (BP) {
                observation.valueQuantity = BP.valueQuantity;
                formattedBPObservations.push(observation);
            }
        });

        return getQuantityValueAndUnit(formattedBPObservations[0]);
    }

    function getQuantityValueAndUnit(ob) {
        if (typeof ob != 'undefined' &&
            typeof ob.valueQuantity != 'undefined' &&
            typeof ob.valueQuantity.value != 'undefined' &&
            typeof ob.valueQuantity.unit != 'undefined') {
            return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
        } else {
            return undefined;
        }
    }

    window.drawVisualization = function (p) {
        $('#holder').show();
        $('#loading').hide();
        $(".loader").hide();
        $('#fname').html(p.fname);
        $('#lname').html(p.lname);
        $('#phone').html(p.phone);
        $('#email').html(p.email);
        $('#gender').html(p.gender);
        $('#birthdate').html(p.birthdate);
        $('#height').html(p.height);
        $('#systolicbp').html(p.systolicbp);
        $('#diastolicbp').html(p.diastolicbp);
        $('#ldl').html(p.ldl);
        $('#hdl').html(p.hdl);
    };

    // function CreatePatient(patientid) {
    //     var data = {}
    //     var patient = {}

    //     patient.Externalemrid = patientid;
    //     patient.firstName = $("#fname").text();
    //     patient.lastName = $("#lname").text();
    //     patient.phone = $("#phone").text();
    //     patient.email = $("#email").text();
    //     patient.dateOfBirth = $("#birthdate").text();

    //     data.patient = patient;

    //     console.log(data);

    //     $.ajax({
    //         url: $("#hdnPatientChartAPIURL").val() + "CreatePatientCRM",
    //         method: "POST",
    //         async: false,
    //         dataType: "json",
    //         data: JSON.stringify(data),
    //         crossDomain: true,
    //         contentType: "application/json; charset=utf-8",
    //         cache: false,
    //         beforeSend: function (xhr) {
    //             /* Authorization header */
    //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
    //         },
    //         success: function (data) {
    //             if (data.data.records != null) {

    //                 $("#CRMpatietid").val(data.data.records.patientId);                    

    //             }

    //         },
    //         error: function () {
    //             console.log("error");
    //         }
    //     });


    // }

    // function CreateDevice(id, patientid, title, startdate) {
    //     var data = {}
    //     var patientDevice = {}
    //     patientDevice.Externalemrid = id;
    //     patientDevice.Title = title;
    //     patientDevice.RecordedDate = startdate;
    //     patientDevice.PatientID = patientid;

    //     data.patientDevice = patientDevice;

    //     $.ajax({
    //         url: $("#hdnPatientChartAPIURL").val() + "CreatePatientDeviceCRM",
    //         method: "POST",
    //         async: false,
    //         dataType: "json",
    //         data: JSON.stringify(data),
    //         crossDomain: true,
    //         contentType: "application/json; charset=utf-8",
    //         cache: false,
    //         beforeSend: function (xhr) {
    //             /* Authorization header */
    //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
    //         },
    //         success: function (data) {
    //             if (data.data.records != null) {

    //                 //$("#timeline").show();

    //                 //timeline();
    //             }

    //         },
    //         error: function () {
    //             console.log("error");
    //         }
    //     });
    // }

    // function CreateEncounter(id, patientid, title, startdate) {
    //     var data = {}
    //     var patientEncounter = {}
    //     patientEncounter.Externalemrid = id;
    //     patientEncounter.Title = title;
    //     patientEncounter.RecordedDate = startdate;
    //     patientEncounter.PatientID = patientid;

    //     data.patientEncounter = patientEncounter;

    //     $.ajax({
    //         url: $("#hdnPatientChartAPIURL").val() + "CreatePatientEncounterCRM",
    //         method: "POST",
    //         async: false,
    //         dataType: "json",
    //         data: JSON.stringify(data),
    //         crossDomain: true,
    //         contentType: "application/json; charset=utf-8",
    //         cache: false,
    //         beforeSend: function (xhr) {
    //             /* Authorization header */
    //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
    //         },
    //         success: function (data) {
    //             if (data.data.records != null) {

    //                 //$("#timeline").show();

    //                 //timeline();
    //             }

    //         },
    //         error: function () {
    //             console.log("error");
    //         }
    //     });
    // }

    // function CreateProcedure(id, patientid, title, startdate) {
    //     var data = {}
    //     var patientProcedure = {}
    //     patientProcedure.Externalemrid = id;
    //     patientProcedure.Title = title;
    //     patientProcedure.RecordedDate = startdate;
    //     patientProcedure.PatientID = patientid;

    //     data.patientProcedure = patientProcedure;

    //     $.ajax({
    //         url: $("#hdnPatientChartAPIURL").val() + "CreatePatientProcedureCRM",
    //         method: "POST",
    //         async: false,
    //         dataType: "json",
    //         data: JSON.stringify(data),
    //         crossDomain: true,
    //         contentType: "application/json; charset=utf-8",
    //         cache: false,
    //         beforeSend: function (xhr) {
    //             /* Authorization header */
    //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
    //         },
    //         success: function (data) {
    //             if (data.data.records != null) {
                    
    //                 //$("#timeline").show();

    //                 //timeline();
    //             }

    //         },
    //         error: function () {
    //             console.log("error");
    //         }
    //     });
    // }

    // function CreateProcedureRequest(id, patientid, title, startdate) {
    //     var data = {}
    //     var patientProcedureRequest = {}
    //     patientProcedureRequest.Externalemrid = id;
    //     patientProcedureRequest.Title = title;
    //     patientProcedureRequest.RecordedDate = startdate;
    //     patientProcedureRequest.PatientID = patientid;

    //     data.patientProcedureRequest = patientProcedureRequest;

    //     $.ajax({
    //         url: $("#hdnPatientChartAPIURL").val() + "CreatePatientProcedureRequestCRM",
    //         method: "POST",
    //         async: false,
    //         dataType: "json",
    //         data: JSON.stringify(data),
    //         crossDomain: true,
    //         contentType: "application/json; charset=utf-8",
    //         cache: false,
    //         beforeSend: function (xhr) {
    //             /* Authorization header */
    //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
    //         },
    //         success: function (data) {
    //             if (data.data.records != null) {

    //                 //$("#timeline").show();

    //                 //timeline();
    //             }

    //         },
    //         error: function () {
    //             console.log("error");
    //         }
    //     });
    // }

    // function CreateCondition(id, patientid, title, startdate) {
    //     var data = {}
    //     var patientCondition = {}
    //     patientCondition.Externalemrid = id;
    //     patientCondition.Title = title;
    //     patientCondition.RecordedDate = startdate;
    //     patientCondition.PatientID = patientid;

    //     data.patientCondition = patientCondition;

    //     $.ajax({
    //         url: $("#hdnPatientChartAPIURL").val() + "CreatePatientConditionCRM",
    //         method: "POST",
    //         async: false,
    //         dataType: "json",
    //         data: JSON.stringify(data),
    //         crossDomain: true,
    //         contentType: "application/json; charset=utf-8",
    //         cache: false,
    //         beforeSend: function (xhr) {
    //             /* Authorization header */
    //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
    //         },
    //         success: function (data) {
    //             if (data.data.records != null) {

    //                 //$("#timeline").show();

    //                 //timeline();
    //             }

    //         },
    //         error: function () {
    //             console.log("error");
    //         }
    //     });
    // }

    // function CreateCarePlan(id, patientid, title, desc, startdate, enddate) {        
    //     var data = {}
    //     var patientCarePlan = {}
    //     patientCarePlan.Externalemrid = id;
    //     patientCarePlan.Title = title;
    //     patientCarePlan.Description = desc;
    //     patientCarePlan.STartDate = startdate;
    //     patientCarePlan.EndDate = enddate;
    //     patientCarePlan.PatientID = patientid;

    //     data.patientCarePlan = patientCarePlan;

    //     $.ajax({
    //         url: $("#hdnPatientChartAPIURL").val() + "CreatePatientCarePlanCRM",
    //         method: "POST",
    //         async: false,
    //         dataType: "json",
    //         data: JSON.stringify(data),
    //         crossDomain: true,
    //         contentType: "application/json; charset=utf-8",
    //         cache: false,
    //         beforeSend: function (xhr) {
    //             /* Authorization header */
    //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
    //         },
    //         success: function (data) {
    //             if (data.data.records != null) {

    //                 //$("#timeline").show();

    //                 //timeline();
    //             }

    //         },
    //         error: function () {
    //             console.log("error");
    //         }
    //     });
    // }

    // function CreateAllergy(id, patientid, title, startdate) {
    //     var data = {}
    //     var patientAllergy = {}
    //     patientAllergy.Externalemrid = id;
    //     patientAllergy.name = title;
    //     patientAllergy.patientId = patientid;
    //     patientAllergy.RecordedDate = startdate;

    //     data.patientAllergy = patientAllergy;

    //     $.ajax({
    //         url: $("#hdnPatientChartAPIURL").val() + "CreatePatientAllergyCRM",
    //         method: "POST",
    //         async: false,
    //         dataType: "json",
    //         data: JSON.stringify(data),
    //         crossDomain: true,
    //         contentType: "application/json; charset=utf-8",
    //         cache: false,
    //         beforeSend: function (xhr) {
    //             /* Authorization header */
    //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
    //         },
    //         success: function (data) {
    //             if (data.data.records != null) {

    //                 //$("#timeline").show();

    //                 //timeline();
    //             }

    //         },
    //         error: function () {
    //             console.log("error");
    //         }
    //     });
    // }

    // function CreateObservation(id, patientid, title, IssuedDate) {
    //     var data = {}
    //     var patientObservation = {}
    //     patientObservation.Externalemrid = id;
    //     patientObservation.description = title;
    //     patientObservation.patientId = patientid;
    //     patientObservation.IssuedDate = IssuedDate;

    //     data.patientObservation = patientObservation;

    //     $.ajax({
    //         url: $("#hdnPatientChartAPIURL").val() + "CreatePatientObservationCRM",
    //         method: "POST",
    //         async: false,
    //         dataType: "json",
    //         data: JSON.stringify(data),
    //         crossDomain: true,
    //         contentType: "application/json; charset=utf-8",
    //         cache: false,
    //         beforeSend: function (xhr) {
    //             /* Authorization header */
    //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
    //         },
    //         success: function (data) {
    //             if (data.data.records != null) {

    //                 //$("#timeline").show();

    //                 //timeline();
    //             }

    //         },
    //         error: function () {
    //             console.log("error");
    //         }
    //     });
    // }

    // function CreateMedicationAdministration() {
    //     var data = {}
    //     var patientMedicationAdministration = {}

    //     //patientAllergy.Externalemrid = id;
    //     //patientAllergy.name = title;
    //     //patientAllergy.patientId = patientid;
    //     //patientAllergy.RecordedDate = startdate;

    //     data.patientMedicationAdministration = patientMedicationAdministration;

    //     $.ajax({
    //         url: $("#hdnPatientChartAPIURL").val() + "CreatePatientMedicationAdministrationCRM",
    //         method: "POST",
    //         async: false,
    //         dataType: "json",
    //         data: JSON.stringify(data),
    //         crossDomain: true,
    //         contentType: "application/json; charset=utf-8",
    //         cache: false,
    //         beforeSend: function (xhr) {
    //             /* Authorization header */
    //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
    //         },
    //         success: function (data) {
    //             if (data.data.records != null) {

    //                 //$("#timeline").show();

    //                 //timeline();
    //             }

    //         },
    //         error: function () {
    //             console.log("error");
    //         }
    //     });
    // }

    // function CreateGoal(id, patientid, startDate, targetDate, category, description) {
    //     var data = {}
    //     var Goal = {}

    //     Goal.Externalemrid = id;
    //     Goal.Patientid = patientid;
    //     Goal.Startdate = startDate;
    //     Goal.TargetDate = targetDate;
    //     Goal.Category = category;
    //     Goal.Description = description;

    //     //patientAllergy.RecordedDate = startdate;

    //     data.patientGoal = Goal;

    //     $.ajax({
    //         url: $("#hdnPatientChartAPIURL").val() + "CreatePatientGoalCRM",
    //         method: "POST",
    //         async: false,
    //         dataType: "json",
    //         data: JSON.stringify(data),
    //         crossDomain: true,
    //         contentType: "application/json; charset=utf-8",
    //         cache: false,
    //         beforeSend: function (xhr) {
    //             /* Authorization header */
    //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
    //         },
    //         success: function (data) {
    //             if (data.data.records != null) {

    //                 //$("#timeline").show();

    //                 //timeline();
    //             }

    //         },
    //         error: function () {
    //             console.log("error");
    //         }
    //     });
    // }

    // function CreateRelatedPerson(id, patientid, startDate, given, family) {
    //     var data = {}
    //     var RelatedPerson = {}

    //     RelatedPerson.Externalemrid = id;
    //     RelatedPerson.Patientid = patientid;
    //     RelatedPerson.Startdate = startDate;
    //     RelatedPerson.Firstname = given;
    //     RelatedPerson.Lastname = family;

    //     data.patientRelatedPerson = RelatedPerson;

    //     $.ajax({
    //         url: $("#hdnPatientChartAPIURL").val() + "CreatePatientRelatedPersonCRM",
    //         method: "POST",
    //         async: false,
    //         dataType: "json",
    //         data: JSON.stringify(data),
    //         crossDomain: true,
    //         contentType: "application/json; charset=utf-8",
    //         cache: false,
    //         beforeSend: function (xhr) {
    //             /* Authorization header */
    //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
    //         },
    //         success: function (data) {
    //             if (data.data.records != null) {

    //                 //$("#timeline").show();

    //                 //timeline();
    //             }

    //         },
    //         error: function () {
    //             console.log("error");
    //         }
    //     });
    // }

    function timeline() {
   
            var YearList = [];
        
            var currentStartDate;
            var currentEndDate = moment(new Date()).format('MM/DD/YYYY');
            var checkedEvents = ['5', '6', '7', '8', '9', '11', '12', '13','10',14];
            var checkedYears = [];
            var pid = $("#CRMpatietid").val();
            var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
            if (pid == '' || pid == null) {
                $('.timelinecontrolnew').hide();
                $('.errorMessage').show();
            } else {
                $('.errorMessage').hide();
                $('.timelinecontrolnew').show();
                getPatientRegistrationDate();
                loadData(true);
            }
        
            // EVENTS
        
            $(".chkEvent").on("click", function () {
                var ev = $(".chkEventItem");
        
                if (this.value == 0) //select all
                {
                    for (var index = 0; index < ev.length; index++) {
                        ev[index].checked = this.checked;
                    }
                }
        
                checkedEvents = [];
                for (var index = 0; index < ev.length; index++) {
                    if (ev[index].checked)
                        checkedEvents.push(ev[index].value);
                }        
        
                var eventSelect = document.getElementById("eventSelect");
                var arrow = eventSelect.innerText.slice(-1);
                if (checkedEvents.length == 0)
                    eventSelect.innerText = "Events " + arrow;
                else
                    if (checkedEvents.length == ev.length)
                        eventSelect.innerText = "All Events " + arrow;
                    else
                        eventSelect.innerText = checkedEvents.length + " out of " + ev.length + " events " + arrow
        
                LoadTimeline();
            });
        
            // FUNCTIONS
        
            function loadData(doSync) {
                //$("._loader").show();
                //$(".loader").show();
                setTimeout(function () {
                    if (doSync) {
                        //loadUserDateFormat();
                        //list = [];
                        if (checkedEvents.indexOf('5') > -1) {
                            Device();
                        }
                        //if (checkedEvents.indexOf('6') > -1) {
                        //    Encounter();
                        //}                
                        //if (checkedEvents.indexOf('8') > -1) {
                        //    Condition();
                        //}
                        if (checkedEvents.indexOf('9') > -1) {
                            CarePlan();
                        }
                        if (checkedEvents.indexOf('11') > -1) {
                            Allergy();
                        }
                        //if (checkedEvents.indexOf('12') > -1) {
                        //    Observation();
                        //}
                        //if (checkedEvents.indexOf('7') > -1) {
                        //    Procedure();
                        //}
                        if (checkedEvents.indexOf('13') > -1) {
                            ProcedureRequest();
                        }
                        if (checkedEvents.indexOf('10') > -1) {
                            Goal();
                        }
                        if (checkedEvents.indexOf('14') > -1) {
                            RelatedPerson();
                        }
                    }
        
                    //event = $('select').val() == null ? '' : $('select').val();
                    //var fltrData = list.filter(function (e) { return this.indexOf(e.type.toString()) > -1; }, checkedEvents);
                    list.sort(dateSort);
                    for (var i = 0; i < list.length; i++) {
                        var date = new Date(list[i].date)
                        YearList.push(date.getFullYear());                
                    }

                    //TODO undo this commented code
                    var YearListNew = (YearList) => YearList.filter((v, i) => YearList.indexOf(v) === i)
                    YearList = YearListNew(YearList);
                    checkedYears = YearList;
        
                    loadYearDropdown(YearList);
                    
        
                    $(".note img").click(function () {
                        var $control = $(this).next('p');
                        if ($control.is(":not(:visible)")) {
                            $control.removeClass('addTranslate');
                            $control.addClass('removeTranslate');
                            setTimeout(function () {
                                $control.show();
                            }, 10);//300
                        } else {
                            $control.addClass('addTranslate');
                            $control.removeClass('removeTranslate');
                            setTimeout(function () {
                                $control.hide();
                            }, 10);//300
                        }
                    });
        
                    $(".openLink").click(function () {
                        var id = $(this).data("id");
                        var entity = $(this).data("entity");
                        openForm(id, entity);
                    });
        
                    //$("._loader").hide();
                    //$(".loader").show();
        
                }, 500); //500
            }
        
            function loadYearDropdown(array) {
                $("#yearEventList").html("");
                $("#yearEventList").append('<div><input class="chkYear" type = "checkbox" value = "0" name = "years" checked = "">[All Years]</div>')
                for (var i = 0; i < array.length; i++) {            
                    $("#yearEventList").append('<div><input class="chkYear chkYearItem" type = "checkbox" value = "' + array[i] +'" name = "years" checked = "">' + array[i] +'</div>')
                }
        
                $(".chkYear").on("click", function () {
                    var ev = $(".chkYearItem");
        
                    if (this.value == 0) //select all
                    {
                        for (var index = 0; index < ev.length; index++) {
                            ev[index].checked = this.checked;
                        }
                    }
        
                    checkedYears = [];
                    for (var index = 0; index < ev.length; index++) {
                        if (ev[index].checked)
                            checkedYears.push(ev[index].value);
                    }
        
                    var eventSelect = document.getElementById("yearSelect");
                    var arrow = eventSelect.innerText.slice(-1);
                    if (checkedYears.length == 0)
                        eventSelect.innerText = "Years " + arrow;
                    else
                        if (checkedYears.length == ev.length)
                            eventSelect.innerText = "All Years " + arrow;
                        else
                            eventSelect.innerText = checkedYears.length + " out of " + ev.length + " events " + arrow
                    
                    LoadTimeline();
                });
        
        
                LoadTimeline();
            }
        
            function LoadTimeline() {
                //$("#loading").show();
                //$(".loader").show();
                $("#timelinecontrolnew").hide()
                $("#timeline").html("");
        
                var filterdata = list.filter(function (e) { return this.indexOf(e.type.toString()) > -1; }, checkedEvents);
        
                var html = "";
        
                for (var j = 0; j < checkedYears.length; j++) {
                    var item = checkedYears[j];
                    html = '<div class="timeline__group" id="' + item + '"><span class="timeline__year" >' + item + '</span></div>';
                    $("#timeline").append(html);
                    for (var i = 0; i < filterdata.length; i++) {
        
                        var date = new Date(filterdata[i].date)
                        var id = filterdata[i].id;
                        var name = filterdata[i].name;
                        var type = filterdata[i].type;
                        var entity = filterdata[i].entity;
                        var year = date.getFullYear();
                        var month = monthNames[date.getMonth()];
                        var day = date.getDate();
        
                        if (year == item) {
                            var yeardivcount = $("#" + year).length;
                            if (yeardivcount > 0) {
                                var thistimelineboxcount = $("#" + year).find(".timeline__box").length;
                                if (thistimelineboxcount > 0) {
        
                                    var daydivcount = $("#" + year).find(".timeline__box").find("." + day).length;
                                    var daydivmonth = $("#" + year).find(".timeline__box").find("." + month).length;
        
                                    if (daydivcount > 0 && daydivmonth > 0) {
                                        html = '<div class="timeline__box">' +
                                            '<div class="timeline__post">' +
                                            '<div class="timeline__content"> ' +
                                            '<span class="timelineentity">' + entity + '</span>' +
                                            '<p> ' + name + '</p>' +
                                            '</div></div></div>';
                                    }
                                    else {
                                        html = '<div class="timeline__box"><div class="timeline__date">' +
                                            '<span class="timeline__day ' + day + '">' + day + '</span>' +
                                            '<span class="timeline__month ' + month + '">' + month + '</span></div>' +
                                            '<div class="timeline__post">' +
                                            '<div class="timeline__content"> ' +
                                            '<span class="timelineentity">' + entity + '</span>' +
                                            '<p> ' + name + '</p>' +
                                            '</div></div></div>';
                                    }
                                }
                                else {
                                    html = '<div class="timeline__box"><div class="timeline__date">' +
                                        '<span class="timeline__day ' + day + '">' + day + '</span>' +
                                        '<span class="timeline__month ' + month + '">' + month + '</span></div>' +
                                        '<div class="timeline__post">' +
                                        '<div class="timeline__content"> ' +
                                        '<span class="timelineentity">' + entity + '</span>' +
                                        '<p> ' + name + '</p>' +
                                        '</div></div></div>';
                                }
                            }
                            else {
                                html = '<div class="timeline__box"><div class="timeline__date">' +
                                    '<span class="timeline__day ' + day + '">' + day + '</span>' +
                                    '<span class="timeline__month ' + month + '">' + month + '</span></div>' +
                                    '<div class="timeline__post">' +
                                    '<div class="timeline__content"> ' +
                                    '<span class="timelineentity">' + entity + '</span>' +
                                    '<p> ' + name + '</p>' +
                                    '</div></div></div>';
                            }                    
                        }
        
                        $("#" + year).append(html);
                    }
                }
        
                $(".timeline__group").each(function () {
                    var timelineboxcount = $(this).find(".timeline__box").length;
                    if (timelineboxcount <= 0) {
                        $(this).hide();
                    }
                    else {
                        $(this).show();
                    }
                });
        
                $("#loading").hide();
                $(".loader").hide();
                $("#timelinecontrolnew").show();
            }
        
            function Device() {
                for (var i = 0; i < patientDeviceGlobal.length; i++) {
                    var dataSet = patientDeviceGlobal[i];
                    var item = {};

                    if (dataSet.hasOwnProperty('DeviceID')) {
                        item.id = dataSet.DeviceID;
                    }
                    item.name = dataSet.Title;

                    if (dataSet.hasOwnProperty('RecordedDate')) {
                        item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
                        item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
                    }
                    item.type = 5;
                    item.entity = "Device";
                    list.push(item);
                };
            //     var patient = {}
            //     patient.patientId = pid;
            //     patient.startDate = currentStartDate;
            //     patient.endDate = currentEndDate;
        
            //     $.ajax({
            //         url: $("#hdnPatientChartAPIURL").val() + "getPatientDevice",
            //         method: "POST",
            //         async: false,
            //         dataType: "json",
            //         data: JSON.stringify(patient),
            //         crossDomain: true,
            //         contentType: "application/json; charset=utf-8",
            //         cache: false,
            //         beforeSend: function (xhr) {
            //             /* Authorization header */
            //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            //         },
            //         success: function (data) {
            //             for (var i = 0; i < data.data.records.length; i++) {
            //                 var dataSet = data.data.records[i];
            //                 var item = {};
        
            //                 if (dataSet.hasOwnProperty('DeviceID')) {
            //                     item.id = dataSet.DeviceID;
            //                 }
            //                 item.name = dataSet.Title;
        
            //                 if (dataSet.hasOwnProperty('RecordedDate')) {
            //                     item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
            //                     item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
            //                 }
            //                 item.type = 5;
            //                 item.entity = "Device";
            //                 list.push(item);
            //             };
            //             return Promise.resolve();
            //         },
            //         error: function () {
            //             console.log("error");
            //         }
            //     });
            }
        
            //function Encounter() {
            //    for (var i = 0; i < patientEncounterGlobal.length; i++) {
            //        var dataSet = patientEncounterGlobal[i];
            //        var item = {};

            //        if (dataSet.hasOwnProperty('EncounterId')) {
            //            item.id = dataSet.EncounterId;
            //        }
            //        item.name = dataSet.Title;

            //        if (dataSet.hasOwnProperty('RecordedDate')) {
            //            item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
            //            item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
            //        }
            //        item.type = 6;
            //        item.entity = "Encounter";
            //        list.push(item);
            //    };
            ////     var patient = {}
            ////     patient.patientId = pid;
            ////     patient.startDate = currentStartDate;
            ////     patient.endDate = currentEndDate;
        
            ////     $.ajax({
            ////         url: $("#hdnPatientChartAPIURL").val() + "getPatientEncounter",
            ////         method: "POST",
            ////         async: false,
            ////         dataType: "json",
            ////         data: JSON.stringify(patient),
            ////         crossDomain: true,
            ////         contentType: "application/json; charset=utf-8",
            ////         cache: false,
            ////         beforeSend: function (xhr) {
            ////             /* Authorization header */
            ////             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            ////         },
            ////         success: function (data) {
            ////             for (var i = 0; i < data.data.records.length; i++) {
            ////                 var dataSet = data.data.records[i];
            ////                 var item = {};
        
            ////                 if (dataSet.hasOwnProperty('EncounterId')) {
            ////                     item.id = dataSet.EncounterId;
            ////                 }
            ////                 item.name = dataSet.Title;
        
            ////                 if (dataSet.hasOwnProperty('RecordedDate')) {
            ////                     item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
            ////                     item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
            ////                 }
            ////                 item.type = 6;
            ////                 item.entity = "Encounter";
            ////                 list.push(item);
            ////             };
            ////             return Promise.resolve();
            ////         },
            ////         error: function () {
            ////             console.log("error");
            ////         }
            ////     });
            //}
        
            //function Procedure() {
            //    for (var i = 0; i < patientProcedureGlobal.length; i++) {
            //        var dataSet = patientProcedureGlobal[i];
            //        var item = {};

            //        if (dataSet.hasOwnProperty('ProcedureID')) {
            //            item.id = dataSet.ProcedureID;
            //        }
            //        item.name = dataSet.Title;

            //        if (dataSet.hasOwnProperty('RecordedDate')) {
            //            item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
            //            item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
            //        }
            //        item.type = 7;
            //        item.entity = "Procedure";
            //        list.push(item);
            //    };
            ////     var patient = {}
            ////     patient.patientId = pid;
            ////     patient.startDate = currentStartDate;
            ////     patient.endDate = currentEndDate;
        
            ////     $.ajax({
            ////         url: $("#hdnPatientChartAPIURL").val() + "getPatientProcedure",
            ////         method: "POST",
            ////         async: false,
            ////         dataType: "json",
            ////         data: JSON.stringify(patient),
            ////         crossDomain: true,
            ////         contentType: "application/json; charset=utf-8",
            ////         cache: false,
            ////         beforeSend: function (xhr) {
            ////             /* Authorization header */
            ////             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            ////         },
            ////         success: function (data) {
            ////             for (var i = 0; i < data.data.records.length; i++) {
            ////                 var dataSet = data.data.records[i];
            ////                 var item = {};
        
            ////                 if (dataSet.hasOwnProperty('ProcedureID')) {
            ////                     item.id = dataSet.ProcedureID;
            ////                 }
            ////                 item.name = dataSet.Title;
        
            ////                 if (dataSet.hasOwnProperty('RecordedDate')) {
            ////                     item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
            ////                     item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
            ////                 }
            ////                 item.type = 7;
            ////                 item.entity = "Procedure";
            ////                 list.push(item);
            ////             };
            ////             return Promise.resolve();
            ////         },
            ////         error: function () {
            ////             console.log("error");
            ////         }
            ////     });
            //}
        
            function ProcedureRequest() {
                for (var i = 0; i < patientProcedureRequestGlobal.length; i++) {
                    var dataSet = patientProcedureRequestGlobal[i];
                    var item = {};

                    if (dataSet.hasOwnProperty('ProcedureRequestID')) {
                        item.id = dataSet.ProcedureRequestID;
                    }
                    item.name = dataSet.Title;

                    if (dataSet.hasOwnProperty('RecordedDate')) {
                        item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
                        item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
                    }
                    item.type = 13;
                    item.entity = "ProcedureRequest";
                    list.push(item);
                };
            //     var patient = {}
            //     patient.patientId = pid;
            //     patient.startDate = currentStartDate;
            //     patient.endDate = currentEndDate;
        
            //     $.ajax({
            //         url: $("#hdnPatientChartAPIURL").val() + "getPatientProcedureRequest",
            //         method: "POST",
            //         async: false,
            //         dataType: "json",
            //         data: JSON.stringify(patient),
            //         crossDomain: true,
            //         contentType: "application/json; charset=utf-8",
            //         cache: false,
            //         beforeSend: function (xhr) {
            //             /* Authorization header */
            //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            //         },
            //         success: function (data) {
            //             for (var i = 0; i < data.data.records.length; i++) {
            //                 var dataSet = data.data.records[i];
            //                 var item = {};
        
            //                 if (dataSet.hasOwnProperty('ProcedureRequestID')) {
            //                     item.id = dataSet.ProcedureRequestID;
            //                 }
            //                 item.name = dataSet.Title;
        
            //                 if (dataSet.hasOwnProperty('RecordedDate')) {
            //                     item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
            //                     item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
            //                 }
            //                 item.type = 13;
            //                 item.entity = "ProcedureRequest";
            //                 list.push(item);
            //             };
            //             return Promise.resolve();
            //         },
            //         error: function () {
            //             console.log("error");
            //         }
            //     });
            }



            //function Condition() {    
                

            //    for (var i = 0; i < patientConditionGlobal.length; i++) {
            //        var dataSet = patientConditionGlobal[i];
            //        var item = {};

            //        if (dataSet.hasOwnProperty('ConditionID')) {
            //            item.id = dataSet.ConditionID;
            //        }
            //        item.name = dataSet.Title;

            //        if (dataSet.hasOwnProperty('RecordedDate')) {
            //            item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
            //            item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
            //        }
            //        item.type = 8;
            //        item.entity = "Condition";
            //        list.push(item);
            //    };
            //    //owais
            //    // var patient = {}
            //    // patient.patientId = pid;
            //    // patient.startDate = currentStartDate;
            //    // patient.endDate = currentEndDate;
        
            //    // $.ajax({
            //    //     url: $("#hdnPatientChartAPIURL").val() + "getPatientCondition",
            //    //     method: "POST",
            //    //     async: false,
            //    //     dataType: "json",
            //    //     data: JSON.stringify(patient),
            //    //     crossDomain: true,
            //    //     contentType: "application/json; charset=utf-8",
            //    //     cache: false,
            //    //     beforeSend: function (xhr) {
            //    //         /* Authorization header */
            //    //         xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            //    //     },
            //    //     success: function (data) {
            //    //         for (var i = 0; i < data.data.records.length; i++) {
            //    //             var dataSet = data.data.records[i];
            //    //             var item = {};
        
            //    //             if (dataSet.hasOwnProperty('ConditionID')) {
            //    //                 item.id = dataSet.ConditionID;
            //    //             }
            //    //             item.name = dataSet.Title;
        
            //    //             if (dataSet.hasOwnProperty('RecordedDate')) {
            //    //                 item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
            //    //                 item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
            //    //             }
            //    //             item.type = 8;
            //    //             item.entity = "Condition";
            //    //             list.push(item);
            //    //         };
            //    //         return Promise.resolve();
            //    //     },
            //    //     error: function () {
            //    //         console.log("error");
            //    //     }
            //    // });
            //}
        
            function CarePlan() {
                                        for (var i = 0; i < patientCarePlanGlobal.length; i++) {
                            var dataSet = patientCarePlanGlobal[i];
                            var item = {};
        
                            if (dataSet.hasOwnProperty('CarePlanID')) {
                                item.id = dataSet.CarePlanID;
                            }
                            item.name = dataSet.Title;
        
                            if (dataSet.hasOwnProperty('STartDate')) {
                                item.date = moment.utc(dataSet.STartDate).format('MM/DD/YYYY');
                                item.dateTime = moment.utc(dataSet.STartDate).format('YYYY-MM-DD HH:mm:ss');
                            }
                            item.type = 9;
                            item.entity = "Care Plan";
                            list.push(item);
                        };
            //     var patient = {}
            //     patient.patientId = pid;
            //     patient.startDate = currentStartDate;
            //     patient.endDate = currentEndDate;
        
            //     $.ajax({
            //         url: $("#hdnPatientChartAPIURL").val() + "getPatientCarePlans",
            //         method: "POST",
            //         async: false,
            //         dataType: "json",
            //         data: JSON.stringify(patient),
            //         crossDomain: true,
            //         contentType: "application/json; charset=utf-8",
            //         cache: false,
            //         beforeSend: function (xhr) {
            //             /* Authorization header */
            //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            //         },
            //         success: function (data) {
            //             for (var i = 0; i < data.data.records.length; i++) {
            //                 var dataSet = data.data.records[i];
            //                 var item = {};
        
            //                 if (dataSet.hasOwnProperty('CarePlanID')) {
            //                     item.id = dataSet.CarePlanID;
            //                 }
            //                 item.name = dataSet.Title;
        
            //                 if (dataSet.hasOwnProperty('STartDate')) {
            //                     item.date = moment.utc(dataSet.STartDate).format('MM/DD/YYYY');
            //                     item.dateTime = moment.utc(dataSet.STartDate).format('YYYY-MM-DD HH:mm:ss');
            //                 }
            //                 item.type = 9;
            //                 item.entity = "Care Plan";
            //                 list.push(item);
            //             };
            //             return Promise.resolve();
            //         },
            //         error: function () {
            //             console.log("error");
            //         }
            //     });
            }
        
            function Allergy() {
                for (var i = 0; i < patientAllergyGlobal.length; i++) {
                    var dataSet = patientAllergyGlobal[i];
                    var item = {};

                    if (dataSet.hasOwnProperty('Id')) {
                        item.id = dataSet.Id;
                    }
                    item.name = dataSet.name;

                    if (dataSet.hasOwnProperty('RecordedDate')) {
                        item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
                        item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
                    }
                    item.type = 11;
                    item.entity = "Allergy Intolerance";
                    list.push(item);
                };
                // var patient = {}
                // patient.patientId = pid;
                // patient.startDate = currentStartDate;
                // patient.endDate = currentEndDate;
        
                // $.ajax({
                //     url: $("#hdnPatientChartAPIURL").val() + "getPatientAllergiesCRM",
                //     method: "POST",
                //     async: false,
                //     dataType: "json",
                //     data: JSON.stringify(patient),
                //     crossDomain: true,
                //     contentType: "application/json; charset=utf-8",
                //     cache: false,
                //     beforeSend: function (xhr) {
                //         /* Authorization header */
                //         xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
                //     },
                //     success: function (data) {
                //         for (var i = 0; i < data.data.records.length; i++) {
                //             var dataSet = data.data.records[i];
                //             var item = {};
        
                //             if (dataSet.hasOwnProperty('Id')) {
                //                 item.id = dataSet.Id;
                //             }
                //             item.name = dataSet.name;
        
                //             if (dataSet.hasOwnProperty('RecordedDate')) {
                //                 item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
                //                 item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
                //             }
                //             item.type = 11;
                //             item.entity = "Allergy Intolerance";
                //             list.push(item);
                //         };
                //         return Promise.resolve();
                //     },
                //     error: function () {
                //         console.log("error");
                //     }
                // });
        
        
            }
        
            //function Observation() {
            //    // var patient = {}
            //    // patient.patientId = pid;
            //    // patient.startDate = currentStartDate;
            //    // patient.endDate = currentEndDate;

            //    for (var i = 0; i < patientObservationGlobal.length; i++) {
            //        var dataSet = patientObservationGlobal[i];
            //        var item = {};

            //        if (dataSet.hasOwnProperty('ObservationID')) {
            //            item.id = dataSet.ObservationID;
            //        }
            //        item.name = dataSet.Description;

            //        if (dataSet.hasOwnProperty('IssuedDate')) {
            //            item.date = moment.utc(dataSet.IssuedDate).format('MM/DD/YYYY');
            //            item.dateTime = moment.utc(dataSet.IssuedDate).format('YYYY-MM-DD HH:mm:ss');
            //        }
            //        item.type = 12;
            //        item.entity = "Observation";
            //        list.push(item);
            //    };
            //    // $.ajax({
            //    //     url: $("#hdnPatientChartAPIURL").val() + "getPatientObservationCRM",
            //    //     method: "POST",
            //    //     async: false,
            //    //     dataType: "json",
            //    //     data: JSON.stringify(patient),
            //    //     crossDomain: true,
            //    //     contentType: "application/json; charset=utf-8",
            //    //     cache: false,
            //    //     beforeSend: function (xhr) {
            //    //         /* Authorization header */
            //    //         xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            //    //     },
            //    //     success: function (data) {
            //    //         for (var i = 0; i < data.data.records.length; i++) {
            //    //             var dataSet = data.data.records[i];
            //    //             var item = {};
        
            //    //             if (dataSet.hasOwnProperty('ObservationID')) {
            //    //                 item.id = dataSet.ObservationID;
            //    //             }
            //    //             item.name = dataSet.Description;
        
            //    //             if (dataSet.hasOwnProperty('IssuedDate')) {
            //    //                 item.date = moment.utc(dataSet.IssuedDate).format('MM/DD/YYYY');
            //    //                 item.dateTime = moment.utc(dataSet.IssuedDate).format('YYYY-MM-DD HH:mm:ss');
            //    //             }
            //    //             item.type = 12;
            //    //             item.entity = "Observation";
            //    //             list.push(item);
            //    //         };
            //    //         return Promise.resolve();
            //    //     },
            //    //     error: function () {
            //    //         console.log("error");
            //    //     }
            //    // });
        
        
            //}
        
        
            function Goal() {
                for (var i = 0; i < patientGoalGlobal.length; i++) {
                    var dataSet = patientGoalGlobal[i];
                    var item = {};

                    if (dataSet.hasOwnProperty('GoalId')) {
                        item.id = dataSet.GoalId;
                    }
                    item.name = dataSet.Category;

                    if (dataSet.hasOwnProperty('Startdate')) {
                        item.date = moment.utc(dataSet.Startdate).format('MM/DD/YYYY');
                        item.dateTime = moment.utc(dataSet.Startdate).format('YYYY-MM-DD HH:mm:ss');
                    }
                    item.type = 10;
                    item.entity = "Goal";
                    list.push(item);
                };
            //     var patient = {}
            //     patient.patientId = pid;
            //     patient.startDate = currentStartDate;
            //     patient.endDate = currentEndDate;
        
            //     $.ajax({
            //         url: $("#hdnPatientChartAPIURL").val() + "getPatientGoalCRM",
            //         method: "POST",
            //         async: false,
            //         dataType: "json",
            //         data: JSON.stringify(patient),
            //         crossDomain: true,
            //         contentType: "application/json; charset=utf-8",
            //         cache: false,
            //         beforeSend: function (xhr) {
            //             /* Authorization header */
            //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            //         },
            //         success: function (data) {
            //             for (var i = 0; i < data.data.records.length; i++) {
            //                 var dataSet = data.data.records[i];
            //                 var item = {};
        
            //                 if (dataSet.hasOwnProperty('GoalId')) {
            //                     item.id = dataSet.GoalId;
            //                 }
            //                 item.name = dataSet.Category;
        
            //                 if (dataSet.hasOwnProperty('Startdate')) {
            //                     item.date = moment.utc(dataSet.Startdate).format('MM/DD/YYYY');
            //                     item.dateTime = moment.utc(dataSet.Startdate).format('YYYY-MM-DD HH:mm:ss');
            //                 }
            //                 item.type = 10;
            //                 item.entity = "Goal";
            //                 list.push(item);
            //             };
            //             return Promise.resolve();
            //         },
            //         error: function () {
            //             console.log("error");
            //         }
            //     });
            }
        
            // function RelatedPerson() {
            //     var patient = {}
            //     patient.patientId = pid;
            //     patient.startDate = currentStartDate;
            //     patient.endDate = currentEndDate;
        
            //     $.ajax({
            //         url: $("#hdnPatientChartAPIURL").val() + "GetPatientRelatedPersonCRM",
            //         method: "POST",
            //         async: false,
            //         dataType: "json",
            //         data: JSON.stringify(patient),
            //         crossDomain: true,
            //         contentType: "application/json; charset=utf-8",
            //         cache: false,
            //         beforeSend: function (xhr) {
            //             /* Authorization header */
            //             xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            //         },
            //         success: function (data) {
            //             for (var i = 0; i < data.data.records.length; i++) {
            //                 var dataSet = data.data.records[i];
            //                 var item = {};
        
            //                 if (dataSet.hasOwnProperty('RelatedPersonId')) {
            //                     item.id = dataSet.RelatedPersonId;
            //                 }
            //                // item.name = dataSet.Category;
        
            //                 if (dataSet.hasOwnProperty('Startdate')) {
            //                     item.date = moment.utc(dataSet.Startdate).format('MM/DD/YYYY');
            //                     item.dateTime = moment.utc(dataSet.Startdate).format('YYYY-MM-DD HH:mm:ss');
            //                 }
            //                 item.type = 14;
            //                 item.entity = "RelatedPerson";
            //                 list.push(item);
            //             };
            //             return Promise.resolve();
            //         },
            //         error: function () {
            //             console.log("error");
            //         }
            //     });
            // }
        
        
        
            function getPatientRegistrationDate() {
        
                var patient = {}
        
                patient.patientId = pid;
                patient.getDocuments = false;
                patient.getAddresses = false;
                patient.getRelationship = false;
        
                $.ajax({
                    url: $("#hdnPatientChartAPIURL").val() + "getPatientDetails",
                    method: "POST",
                    async: false,
                    dataType: "json",
                    data: JSON.stringify(patient),
                    crossDomain: true,
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    beforeSend: function (xhr) {
                        /* Authorization header */
                        xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
                    },
                    success: function (data) {
                        var result = data.data.records;
        
                        if (result.hasOwnProperty('dateOfBirth')) {
                            if (result.dateOfBirth != null) {
                                currentStartDate = moment(result.dateOfBirth).format('MM/DD/YYYY');
                            }
                        }                
                    },
                    error: function () {
                        console.log("error");
                    }
                });
            }
        
            function getTypeImageName(a) {
                switch (a) {
                    case 1: return "../webresources/msemr_AppointmentsEMRSVG";
                    case 2: return "../webresources/msemr_devicesvg";
                    case 3: return "../webresources/msemr_medicationrequestSVG";
                    case 4: return "../webresources/msemr_NutritionOrdersSVG";
                    case 5: return "../webresources/msemr_tc_icon_task_svg";
                    case 6: return "../webresources/msemr_ProceduresSVG";
                    case 7: return "../webresources/msemr_ReferralRequestsSVG";
                    case 8: return "../webresources/msemr_EncountersSVG";
                    case 9: return "./src/images/msemr_careplanSVG.svg";
                    case 10: return "../webresources/msemr_CarePlanGoalSVG";
                    case 11: return "./src/images/msemr_allergyintolerancesSVG.svg";
                    case 12: return "./src/images/msemr_ObservationSVG.svg";
                    default: return "./src/images/msemr_careplanSVG.svg";
                }
            }
        
            function getTypeImageAltName(a) {
                switch (a) {
                    case 1: return "Appointment";
                    case 2: return "Device";
                    case 3: return "Medication";
                    case 4: return "Nutrition Order";
                    case 5: return "Task";
                    case 6: return "Procedure";
                    case 7: return "Referral";
                    case 8: return "Encounter";
                    case 9: return "Care Plan";
                    case 10: return "Goal";
                    case 11: return "Allergy";
                    case 12: return "Observation";
                    default: return "";
                }
            }
        
            function openForm(recordId, entityName) {
                var entityFormOptions = {};
                entityFormOptions["entityName"] = entityName;
                entityFormOptions["entityId"] = recordId;
                entityFormOptions["openInNewWindow"] = true;
        
                parent.Xrm.Navigation.openForm(entityFormOptions).then(
                    function (success) {
                    },
                    function (error) {
                        console.log(error);
                    });
            }
        
            var dateSort = function (m, n) {
                var s = new Date(m.dateTime), e = new Date(n.dateTime);
                if (s > e) return 1;
                if (s < e) return -1;
                return 0;
            };
        
        }


})(window);
