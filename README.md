# IonRangeSlider for Mendix - Version 1

This widget is a wrapper for the [Ion Range Slider](http://ionden.com/a/plugins/ion.rangeSlider/en.html) library allowing a developer to create sliders within their application.

## Contributing

For more information on contributing to this repository visit [Contributing to a GitHub repository](https://world.mendix.com/display/howto50/Contributing+to+a+GitHub+repository)!

## Typical usage scenario

Where you need a slider to select a value or a raneg of values.

# Widgets

There are two available widgets:
**IonRangeSlider (Context Object)** Creates a slider of integer values using configuration based on attributes within the context object
**IonRangeSlider (Associated Objects)** Creates a slider of integer, decimal or string values using configuration based on objects associated to the context object

# Features
- Supports sliders with single (from) or double (from and to) handles.
- Set limits on the available range a handle can use.
- Render the control as disabled or hidden, using a static parameter on the widget or controlled from a boolean attribute.

# Configuration - IonRangeSlider (Context Object)

## Data Source
- **Slider Type**: The type of slider to create.
- **From**: The integer attribute in the context object holding the value for the left handle (or the single handle).
- **To**: The integer attribute in the context object holding the value for the right handle.
- **Min (Default)**: The default minimum value to be displayed on the slider
- **Min**: The attribute holding the minimum value to be displayed on the slider (overrides the default)
- **Max (Default)**: The default maximum value to be displayed on the slider
- **Max**: The attribute holding the maximum value to be displayed on the slider (overrides the default)
- **Step (Default)**: The default step value to be used on the slider
- **Step**: The attribute holding the step value to be used on the slider (overrides the default)

## Movement Limits (From)
- **Limit From Movement**: Whether to limit the movement of the from handle or not
- **From Minimum (Default)**: The default minimum allowed value for the From handle
- **From Minimum**: The attribute holding the minimum allowed value for the From handle (overrides the default)
- **From Maximum (Default)**: The default maximum allowed value for the From handle
- **From Maximum**: The attribute holding the maximum allowed value for the From handle (overrides the default)
- **Show From Shadow**: Whether to display a shadow to indicate the allowed range or not

## Movement Limits (To)
- **Limit To Movement**: Whether to limit the movement of the To handle or not
- **To Minimum (Default)**: The default minimum allowed value for the To handle
- **To Minimum**: The attribute holding the minimum allowed value for the To handle (overrides the default)
- **To Maximum (Default)**: The default maximum allowed value for the To handle
- **To Maximum**: The attribute holding the maximum allowed value for the To handle (overrides the default)
- **Show From Shadow**: Whether to display a shadow to indicate the allowed range or not

## Display
- **Show Grid**: Whether to display grid lines within the slider or not.
- **Prefix**: The text to be displayed before the slider values.
- **Postfix**: The text to be displayed after the slider values.
- **Disabled**: Whether to render the control in a disabled state or not.
- **Disabled via attribute**: An optional parameter. If populated will use the selected boolean attribute to render the control in a disabled state or not (true = disabled). This property overrides the 'Disabled' parameter.
- **Visible**: Whether to render the control visible or not.
- **Visible via attribute**: An optional parameter. If populated will use the selected boolean attribute to render the control visible or not (true = visible). This property overrides the 'Visible' parameter.

# Configuration - IonRangeSlider (Associated Objects)

## Data Source
- **Slider Type**: The type of slider to create.
- **Value Entity**: The entity holding the values to be used for the slider.
- **XPath Constraint**: The constraint to apply when retrieving values for the slider.
- **Value Attribute**: The integer, decimal or string attribute that holds the display value for each slider value.
- **Sort Order**: The sort order to apply when retrieving values for the slider.
- **From Association**: The association to the object (must be the same type as 'Value Entity') holding the value for the left handle (or the single handle).
- **To Association**:  The association to the object (must be the same type as 'Value Entity') holding the value for the right handle.

## Movement Limits (From)
- **Limit From Movement**: Whether to limit the movement of the from handle or not
- **From Minimum (Default)**: The default minimum allowed value for the From handle
- **From Minimum**: The attribute holding the minimum allowed value for the From handle (overrides the default)
- **From Maximum (Default)**: The default maximum allowed value for the From handle
- **From Maximum**: The attribute holding the maximum allowed value for the From handle (overrides the default)
- **Show From Shadow**: Whether to display a shadow to indicate the allowed range or not

## Movement Limits (To)
- **Limit To Movement**: Whether to limit the movement of the To handle or not
- **To Minimum (Default)**: The default minimum allowed value for the To handle
- **To Minimum**: The attribute holding the minimum allowed value for the To handle (overrides the default)
- **To Maximum (Default)**: The default maximum allowed value for the To handle
- **To Maximum**: The attribute holding the maximum allowed value for the To handle (overrides the default)
- **Show From Shadow**: Whether to display a shadow to indicate the allowed range or not

## Display
- **Show Grid**: Whether to display grid lines within the slider or not.
- **Prefix**: The text to be displayed before the slider values.
- **Postfix**: The text to be displayed after the slider values.
- **Disabled**: Whether to render the control in a disabled state or not.
- **Disabled via attribute**: An optional parameter. If populated will use the selected boolean attribute to render the control in a disabled state or not (true = disabled). This property overrides the 'Disabled' parameter.
- **Visible**: Whether to render the control visible or not.
- **Visible via attribute**: An optional parameter. If populated will use the selected boolean attribute to render the control visible or not (true = visible). This property overrides the 'Visible' parameter.

# Known Issues

See [here](https://github.com/lindski/IonRangeSlider/issues) for all outstanding issues or to raise a new issue, enhancement etc.