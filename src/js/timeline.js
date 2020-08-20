// function timeline() {
// debugger;
//     var list = [];
//     var YearList = [];

//     var currentStartDate;
//     var currentEndDate = moment(new Date()).format('MM/DD/YYYY');
//     var checkedEvents = ['5', '6', '7', '8', '9', '11', '12', '13','10',14];
//     var checkedYears = [];
//     var pid = $("#CRMpatietid").val();
//     var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//     if (pid == '' || pid == null) {
//         $('.timelinecontrolnew').hide();
//         $('.errorMessage').show();
//     } else {
//         $('.errorMessage').hide();
//         $('.timelinecontrolnew').show();
//         getPatientRegistrationDate();
//         loadData(true);
//     }

//     // EVENTS

//     $(".chkEvent").on("click", function () {
//         var ev = $(".chkEventItem");

//         if (this.value == 0) //select all
//         {
//             for (var index = 0; index < ev.length; index++) {
//                 ev[index].checked = this.checked;
//             }
//         }

//         checkedEvents = [];
//         for (var index = 0; index < ev.length; index++) {
//             if (ev[index].checked)
//                 checkedEvents.push(ev[index].value);
//         }        

//         var eventSelect = document.getElementById("eventSelect");
//         var arrow = eventSelect.innerText.slice(-1);
//         if (checkedEvents.length == 0)
//             eventSelect.innerText = "Events " + arrow;
//         else
//             if (checkedEvents.length == ev.length)
//                 eventSelect.innerText = "All Events " + arrow;
//             else
//                 eventSelect.innerText = checkedEvents.length + " out of " + ev.length + " events " + arrow

//         LoadTimeline();
//     });

//     // FUNCTIONS

//     function loadData(doSync) {
//         $("._loader").show();
//         setTimeout(function () {
//             if (doSync) {
//                 //loadUserDateFormat();
//                 list = [];
//                 if (checkedEvents.indexOf('5') > -1) {
//                     Device();
//                 }
//                 if (checkedEvents.indexOf('6') > -1) {
//                     Encounter();
//                 }                
//                 if (checkedEvents.indexOf('8') > -1) {
//                     Condition();
//                 }
//                 if (checkedEvents.indexOf('9') > -1) {
//                     CarePlan();
//                 }
//                 if (checkedEvents.indexOf('11') > -1) {
//                     Allergy();
//                 }
//                 if (checkedEvents.indexOf('12') > -1) {
//                     Observation();
//                 }
//                 if (checkedEvents.indexOf('7') > -1) {
//                     Procedure();
//                 }
//                 if (checkedEvents.indexOf('13') > -1) {
//                     ProcedureRequest();
//                 }
//                 if (checkedEvents.indexOf('10') > -1) {
//                     Goal();
//                 }
//                 if (checkedEvents.indexOf('14') > -1) {
//                     RelatedPerson();
//                 }
//             }

//             //event = $('select').val() == null ? '' : $('select').val();
//             //var fltrData = list.filter(function (e) { return this.indexOf(e.type.toString()) > -1; }, checkedEvents);
//             list.sort(dateSort);
//             for (var i = 0; i < list.length; i++) {
//                 var date = new Date(list[i].date)
//                 YearList.push(date.getFullYear());                
//             }

//             var YearListNew = (YearList) => YearList.filter((v, i) => YearList.indexOf(v) === i)
//             YearList = YearListNew(YearList);
//             checkedYears = YearList;

//             loadYearDropdown(YearList);
            

//             $(".note img").click(function () {
//                 var $control = $(this).next('p');
//                 if ($control.is(":not(:visible)")) {
//                     $control.removeClass('addTranslate');
//                     $control.addClass('removeTranslate');
//                     setTimeout(function () {
//                         $control.show();
//                     }, 300);
//                 } else {
//                     $control.addClass('addTranslate');
//                     $control.removeClass('removeTranslate');
//                     setTimeout(function () {
//                         $control.hide();
//                     }, 300);
//                 }
//             });

//             $(".openLink").click(function () {
//                 var id = $(this).data("id");
//                 var entity = $(this).data("entity");
//                 openForm(id, entity);
//             });

//             $("._loader").hide();

//         }, 500);
//     }

