var LoanEngine = /** @class */ (function () {
    function LoanEngine() {
    }
    LoanEngine.equivalentRate = function (r, m, q) {
        var ppx = 1 + (r / m);
        var ppy = (m / q);
        var pp = Math.pow(ppx, ppy);
        return q * (pp - 1);
    };
    LoanEngine.paymentPerPeriod = function (p, r, n) {
        var nn = r * Math.pow((1 + r), n);
        var dd = Math.pow((1 + r), n) - 1;
        var a = p * nn / dd;
        return a;
    };
    LoanEngine.estimatedInterest = function (p, r, n) {
        var mp = this.paymentPerPeriod(p, r, n);
        var totalPaid = mp * n;
        return totalPaid - p;
    };
    LoanEngine.amortizationStats = function (results) {
        var stats = {
            actualInterest: 0.0,
            totalPaid: 0.0,
            actualPayments: results.length
        };
        for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
            var r = results_1[_i];
            stats.actualInterest += r.interestPayment;
            stats.totalPaid += r.payment;
        }
        return stats;
    };
    LoanEngine.amortizationSchedule = function (inputs) {
        var result = [];
        var r = inputs.rate;
        if (inputs.compoundPerYear != inputs.paymentPerYear) {
            r = this.equivalentRate(inputs.rate, inputs.compoundPerYear, inputs.paymentPerYear);
        }
        var ratePerPeriod = r / inputs.paymentPerYear;
        var monthlyPayment = this.paymentPerPeriod(inputs.principle, ratePerPeriod, inputs.totalPayments);
        // Add in specific extra monthly payment
        monthlyPayment += inputs.extraMonthlyPayment;
        var actualPayments = 0;
        var totalInterest = 0;
        var priorPrinciple = inputs.principle;
        var extraPayments = this.toExtraPaymentDict(inputs.extraPayments);
        for (var x = 1; x < inputs.totalPayments + 1; x++) {
            var payment = monthlyPayment;
            // Add in extra payment at some interval.
            if (extraPayments.hasOwnProperty(x)) {
                payment += extraPayments[x];
            }
            var interestPayment = ratePerPeriod * priorPrinciple;
            totalInterest += interestPayment;
            var principlePayment = payment - interestPayment;
            var newPrinciple = priorPrinciple - principlePayment;
            // If the new balance is zero, then it is an early payoff. Back out of the negative amount from
            // the payment.
            if (newPrinciple < 0) {
                payment += newPrinciple;
                principlePayment += newPrinciple;
                newPrinciple = 0;
            }
            result.push({
                period: x,
                payment: payment,
                interestPayment: interestPayment,
                principlePayment: principlePayment,
                principle: newPrinciple
            });
            actualPayments += 1;
            priorPrinciple = newPrinciple;
            if (newPrinciple == 0) {
                break;
            }
        }
        return result;
    };
    LoanEngine.toExtraPaymentDict = function (extraPayments) {
        var result = {};
        for (var x = 0; x < extraPayments.length; x++) {
            result[extraPayments[x].month] = extraPayments[x].amount;
        }
        return result;
    };
    return LoanEngine;
}());
