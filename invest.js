App = (function() {
    'use strict';

    var bank, down, closing, monthlyCostMortgaged, monthlyCostOwned, monthlyPayment, rent, tax, costToBuy,
        vars = {},
        propertiesWithMortgages = [],
        propertiesOwned = [];

    function init() {
        console.log('init');
        bank = vars.initial;

        // wild ass guess
        closing = 0.016 * vars.price;
        down = closing + vars.price * vars.downPayment / 100;
        rent = vars.price * vars.rentToPrice;
        monthlyPayment = new Property().getMonthlyPayment();
        tax = vars.price * (vars.tax / 100) / 12;
        monthlyCostMortgaged = (monthlyPayment + vars.hoi / 12 + tax + vars.pm) * (1 + vars.vacancy / 100);
        monthlyCostOwned = (vars.hoi / 12 + tax + vars.pm) * (1 + vars.vacancy / 100);
        costToBuy = down + closing + monthlyPayment * 6;
        propertiesWithMortgages = [];
        propertiesOwned = [];
        calculate();
        console.log(rent);
    }
    function calculate() {
        var months = vars.years * 12;
        var income = 0;
        var payment;
        var totalInterestPaid = 0;
        var taxableIncome;
        var mortgage;
        var totalProperties;
        var i, j;
        for(i = 0; i < months; i++) {
            income = 0;
            taxableIncome = 0;
            totalInterestPaid = 0;

            // first pay off any liabilities
            bank = bank - monthlyCostOwned * propertiesOwned.length;
            for(j = 0; j < propertiesWithMortgages.length; j++) {
                bank = bank - monthlyCostMortgaged;
                mortgage = propertiesWithMortgages[j];
                payment = mortgage.makePayment();
                totalInterestPaid += payment.interest;
                income += payment.refund;
                if(payment.refund) {
                    propertiesOwned.push(propertiesWithMortgages.splice(j, 1));
                }
            }
            income += rent * (propertiesOwned.length + propertiesWithMortgages.length);
            taxableIncome = income - totalInterestPaid;
            bank += totalInterestPaid + taxableIncome * (1 - vars.incometax / 100);
            bank += vars.external;
            if(!(i % 12)) {
                console.log('year ' + i / 12 + ': ' + (propertiesOwned.length + propertiesWithMortgages.length) + ' properties owned');
                //console.log('income: ' + (totalInterestPaid + taxableIncome * (1 - vars.incometax / 100)));
            }
            // buy buy buy
            while(bank >= costToBuy) {
                buyProperty()
            }
        }
        console.log('bank: ', bank);
        console.log('income: ' + (totalInterestPaid + taxableIncome * (1 - vars.incometax / 100)));
        var equity = propertiesOwned.length * vars.price;
        for(j = 0; j < propertiesWithMortgages.length; j++) {
            equity = equity + vars.price - propertiesWithMortgages[j].principal;
        }
        console.log('equity: ' + equity);
    }
    function buyProperty(options) {
        propertiesWithMortgages.push(new Property(options));
        bank = bank - costToBuy;
    }
    function initVars() {
        var elements = {
            initial: document.getElementById('initial'),
            external: document.getElementById('external'),
            rentToPrice: document.getElementById('rent-to-price'),
            downPayment: document.getElementById('down-payment'),
            incometax: document.getElementById('incometax'),
            price: document.getElementById('price'),
            years: document.getElementById('years'),
            tax: document.getElementById('tax'),
            interest: document.getElementById('interest'),
            term: document.getElementById('term'),
            hoi: document.getElementById('hoi'),
            pm: document.getElementById('pm'),
            vacancy: document.getElementById('vacancy')
        };
        var el, key;
        for(key in elements) {
            if(elements.hasOwnProperty(key)) {
                (function(key) {
                    Object.defineProperty(vars, key, {
                        get: function() {
                            return Number(elements[key].value);
                        }
                    });
                })(key);
            }
        }
    }

    // Define propery Object
    var Property = function(options) {
        this.options = {
            price: vars.price,
            down: vars.price * vars.downPayment / 100,
            interestRate: (vars.interest / 100) / 12,
            term: vars.term
        };
        var key;
        for(key in options) {
            this.options[key] = options[key];
        }
        this.init();
    };
    Property.prototype.init = function() {
        this.payments = 0;
        this.equity = this.options.down;
        this.principal = this.options.price - this.options.down;
        this.c = this.getMonthlyPayment();
        this.totalCost = this.getTotalCost();
    };
    Property.prototype.makePayment = function() {
        var interest = this.principal * this.options.interestRate;
        var payDown = this.c - interest;
        var refund = 0;
        this.payments++;
        if(this.principal <= payDown) {
            refund = payDown - this.principal;
            this.principal = 0;
            console.log('payed off!!! in ' + (this.payments / 12) + ' years');
        } else {
            this.principal -= payDown;
        }
        return {
            interest: interest,
            refund: refund
        };
    }
    Property.prototype.getEquityAtEndOfMonth = function(month) {
        var r = this.options.interestRate;
        var P = this.options.price - this.options.down;
        var N = month;
        var amountOwed = Math.pow((1 + r), month) * P;
        return this.options.price - amountOwed;
    };
    Property.prototype.getEquityAtEndOfYear = function(year) {
        return this.getEquityAtMonth(year * 12);
    };
    Property.prototype.getMonthlyPayment = function() {
        var r = this.options.interestRate;
        var P = this.options.price - this.options.down;
        var N = this.options.term * 12;
        return r * P / (1 - Math.pow((1 + r), N * -1));
    };
    Property.prototype.getTotalCost = function() {
        return this.c * this.options.term * 12;
    };
    initVars();
    init();
    document.getElementById('recalculate').onclick = init;
    return {
        Property: Property,
        properties: {
            propertiesOwned: propertiesOwned,
            propertiesWithMortgages: propertiesWithMortgages
        }
    };
})();
