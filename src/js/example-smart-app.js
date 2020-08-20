(function (window) {
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
                                        var title = obv[i].code.coding[0].display;
                                        var recordeddate = obv[i].issued;
                                        CreateObservation(obv[i].id, $("#CRMpatietid").val(), "Observation - " + title, recordeddate);
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
                                            var title = Allergy[i].substance.coding[0].display;
                                            var recordeddate = Allergy[i].recordedDate;
                                            //CreateAllergy(Allergy[i].id, $("#CRMpatietid").val(), "Allergy - " + title, recordeddate);
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
                                            var title = condition[i].code.coding[0].display;
                                            var recordeddate = condition[i].onsetDateTime;
                                            //CreateCondition(condition[i].id, $("#CRMpatietid").val(), "Condition - " + title, recordeddate);
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
                                            var title = procedureRequest[i].code.coding[0].display;
                                            var recordeddate = procedureRequest[i].scheduledPeriod.start;                                            
                                            //CreateProcedureRequest(procedureRequest[i].id, $("#CRMpatietid").val(), "procedureRequest - " + title, recordeddate);
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
                                            var recordeddate = encounter[i].period.start;
                                            //CreateEncounter(encounter[i].id, $("#CRMpatietid").val(), "Encounter - " + title, recordeddate);
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
                        debugger;
                        if (device != null) {
                            if (device.length > 0) {
                                for (var i = 0; i <= device.length; i++) {
                                    if (device[i] != null) {
                                        if (device[i] != undefined) {
                                            var title = device[i].type.text;
                                            var recordeddate = device[i].meta.lastUpdated;
                                            //CreateDevice(device[i].id, $("#CRMpatietid").val(), "Device - " + title, recordeddate);
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
                                        }
                                    }
                                }
                            }
                        }
                    });


                    setTimeout(function () {
                        $("#timeline").show();
                        timeline();
                    }, 7000);                   

                });

                var medicationAdministration = smart.patient.api.fetchAll({
                    type: 'MedicationAdministration',
                    query: {
                        patient: patient.id
                    }
                });

                $.when(medicationAdministration).done(function (MedicationAdministration) {

                    if (MedicationAdministration != null) {
                        if (MedicationAdministration.length > 0) {
                            for (var i = 0; i <= MedicationAdministration.length; i++) {
                                if (MedicationAdministration[i] != null) {
                                    if (MedicationAdministration[i] != undefined) {
                                        // var title = Slot[i].substance.coding[0].display;
                                        // var recordeddate = Allergy[i].recordedDate
                                        Alert("ABC");
                                    }
                                }
                            }
                        }
                    }
                });


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
                                    }
                                }
                            }
                        }
                    }
                });


                var relatedPerson = smart.patient.api.fetchAll({
                    type: 'RelatedPerson',
                    query: {
                        patient: patient.id
                    }
                });

                $.when(relatedPerson).done(function (RelatedPerson) {

                    if (RelatedPerson != null) {
                        if (RelatedPerson.length > 0) {
                            for (var i = 0; i <= RelatedPerson.length; i++) {
                                if (RelatedPerson[i] != null) {
                                    if (RelatedPerson[i] != undefined) {

                                      //  var externalEmrId = RelatedPerson[i].id;
                                       // var startdate = RelatedPerson[i].identifier[6].period.start;
                                       // var family = RelatedPerson[i].name[2].family[0];
                                       // var given = RelatedPerson[i].name[3].given[0];
                                        //CreateRelatedPerson(externalEmrId, $("#CRMpatietid").val(), startdate, given, family);
                                    }
                                }
                            }
                        }
                    }
                    var externalEmrId = 5796399;
                    var startdate = "2016-11-01T10:00:00.000Z";
                    var family = "PETERS";
                    var given = "TIMOTHY";
                    CreateRelatedPerson(externalEmrId, $("#CRMpatietid").val(), startdate, given, family);
                    
                });

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

    function CreatePatient(patientid) {
        var data = {}
        var patient = {}

        patient.Externalemrid = patientid;
        patient.firstName = $("#fname").text();
        patient.lastName = $("#lname").text();
        patient.phone = $("#phone").text();
        patient.email = $("#email").text();
        patient.dateOfBirth = $("#birthdate").text();

        data.patient = patient;

        console.log(data);

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "CreatePatientCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            },
            success: function (data) {
                if (data.data.records != null) {

                    $("#CRMpatietid").val(data.data.records.patientId);                    

                }

            },
            error: function () {
                console.log("error");
            }
        });


    }

    function CreateDevice(id, patientid, title, startdate) {
        var data = {}
        var patientDevice = {}
        patientDevice.Externalemrid = id;
        patientDevice.Title = title;
        patientDevice.RecordedDate = startdate;
        patientDevice.PatientID = patientid;

        data.patientDevice = patientDevice;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "CreatePatientDeviceCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            },
            success: function (data) {
                if (data.data.records != null) {

                    //$("#timeline").show();

                    //timeline();
                }

            },
            error: function () {
                console.log("error");
            }
        });
    }

    function CreateEncounter(id, patientid, title, startdate) {
        var data = {}
        var patientEncounter = {}
        patientEncounter.Externalemrid = id;
        patientEncounter.Title = title;
        patientEncounter.RecordedDate = startdate;
        patientEncounter.PatientID = patientid;

        data.patientEncounter = patientEncounter;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "CreatePatientEncounterCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            },
            success: function (data) {
                if (data.data.records != null) {

                    //$("#timeline").show();

                    //timeline();
                }

            },
            error: function () {
                console.log("error");
            }
        });
    }

    function CreateProcedure(id, patientid, title, startdate) {
        var data = {}
        var patientProcedure = {}
        patientProcedure.Externalemrid = id;
        patientProcedure.Title = title;
        patientProcedure.RecordedDate = startdate;
        patientProcedure.PatientID = patientid;

        data.patientProcedure = patientProcedure;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "CreatePatientProcedureCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            },
            success: function (data) {
                if (data.data.records != null) {
                    
                    //$("#timeline").show();

                    //timeline();
                }

            },
            error: function () {
                console.log("error");
            }
        });
    }

    function CreateProcedureRequest(id, patientid, title, startdate) {
        var data = {}
        var patientProcedureRequest = {}
        patientProcedureRequest.Externalemrid = id;
        patientProcedureRequest.Title = title;
        patientProcedureRequest.RecordedDate = startdate;
        patientProcedureRequest.PatientID = patientid;

        data.patientProcedureRequest = patientProcedureRequest;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "CreatePatientProcedureRequestCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            },
            success: function (data) {
                if (data.data.records != null) {

                    //$("#timeline").show();

                    //timeline();
                }

            },
            error: function () {
                console.log("error");
            }
        });
    }

    function CreateCondition(id, patientid, title, startdate) {
        var data = {}
        var patientCondition = {}
        patientCondition.Externalemrid = id;
        patientCondition.Title = title;
        patientCondition.RecordedDate = startdate;
        patientCondition.PatientID = patientid;

        data.patientCondition = patientCondition;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "CreatePatientConditionCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            },
            success: function (data) {
                if (data.data.records != null) {

                    //$("#timeline").show();

                    //timeline();
                }

            },
            error: function () {
                console.log("error");
            }
        });
    }

    function CreateCarePlan(id, patientid, title, desc, startdate, enddate) {        
        var data = {}
        var patientCarePlan = {}
        patientCarePlan.Externalemrid = id;
        patientCarePlan.Title = title;
        patientCarePlan.Description = desc;
        patientCarePlan.STartDate = startdate;
        patientCarePlan.EndDate = enddate;
        patientCarePlan.PatientID = patientid;

        data.patientCarePlan = patientCarePlan;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "CreatePatientCarePlanCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            },
            success: function (data) {
                if (data.data.records != null) {

                    //$("#timeline").show();

                    //timeline();
                }

            },
            error: function () {
                console.log("error");
            }
        });
    }

    function CreateAllergy(id, patientid, title, startdate) {
        var data = {}
        var patientAllergy = {}
        patientAllergy.Externalemrid = id;
        patientAllergy.name = title;
        patientAllergy.patientId = patientid;
        patientAllergy.RecordedDate = startdate;

        data.patientAllergy = patientAllergy;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "CreatePatientAllergyCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            },
            success: function (data) {
                if (data.data.records != null) {

                    //$("#timeline").show();

                    //timeline();
                }

            },
            error: function () {
                console.log("error");
            }
        });
    }

    function CreateObservation(id, patientid, title, IssuedDate) {
        var data = {}
        var patientObservation = {}
        patientObservation.Externalemrid = id;
        patientObservation.description = title;
        patientObservation.patientId = patientid;
        patientObservation.IssuedDate = IssuedDate;

        data.patientObservation = patientObservation;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "CreatePatientObservationCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            },
            success: function (data) {
                if (data.data.records != null) {

                    //$("#timeline").show();

                    //timeline();
                }

            },
            error: function () {
                console.log("error");
            }
        });
    }

    function CreateMedicationAdministration() {
        var data = {}
        var patientMedicationAdministration = {}

        //patientAllergy.Externalemrid = id;
        //patientAllergy.name = title;
        //patientAllergy.patientId = patientid;
        //patientAllergy.RecordedDate = startdate;

        data.patientMedicationAdministration = patientMedicationAdministration;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "CreatePatientMedicationAdministrationCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            },
            success: function (data) {
                if (data.data.records != null) {

                    //$("#timeline").show();

                    //timeline();
                }

            },
            error: function () {
                console.log("error");
            }
        });
    }

    function CreateGoal(id, patientid, startDate, targetDate, category, description) {
        var data = {}
        var Goal = {}

        Goal.Externalemrid = id;
        Goal.Patientid = patientid;
        Goal.Startdate = startDate;
        Goal.TargetDate = targetDate;
        Goal.Category = category;
        Goal.Description = description;

        //patientAllergy.RecordedDate = startdate;

        data.patientGoal = Goal;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "CreatePatientGoalCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            },
            success: function (data) {
                if (data.data.records != null) {

                    //$("#timeline").show();

                    //timeline();
                }

            },
            error: function () {
                console.log("error");
            }
        });
    }

    function CreateRelatedPerson(id, patientid, startDate, given, family) {
        var data = {}
        var RelatedPerson = {}

        RelatedPerson.Externalemrid = id;
        RelatedPerson.Patientid = patientid;
        RelatedPerson.Startdate = startDate;
        RelatedPerson.Firstname = given;
        RelatedPerson.Lastname = family;

        data.patientRelatedPerson = RelatedPerson;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "CreatePatientRelatedPersonCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            },
            success: function (data) {
                if (data.data.records != null) {

                    //$("#timeline").show();

                    //timeline();
                }

            },
            error: function () {
                console.log("error");
            }
        });
    }


})(window);
