'use strict';
var app = angular.module('myApp', ['ui.router', 'ngMaterial', 'ngMessages', 'ui.bootstrap', 'FBAngular']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
    function($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise("/Home");
        $stateProvider
            .state('/', {
                url: '/',
                templateUrl: 'app/views/home.html',
                controller: 'headerController'
            })
            .state('app', {
                url: '/app',
                templateUrl: 'app/views/header.html',
                controller: 'headerController'
            })
            .state('Home', {
                url: '/Home',
                templateUrl: 'app/views/home.html',
                controller: 'headerController'
            })
    }
]);


app.directive("collapseNavAccordion", ["$rootScope", function($rs) {
    return {
        restrict: "A",
        link: function(scope, el) {
            var lists = el.find(".navlist").parent("li"),
                a = lists.children("a"),
                aul = lists.find("ul a"),
                listsRest = el.children("li").not(lists),
                aRest = listsRest.children("a"),
                stopClick = 0;
            a.on("click", function(e) {
                if (!scope.navHorizontal) {
                    if (e.timeStamp - stopClick > 300) {
                        var self = $(this),
                            parent = self.parent("li");
                        lists.not(parent).removeClass("open"), parent.toggleClass("open"), stopClick = e.timeStamp
                    }
                    e.preventDefault()
                }
                e.stopPropagation(), e.stopImmediatePropagation()
            }), aul.on("touchend", function(e) {
                scope.isMobile && ($rs.navOffCanvas = $rs.navOffCanvas ? !1 : !0), e.stopPropagation(), e.stopImmediatePropagation()
            }), aRest.on("touchend", function(e) {
                scope.isMobile && ($rs.navOffCanvas = $rs.navOffCanvas ? !1 : !0), e.stopPropagation(), e.stopImmediatePropagation()
            }), aRest.on("click", function(e) {
                if (!scope.navHorizontal) {
                    var parent = aRest.parent("li");
                    lists.not(parent).removeClass("open")
                }
                e.stopPropagation(), e.stopImmediatePropagation()
            })
        }
    }
}]);

app.controller("headerController", function($scope) {

})
app.directive("sparkline", [function() {
    return {
        restrict: "EA",
        link: function(scope, el, attrs) {
            var model = attrs.values || el.text();
            var opts = {};

            if (attrs.opts) angular.extend(opts, angular.fromJson(attrs.opts));
            else {
                angular.extend(opts, attrs);
            }

            // The following options have to be converted to array from string
            // Type 		Options
            // ====			========
            // Bar 			stackedBarColor
            // Bullet		rangeColors
            // Pie 			sliceColors
            // NOte: when sepcifying multiple colors for above attributes, don't put spaces between them
            // Eg: [#4CAF50,#38B4EE,#eee]  // right
            // 	[#4CAF50, #38B4EE, #eee]	// wrong

            // for bar
            if (attrs.stackedBarColor) {
                opts.stackedBarColor = attrs.stackedBarColor.replace("[", "").replace("]", "").split(",");
            }
            // for bullet
            if (attrs.rangeColors) {
                opts.rangeColors = attrs.rangeColors.replace("[", "").replace("]", "").split(",");
            }
            // for pie
            if (attrs.sliceColors) {
                opts.sliceColors = attrs.sliceColors.replace("[", "").replace("]", "").split(",");

            }



            if (angular.isString(model))
                model = JSON.parse("[" + model + "]");

            el.sparkline(model, opts);

        }
    }
}])


