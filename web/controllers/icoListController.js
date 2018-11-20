var express = require('express');
var bodyParser = require('body-parser');
var Business = require('../models/business');

var async = require('async');

// Display Business create form on GET.
exports.ongoing_ico_list_page = function(req, res, next) {
    Business.find()
        .exec(function(err, list_icos) {
            if (err) {
                return next(err);
            }
            //Successful, so render
            res.render('icoListing-ongoing', {
                title: 'Business Profile',
                icos: list_icos
            });
        });
}
// Display Business create form on GET.
exports.upcoming_ico_list_page = function(req, res, next) {
    Business.find()
        .exec(function(err, list_icos) {
            if (err) {
                return next(err);
            }
            //Successful, so render
            res.render('icoListing-upcoming', {
                title: 'Business Profile',
                icos: list_icos
            });
        });
}
// Display Business create form on GET.
exports.past_ico_list_page = function(req, res, next) {
    Business.find()
        .exec(function(err, list_icos) {
            if (err) {
                return next(err);
            }
            //Successful, so render
            res.render('icoListing-past', {
                title: 'Business Profile',
                icos: list_icos
            });
        });
}
// Display Business create form on GET.
exports.all_ico_list_page = function(req, res, next) {
    Business.find()
        .exec(function(err, list_icos) {
            if (err) {
                return next(err);
            }
            //Successful, so render
            res.render('icoListing-all', {
                title: 'Business Profile',
                icos: list_icos
            });
        });
}
