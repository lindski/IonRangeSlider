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

    return declare("IonRangeSlider.widget.IonRangeSlider", [ _WidgetBase, _TemplatedMixin ], {

        templateString: widgetTemplate,


        widgetBase: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,
        _isValid : null,
        _sortParams: null,
        _valueReference : null,
        _fromReference : null,
        _fromEntity : null,
        _toReference : null,
        _toEntity : null,
        _$input : null,
        _slider : null,

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

            switch( this.dataSource){
                case "attribute":
                    if(!this.from){
                        valid = false;
                        logger.error(this.id + ": 'Attribute Config/From' must be specified with an attribute data source");
                    }
                    if(!this.to && this.sliderType==="double"){
                        valid = false;
                        logger.error(this.id + ": 'Attribute Config/To' must be specified with an attribute data source and a double slider type");
                    }
                    break;
                case "association":
                    if(!this.valueEntity){
                        valid = false;
                        logger.error(this.id + ": 'Association Config/Value Entity' must be specified with an association data source");
                    }

                    if(!this.valueAttribute){
                        valid = false;
                        logger.error(this.id + ": 'Association Config/Value Attribute' must be specified with an association data source");
                    }

                    if(!this.fromAssociation){
                        valid = false;
                        logger.error(this.id + ": 'Association Config/From Association' must be specified with an association data source");
                    }

                    if(!this.toAssociation && this.sliderType==="double"){
                        valid = false;
                        logger.error(this.id + ": 'Association Config/To Association' must be specified with an association data source and a double slider type");
                    }

                    if( this._fromEntity != this.valueEntity ){
                        valid = false;
                        logger.error(this.id + ": 'Association Config/Value Entity' and 'Association Config/From Association' must resolve to the same entity.");                        
                    }
                    else if( this._fromEntity != this._toEntity && this.sliderType==="double"){
                        valid = false;
                        logger.error(this.id + ": 'Association Config/From Association' and 'Association Config/To Association' must resolve to the same entity.");
                    }                    
                    break;
                default:
                    valid = false;
                    logger.error(this.id + ": Data Source type '" + this.dataSource + "' not valid.");
                    break;
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

                var options = this._getSliderOptions(this._contextObj);
                
                if(this.dataSource === "attribute"){       
                    if( !this._slider){
                        this._$input.ionRangeSlider(options);
                        this._slider = this._$input.data("ionRangeSlider");
                    }
                    else{
                        this._slider.update(options);
                    }                    
                } else if(this.dataSource === "association"){
                    console.log("Association source not implemented.")
                    /*var values = objs.map(function(obj){
                            return obj.get(self.valueAttribute);
                        })

                        var options = self._getSliderOptions(self._contextObj);
                        options.values = values;

                        self._$input.ionRangeSlider(options);*/
                }

                this._updateSliderVisibility();

            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }            

            mendix.lang.nullExec(callback);
        },

        _getSliderOptions : function(obj){
            var self = this;
            var options = {};
            options.type = this.sliderType;
            options.min = this.min ? obj.get(this.min) : this.minDefault;
            options.max = this.max ? obj.get(this.max) : this.maxDefault;
            if( this.from ){
                options.from = obj.get(this.from);
            }

            if( this.to ){
                options.to = obj.get(this.to);
            }            

            options.grid = this.showGrid;
            
            options.step = this.step ? obj.get(this.step) : this.stepDefault;

            if( this.prefix ){
                options.prefix = this.prefix;
            }

            if( this.postfix ){
                options.postfix = this.postfix;
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

            options.onFinish = function (data) {
                var currentFrom = obj.get(self.from);
                if( data.from != currentFrom){
                    obj.set(self.from, data.from);
                }
                
                if( self.to ){                                
                    var currentTo = obj.get(self.to);
                    if( data.to != currentTo){
                        obj.set(self.to, data.to);
                    }
                }                
            }
            
            return options;
        },  
        
        // retrieves the data from the entity, applying the required constraint
        _loadSliderValues: function () {            
            // Important to clear all validations!
            this._clearValidations();
            
            // reset our data
            var xpath = '//' + this._entity + this.dataConstraint.replace('[%CurrentObject%]', this._contextObj.getGuid());
            mx.data.get({
                xpath: xpath,
                filter: {
                    sort: this._sortParams,
                    offset: 0
                },
                callback: dojoLang.hitch(this, this._processComboData)
            });
        },    

        _execMf: function (guid, mf, cb) {
            if (guid && mf) {
                mx.data.action({
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
                }, this);
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

                if(this.dataSource === "attribute"){
                    var fromAttributeHandle = this.subscribe({
                        guid: this._contextObj.getGuid(),
                        attr: this.from,
                        callback: dojoLang.hitch(this, function(guid, attr, attrValue) {
                            var options = {};
                            options.from = this._contextObj.get(this.from);
                            this._slider.update(options);
                        })
                    });
                    this._handles.push(fromAttributeHandle);

                    var toAttributeHandle = this.subscribe({
                        guid: this._contextObj.getGuid(),
                        attr: this.to,
                        callback: dojoLang.hitch(this, function(guid, attr, attrValue) {
                            var options = {};
                            options.to = this._contextObj.get(this.to);
                            this._slider.update(options);
                        })
                    });
                    this._handles.push(toAttributeHandle);
                }

                if(this.dataSource === "association"){
                    var fromAssociationHandle = this.subscribe({
                        guid: this._contextObj.getGuid(),
                        attr: this._fromReference,
                        callback: dojoLang.hitch(this, function(guid, attr, attrValue) {
                            this._updateRendering();
                        })
                    });
                    this._handles.push(fromAssociationHandle);

                    var toAssociationHandle = this.subscribe({
                        guid: this._contextObj.getGuid(),
                        attr: this._toReference,
                        callback: dojoLang.hitch(this, function(guid, attr, attrValue) {
                            this._updateRendering();
                        })
                    });
                    this._handles.push(toAssociationHandle);
                }
            }
        },
    });
});

require(["IonRangeSlider/widget/IonRangeSlider"]);