app.controller("AppCtrl", ["$rootScope", "$scope", "$timeout", function($rs, $scope, $timeout) {
    var mm = window.matchMedia("(max-width: 767px)");
    $rs.isMobile = mm.matches ? !0 : !1, $rs.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        "$apply" == phase || "$digest" == phase ? fn && "function" == typeof fn && fn() : this.$apply(fn)
    }, mm.addListener(function(m) {
        $rs.safeApply(function() {
            $rs.isMobile = m.matches ? !0 : !1
        })
    }), $scope.navFull = !0, $scope.toggleNav = function() {
        $scope.navFull = $scope.navFull ? !1 : !0, $rs.navOffCanvas = $rs.navOffCanvas ? !1 : !0, console.log("navOffCanvas: " + $scope.navOffCanvas), $timeout(function() {
            $rs.$broadcast("c3.resize")
        }, 260)
    }, $scope.toggleSettingsBox = function() {
        $scope.isSettingsOpen = $scope.isSettingsOpen ? !1 : !0
    }, $scope.themeActive = "theme-zero", $scope.fixedHeader = !0, $scope.navHorizontal = !1;
    var SETTINGS_STATES = "_setting-states",
        statesQuery = {
            get: function() {
                return JSON.parse(localStorage.getItem(SETTINGS_STATES))
            },
            put: function(states) {
                localStorage.setItem(SETTINGS_STATES, JSON.stringify(states))
            }
        },
        sQuery = statesQuery.get() || {
            navHorizontal: $scope.navHorizontal,
            fixedHeader: $scope.fixedHeader,
            navFull: $scope.navFull,
            themeActive: $scope.themeActive
        };
    sQuery && ($scope.navHorizontal = sQuery.navHorizontal, $scope.fixedHeader = sQuery.fixedHeader, $scope.navFull = sQuery.navFull, $scope.themeActive = sQuery.themeActive), $scope.onNavHorizontal = function() {
        sQuery.navHorizontal = $scope.navHorizontal, statesQuery.put(sQuery)
    }, $scope.onNavFull = function() {
        sQuery.navFull = $scope.navFull, statesQuery.put(sQuery), $timeout(function() {
            $rs.$broadcast("c3.resize")
        }, 260)
    }, $scope.onFixedHeader = function() {
        sQuery.fixedHeader = $scope.fixedHeader, statesQuery.put(sQuery)
    }, $scope.onThemeActive = function() {
        sQuery.themeActive = $scope.themeActive, statesQuery.put(sQuery)
    }, $scope.onThemeChange = function(theme) {
        console.log("theme")
        $scope.themeActive = theme, $scope.onThemeActive()
    }
}])

app.controller("HeadCtrl", ["$scope", "Fullscreen", function($scope, Fullscreen) {
    $scope.toggleFloatingSidebar = function() {
        $scope.floatingSidebar = $scope.floatingSidebar ? !1 : !0, console.log("floating-sidebar: " + $scope.floatingSidebar)
    }, $scope.goFullScreen = function() {
        Fullscreen.isEnabled() ? Fullscreen.cancel() : Fullscreen.all()
    }
}]);


app.directive("highlightActive", ["$location", function($location) {
    return {
        restrict: "A",
        link: function(scope, el) {
            var links = el.find("a"),
                path = function() {
                    return $location.path()
                },
                highlightActive = function(links, path) {
                    var path = "#" + path;
                    angular.forEach(links, function(link) {
                        var link = angular.element(link),
                            li = link.parent("li"),
                            href = link.attr("href");
                        li.hasClass("active") && li.removeClass("active"), 0 == path.indexOf(href) && li.addClass("active")
                    })
                };
            highlightActive(links, $location.path()), scope.$watch(path, function(newVal, oldVal) {
                newVal != oldVal && highlightActive(links, $location.path())
            })
        }
    }
}])