//     function loadYearDropdown(array) {
//         $("#yearEventList").html("");
//         $("#yearEventList").append('<div><input class="chkYear" type = "checkbox" value = "0" name = "years" checked = "">[All Years]</div>')
//         for (var i = 0; i < array.length; i++) {            
//             $("#yearEventList").append('<div><input class="chkYear chkYearItem" type = "checkbox" value = "' + array[i] +'" name = "years" checked = "">' + array[i] +'</div>')
//         }

//         $(".chkYear").on("click", function () {
//             var ev = $(".chkYearItem");

//             if (this.value == 0) //select all
//             {
//                 for (var index = 0; index < ev.length; index++) {
//                     ev[index].checked = this.checked;
//                 }
//             }

//             checkedYears = [];
//             for (var index = 0; index < ev.length; index++) {
//                 if (ev[index].checked)
//                     checkedYears.push(ev[index].value);
//             }

//             var eventSelect = document.getElementById("yearSelect");
//             var arrow = eventSelect.innerText.slice(-1);
//             if (checkedYears.length == 0)
//                 eventSelect.innerText = "Years " + arrow;
//             else
//                 if (checkedYears.length == ev.length)
//                     eventSelect.innerText = "All Years " + arrow;
//                 else
//                     eventSelect.innerText = checkedYears.length + " out of " + ev.length + " events " + arrow
            
//             LoadTimeline();
//         });


//         LoadTimeline();
//     }

//     function LoadTimeline() {
//         $("#loading").show();
//         $("#timelinecontrolnew").hide()
//         $("#timeline").html("");

//         var filterdata = list.filter(function (e) { return this.indexOf(e.type.toString()) > -1; }, checkedEvents);

//         var html = "";

//         for (var j = 0; j < checkedYears.length; j++) {
//             var item = checkedYears[j];
//             html = '<div class="timeline__group" id="' + item + '"><span class="timeline__year" >' + item + '</span></div>';
//             $("#timeline").append(html);
//             for (var i = 0; i < filterdata.length; i++) {

//                 var date = new Date(filterdata[i].date)
//                 var id = filterdata[i].id;
//                 var name = filterdata[i].name;
//                 var type = filterdata[i].type;
//                 var entity = filterdata[i].entity;
//                 var year = date.getFullYear();
//                 var month = monthNames[date.getMonth()];
//                 var day = date.getDate();

//                 if (year == item) {
//                     var yeardivcount = $("#" + year).length;
//                     if (yeardivcount > 0) {
//                         var thistimelineboxcount = $("#" + year).find(".timeline__box").length;
//                         if (thistimelineboxcount > 0) {

//                             var daydivcount = $("#" + year).find(".timeline__box").find("." + day).length;
//                             var daydivmonth = $("#" + year).find(".timeline__box").find("." + month).length;

//                             if (daydivcount > 0 && daydivmonth > 0) {
//                                 html = '<div class="timeline__box">' +
//                                     '<div class="timeline__post">' +
//                                     '<div class="timeline__content"> ' +
//                                     '<span class="timelineentity">' + entity + '</span>' +
//                                     '<p> ' + name + '</p>' +
//                                     '</div></div></div>';
//                             }
//                             else {
//                                 html = '<div class="timeline__box"><div class="timeline__date">' +
//                                     '<span class="timeline__day ' + day + '">' + day + '</span>' +
//                                     '<span class="timeline__month ' + month + '">' + month + '</span></div>' +
//                                     '<div class="timeline__post">' +
//                                     '<div class="timeline__content"> ' +
//                                     '<span class="timelineentity">' + entity + '</span>' +
//                                     '<p> ' + name + '</p>' +
//                                     '</div></div></div>';
//                             }
//                         }
//                         else {
//                             html = '<div class="timeline__box"><div class="timeline__date">' +
//                                 '<span class="timeline__day ' + day + '">' + day + '</span>' +
//                                 '<span class="timeline__month ' + month + '">' + month + '</span></div>' +
//                                 '<div class="timeline__post">' +
//                                 '<div class="timeline__content"> ' +
//                                 '<span class="timelineentity">' + entity + '</span>' +
//                                 '<p> ' + name + '</p>' +
//                                 '</div></div></div>';
//                         }
//                     }
//                     else {
//                         html = '<div class="timeline__box"><div class="timeline__date">' +
//                             '<span class="timeline__day ' + day + '">' + day + '</span>' +
//                             '<span class="timeline__month ' + month + '">' + month + '</span></div>' +
//                             '<div class="timeline__post">' +
//                             '<div class="timeline__content"> ' +
//                             '<span class="timelineentity">' + entity + '</span>' +
//                             '<p> ' + name + '</p>' +
//                             '</div></div></div>';
//                     }                    
//                 }

