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

    Configuration based on associated objects
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

    return declare("IonRangeSlider.widget.AssociatedObjectIonRangeSlider", [ _WidgetBase, _TemplatedMixin ], {

        templateString: widgetTemplate,

        widgetBase: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,
        _isValid : null,
        _sortParams: null,
        _fromReference : null,
        _fromEntity : null,
        _toReference : null,
        _toEntity : null,
        _$input : null,
        _slider : null,
        _valueGuids : null,

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");

            this._fromReference = this.fromAssociation.split('/')[0];
            this._fromEntity = this.fromAssociation.split('/')[1];

            this._toReference = this.toAssociation.split('/')[0];
            this._toEntity = this.toAssociation.split('/')[1];

            // issues with the sort parameters being persisted between widget instances mean we set the sort array to empty.
            this._sortParams = [];
            // create our sort order array
            for(var i=0;i<this._sortContainer.length;i++) {
                var item = this._sortContainer[i];
                this._sortParams.push([item.sortAttribute, item.sortOrder]);
            }

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
            this._sortParams = [];
        },

        // Attach events to HTML dom elements
        _validateWidget: function() {
            logger.debug(this.id + "._validateWidget");
            var valid = true;

            if(!this.toAssociation && this.sliderType==="double"){
                valid = false;
                logger.error(this.id + ": 'Data Source/To Association' must be specified with a double slider type.");
            }

            if( this._fromEntity != this.valueEntity ){
                valid = false;
                logger.error(this.id + ": 'Data Source/Value Entity' and 'Data Source/From Association' must resolve to the same entity.");                        
            }
            else if( this._fromEntity != this._toEntity && this.sliderType==="double"){
                valid = false;
                logger.error(this.id + ": 'Data Source/From Association' and 'Data Source/To Association' must resolve to the same entity.");
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

                this._loadSliderValues(callback);
            } else {
                dojoStyle.set(this.domNode, "display", "none");
                this._executeCallback(callback, "_updateRendering");
            } 
        },

        _getSliderOptions : function(obj){
            var options = this._getCommonSliderOptions(obj);
            
            var from = this._valueGuids.indexOf(obj.get(this._fromReference));
            if( from >= 0 ){
                options.from = from;
            }
            
            var to = this._valueGuids.indexOf(obj.get(this._toReference));
            if( to >= 0 ){
                options.to = to;
            }

            var self = this;
            options.onFinish = function (data) {
                var currentFrom = self._valueGuids.indexOf(obj.get(self._fromReference));
                if( data.from != currentFrom){
                    obj.addReference(self._fromReference,self._valueGuids[data.from]);
                }

                if( self.sliderType === "double"){
                    var currentTo = self._valueGuids.indexOf(obj.get(self._toReference));
                    if( data.to != currentTo){
                        obj.addReference(self._toReference,self._valueGuids[data.to]);
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
                options.from_min = this.fromMinimum ? obj.get(this.fromMinimum) : this.fromMinimumDefault;
                options.from_max = this.fromMaximum ? obj.get(this.fromMaximum) : this.fromMaximumDefault;
                options.from_shadow = this.fromShadow;
            }

            if( this.applyToMovementLimit ){
                options.to_min = this.toMinimum ? obj.get(this.toMinimum) : this.toMinimumDefault;
                options.to_max = this.toMaximum ? obj.get(this.toMaximum) : this.toMaximumDefault;
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
            
            return options;
        },  
        
        // retrieves the data from the entity, applying the required constraint
        _loadSliderValues: function (callback) {            
            // reset our data
            var xpath = '//' + this.valueEntity + this.valueConstraint.replace('[%CurrentObject%]', this._contextObj.getGuid());
            mx.data.get({
                xpath: xpath,
                filter: {
                    sort: this._sortParams,
                    offset: 0
                },
                callback: dojoLang.hitch(this, function(objs){
                    this._processSliderValues(objs, callback);
                })
            });
        },
        
        // retrieves the data from the entity, applying the required constraint
        _processSliderValues: function (objs, callback) {
            this._valueGuids = [];
            var values = [];

            for(var i = 0; i < objs.length; i++){
                var obj = objs[i];
                var value = obj.get(this.valueAttribute);
                values.push(value);
                this._valueGuids.push(obj.getGuid());
            }

            var options = this._getSliderOptions(this._contextObj);
            options.values = values;
            
            if( !this._slider){
                this._$input.ionRangeSlider(options);
                this._slider = this._$input.data("ionRangeSlider");
            }
            else{
                this._slider.update(options);
            }
            
            this._executeCallback(callback, "_processSliderValues");
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

                var fromAssociationHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this._fromReference,
                    callback: dojoLang.hitch(this, function(guid, attr, attrValue) {
                        var options = {};
                        var from = this._valueGuids.indexOf(this._contextObj.get(this._fromReference));
                        if( from >= 0 ){
                            options.from = from;
                        }

                        this._slider.update(options);
                    })
                });
                this._handles.push(fromAssociationHandle);

                var toAssociationHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this._toReference,
                    callback: dojoLang.hitch(this, function(guid, attr, attrValue) {
                        var options = {};
                        var to = this._valueGuids.indexOf(this._contextObj.get(this._toReference));
                        if( to >= 0 ){
                            options.to = to;
                        }

                        this._slider.update(options);
                    })
                });
                this._handles.push(toAssociationHandle);
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

require(["IonRangeSlider/widget/AssociatedObjectIonRangeSlider"]);
