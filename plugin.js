'use strict';

(function () {
    CKEDITOR.plugins.add('mustache_placeholder', {
        requires: 'widget,dialog',
        lang: 'en',
        icons: 'mustache_placeholder',
        hidpi: true,

        onLoad: function () {
            // Register styles for placeholder widget frame.
            CKEDITOR.addCss('.cke_mustache_placeholder{border:1px dashed #CCCCCC}');
        },

        init: function (editor) {

            var lang = editor.lang.mustache_placeholder;

            // Register dialog.
            CKEDITOR.dialog.add('mustache_placeholder', this.path + 'dialogs/mustache_placeholder.js');

            // Put ur init code here.
            editor.widgets.add('mustache_placeholder', {
                // Widget code.
                dialog: 'mustache_placeholder',
                pathName: lang.pathName,
                // We need to have wrapping element, otherwise there are issues in
                // add dialog.
                template: '<span class="cke_mustache_placeholder"></span>',

                downcast: function () {
                    var downcasted = '{{' + this.data.name + '}}';
                    return new CKEDITOR.htmlParser.text(downcasted);
                },

                init: function () {
                    // Note that placeholder markup characters are stripped for the name.
                    var value = this.element.getText().slice(2, -2);
                    this.setData('name', value);
                },

                data: function () {
                    var text = '{{' + this.data.name + '}}';
                    this.element.setText(text);
                },

                getLabel: function () {
                    var label = this.editor.lang.widget.label.replace(/%1/, this.data.name + ' ' + this.pathName);
                    return label;
                }
            });

            editor.ui.addButton && editor.ui.addButton('CreateMustachePlaceholder', {
                label: lang.toolbar,
                command: 'mustache_placeholder',
                toolbar: 'insert,6',
                icon: 'mustache_placeholder'
            });
        },

        afterInit: function (editor) {
            var placeholderReplaceRegex = /{{.+?}}/g;

            editor.dataProcessor.dataFilter.addRules({
                text: function (text, node) {
                    var dtd = node.parent && CKEDITOR.dtd[node.parent.name];

                    // Skip the case when placeholder is in elements like <title> or <textarea>
                    // but upcast placeholder in custom elements (no DTD).
                    if (dtd && !dtd.span)
                        return;

                    return text.replace(placeholderReplaceRegex, function (match) {
                        // Creating widget code.
                        var widgetWrapper = null,
                            innerElement = new CKEDITOR.htmlParser.element('span', {
                                'class': 'cke_mustache_placeholder'
                            });

                        // Adds placeholder identifier as innertext.
                        innerElement.add(new CKEDITOR.htmlParser.text(match));
                        widgetWrapper = editor.widgets.wrapElement(innerElement, 'mustache_placeholder');

                        // Return outerhtml of widget wrapper so it will be placed
                        // as replacement.
                        return widgetWrapper.getOuterHtml();
                    });
                }
            });
        }
    });
})();