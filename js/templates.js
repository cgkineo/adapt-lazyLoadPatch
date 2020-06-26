define([
    'core/js/adapt',
    'handlebars',
    './templateRenderEvent'
], function(Adapt, Handlebars, TemplateRenderEvent) {

    /**
     * Adds template and partial, preRender and postRender events to Adapt
     */

    function onRender(cb) {
        var intercept = function(object, name, mode, cb) {
            return (object[name] = cb.bind(object, object[name], name, mode));
        };
        Object.keys(window.Handlebars.templates).forEach(function(name) {
            intercept(window.Handlebars.templates, name, 'template', cb);
        });
        Object.keys(Handlebars.partials).forEach(function(name) {
            intercept(Handlebars.partials, name, 'partial', cb);
        });
    }

    onRender(function(template, name, mode) {
        var args = Array.prototype.slice.call(arguments, 3);
        // Send preRender event to allow modification of args
        var preRenderEvent = new TemplateRenderEvent(mode + ':preRender', name, mode, null, args);
        Adapt.trigger(preRenderEvent.type, preRenderEvent);

        // Execute template
        var value = template.apply(this, preRenderEvent.args);

        // Send postRender event to allow modification of rendered template
        var postRenderEvent = new TemplateRenderEvent(mode + ':postRender', name, mode, value, preRenderEvent.args);
        Adapt.trigger(postRenderEvent.type, postRenderEvent);

        // Return rendered, modified template
        return postRenderEvent.value;
    });

});
