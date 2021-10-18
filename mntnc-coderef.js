//// fdespi.09242021
//// app-ictservice.js version 1.0

var app = angular.module('mntnc-coderef',['functionService','ngRoute','ui.bootstrap'])
.run(function($rootScope) {
    $rootScope.userlogged="";
})

app.directive('selectCoderef', function() {
  return {
    require: "ngModel",
    scope: {
      pc: '@'
    },
    restrict: 'E',
    replace: true,
    template:'<select class ="form-control" placeholder="Search.."> '
              + '  <option value=""></option> '
              + '  <option ng-repeat="x in list" value="{{x.Code}}">{{x.Descr}}</option> '
              + '</select>',
    controller: function($scope,utilServ,$http) {
        $scope.loadTable = function(){
          $http.get("coderef/getCodeReferenceList/phocov/"+$scope.pc).success(function(data){
            $scope.list = data['crlist'];
          }).catch(function (err) {
          }).finally(function () {
          });
        }

        $scope.loadTable();
    },
    link: function(scope,elem,attrs,ngModel) {
        // update the color picker whenever the value on the scope changes
        ngModel.$render = function() {
          elem.val(ngModel.$modelValue);            
        };
    }
  };
});

app.directive('rbSymptom', function() {
  return {
    require: "ngModel",
    restrict: 'E',
    scope: {
      ngclass: '@',
      retlist: '@'
    },
    template: '  <div ng-repeat="x in list" class="{{ngclass}}"> '
            + '     <input type="checkbox" id="{{x.Code}}" ng-model="x.selected"> ' // ng-checked="(x.selected==1)?true:false"
            + '     <label for="{{x.Code}}"><b>{{ x.Descr | uppercase }}</b></label> '
            + '  </div> ',
    controller: function($scope,utilServ,$http) {
        function newList(list){
          if(list){
            for (var i=0; i < list.length; i++) {
              var row = list[i];
              row.selected = (row.selected===1||row.selected) ? true : false;
            }
          }
          return list;
        }

        $scope.loadTable = function(){
          if($scope.retlist===true){
            $http.get("coderef/getCodeReferenceList/phocov/is").success(function(data){
              $scope.list = data['crlist'];
              $scope.list = newList($scope.list);
              console.log($scope.list);
            }).catch(function (err) {
            }).finally(function () {
            });
          }
          else
            $scope.list = newList($scope.slist);
        }
    },
    link: function(scope,elem,attrs,ngModel) {
        ngModel.$render = function() {
          elem.val(ngModel.$modelValue);  
          scope.slist = ngModel.$modelValue; 
          scope.loadTable(); 
        };
    }
  }
});

app.directive('codeRef', function() {
  return {
    scope: {
      title: '@',
      dbt: '@',
      code: '@'
    },
    restrict: 'E',
    templateUrl: 'application/views/content/directiveTemplates/codereference.php',
    controller: function($scope,utilServ,$http) {

        $scope.sort_by = function(predicate) {
          $scope.predicate = predicate;
          $scope.reverse = !$scope.reverse;
        }

        $scope.currentPage = 1;
        $scope.pageSize = 10;

        function resetNewRec(){
          $scope.n_cr = {'Code': '',
                         'Descr': '', 
                         'ParentCode': $scope.code
                        };
        }

        $scope.loadTable = function(){
          $http.get("coderef/getCodeReferenceList/"+$scope.dbt+"/"+$scope.code).success(function(data){
            $scope.tblCRlist = data['crlist'];
          }).catch(function (err) {
          }).finally(function () {
          });
        }

        $scope.loadTable();
        resetNewRec();

        $scope.editCodeRef = function(x){
          $scope.e_cr = x;
          $('#modal_editcoderef').modal({show:true});
        }

        $scope.saveCodeRef = function(type){ //pc = parentcode
            var cr;

            (type==0) ? cr = $scope.n_cr : cr = $scope.e_cr;

            $.ajax({
                  type: 'post',
                  url: 'coderef/saveCodeReference',
                  data: {
                    id: cr.Code,
                    abbrev: cr.Abbrev,
                    desc: cr.Descr,
                    pc: $scope.code,
                    db: $scope.dbt
                  },
                  success: function (response) {
                    var resp = JSON.parse(response);
                    if(resp==true){
                      if (type==0){
                        $('#modal_addcoderef').modal('hide');
                        $scope.n_function = '';
                      }
                      else{
                        $('#modal_editcoderef').modal('hide');
                        $scope.e_function = '';
                      }

                      swal("Saved!", "Successfully saved !", "success");
                      $scope.loadTable();
                      resetNewRec();
                    }
                    else{
                      (type==0) ? $('#modal_addcoderef').modal('hide') : $('#modal_editcoderef').modal('hide');

                      alertify.alert("Something went wrong !", 'Please try again later !');
                    }
                  }
              }); 

        }

        $scope.deleteCodeRef = function(x){
            swal({
                title:"Are you sure you want to delete this record ?",
                text: x.Descr,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: true
            }, function () {
                $.ajax({
                      type: 'post',
                      url: 'coderef/deleteCodeReference',
                      data: {
                        code: x.Code,
                        pc: $scope.code,
                        db: $scope.dbt
                      },
                      success: function (response) {
                        if(response){
                          alertify.error('[' + x.Descr + '] record Deleted.');
                          $scope.loadTable();
                        }
                      }
                  }); 
                
            });
        }
    },
    link: function(scope,elem,attrs,ngModel) {
      // console.log(scope.dbt)
        // update the color picker whenever the value on the scope changes
        // ngModel.$render = function() {
        //   elem.val(ngModel.$modelValue);            
        // };
    }
  };
});

//
//
// CONTROLLER coderefmainCtrl
app.controller("coderefmainCtrl", function (utilServ,$scope, $http, $timeout,$location,$routeParams,$rootScope,$window,$route,$interval) {
  $rootScope.userlogged = JSON.parse(localStorage.getItem("cpgportal_userdata"));

  var path1 = $location.path().split("/")[1];
  var path2 = $location.path().split("/")[2];
  var path3 = $location.path().split("/")[3];

  if($rootScope.userlogged['role']!='SUPERADMIN'&&!$rootScope.UserHasAccess(path1 + '_' + path2 + '_' + path3)){
     $location.path("/norights");
  }

  $scope.pagecode = path3;
});
// end of coderefCtrl CONTROLLER
// 
// 