//                 $("#" + year).append(html);
//             }
//         }

//         $(".timeline__group").each(function () {
//             var timelineboxcount = $(this).find(".timeline__box").length;
//             if (timelineboxcount <= 0) {
//                 $(this).hide();
//             }
//             else {
//                 $(this).show();
//             }
//         });

//         $("#loading").hide();
//         $("#timelinecontrolnew").show();
//     }

//     function Device() {
//         var patient = {}
//         patient.patientId = pid;
//         patient.startDate = currentStartDate;
//         patient.endDate = currentEndDate;

//         $.ajax({
//             url: $("#hdnPatientChartAPIURL").val() + "getPatientDevice",
//             method: "POST",
//             async: false,
//             dataType: "json",
//             data: JSON.stringify(patient),
//             crossDomain: true,
//             contentType: "application/json; charset=utf-8",
//             cache: false,
//             beforeSend: function (xhr) {
//                 /* Authorization header */
//                 xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
//             },
//             success: function (data) {
//                 for (var i = 0; i < data.data.records.length; i++) {
//                     var dataSet = data.data.records[i];
//                     var item = {};

//                     if (dataSet.hasOwnProperty('DeviceID')) {
//                         item.id = dataSet.DeviceID;
//                     }
//                     item.name = dataSet.Title;

//                     if (dataSet.hasOwnProperty('RecordedDate')) {
//                         item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
//                         item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
//                     }
//                     item.type = 5;
//                     item.entity = "Device";
//                     list.push(item);
//                 };
//                 return Promise.resolve();
//             },
//             error: function () {
//                 console.log("error");
//             }
//         });
//     }

//     function Encounter() {
//         var patient = {}
//         patient.patientId = pid;
//         patient.startDate = currentStartDate;
//         patient.endDate = currentEndDate;

//         $.ajax({
//             url: $("#hdnPatientChartAPIURL").val() + "getPatientEncounter",
//             method: "POST",
//             async: false,
//             dataType: "json",
//             data: JSON.stringify(patient),
//             crossDomain: true,
//             contentType: "application/json; charset=utf-8",
//             cache: false,
//             beforeSend: function (xhr) {
//                 /* Authorization header */
//                 xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
//             },
//             success: function (data) {
//                 for (var i = 0; i < data.data.records.length; i++) {
//                     var dataSet = data.data.records[i];
//                     var item = {};

//                     if (dataSet.hasOwnProperty('EncounterId')) {
//                         item.id = dataSet.EncounterId;
//                     }
//                     item.name = dataSet.Title;

//                     if (dataSet.hasOwnProperty('RecordedDate')) {
//                         item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
//                         item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
//                     }
//                     item.type = 6;
//                     item.entity = "Encounter";
//                     list.push(item);
//                 };
//                 return Promise.resolve();
//             },
//             error: function () {
//                 console.log("error");
//             }
//         });
//     }

//     function Procedure() {
//         var patient = {}
//         patient.patientId = pid;
//         patient.startDate = currentStartDate;
//         patient.endDate = currentEndDate;

//         $.ajax({
//             url: $("#hdnPatientChartAPIURL").val() + "getPatientProcedure",
//             method: "POST",
//             async: false,
//             dataType: "json",
//             data: JSON.stringify(patient),
//             crossDomain: true,
//             contentType: "application/json; charset=utf-8",
//             cache: false,
//             beforeSend: function (xhr) {
//                 /* Authorization header */
//                 xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
//             },
//             success: function (data) {
//                 for (var i = 0; i < data.data.records.length; i++) {
//                     var dataSet = data.data.records[i];
//                     var item = {};

//                     if (dataSet.hasOwnProperty('ProcedureID')) {
//                         item.id = dataSet.ProcedureID;
//                     }
//                     item.name = dataSet.Title;

