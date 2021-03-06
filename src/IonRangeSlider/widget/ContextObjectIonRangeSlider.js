/*global logger*/
/*
    IonRangeSlider
    ========================

    @file      : IonRangeSlider.js
    @version   : 2.1.0
    @author    : Iain Lindsay
    @date      : 2017-08-17
    @copyright : AuraQ Limited 2016
    @license   : Apache v2

    Documentation
    ========================
    This widget is a wrapper for the Ion Range Slider
    http://ionden.com/a/plugins/ion.rangeSlider/en.html

    Configuration based on the context object
*/
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "IonRangeSlider/lib/jquery-1.11.2",
    "IonRangeSlider/lib/ion.rangeSlider",
    "dojo/text!IonRangeSlider/widget/template/IonRangeSlider.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, _jQuery, _rangeSlider, widgetTemplate) {
    "use strict";

    var $ = _jQuery.noConflict(true);
    $ = _rangeSlider.createInstance($);

    return declare("IonRangeSlider.widget.ContextObjectIonRangeSlider", [ _WidgetBase, _TemplatedMixin ], {

        templateString: widgetTemplate,

        widgetBase: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,
        _isValid : null,
        _$input : null,
        _slider : null,

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");

            dom.addCss(require.toUrl("IonRangeSlider/lib/css/ion.rangeSlider.css"));
            dom.addCss(require.toUrl("IonRangeSlider/lib/css/normalize.css"));
            dom.addCss(require.toUrl("IonRangeSlider/lib/css/ion.rangeSlider.skinHTML5.css"));
            this._$input = $('#' + this.id + ' .rangeSliderInput'); 

            // validate the widget        
            this._isValid = this._validateWidget();
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering(callback);
        },

        resize: function (box) {
          logger.debug(this.id + ".resize");
        },

        uninitialize: function () {
          logger.debug(this.id + ".uninitialize");
        },

        // Attach events to HTML dom elements
        _validateWidget: function() {
            logger.debug(this.id + "._validateWidget");
            var valid = true;

            if(!this.to && this.sliderType==="double"){
                valid = false;
                logger.error(this.id + ": 'Data Source/To' must be specified");
            }

            return valid;
        },

        _updateSliderVisibility : function(){
            // fixed property gets checked first
            if(this.visible){
                if (dojoClass.contains(this.domNode, 'hidden')) {
                    dojoClass.remove(this.domNode, 'hidden');
                }
            } else {
                if (!dojoClass.contains(this.domNode, 'hidden')) {
                    dojoClass.add(this.domNode, 'hidden');
                }
            }

            // attribute property beats fixed property
            if(this.visibleViaAttribute ){
                if(this._contextObj.get(this.visibleViaAttribute)){
                    if (dojoClass.contains(this.domNode, 'hidden')) {
                        dojoClass.remove(this.domNode, 'hidden');
                    } 
                } else {
                    if (!dojoClass.contains(this.domNode, 'hidden')) {
                        dojoClass.add(this.domNode, 'hidden');
                    }
                }
            }
        },

        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");
            var self = this;

            if (this._contextObj !== null && this._isValid) {
                dojoStyle.set(this.domNode, "display", "block");
                this._updateSliderVisibility();

                var options = this._getSliderOptions(this._contextObj);
                if( !this._slider){
                    this._$input.ionRangeSlider(options);
                    this._slider = this._$input.data("ionRangeSlider");
                }
                else{
                    this._slider.update(options);
                }

            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }
            
            this._executeCallback(callback, "_updateRendering");
        },

        _getSliderOptions : function(obj){
            var options = this._getCommonSliderOptions(obj);
            options.min = this.min ? parseInt(obj.get(this.min)) : this.minDefault;
            options.max = this.max ? parseInt(obj.get(this.max)) : this.maxDefault;
            if( this.from ){
                options.from = parseInt(obj.get(this.from));
            }

            if( this.sliderType === "double"){
                options.to = parseInt(obj.get(this.to));
            }
            
            options.step = this.step ? parseInt(obj.get(this.step)) : this.stepDefault;  

            var self = this;
            options.onFinish = function (data) {
                var currentFrom = parseInt(obj.get(self.from));
                var dataFrom = parseInt(data.from);
                if( dataFrom != currentFrom){
                    obj.set(self.from, dataFrom);
                }
                if( self.sliderType === "double"){
                    var currentTo = parseInt(obj.get(self.to));
                    var dataTo = parseInt(data.to);
                    if( dataTo != currentTo){
                        obj.set(self.to, dataTo);
                    }
                }  
                
                if(self.onValueChangeMicroflow){
                    self._execMf(self._contextObj.getGuid(), self.onValueChangeMicroflow, 
                        self.onValueChangeMicroflowShowProgress, self.onValueChangeMicroflowProgressMessage);
                }
            }
            
            return options;
        },

        _getCommonSliderOptions : function(obj){
            var options = {};
            options.type = this.sliderType;
            options.grid = this.showGrid;            
                        
            if( this.prefix ){
                options.prefix = this.prefix;
            }

            if( this.postfix ){
                options.postfix = this.postfix;
            }          

            if( this.applyFromMovementLimit ){
                options.from_min = this.fromMinimum ? parseInt(obj.get(this.fromMinimum)) : this.fromMinimumDefault;
                options.from_max = this.fromMaximum ? parseInt(obj.get(this.fromMaximum)) : this.fromMaximumDefault;
                options.from_shadow = this.fromShadow;
            }

            if( this.applyToMovementLimit ){
                options.to_min = this.toMinimum ? parseInt(obj.get(this.toMinimum)) : this.toMinimumDefault;
                options.to_max = this.toMaximum ? parseInt(obj.get(this.toMaximum)) : this.toMaximumDefault;
                options.to_shadow = this.toShadow;
            }

            // fixed property gets checked first
            if(this.disabled){
                options.disable = true;
            } else{
                options.disable = false;
            }

            // attribute property beats fixed property    
            if(this.disabledViaAttribute){
                if(this._contextObj.get(this.disabledViaAttribute) ){
                    options.disable = true;
                } else{
                    options.disable = false;
                }
            }

            options.prettify_enabled = this.prettifyNumbers;
            
            return options;
        },

        // Reset subscriptions.
        _resetSubscriptions: function() {
            logger.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            if (this._handles) {
                dojoArray.forEach(this._handles, function (handle) {
                    mx.data.unsubscribe(handle);
                });
                this._handles = []; 
            }

            // When a mendix object exists create subscriptions.
            if (this._contextObj) {
                var objectHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: dojoLang.hitch(this, function(guid) {
                        this._updateRendering();
                    })
                });

                this._handles.push(objectHandle);

                var fromAttributeHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.from,
                    callback: dojoLang.hitch(this, function(guid, attr, attrValue) {
                        var options = {};
                        options.from = parseInt(this._contextObj.get(this.from));
                        this._slider.update(options);
                    })
                });
                this._handles.push(fromAttributeHandle);

                var toAttributeHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.to,
                    callback: dojoLang.hitch(this, function(guid, attr, attrValue) {
                        var options = {};
                        options.to = parseInt(this._contextObj.get(this.to));
                        this._slider.update(options);
                    })
                });
                this._handles.push(toAttributeHandle);
            }
        },

        _execMf: function (guid, mf, cb, showProgress, message) {
            var self = this;
            if (guid && mf) {                
                var options = {
                    params: {
                        applyto: 'selection',
                        actionname: mf,
                        guids: [guid]
                    },
                    callback: function (objs) {
                        if (cb) {
                            cb(objs);
                        }
                    },
                    error: function (e) {
                        logger.error('Error running Microflow: ' + e);
                    }
                }

                if(showProgress){                    
                    options.progress = "modal";
                    options.progressMsg = message;
                }

                mx.ui.action(mf,options, this);
            }
        },

        // Shorthand for executing a callback, adds logging to your inspector
        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["IonRangeSlider/widget/ContextObjectIonRangeSlider"]);
