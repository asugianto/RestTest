angular.module('RestTestController', []).
    controller('dataController', ['$scope', 'RestTestService', function($scope, RestTestService) {
        $scope.data = {};

        // variable for paginations
        $scope.currentPage = 1;
        $scope.totalPages = 0;
        $scope.maxPerPage = 10;

        // Variable to calculate the total balance per page
        $scope.totalBalance = 0;

        // Variable to store expense categories
        $scope.expenseCategories = [];
        $scope.selectedCategory = '';

        // Return number in array
        $scope.getNumber = function(num) {
            return new Array(num);
        };

        // Pagination controller
        $scope.showNextPage = function() {
            $scope.selectedCategory = '';
            $scope.currentPage++;
            $scope.getTransactionList();
        };

        $scope.showPrevPage = function() {
            $scope.selectedCategory = '';
            $scope.currentPage--;
            $scope.getTransactionList();
        };

        $scope.showPage = function(pageNumber) {
            $scope.selectedCategory = '';
            $scope.currentPage = pageNumber;
            $scope.getTransactionList();
        }

        // Internal function needed to display the correct data
        $scope.getTransactionList = function () {
            // call to get data
            RestTestService.getData($scope.currentPage).then(function(results) {

                $scope.data = results.data;
                $scope.data.transactions = RestTestService.modifyData($scope.data.transactions);
                $scope.expenseCategories = RestTestService.getExpenseCategories(results.data.transactions);
                $scope.currentPage = $scope.data.page;
                $scope.totalPages = Math.ceil($scope.data.totalCount / $scope.maxPerPage);
                $scope.calculateTotalBalance();
            });
        }

        $scope.calculateTotalBalance = function() {
            $scope.totalBalance = 0;
            for (var i = 0; i < $scope.data.transactions.length; i++) {
                if($scope.selectedCategory === '') {
                    // Add every transactions to total balance if there's no filter
                    $scope.totalBalance += Number($scope.data.transactions[i].Amount);
                } else {
                    // Only add filtered categories to total balance
                    if($scope.data.transactions[i].Ledger === $scope.selectedCategory) {
                        $scope.totalBalance += Number($scope.data.transactions[i].Amount);
                    }
                }
            }
        }
    }]);