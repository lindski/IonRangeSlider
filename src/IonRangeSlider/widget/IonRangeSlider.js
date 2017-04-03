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
        _valueEntity : null,
        _fromReference : null,
        _fromEntity : null,
        _toReference : null,
        _toEntity : null,
        _$input : null,

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");

            this._valueReference = this.valueAssociation.split('/')[0];
            this._valueEntity = this.valueAssociation.split('/')[1];

            this._fromReference = this.fromAssociation.split('/')[0];
            this._fromEntity = this.fromAssociation.split('/')[1];

            this._toReference = this.toAssociation.split('/')[0];
            this._toEntity = this.toAssociation.split('/')[1];

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
                    if(!this.valueAssociation){
                        valid = false;
                        logger.error(this.id + ": 'Association Config/Value Association' must be specified with an association data source");
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

                    if( (this._fromEntity != this._toEntity) && (this._fromEntity != this._valueEntity)){
                        valid = false;
                        logger.error(this.id + ": 'Association Config/Value Association', Association Config/From Association', Association Config/To Association' must all resolve to the same entity.");
                    }
                    break;
                default:
                    valid = false;
                    logger.error(this.id + ": Data Source type '" + this.dataSource + "' not valid.");
                    break;
            }

            return valid;
        },

        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");
            var self = this;

            if (this._contextObj !== null && this._isValid) {
                dojoStyle.set(this.domNode, "display", "block");

                if(this.valueLoadMicroflow){
                    this._execMf(this._contextObj.getGuid(), this.valueLoadMicroflow, function(objs){
                        var values = objs.map(function(obj){
                            return obj.get(self.valueAttribute);
                        })

                        var options = self._getSliderOptions(self._contextObj);
                        options.values = values;

                        self._$input.ionRangeSlider(options);
                    })
                }else{
                    this._$input.ionRangeSlider(this._getSliderOptions(this._contextObj));
                }
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

        }
    });
});

require(["IonRangeSlider/widget/IonRangeSlider"]);
