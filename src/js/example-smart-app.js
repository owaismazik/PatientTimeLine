(function (window) {
    var list = [];

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

                    if (obv != null) {
                        if (obv.length > 0) {
                            for (var i = 0; i <= 10; i++) {
                                if (obv[i] != null) {
                                    if (obv[i] != undefined) {
                                        var patientObservation = {};
                                        var title = obv[i].code.coding[0].display;
                                        var recordeddate = obv[i].issued;
                                        patientObservation.obvID = obv[i].id;
                                        patientObservation.Description = obv[i].code.text;
                                        patientObservation.description = "Observation - " + title;
                                        patientObservation.patientId = $("#CRMpatietid").val();
                                        patientObservation.IssuedDate = recordeddate;
                                        var dataSet = patientObservation;
                                        var item = {};

                                        if (dataSet.hasOwnProperty('ObservationID')) {
                                            item.id = dataSet.ObservationID;
                                        }
                                        item.name = "Observation - " + title;

                                        if (dataSet.hasOwnProperty('IssuedDate')) {
                                            item.date = moment.utc(recordeddate).format('MM/DD/YYYY');
                                            item.dateTime = moment.utc(recordeddate).format('YYYY-MM-DD HH:mm:ss');
                                        }
                                        item.type = 12;
                                        item.id = obv[i].id;
                                        if (obv[i].hasOwnProperty("encounter")) {
                                            item.encounterID = obv[i].encounter.reference.split('/')[1];
                                        }
                                        item.entity = "Observation";
                                        list.push(item);
                                    }
                                }
                            }
                        }
                    }

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
                                            var recordeddate = "";
                                            if (encounter[i].hasOwnProperty('period')) {
                                                recordeddate = encounter[i].period.start;
                                            }
                                            else if (encounter[i].hasOwnProperty('meta')) {
                                                recordeddate = encounter[i].meta.lastUpdated;
                                            }
                                            var patientEncounter = {}
                                            patientEncounter.encounterID = encounter[i].id;
                                            patientEncounter.Title = "Encounter - " + title;
                                            patientEncounter.RecordedDate = recordeddate;
                                            patientEncounter.PatientID = $("#CRMpatietid").val();
                                            var dataSet = patientEncounter;
                                            var item = {};

                                            item.name = dataSet.Title;

                                            if (dataSet.hasOwnProperty('RecordedDate')) {
                                                item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
                                                item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
                                            }
                                            item.type = 6;
                                            item.id = dataSet.encounterID;
                                            item.entity = "Encounter";
                                            list.push(item);
                                        }
                                    }
                                }
                            }
                        }
                    });

                    //CreatePatient(patient.id);




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
                                            var patientAllergy = {}
                                            patientAllergy.AllergyID = Allergy[i].id;
                                            patientAllergy.name = "Allergy - " + title;
                                            patientAllergy.patientId = $("#CRMpatietid").val();
                                            patientAllergy.RecordedDate = recordeddate;
                                            var dataSet = patientAllergy;
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
                                            item.id = dataSet.AllergyID;
                                            if (Allergy[i].hasOwnProperty("encounter")) {
                                                item.encounterID = Allergy[i].encounter.reference.split('/')[1];
                                            }
                                            item.entity = "Allergy Intolerance";
                                            list.push(item);
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
                                            var patientCondition = {}
                                            patientCondition.conditionID = condition[i].id;
                                            patientCondition.Title = "Condition - " + title;
                                            patientCondition.RecordedDate = recordeddate;
                                            patientCondition.PatientID = $("#CRMpatietid").val();
                                            var dataSet = patientCondition;
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
                                            item.id = dataSet.conditionID;
                                            if (condition[i].hasOwnProperty("encounter")) {
                                                item.encounterID = condition[i].encounter.reference.split('/')[1];
                                            }
                                            item.entity = "Condition";
                                            list.push(item);
                                        }
                                    }
                                }
                            }
                        }
                    });  

                    var MedOrder = smart.patient.api.fetchAll({
                        type: 'MedicationOrder',
                        query: {
                            patient: patient.id
                        }
                    });

                    $.when(MedOrder).done(function (MedicationOrder) {

                        if (MedicationOrder != null) {
                            if (MedicationOrder.length > 0) {
                                for (var i = 0; i <= MedicationOrder.length; i++) {
                                    if (MedicationOrder[i] != null) {
                                        if (MedicationOrder[i] != undefined) {
                                            var title = "";
                                            if (MedicationOrder[i].medicationCodeableConcept != undefined) {
                                                if (MedicationOrder[i].hasOwnProperty('medicationCodeableConcept')) {
                                                    if (MedicationOrder[i].medicationCodeableConcept.hasOwnProperty('coding')) {
                                                        if (MedicationOrder[1].medicationCodeableConcept.coding[0].hasOwnProperty('display')) {
                                                            title = MedicationOrder[i].medicationCodeableConcept.coding[0].display;
                                                        }
                                                    }
                                                }
                                            }
                                            var recordeddate = MedicationOrder[i].dateWritten;
                                            var patientMedicationOrder = {}
                                            patientMedicationOrder.MedicationOrderID = MedicationOrder[i].id;
                                            patientMedicationOrder.Title = "MedicationOrder - " + title;
                                            patientMedicationOrder.RecordedDate = recordeddate;
                                            patientMedicationOrder.PatientID = $("#CRMpatietid").val();
                                            var dataSet = patientMedicationOrder;
                                            var item = {};
                                            //if (dataSet.hasOwnProperty('MedicationOrderID')) {
                                            //    item.id = dataSet.MedicationOrderID;
                                            //}
                                            item.name = dataSet.Title;
                                            if (dataSet.hasOwnProperty('RecordedDate')) {
                                                item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
                                                item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
                                            }
                                            item.type = 8;
                                            item.id = dataSet.MedicationOrderID;
                                            if (MedicationOrder[i].hasOwnProperty("encounter")) {
                                                item.encounterID = MedicationOrder[i].encounter.reference.split('/')[1];
                                            }
                                            item.entity = "MedicationOrder";
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
                                            var title = '';
                                            if (procedure[i].code.hasOwnProperty('coding')) {
                                                if (procedure[i].code.coding.hasOwnProperty('display')) {
                                                    title = procedure[i].code.coding[0].display;
                                                }
                                            }
                                            else {
                                                title = procedure[i].code;
                                            }
                                            var recordeddate = '';

                                            if (procedure[i].hasOwnProperty("performedDateTime")) {
                                                recordeddate = procedure[i].performedDateTime;
                                            }
                                            else if (procedure[i].hasOwnProperty("performedPeriod")) {
                                                recordeddate = procedure[i].performedPeriod.start;
                                            }
                                            else if (procedure[i].hasOwnProperty("meta")) {
                                                if (procedure[i].meta.lastUpdated != "undefined") {
                                                    recordeddate = procedure[i].meta.lastUpdated;
                                                }
                                            }
                                            if (recordeddate.length == 4) {
                                                if (procedure[i].meta.lastUpdated != "undefined") {
                                                    recordeddate = procedure[i].meta.lastUpdated;
                                                }
                                            }

                                            //CreateProcedure(procedure[i].id, $("#CRMpatietid").val(), "Procedure - " + title, recordeddate);
                                            var patientProcedure = {}
                                            patientProcedure.procedureID = procedure[i].id;
                                            patientProcedure.Title = "Procedure - " + title;
                                            patientProcedure.RecordedDate = recordeddate;
                                            patientProcedure.PatientID = $("#CRMpatietid").val();
                                            //patientProcedureGlobal = patientProcedure;
                                            var dataSet = patientProcedure;
                                            var item = {};

                                            //if (dataSet.hasOwnProperty('ProcedureID')) {
                                            //    item.id = dataSet.ProcedureID;
                                            //}
                                            item.name = dataSet.Title;

                                            if (dataSet.hasOwnProperty('RecordedDate')) {
                                                item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
                                                item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
                                            }
                                            item.type = 7;
                                            item.id = dataSet.procedureID;
                                            if (procedure[i].hasOwnProperty("encounter")) {
                                                item.encounterID = procedure[i].encounter.reference.split('/')[1];
                                            }
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
                                            patientProcedure.procedureRequestID = procedureRequest[i].id;
                                            patientProcedure.Title = "procedureRequest - " + title;
                                            patientProcedure.RecordedDate = recordeddate;
                                            patientProcedure.PatientID = $("#CRMpatietid").val();
                                            //patientProcedureRequestGlobal = patientProcedure;
                                            var dataSet = patientProcedure;
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
                                            item.id = dataSet.procedureRequestID;
                                            if (procedureRequest[i].hasOwnProperty("encounter")) {
                                                item.encounterID = procedureRequest[i].encounter.reference.split('/')[1];
                                            }
                                            item.entity = "ProcedureRequest";
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
                                            patientDevice.deviceID = device[i].id;
                                            patientDevice.Title = "Device - " + title;
                                            patientDevice.RecordedDate = recordeddate;
                                            patientDevice.PatientID = $("#CRMpatietid").val();
                                            //patientDeviceGlobal = patientDevice;
                                            var dataSet = patientDevice;
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
                                            item.id = dataSet.deviceID;
                                            if (device[i].hasOwnProperty("encounter")) {
                                                item.encounterID = device[i].encounter.reference.split('/')[1];
                                            }
                                            item.entity = "Device";
                                            list.push(item);
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
                                            patientCarePlan.careplanID = careplan[i].id;
                                            patientCarePlan.Title = fname + " " + lname + " Care Plan";
                                            patientCarePlan.Description = fname + " " + lname + " Care Plan";
                                            patientCarePlan.STartDate = careplan[i].period.start;
                                            patientCarePlan.EndDate = careplan[i].period.start;
                                            patientCarePlan.PatientID = $("#CRMpatietid").val();
                                            //patientCarePlanGlobal = patientCarePlan;
                                            var dataSet = patientCarePlan;
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
                                            item.id = dataSet.careplanID;
                                            if (careplan[i].hasOwnProperty("encounter")) {
                                                item.encounterID = careplan[i].encounter.reference.split('/')[1];
                                            }
                                            item.entity = "Care Plan";
                                            list.push(item);
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
                                            var Goal = {}
                                            Goal.Externalemrid = externalEmrId;
                                            Goal.Patientid = $("#CRMpatietid").val();
                                            Goal.Startdate = startdate;
                                            Goal.TargetDate = targetdate;
                                            Goal.Category = category;
                                            Goal.Description = description;
                                            //patientGoalGlobal = Goal;
                                            var dataSet = Goal;
                                            var item = {};

                                            if (dataSet.hasOwnProperty('GoalId')) {
                                                item.id = dataSet.GoalId;
                                            }
                                            item.name = dataSet.Category;

                                            if (dataSet.hasOwnProperty('Startdate')) {
                                                item.date = moment.utc(dataSet.Startdate).format('MM/DD/YYYY');
                                                item.dateTime = moment.utc(dataSet.Startdate).format('YYYY-MM-DD HH:mm:ss');
                                            }
                                            if (Goal[i].hasOwnProperty("encounter")) {
                                                item.encounterID = Goal[i].encounter.reference.split('/')[1];
                                            }
                                            item.type = 10;
                                            item.entity = "Goal";
                                            list.push(item);
                                        }
                                    }
                                }
                            }
                        }
                    });


                    setTimeout(function () {
                        $("#timeline").show();
                        timeline();
                    }, 2000);  //7000     

                    setTimeout(function () {
                        $("#timeline").hide();
                        //timeline();
                    }, 7000); 

                    setTimeout(function () {
                        $("#timeline").show();
                        timeline();
                    }, 7010); 

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
        $(".loader").hide();
        $('#fname').html(p.fname);
        $('#lname').html(p.lname);
        $('#phone').html(p.phone);
        if (p.email == "") {
            $('#email').html("testing@testing_email.com");
        }
        else {
            $('#email').html(p.email);
        }
        $('#gender').html(p.gender);
        $('#birthdate').html(p.birthdate);
        $('#height').html(p.height);
        $('#systolicbp').html(p.systolicbp);
        $('#diastolicbp').html(p.diastolicbp);
        $('#ldl').html(p.ldl);
        $('#hdl').html(p.hdl);
    };

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
                //getPatientRegistrationDate();
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

                if (!checkedEvents.includes('6') && checkedEvents.length >= 1) {
                    checkedEvents.push('6');
                    ev[1].checked = true;
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
                        //if (checkedEvents.indexOf('5') > -1) {
                        //    Device();
                        //}
                        //if (checkedEvents.indexOf('6') > -1) {
                        //    Encounter();
                        //}                
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
                var value = $('#changeOrder').val();
                var breaker = false;
                var counter = 0;
                var loopBreakingValue = 100;
        
                var filterdata = list.filter(function (e) { return this.indexOf(e.type.toString()) > -1; }, checkedEvents);

                var html = "";

                if (value == "true") {
                    var newArray = filterdata.sort((a, b) => (a.type == 6) ? -1 : 1); // for encounter ascending
                    for (var j = 0; j < checkedYears.length; j++) {
                        counter = 0;
                        var item = checkedYears[j];
                        html = '<div class="timeline__group" id="' + item + '"><span class="timeline__year" >' + item + '</span></div>';

                        $("#timeline").append(html);
                        for (var i = 0; i < newArray.length; i++) {
                            var date = new Date(newArray[i].date)
                            var id = newArray[i].id;
                            var name = newArray[i].name;
                            var type = newArray[i].type;
                            var entity = newArray[i].entity;
                            var year = date.getFullYear();
                            var month = monthNames[date.getMonth()];
                            var day = date.getDate();
                            var encounterID = newArray[i].encounterID;
                            var collapseHTML = '';
                            if (entity == "Encounter") {
                                collapseHTML = ' <i style="left:90px;margin-left: 10px" class="arrow right"></i>';
                            }
                            var spanClass = "";
                            var imgClass = "";

                            ({ spanClass, imgClass } = getEntityCssClass(entity, spanClass, imgClass));

                            if (year == item) {
                                var yeardivcount;
                                var idEncounter;
                                var thistimelineboxcount;
                                var daydivcount;
                                var daydivmonth;
                                ({ yeardivcount, idEncounter, thistimelineboxcount, daydivcount, daydivmonth, html } = generatingHTML(year, encounterID, day, month, entity, html, id, name, spanClass, imgClass, collapseHTML));
                            }

                            $("#" + year).append(html);
                            html = ""; 
                        }
                    }
                }
                else {
                    // for desending
                    for (var j = checkedYears.length - 1; j >= 0; j--) {
                        var item = checkedYears[j];
                        html = '<div class="timeline__group" id="' + item + '"><span class="timeline__year" >' + item + '</span></div>';
                        $("#timeline").append(html);
                        filterdata.sort((a, b) => (a.type == 6) ? 1 : -1) // for encounter descending
                        for (var i = filterdata.length - 1; i >= 0; i--) {
                            var date = new Date(filterdata[i].date)
                            var id = filterdata[i].id;
                            var name = filterdata[i].name;
                            var type = filterdata[i].type;
                            var entity = filterdata[i].entity;
                            var year = date.getFullYear();
                            var month = monthNames[date.getMonth()];
                            var day = date.getDate();
                            var encounterID = filterdata[i].encounterID;
                            var collapseHTML = '';
                            if (entity == "Encounter") {
                                collapseHTML = ' <i style="left:90px;margin-left: 10px" class="arrow right"></i>';
                            }
                            var spanClass = "";
                            var imgClass = "";

                            ({ spanClass, imgClass } = getEntityCssClass(entity, spanClass, imgClass));

                            if (year == item) {

                                var yeardivcount;
                                var idEncounter;
                                var thistimelineboxcount;
                                var daydivcount;
                                var daydivmonth;
                                ({ yeardivcount, idEncounter, thistimelineboxcount, daydivcount, daydivmonth, html } = generatingHTML(year, encounterID, day, month, entity, html, id, name, spanClass, imgClass, collapseHTML));
                            }
                            $("#" + year).append(html);
                            html = "";
                        }
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
                $(".timeline__content").on("click", function () {
                    $(this.children[0].firstElementChild).toggleClass("move")
                });
                $(function () {
                    $(".accordion").accordion({
                        collapsible: true
                    });
                });
                var collapseAll = function () {
                    $(".accordion").accordion("option");
                }
            }
                        
        function generatingHTML(year, encounterID, day, month, entity, html, id, name, spanClass, imgClass, collapseHTML) {
            var yeardivcount = $("#" + year).length;
            var idEncounter = '#' + encounterID;
            if (yeardivcount > 0) {
                var thistimelineboxcount = $("#" + year).find(".timeline__box").length;
                if (thistimelineboxcount > 0) {
                    var daydivcount = $("#" + year).find(".timeline__box").find("." + day).length;
                    var daydivmonth = $("#" + year).find(".timeline__box").find("." + month).length;
                    if (daydivcount > 0 && daydivmonth > 0) {
                        if (encounterID != undefined && entity != "Encounter") {
                            if ($(idEncounter).parent().parent().parent().siblings().children().length >= 1) {
                                html = '<div class="timeline__post">' +
                                    '<div class="timeline__content"> ' +
                                    '<span id="' + id + '" encounterID="' + encounterID + '" class="timelineentity">' + entity + '</span>' +
                                    '<p> ' + name + '</p>' +
                                    '<span class="mzkicon ' + spanClass + '">' +
                                    '<img class="mzkimg ' + imgClass + '" src="https://owaismazik.github.io/PatientTimeLine/src/images/' + imageName + '">' +
                                    '</span>' +
                                    '</div></div>';
                                $(idEncounter).parent().parent().parent().siblings().append(html);
                                html = "";
                            }
                            else {
                                html = '<div class="timeline__box mzkheight mzktimelinebox">' +
                                    '<div class="timeline__post">' +
                                    '<div class="timeline__content"> ' +
                                    '<span id="' + id + '" encounterID="' + encounterID + '" class="timelineentity">' + entity + '</span>' +
                                    '<p> ' + name + '</p>' +
                                    '<span class="mzkicon ' + spanClass + '">' +
                                    '<img class="mzkimg ' + imgClass + '" src="https://owaismazik.github.io/PatientTimeLine/src/images/' + imageName + '">' +
                                    '</span>' +
                                    '</div></div></div>';
                                $(idEncounter).parent().parent().parent().parent().append(html);
                                html = "";
                            }
                        }
                        else {
                            html = '<div class="accordion"><div class="timeline__box mzkheight mzktimelinebox">' +
                                '<div class="timeline__post">' +
                                '<div class="timeline__content"> ' +
                                '<span id="' + id + '" encounterID="' + encounterID + '" class="timelineentity">' + entity + collapseHTML + '</span>' +
                                '<p> ' + name + '</p>' +
                                '<span class="mzkicon ' + spanClass + '">' +
                                '<img class="mzkimg ' + imgClass + '" src="https://owaismazik.github.io/PatientTimeLine/src/images/' + imageName + '">' +
                                '</span>' +
                                '</div></div></div></div>';
                        }
                    }
                    else {
                        if (encounterID != undefined && entity != "Encounter") {
                            if ($(idEncounter).parent().parent().parent().siblings().children().length >= 1) {
                                html = '<div class="timeline__box mzkheight mzktimelinebox"><div class="timeline__date mzkpanalchild">' +
                                    '<span class="timeline__day ' + day + '">' + day + '</span>' +
                                    '<span class="timeline__month ' + month + '">' + month + '</span></div>' +
                                    '<div class="timeline__post">' +
                                    '<div class="timeline__content"> ' +
                                    '<span id="' + id + '" encounterID="' + encounterID + '" class="timelineentity">' + entity + '</span>' +
                                    '<p> ' + name + '</p>' +
                                    '<span class="mzkicon ' + spanClass + '">' +
                                    '<img class="mzkimg ' + imgClass + '" src="https://owaismazik.github.io/PatientTimeLine/src/images/' + imageName + '">' +
                                    '</span>' +
                                    '</div></div></div>';
                                $(idEncounter).parent().parent().parent().siblings().append(html);
                                html = "";
                            }
                            else {
                                html = '<div class="timeline__box mzkheight mzktimelinebox">' +
                                    // TODO testing
                                    //'<span class="timeline__day ' + day + '">' + day + '</span>' +
                                    //'<span class="timeline__month ' + month + '">' + month + '</span></div>' +
                                    '<div class="timeline__post">' +
                                    '<div class="timeline__content"> ' +
                                    '<span id="' + id + '" encounterID="' + encounterID + '" class="timelineentity">' + entity + '</span>' +
                                    '<p> ' + name + '</p>' +
                                    '<span class="mzkicon ' + spanClass + '">' +
                                    '<img class="mzkimg ' + imgClass + '" src="https://owaismazik.github.io/PatientTimeLine/src/images/' + imageName + '">' +
                                    '</span>' +
                                    '</div></div></div>';
                                $(idEncounter).parent().parent().parent().parent().append(html);
                                html = "";
                            }
                        }
                        else {
                            html = '<div class="accordion"><div class="timeline__box mzkheight mzktimelinebox"><div class="timeline__date">' +
                                '<span class="timeline__day ' + day + '">' + day + '</span>' +
                                '<span class="timeline__month ' + month + '">' + month + '</span></div>' +
                                '<div class="timeline__post">' +
                                '<div class="timeline__content"> ' +
                                '<span id="' + id + '" encounterID="' + encounterID + '" class="timelineentity">' + entity + collapseHTML + '</span>' +
                                '<p> ' + name + '</p>' +
                                '<span class="mzkicon ' + spanClass + '">' +
                                '<img class="mzkimg ' + imgClass + '" src="https://owaismazik.github.io/PatientTimeLine/src/images/' + imageName + '">' +
                                '</span>' +
                                '</div></div></div></div>';
                        }
                    }
                }
                else {
                    if (encounterID != undefined && entity != "Encounter") {
                        if ($(idEncounter).parent().parent().parent().siblings().children().length >= 1) {
                            html = '<div class="timeline__box mzkheight mzktimelinebox"><div class="timeline__date mzkpanalchild">' +
                                '<span class="timeline__day ' + day + '">' + day + '</span>' +
                                '<span class="timeline__month ' + month + '">' + month + '</span></div>' +
                                '<div class="timeline__post">' +
                                '<div class="timeline__content"> ' +
                                '<span id="' + id + '" encounterID="' + encounterID + '" class="timelineentity">' + entity + '</span>' +
                                '<p> ' + name + '</p>' +
                                '<span class="mzkicon ' + spanClass + '">' +
                                '<img class="mzkimg ' + imgClass + '" src="https://owaismazik.github.io/PatientTimeLine/src/images/' + imageName + '">' +
                                '</span>' +
                                '</div></div></div>';
                            $(idEncounter).parent().parent().parent().siblings().append(html);
                            html = "";
                        }
                        else {
                            html = '<div class="timeline__box mzkheight mzktimelinebox"><div class="timeline__date mzkpanalchild">' +
                                '<span class="timeline__day ' + day + '">' + day + '</span>' +
                                '<span class="timeline__month ' + month + '">' + month + '</span></div>' +
                                '<div class="timeline__post">' +
                                '<div class="timeline__content"> ' +
                                '<span id="' + id + '" encounterID="' + encounterID + '" class="timelineentity">' + entity + '</span>' +
                                '<p> ' + name + '</p>' +
                                '<span class="mzkicon ' + spanClass + '">' +
                                '<img class="mzkimg ' + imgClass + '" src="https://owaismazik.github.io/PatientTimeLine/src/images/' + imageName + '">' +
                                '</span>' +
                                '</div></div></div>';
                            $(idEncounter).parent().parent().parent().parent().append(html);
                            html = "";
                        }
                    }
                    else {
                        html = '<div class="accordion"><div class="timeline__box mzkheight mzktimelinebox"><div class="timeline__date">' +
                            '<span class="timeline__day ' + day + '">' + day + '</span>' +
                            '<span class="timeline__month ' + month + '">' + month + '</span></div>' +
                            '<div class="timeline__post">' +
                            '<div class="timeline__content"> ' +
                            '<span id="' + id + '" encounterID="' + encounterID + '" class="timelineentity">' + entity + collapseHTML + '</span>' +
                            '<p> ' + name + '</p>' +
                            '<span class="mzkicon ' + spanClass + '">' +
                            '<img class="mzkimg ' + imgClass + '" src="https://owaismazik.github.io/PatientTimeLine/src/images/' + imageName + '">' +
                            '</span>' +
                            '</div></div></div></div>';
                    }
                }
            }
            else {
                if (encounterID != undefined && entity != "Encounter") {
                    if ($(idEncounter).parent().parent().parent().siblings().children().length >= 1) {
                        html = '<div class="timeline__box mzkheight mzktimelinebox"><div class="timeline__date mzkpanalchild">' +
                            '<span class="timeline__day ' + day + '">' + day + '</span>' +
                            '<span class="timeline__month ' + month + '">' + month + '</span></div>' +
                            '<div class="timeline__post">' +
                            '<div class="timeline__content"> ' +
                            '<span id="' + id + '" encounterID="' + encounterID + '" class="timelineentity">' + entity + '</span>' +
                            '<p> ' + name + '</p>' +
                            '<span class="mzkicon ' + spanClass + '">' +
                            '<img class="mzkimg ' + imgClass + '" src="https://owaismazik.github.io/PatientTimeLine/src/images/' + imageName + '">' +
                            '</span>' +
                            '</div></div></div>';
                        $(idEncounter).parent().parent().parent().siblings().append(html);
                        html = "";
                    }
                    else {
                        html = '<div class="timeline__box mzkheight mzktimelinebox"><div class="timeline__date mzkpanalchild">' +
                            '<span class="timeline__day ' + day + '">' + day + '</span>' +
                            '<span class="timeline__month ' + month + '">' + month + '</span></div>' +
                            '<div class="timeline__post">' +
                            '<div class="timeline__content"> ' +
                            '<span id="' + id + '" encounterID="' + encounterID + '" class="timelineentity">' + entity + '</span>' +
                            '<p> ' + name + '</p>' +
                            '<span class="mzkicon ' + spanClass + '">' +
                            '<img class="mzkimg ' + imgClass + '" src="https://owaismazik.github.io/PatientTimeLine/src/images/' + imageName + '">' +
                            '</span>' +
                            '</div></div></div>';
                        $(idEncounter).parent().parent().parent().parent().append(html);
                        html = "";
                    }
                }
                else {
                    html = '<div class="accordion"><div class="timeline__box mzkheight mzktimelinebox"><div class="timeline__date">' +
                        '<span class="timeline__day ' + day + '">' + day + '</span>' +
                        '<span class="timeline__month ' + month + '">' + month + '</span></div>' +
                        '<div class="timeline__post">' +
                        '<div class="timeline__content"> ' +
                        '<span id="' + id + '" encounterID="' + encounterID + '" class="timelineentity">' + entity + collapseHTML + '</span>' +
                        '<p> ' + name + '</p>' +
                        '<span class="mzkicon ' + spanClass + '">' +
                        '<img class="mzkimg ' + imgClass + '" src="https://owaismazik.github.io/PatientTimeLine/src/images/' + imageName + '">' +
                        '</span>' +
                        '</div></div></div></div>';
                }
            }
            return { yeardivcount, idEncounter, thistimelineboxcount, daydivcount, daydivmonth, html };
        }

        function getEntityCssClass(entity, spanClass, imgClass) {
            switch (entity) {
                case "Allergy Intolerance":
                    imageName = "allergy.png";
                    spanClass = "mzkaleryspan";
                    imgClass = 'mzkalergyimg';
                    break;
                case "Observation":
                    imageName = "Observation.png";
                    spanClass = "mzkobserspan";
                    imgClass = 'mzkobserimg';
                    break;
                case "Condition":
                    imageName = "conditon.png";
                    spanClass = "mzkobserspan";
                    imgClass = 'mzkobserimg';
                    break;
                case "MedicationOrder":
                    imageName = "MedicationOrder.png";
                    spanClass = "mzkmedicationspan";
                    imgClass = 'mzkmedicationimg';
                    break;
                case "Procedure":
                    imageName = "procedure.png";
                    spanClass = "mzkprocedurerspan";
                    imgClass = 'mzkprocedureimg';
                    break;
                case "ProcedureRequest":
                    imageName = "request.png";
                    spanClass = "mzkprocreqspan";
                    imgClass = 'mzkprocreqimg';
                    break;
                case "Encounter":
                    imageName = "encounter.png";
                    spanClass = "mzkencounterspan";
                    imgClass = 'mzkencounterimg';
                    break;
                default:
                    imageName = "";
            }
            return { spanClass, imgClass };
        }

            //function getTypeImageName(a) {
            //    switch (a) {
            //        case 1: return "../webresources/msemr_AppointmentsEMRSVG";
            //        case 2: return "../webresources/msemr_devicesvg";
            //        case 3: return "../webresources/msemr_medicationrequestSVG";
            //        case 4: return "../webresources/msemr_NutritionOrdersSVG";
            //        case 5: return "../webresources/msemr_tc_icon_task_svg";
            //        case 6: return "../webresources/msemr_ProceduresSVG";
            //        case 7: return "../webresources/msemr_ReferralRequestsSVG";
            //        case 8: return "../webresources/msemr_EncountersSVG";
            //        case 9: return "./src/images/msemr_careplanSVG.svg";
            //        case 10: return "../webresources/msemr_CarePlanGoalSVG";
            //        case 11: return "./src/images/msemr_allergyintolerancesSVG.svg";
            //        case 12: return "./src/images/msemr_ObservationSVG.svg";
            //        default: return "./src/images/msemr_careplanSVG.svg";
            //    }
            //}
        
            //function getTypeImageAltName(a) {
            //    switch (a) {
            //        case 1: return "Appointment";
            //        case 2: return "Device";
            //        case 3: return "Medication";
            //        case 4: return "Nutrition Order";
            //        case 5: return "Task";
            //        case 6: return "Procedure";
            //        case 7: return "Referral";
            //        case 8: return "Encounter";
            //        case 9: return "Care Plan";
            //        case 10: return "Goal";
            //        case 11: return "Allergy";
            //        case 12: return "Observation";
            //        default: return "";
            //    }
            //}
        
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

    $(".changeOrderClass").on("click", function () {
        var value = $('#changeOrder').val();
        if (value == "true") {
            $('#changeOrder').val(false);
            timeline();
        }
        else {
            $('#changeOrder').val(true);
            timeline();
        }
    });

})(window);