//                     if (dataSet.hasOwnProperty('RecordedDate')) {
//                         item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
//                         item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
//                     }
//                     item.type = 7;
//                     item.entity = "Procedure";
//                     list.push(item);
//                 };
//                 return Promise.resolve();
//             },
//             error: function () {
//                 console.log("error");
//             }
//         });
//     }

//     function ProcedureRequest() {
//         var patient = {}
//         patient.patientId = pid;
//         patient.startDate = currentStartDate;
//         patient.endDate = currentEndDate;

//         $.ajax({
//             url: $("#hdnPatientChartAPIURL").val() + "getPatientProcedureRequest",
//             method: "POST",
//             async: false,
//             dataType: "json",
//             data: JSON.stringify(patient),
//             crossDomain: true,
//             contentType: "application/json; charset=utf-8",
//             cache: false,
//             beforeSend: function (xhr) {
//                 /* Authorization header */
//                 xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
//             },
//             success: function (data) {
//                 for (var i = 0; i < data.data.records.length; i++) {
//                     var dataSet = data.data.records[i];
//                     var item = {};

//                     if (dataSet.hasOwnProperty('ProcedureRequestID')) {
//                         item.id = dataSet.ProcedureRequestID;
//                     }
//                     item.name = dataSet.Title;

//                     if (dataSet.hasOwnProperty('RecordedDate')) {
//                         item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
//                         item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
//                     }
//                     item.type = 13;
//                     item.entity = "ProcedureRequest";
//                     list.push(item);
//                 };
//                 return Promise.resolve();
//             },
//             error: function () {
//                 console.log("error");
//             }
//         });
//     }

//     function Condition() {       
//         var patient = {}
//         patient.patientId = pid;
//         patient.startDate = currentStartDate;
//         patient.endDate = currentEndDate;

//         $.ajax({
//             url: $("#hdnPatientChartAPIURL").val() + "getPatientCondition",
//             method: "POST",
//             async: false,
//             dataType: "json",
//             data: JSON.stringify(patient),
//             crossDomain: true,
//             contentType: "application/json; charset=utf-8",
//             cache: false,
//             beforeSend: function (xhr) {
//                 /* Authorization header */
//                 xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
//             },
//             success: function (data) {
//                 for (var i = 0; i < data.data.records.length; i++) {
//                     var dataSet = data.data.records[i];
//                     var item = {};

//                     if (dataSet.hasOwnProperty('ConditionID')) {
//                         item.id = dataSet.ConditionID;
//                     }
//                     item.name = dataSet.Title;

//                     if (dataSet.hasOwnProperty('RecordedDate')) {
//                         item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
//                         item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
//                     }
//                     item.type = 8;
//                     item.entity = "Condition";
//                     list.push(item);
//                 };
//                 return Promise.resolve();
//             },
//             error: function () {
//                 console.log("error");
//             }
//         });
//     }

//     function CarePlan() {
//         var patient = {}
//         patient.patientId = pid;
//         patient.startDate = currentStartDate;
//         patient.endDate = currentEndDate;

//         $.ajax({
//             url: $("#hdnPatientChartAPIURL").val() + "getPatientCarePlans",
//             method: "POST",
//             async: false,
//             dataType: "json",
//             data: JSON.stringify(patient),
//             crossDomain: true,
//             contentType: "application/json; charset=utf-8",
//             cache: false,
//             beforeSend: function (xhr) {
//                 /* Authorization header */
//                 xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
//             },
//             success: function (data) {
//                 for (var i = 0; i < data.data.records.length; i++) {
//                     var dataSet = data.data.records[i];
//                     var item = {};

//                     if (dataSet.hasOwnProperty('CarePlanID')) {
//                         item.id = dataSet.CarePlanID;
//                     }
//                     item.name = dataSet.Title;

//                     if (dataSet.hasOwnProperty('STartDate')) {
//                         item.date = moment.utc(dataSet.STartDate).format('MM/DD/YYYY');
//                         item.dateTime = moment.utc(dataSet.STartDate).format('YYYY-MM-DD HH:mm:ss');
//                     }
//                     item.type = 9;
//                     item.entity = "Care Plan";
//                     list.push(item);
//                 };
//                 return Promise.resolve();
//             },
//             error: function () {
//                 console.log("error");
//             }
//         });
//     }

//     function Allergy() {
//         var patient = {}
//         patient.patientId = pid;
//         patient.startDate = currentStartDate;
//         patient.endDate = currentEndDate;

