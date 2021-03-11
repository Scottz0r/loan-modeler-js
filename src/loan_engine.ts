interface ExtraPayment {
    month: number,
    amount: number
}

interface AmortizationInputs {
    principle: number,
    rate: number,
    compoundPerYear: number,
    paymentPerYear: number,
    totalPayments: number,
    extraMonthlyPayment: number,
    extraPayments: Array<ExtraPayment>
}

interface AmortizationResult {
    period: number,
    payment: number,
    interestPayment: number,
    principlePayment: number,
    principle: number
}

class LoanEngine
{
    static equivalentRate(r: number, m: number, q: number): number {
        let ppx = 1 + (r / m);
        let ppy = (m / q);
    
        let pp = Math.pow(ppx, ppy);
    
        return q * (pp - 1);
    }
    
    static paymentPerPeriod(p: number, r: number, n: number): number {
        let nn = r * Math.pow((1 + r), n);
        let dd = Math.pow((1 + r), n) - 1;
    
        let a = p * nn / dd;
    
        return a;
    }
    
    // TODO: This should convert rate to payment frequency.
    static estimatedInterest(p: number, r: number, n: number): number {
        let mp = this.paymentPerPeriod(p, r, n);
        let totalPaid = mp * n;
        return totalPaid - p;
    }

    static amortizationStats(results: Array<AmortizationResult>) {
        let stats = {
            actualInterest: 0.0,
            totalPaid: 0.0,
            actualPayments: results.length
        };

        for (const r of results) {
            stats.actualInterest += r.interestPayment;
            stats.totalPaid += r.payment;
        }

        return stats;
    }

    static amortizationSchedule(inputs: AmortizationInputs): Array<AmortizationResult> {
        let result: Array<AmortizationResult> = [];
    
        let r = inputs.rate;
    
        if (inputs.compoundPerYear != inputs.paymentPerYear) {
            r = this.equivalentRate(inputs.rate, inputs.compoundPerYear, inputs.paymentPerYear);
        }
    
        let ratePerPeriod = r / inputs.paymentPerYear;
        let monthlyPayment = this.paymentPerPeriod(inputs.principle, ratePerPeriod, inputs.totalPayments);
    
        // Add in specific extra monthly payment
        monthlyPayment += inputs.extraMonthlyPayment;
    
        let actualPayments = 0;
        let totalInterest = 0;
        let priorPrinciple = inputs.principle;
    
        var extraPayments = this.toExtraPaymentDict(inputs.extraPayments);
    
        for (let x = 1; x < inputs.totalPayments + 1; x++) {
            var payment = monthlyPayment;
    
            // Add in extra payment at some interval.
            if (extraPayments.hasOwnProperty(x)) {
                payment += extraPayments[x];
            }
    
            let interestPayment = ratePerPeriod * priorPrinciple;
    
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
                payment,
                interestPayment,
                principlePayment,
                principle: newPrinciple
            });
    
            actualPayments += 1;
            priorPrinciple = newPrinciple;
    
            if (newPrinciple == 0) {
                break;
            }
        }
    
        return result;
    }
    
    static toExtraPaymentDict(extraPayments: Array<ExtraPayment>): any {
        let result = {}
    
        for (let x = 0; x < extraPayments.length; x++) {
            result[extraPayments[x].month] = extraPayments[x].amount;
        }
    
        return result;
    }    
}
