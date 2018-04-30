var app = angular.module("appModule", ["kendo.directives", 'ui.select', 'ngSanitize']);

app.controller("ctrl", function ($scope) {

    var vm = this;


    vm.logs = []
    vm.bins = []
    vm.binId = '';
    var database = firebase.database();
    vm.addFirebase = addFirebase

    // model for save
    vm.bin = ''
    vm.model = {
        lat: '',
        lng: '',
        status: 'blank'
    }
    vm.onSelectCallback = onSelectCallback
    $scope.$watch('vm.date', function (cur, bef) {

        if (cur) {
            vm.gridOption.dataSource.read()
        }
        else if (!cur && bef) {
            vm.date = ''
            vm.gridOption.dataSource.read()
        }
    })
    function getPinColor(status) {
        switch (status) {
            case 'blank': return "69FE75"
            case 'half': return "FEC069"
            case 'full': return "FE7569"
            default: return "69FE75"
        }
    }
    function onSelectCallback(item, model) {
        vm.gridOption.dataSource.read()
    }

    function filterDate(list, obj) {
        obj.time = new Date(obj.time)
        if (vm.date) {
            if (vm.date == moment(obj.time).format("YYYY-MM-DD")) {
                list.push(obj);
            }
        }
        else {
            list.push(obj);
        }
    }

    function addFirebase() {

        if (vm.bin && vm.model.lat && vm.model.lng) {
            firebase.database().ref('bins/' + vm.bin).set(vm.model);
            alert('บันทึกสำเร็จ')
            vm.bin = ''
            vm.model.lat = ''
            vm.model.lng = ''
        }
        else {
            alert("กรุณากรอกข้อมูลให้ครบ");
        }
        //alert('ok')

    }
    function initial() {


        vm.gridOption = {
            height: 500,
            scrollable: true,
            dataSource: new kendo.data.DataSource({
                transport: {
                    read: function (e) {
                        firebase.database().ref('logs').on('value', function (data) {
                            if (data.val()) {
                                var keys = Object.keys(data.val())
                                var list = []
                                var p = data.val()
                                for (var key in p) {
                                    if (p.hasOwnProperty(key)) {
                                        if (vm.binId) {
                                            if (p[key].id == vm.binId) {
                                                filterDate(list, p[key])
                                            }
                                        }
                                        else {
                                            filterDate(list, p[key])
                                        }
                                    }
                                }
                                e.success({
                                    data: list,
                                    total: list.length || 0
                                })
                            }

                        });
                    },

                },
                batch: true,
                pageSize: 1000,
                schema: {
                    data: "data",
                    total: "total"
                },
                sort: { field: "time", dir: "desc" },
                group: [{ field: "id" }],
            }),
            sortable: true,
            pageable: true,


            columns: [
                {
                    field: "id",
                    title: "Bin Id",
                    width: "120px",
                    sortable: false
                },
                {
                    field: "time",
                    title: "TimeStamp",
                    width: "200px",
                    template: function (e) {
                        return kendo.toString(kendo.parseDate(e.time, 'yyyy-MM-ddTHH:mm:ss'), 'dd/MM/yyyy HH:mm:ss') || ' '
                    }
                }, {
                    field: "status",
                    title: "Status",
                    width: "120px",
                    sortable: false
                }, {
                    field: "id",
                    title: "id",
                    groupHeaderTemplate: " ",
                    hidden: true
                }]
        };

        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 18,
            center: new google.maps.LatLng(16.743468, 100.195924),  // เปลี่ยนตามสถานที่
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        var marks = []
        var marker, i;
        var infowindow = new google.maps.InfoWindow();

        // firebase.database().ref('bins/').once('value').then(function (snapshot) {
        firebase.database().ref('bins/').on('value', function (snapshot) {

            marks = []
            vm.bins = []
            vm.bins.push({
                id: '',
                name: 'All'
            })
            snapshot.forEach(function (data) {
                vm.bins.push({
                    id: data.key,
                    name: data.key
                })
                marks.push({
                    id: data.key,
                    lat: data.val().lat,
                    lng: data.val().lng,
                    status: data.val().status,
                    color: getPinColor(data.val().status)
                });
            });


            marks.forEach(function (e) {
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(Number(e.lat), Number(e.lng)),
                    map: map,
                    icon: new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + e.color)
                });
                google.maps.event.addListener(marker, 'click', (function (marker, i) {
                    return function () {
                        infowindow.setContent(
                            "<p>" + "ชื่อถังขยะ : " + e.id + "<br />" +
                            "สถานะของถังขยะ : " + e.status + "</p>"
                        );
                        infowindow.open(map, marker);
                    }
                })(marker, i));
            });

        });

        //================================================================================ //genesis 4/17/2018
        google.maps.event.addListener(map, 'click', function (event) {

            vm.model.lat = event.latLng.lat()
            vm.model.lng = event.latLng.lng()
            $scope.$apply()
            placeMarker(event.latLng)
        });
        var new_marker;
        function placeMarker(location) {

            if (new_marker) {
                new_marker.setPosition(location);
            } else {
                new_marker = new google.maps.Marker({
                    position: location,
                    map: map
                });
            }
        }
        //================================================================================
    }
    initial()
});

app.directive("date", function () {



    return {
        restrict: "E",
        require: 'ngModel',
        scope: {
            ngModel: '=',
            ngDisabled: '=',
            today: '@',
            status: '=',
            widget: '='
        },
        controllerAs: 'vm',
        controller: function ($scope, $element) {
            var vm = this;
            var element = $element
            var format = 'dd/mm/yyyy'
            var first = true

            angular.element('.input-daterange').datepicker({
                format: format
            });
            var model = angular.copy($scope.ngModel)
            var datePicker = element.find("input[name=datePicker]").datepicker();

            $scope.$watch("status", function (v) {
                if (v) {
                    if ($scope.ngModel) {
                        element.find("input[name=datePicker]").datepicker("setDate", config.getKendoDateFormat($scope.ngModel));
                    }
                }
            });



            datePicker.on("changeDate", function (e) {
                sendOutput(e.date)
            });

            datePicker.change(function (e) {
                if (!datePicker.val()) {
                    sendOutput('')
                }
            });
            function sendOutput(output) {
                $scope.$evalAsync(function () {
                    if (!output) $scope.ngModel = ''
                    else
                        $scope.ngModel = moment(output).format("YYYY-MM-DD");// config.getMomentDateFormat(output)
                });
            }


            if ($scope.widget) {
                if ($scope.widget.notify) {
                    $scope.widget.notify = callMeWhenStatusChange;
                }
            }
            function callMeWhenStatusChange(model) {
                $scope.ngModel = model
                if (model) {
                    element.find("input[name=datePicker]").datepicker("setDate", config.getKendoDateFormat($scope.ngModel));
                }
                else {
                    element.find("input[name=datePicker]").datepicker("setDate", '');
                }
            }

        },
        template:
            "<div class='input-daterange input-group' >" +
            "<input type='text' class='form-control' name='datePicker' ng-disabled='ngDisabled'/>" +
            "</div>"
    }
});