//         $.ajax({
//             url: $("#hdnPatientChartAPIURL").val() + "getPatientAllergiesCRM",
//             method: "POST",
//             async: false,
//             dataType: "json",
//             data: JSON.stringify(patient),
//             crossDomain: true,
//             contentType: "application/json; charset=utf-8",
//             cache: false,
//             beforeSend: function (xhr) {
//                 /* Authorization header */
//                 xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
//             },
//             success: function (data) {
//                 for (var i = 0; i < data.data.records.length; i++) {
//                     var dataSet = data.data.records[i];
//                     var item = {};

//                     if (dataSet.hasOwnProperty('Id')) {
//                         item.id = dataSet.Id;
//                     }
//                     item.name = dataSet.name;

//                     if (dataSet.hasOwnProperty('RecordedDate')) {
//                         item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
//                         item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
//                     }
//                     item.type = 11;
//                     item.entity = "Allergy Intolerance";
//                     list.push(item);
//                 };
//                 return Promise.resolve();
//             },
//             error: function () {
//                 console.log("error");
//             }
//         });


//     }

//     function Observation() {
//         var patient = {}
//         patient.patientId = pid;
//         patient.startDate = currentStartDate;
//         patient.endDate = currentEndDate;

//         $.ajax({
//             url: $("#hdnPatientChartAPIURL").val() + "getPatientObservationCRM",
//             method: "POST",
//             async: false,
//             dataType: "json",
//             data: JSON.stringify(patient),
//             crossDomain: true,
//             contentType: "application/json; charset=utf-8",
//             cache: false,
//             beforeSend: function (xhr) {
//                 /* Authorization header */
//                 xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
//             },
//             success: function (data) {
//                 for (var i = 0; i < data.data.records.length; i++) {
//                     var dataSet = data.data.records[i];
//                     var item = {};

//                     if (dataSet.hasOwnProperty('ObservationID')) {
//                         item.id = dataSet.ObservationID;
//                     }
//                     item.name = dataSet.Description;

//                     if (dataSet.hasOwnProperty('IssuedDate')) {
//                         item.date = moment.utc(dataSet.IssuedDate).format('MM/DD/YYYY');
//                         item.dateTime = moment.utc(dataSet.IssuedDate).format('YYYY-MM-DD HH:mm:ss');
//                     }
//                     item.type = 12;
//                     item.entity = "Observation";
//                     list.push(item);
//                 };
//                 return Promise.resolve();
//             },
//             error: function () {
//                 console.log("error");
//             }
//         });


//     }


//     function Goal() {
//         var patient = {}
//         patient.patientId = pid;
//         patient.startDate = currentStartDate;
//         patient.endDate = currentEndDate;

//         $.ajax({
//             url: $("#hdnPatientChartAPIURL").val() + "getPatientGoalCRM",
//             method: "POST",
//             async: false,
//             dataType: "json",
//             data: JSON.stringify(patient),
//             crossDomain: true,
//             contentType: "application/json; charset=utf-8",
//             cache: false,
//             beforeSend: function (xhr) {
//                 /* Authorization header */
//                 xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
//             },
//             success: function (data) {
//                 for (var i = 0; i < data.data.records.length; i++) {
//                     var dataSet = data.data.records[i];
//                     var item = {};

//                     if (dataSet.hasOwnProperty('GoalId')) {
//                         item.id = dataSet.GoalId;
//                     }
//                     item.name = dataSet.Category;

//                     if (dataSet.hasOwnProperty('Startdate')) {
//                         item.date = moment.utc(dataSet.Startdate).format('MM/DD/YYYY');
//                         item.dateTime = moment.utc(dataSet.Startdate).format('YYYY-MM-DD HH:mm:ss');
//                     }
//                     item.type = 10;
//                     item.entity = "Goal";
//                     list.push(item);
//                 };
//                 return Promise.resolve();
//             },
//             error: function () {
//                 console.log("error");
//             }
//         });
//     }

//     function RelatedPerson() {
//         var patient = {}
//         patient.patientId = pid;
//         patient.startDate = currentStartDate;
//         patient.endDate = currentEndDate;

