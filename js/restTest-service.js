var restTestApp = angular.module('RestTestApp');

restTestApp.service('RestTestService', function($http) {
        return {

            getData: function(page) {
                // Service to Get data from the API
                return $http({
                    url: 'http://resttest.bench.co/transactions/' + page + '.json',
                    method: 'GET'
                });
            },

            modifyData: function(data) {
                // Modify data so it'll satisfy the requirement criteria

                var prevData = null;
                var newData = [];
                var dailyBalance = 0;

                for(var i = data.length-1; i >= 0 ; i--) {
                    if(JSON.stringify(prevData) !== JSON.stringify(data[i])) {

                        // Trim unreadable description
                        data[i].Company = this.trimString(data[i].Company.split(' '));

                        // Check for running balance per dates
                        if(prevData === null || (prevData.Date === data[i].Date)) {
                            dailyBalance += Number(data[i].Amount);
                        } else if (i > 0) {
                            // When date different from the previous transaction, we'll insert the running balance on the last recurring dates
                            data[i+1].runningBalance = dailyBalance;
                            dailyBalance += Number(data[i].Amount);
                        } else {
                            // Last entry on the table, add running balance to previous entry if the last entry is different than previous,
                            // Otherwise, add running balance to the last entry
                            if(prevData.Date !== data[i].Date) {
                                data[i+1].runningBalance = dailyBalance;
                            }

                            dailyBalance += Number(data[i].Amount);
                            data[i].runningBalance = dailyBalance;
                        }

                        // Check if there's any duplicates within the sorted array
                        var originalData = {};
                        angular.copy(data[i], originalData); // deep copy data and compare it with previous
                        prevData = originalData;

                        newData.push(data[i]);
                    }
                }

                // Return the newly created array minus the duplicates
                return newData;
            },

            getExpenseCategories: function(transactions) {

                // Separate categories within transactions, creating a unique function to find distinct categories
                Array.prototype.contains = function(v) {
                    for(var i = 0; i < this.length; i++) {
                        if(this[i] === v) return true;
                    }
                    return false;
                };

                Array.prototype.unique = function() {
                    var arr = [];
                    for(var i = 0; i < this.length; i++) {
                        if(!arr.contains(this[i].Ledger) && this[i].Ledger !== '') {
                            arr.push(this[i].Ledger);
                        }
                    }
                    return arr;
                }

                var categories = transactions.unique();
                return categories;
            },

            trimString: function(company) {

                // Trim the company name so it'll be more readable
                var information = '';
                var companyDesc = company;

                for(var i = 0; i < companyDesc.length; i++) {
                    // function to check if word start with x or #x characters, and end with number, we remove this because it's unreadable for the user
                    if(((companyDesc[i][0] === 'x' || companyDesc[i].substring(0,2) === '#x') &&
                        !isNaN(Number(companyDesc[i][companyDesc[i].length-1]))) ||
                        companyDesc[i][0] === '@') {
                        information += '';
                    } else {
                        information = information + ' ' + companyDesc[i];
                    }
                }

                return information;
            },
        }
    });