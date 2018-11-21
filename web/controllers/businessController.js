var express = require('express');
var bodyParser = require('body-parser');
var Business = require('../models/business');

var async = require('async');

// Display Business create form on GET.
exports.business_create_get = function(req, res, next) {
    console.log("req.user.id")
    console.log(req.user.id)
    res.render('icoCreate', {
        title: 'Launch ICO',
        user: req.user
    });
};

//Display Business profile
exports.business_profile_page = function(req, res, next) {
    async.parallel({
        business: function(callback) {
            Business.findById(req.params.id)
                .exec(callback)
        },
    }, function(err, results) {
        if (err) {
            return next(err);
        } // Error in API usage.
        if (results.business == null) { // No results.
            var err = new Error('Business not found');
            err.status = 404;
            return next(err);
        }
        res.render('businessProfile', {
            businessName: results.business.businessName,
            businessDescription: results.business.businessDescription,
            email: results.business.email,
            tokens: results.business.tokens,
            tokenPrice: results.business.tokenPrice,
            startDate: results.business.startDate,
            endDate: results.business.endDate,
            tokenName: results.business.tokenName,
            tokenDescription: results.business.tokenDescription,
            user: "99",
        });
    });
}
exports.business_profile_page_details = function(req, res, next) {
    async.parallel({
        business: function(callback) {
            Business.findById(req.params.id)
                .exec(callback)
        },
    }, function(err, results) {
        console.log(results)
        if (err) {
            return next(err);
        } // Error in API usage.
        if (results.business == null) { // No results.
            var err = new Error('Business not found');
            err.status = 404;
            return next(err);
        }
        res.json(results)
    });
}

// Display Business create form on POST.
exports.business_create_post = function(req, res, next) {
    var business = new Business({
        businessName: req.body.businessName,
        businessDescription: req.body.businessDescription,
        email: req.body.email,
        tokenName: req.body.tokenName,
        tokens: req.body.tokensGenerate,
        tokenPrice: req.body.tokenPrice,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        tokenDescription: req.body.tokenDescription,
        user: req.user.id,
    });
    // Data from form is valid. Save Business.
    business.save(function(err) {
        if (err) {
            return next(err);
        }
        //successful - redirect to new Business record.
        res.redirect('/businessprofile/' + business.id);
    });
};
exports.business_update_get = function(req, res, next) {
    console.log("working 1")
};
exports.business_update_post = function(req, res, next) {
    console.log("working 2")
};
