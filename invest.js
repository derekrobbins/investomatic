App = (function() {
    'use strict';

    var App = {
        vars: {},
        init: init
    };
    function init() {
        initVars();
        calculate();
    }
    function calculate() {
        var months = App.vars.years * 12;
        var i;
        for(i = 0; i < months; i++) {

        }
    }
    function initVars() {
        var elements = {
            initial: document.getElementById('initial'),
            rentToPrice: document.getElementById('rent-to-price'),
            downPayment: document.getElementById('down-payment'),
            price: document.getElementById('price'),
            years: document.getElementById('years')
        };
        var el, key;
        for(key in elements) {
            if(elements.hasOwnProperty(key)) {
                Object.defineProperty(App.vars, key, {
                    get: function() {
                        return elements[key].value;
                    }
                });
            }
        }
    }

    // Define propery Object
    var Property = function(options) {
        this.options = {
            price: 100000,
            down: 20000,
            interestRate: 0.04,
            term: 30
        };
        var key;
        for(key in options) {
            this.options[key] = options[key];
        }
        this.init();
    };
    Property.prototype.init = function() {
        this.equity = this.options.down;
        this.totalCost = this.getTotalCost();
    };
    Property.prototype.getEquityAtMonth = function(month) {
    };
    Property.prototype.getEquityAtYear = function(year) {
        return this.getEquityAtMonth(year * 12);
    };
    Property.prototype.getMonthlyPayment = function() {
        console.log(this);
        return this.totalCost / this.options.term / 12;
    };
    Property.prototype.getTotalCost = function() {
        return (this.options.price - this.options.down) * Math.pow((1 + this.options.interestRate / 12), this.options.term * 12);
    };
    App.init();
    App.Property = Property;
    return App;
})();
