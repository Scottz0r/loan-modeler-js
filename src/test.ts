/// <reference path="./loan_engine.ts" />

let ai: AmortizationInputs = {
    principle: 252_000,
    rate: 0.0285,
    compoundPerYear: 12,
    paymentPerYear: 12,
    totalPayments: 240,
    extraMonthlyPayment: 50,
    extraPayments: []
}

let result = amortizationSchedule(ai);

for(let r of result) {
    console.log(r);
}
