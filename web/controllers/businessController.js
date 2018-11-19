var express = require('express');
var bodyParser = require('body-parser');
var Business = require('../models/business');

var async = require('async');

// Display Business create form on GET.
exports.business_create_get = function(req, res, next) {
    console.log(req.user)
    res.render('icoCreate', {
        title: 'Launch ICO',
        user: req.user
    });
};

// Display Business create form on POST.
exports.business_create_post = function(req, res, next) {
    var business = new Business({
        businessName: req.body.businessName,
        businessDescription: req.body.businessDescription,
        email: req.body.email,
        tokens: req.body.tokensGenerate,
        tokenPrice: req.body.tokenPrice,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        tokenDesctiption: req.body.tokenDesctiption,
        user: req.user.id,
    });
    console.log("======================business")
    console.log(req.user)
    // Data from form is valid. Save Business.
    business.save(function(err) {
        if (err) {
            return next(err);
        }
        //successful - redirect to new Business record.
        res.redirect('/profile/ico/' + business.id);
    });
};
exports.business_update_get = function(req, res, next) {
    console.log("working 1")
};
exports.business_update_post = function(req, res, next) {
    console.log("working 2")
};