app.directive("customScrollbar", ["$interval", function($interval) {
    return {
        restrict: "A",
        link: function(scope, el) {
            el.perfectScrollbar({
                suppressScrollX: !0
            }), $interval(function() {
                el[0].scrollHeight >= el[0].clientHeight && el.perfectScrollbar("update")
            }, 400)
        }
    }
}]);
app.controller("DashboardCtrl", ["$scope", function($scope) {
    $scope.analyticsconfig = {
        data: {
            columns: [
                ["Network Load", 30, 100, 80, 140, 150, 200],
                ["CPU Load", 90, 100, 170, 140, 150, 50]
            ],
            type: "spline",
            types: {
                "Network Load": "bar"
            }
        },
        color: {
            pattern: ["#3F51B5", "#38B4EE", "#4CAF50", "#E91E63"]
        },
        legend: {
            position: "inset"
        },
        size: {
            height: 330
        }
    }, $scope.storageOpts = {
        size: 100,
        lineWidth: 2,
        lineCap: "square",
        barColor: "#E91E63"
    }, $scope.storagePercent = 80, $scope.serverOpts = {
        size: 100,
        lineWidth: 2,
        lineCap: "square",
        barColor: "#4CAF50"
    }, $scope.serverPercent = 35, $scope.clientOpts = {
        size: 100,
        lineWidth: 2,
        lineCap: "square",
        barColor: "#FDD835"
    }, $scope.clientPercent = 54, $scope.browserconfig = {
        data: {
            columns: [
                ["Chrome", 48.9],
                ["Firefox", 16.1],
                ["Safari", 10.9],
                ["IE", 17.1],
                ["Other", 7]
            ],
            type: "donut"
        },
        size: {
            width: 260,
            height: 260
        },
        donut: {
            width: 50
        },
        color: {
            pattern: ["#3F51B5", "#4CAF50", "#f44336", "#E91E63", "#38B4EE"]
        }
    }
}]);
app.factory("todoStorage", [function() {
    var STORAGE_ID = "_todo-task",
        store = {
            todos: [],
            get: function() {
                return JSON.parse(localStorage.getItem(STORAGE_ID))
            },
            put: function(todos) {
                localStorage.setItem(STORAGE_ID, JSON.stringify(todos))
            }
        };
    return store
}])
app.controller("TodoCtrl", ["$scope", "todoStorage", "$filter", function($s, store, $filter) {
    var demoTodos = [{
            title: "Eat healthy, Eat fresh",
            completed: !1
        }, {
            title: "Donate some money",
            completed: !0
        }, {
            title: "Wake up at 5:00 A.M",
            completed: !1
        }, {
            title: "Hangout with friends at 12:00",
            completed: !1
        }, {
            title: "Another todo on the list. Add as many you want.",
            completed: !1
        }, {
            title: "The last but not the least.",
            completed: !0
        }],
        todos = $s.todos = store.get() || demoTodos;
    $s.newTodo = "", $s.remainingCount = $filter("filter")(todos, {
        completed: !1
    }).length, $s.editedTodo = null, $s.edited = !1, $s.todoshow = "all", $s.$watch("remainingCount == 0", function(newVal) {
        $s.allChecked = newVal
    }), $s.filter = function(filter) {
        switch (filter) {
            case "all":
                $s.statusFilter = "";
                break;
            case "active":
                $s.statusFilter = {
                    completed: !1
                }
        }
    }, $s.addTodo = function() {
        var newTodo = {
            title: $s.newTodo.trim(),
            completed: !1
        };
        0 !== newTodo.length && (todos.push(newTodo), store.put(todos), $s.newTodo = "", $s.remainingCount++)
    }, $s.editTodo = function(todo) {
        $s.editedTodo = todo, $s.edited = !0, $s.originalTodo = angular.extend({}, todo)
    }, $s.removeTodo = function(todo) {
        $s.remainingCount -= todo.completed ? 0 : 1, todos.splice(todos.indexOf(todo), 1), store.put(todos)
    }, $s.doneEditing = function(todo) {
        $s.editedTodo = null, $s.edited = !1, todo.title = todo.title.trim(), todo.title || $s.removeTodo(todo), store.put(todos)
    }, $s.revertEditing = function(todo) {
        todos[todos.indexOf(todo)] = $scope.originalTodo, $s.doneEditing($s.originalTodo)
    }, $s.toggleCompleted = function(todo) {
        $s.remainingCount += todo.completed ? -1 : 1, store.put(todos)
    }, $s.clearCompleted = function() {
        $s.todos = todos = todos.filter(function(val) {
            return !val.completed
        }), store.put(todos)
    }, $s.markAll = function(completed) {
        todos.forEach(function(todo) {
            todo.completed = !completed
        }), $s.remainingCount = completed ? todos.length : 0, store.put(todos)
    }
}]);
app.factory('c3Factory', ['$q', '$timeout', function($q, $timeout) {
    var defer = $q.defer();
    var chart = {};
    var allCharts = {};
    var decorateChart = function(chart) {};

    chart.get = function(id) {
        var chart;
        return $timeout(function() {
            //time out to wait for the chart to be compiled
        }, 100).then(function() {
            chart = allCharts[id];
            return chart;
        });
    };

    chart.getAll = function() {
        return $timeout(function() {
            return allCharts;
        }, 100);
    };

    chart.register = function(id, chart) {
        decorateChart(chart);
        allCharts[id] = chart;
    };

    return chart;
}]);
app.directive('c3Chart', ['c3Factory', function(c3Factory) {

    //color patterns for chart coloring
    var patterns = {
        light: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896'],
        dark: ['#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7'],
        material: ['#e51c23', '#673ab7', '#5677fc', '#03a9f4', '#00bcd4', '#259b24', '#ffeb3b', '#ff9800']
    };

    return {
        restrict: 'EAC',
        scope: {
            config: '='
        },
        template: '<div></div>',
        replace: true,
        link: function(scope, element, attrs) {
            //available option to show gridlines for chart
            //assign a type of line if undefined
            if (!scope.config.type) scope.config.type = 'line';

            //generate c3 chart data
            var chartData = scope.config;
            chartData.bindto = '#' + attrs.id;

            //Generating the chart
            var chart = c3.generate(chartData);
            c3Factory.register(attrs.id, chart);
            // bind resize event

            scope.$on("c3.resize", function(e, data) {
                chart.resize();
            });
        }
    };
}]);