//         $.ajax({
//             url: $("#hdnPatientChartAPIURL").val() + "GetPatientRelatedPersonCRM",
//             method: "POST",
//             async: false,
//             dataType: "json",
//             data: JSON.stringify(patient),
//             crossDomain: true,
//             contentType: "application/json; charset=utf-8",
//             cache: false,
//             beforeSend: function (xhr) {
//                 /* Authorization header */
//                 xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
//             },
//             success: function (data) {
//                 for (var i = 0; i < data.data.records.length; i++) {
//                     var dataSet = data.data.records[i];
//                     var item = {};

//                     if (dataSet.hasOwnProperty('RelatedPersonId')) {
//                         item.id = dataSet.RelatedPersonId;
//                     }
//                    // item.name = dataSet.Category;

//                     if (dataSet.hasOwnProperty('Startdate')) {
//                         item.date = moment.utc(dataSet.Startdate).format('MM/DD/YYYY');
//                         item.dateTime = moment.utc(dataSet.Startdate).format('YYYY-MM-DD HH:mm:ss');
//                     }
//                     item.type = 14;
//                     item.entity = "RelatedPerson";
//                     list.push(item);
//                 };
//                 return Promise.resolve();
//             },
//             error: function () {
//                 console.log("error");
//             }
//         });
//     }



//     function getPatientRegistrationDate() {

//         var patient = {}

//         patient.patientId = pid;
//         patient.getDocuments = false;
//         patient.getAddresses = false;
//         patient.getRelationship = false;

//         $.ajax({
//             url: $("#hdnPatientChartAPIURL").val() + "getPatientDetails",
//             method: "POST",
//             async: false,
//             dataType: "json",
//             data: JSON.stringify(patient),
//             crossDomain: true,
//             contentType: "application/json; charset=utf-8",
//             cache: false,
//             beforeSend: function (xhr) {
//                 /* Authorization header */
//                 xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
//             },
//             success: function (data) {
//                 var result = data.data.records;

//                 if (result.hasOwnProperty('dateOfBirth')) {
//                     if (result.dateOfBirth != null) {
//                         currentStartDate = moment(result.dateOfBirth).format('MM/DD/YYYY');
//                     }
//                 }                
//             },
//             error: function () {
//                 console.log("error");
//             }
//         });
//     }

//     function getTypeImageName(a) {
//         switch (a) {
//             case 1: return "../webresources/msemr_AppointmentsEMRSVG";
//             case 2: return "../webresources/msemr_devicesvg";
//             case 3: return "../webresources/msemr_medicationrequestSVG";
//             case 4: return "../webresources/msemr_NutritionOrdersSVG";
//             case 5: return "../webresources/msemr_tc_icon_task_svg";
//             case 6: return "../webresources/msemr_ProceduresSVG";
//             case 7: return "../webresources/msemr_ReferralRequestsSVG";
//             case 8: return "../webresources/msemr_EncountersSVG";
//             case 9: return "./src/images/msemr_careplanSVG.svg";
//             case 10: return "../webresources/msemr_CarePlanGoalSVG";
//             case 11: return "./src/images/msemr_allergyintolerancesSVG.svg";
//             case 12: return "./src/images/msemr_ObservationSVG.svg";
//             default: return "./src/images/msemr_careplanSVG.svg";
//         }
//     }

//     function getTypeImageAltName(a) {
//         switch (a) {
//             case 1: return "Appointment";
//             case 2: return "Device";
//             case 3: return "Medication";
//             case 4: return "Nutrition Order";
//             case 5: return "Task";
//             case 6: return "Procedure";
//             case 7: return "Referral";
//             case 8: return "Encounter";
//             case 9: return "Care Plan";
//             case 10: return "Goal";
//             case 11: return "Allergy";
//             case 12: return "Observation";
//             default: return "";
//         }
//     }

//     function openForm(recordId, entityName) {
//         var entityFormOptions = {};
//         entityFormOptions["entityName"] = entityName;
//         entityFormOptions["entityId"] = recordId;
//         entityFormOptions["openInNewWindow"] = true;

//         parent.Xrm.Navigation.openForm(entityFormOptions).then(
//             function (success) {
//             },
//             function (error) {
//                 console.log(error);
//             });
//     }

//     var dateSort = function (m, n) {
//         var s = new Date(m.dateTime), e = new Date(n.dateTime);
//         if (s > e) return 1;
//         if (s < e) return -1;
//         return 0;
//     };

// }