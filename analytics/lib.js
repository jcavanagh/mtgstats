/* global _ */
//Stats are fun!

//Factorial
//TODO: Memoize
this.factorial = function(n) {
    var result = 1;
    for (var i = 2; i <= n; i++) {
        result *= i;
    }

    return result;
};

//Binomial coefficient
//From a set of size n, return number of distinct subsets of size k
//Positive integers only
this.binomialCoeff = function(n, k) {
    if(k === 0 || n === k) {
        return 1;
    }

    if(k > n) {
        return 0;
    }

    return this.factorial(n) / (this.factorial(k) * this.factorial(n - k));
};

//Multiset coefficient
this.multisetCoeff = function(n, k) {
    return this.binomialCoeff(n + k - 1, k);
}

//Hypergeometric, equal to target successes
this.hyp = function(pop, pSuc, sample, tSuc) {
    return ( this.binomialCoeff(pSuc, tSuc) * this.binomialCoeff(pop - pSuc, sample - tSuc) ) / this.binomialCoeff(pop, sample);
};

//Hypergeometric, less than target successes
this.hyplt = function(pop, pSuc, sample, tSuc) {
    return _.reduce(_.range(tSuc), function(sum, i) {
        return sum + this.hyp(pop, pSuc, sample, i);
    }, 0);
};

//Hypergeometric, less than or equal to target successes
this.hyplte = function(pop, pSuc, sample, tSuc) {
    return _.reduce(_.range(tSuc + 1), function(sum, i) {
        return sum + this.hyp(pop, pSuc, sample, i);
    }, 0);
};

//Hypergeometric, greater than target successes
this.hypgt = function(pop, pSuc, sample, tSuc) {
    return _.reduce(_.range(tSuc + 1, sample + 1), function(sum, i) {
        return sum + this.hyp(pop, pSuc, sample, i);
    }, 0);
};

//Hypergeometric, greater than or equal to target successes
this.hypgte = function(pop, pSuc, sample, tSuc) {
    return _.reduce(_.range(tSuc, sample + 1), function(sum, i) {
        return sum + this.hyp(pop, pSuc, sample, i);
    }, 0);
};

//Exports
module.exports = this;