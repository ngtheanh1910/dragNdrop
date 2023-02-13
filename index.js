var theTree = [{
            "id": "animal",
            "parent": "#",
            "text": "Animals",
            "data": {
                "name": "Quick"
            },
            "type": "root"
        },
        {
            "id": "device",
            "parent": "#",
            "text": "Devices",
            "type": "root"
        },
        {
            "id": "dog",
            "parent": "animal",
            "text": "Dogs",
            "type": "file"
        },
        {
            "id": "lion",
            "parent": "animal",
            "text": "Lions",
            "type": "file"
        },
        {
            "id": "mobile",
            "parent": "device",
            "text": "Mobile Phones",
            "type": "file"
        },
        {
            "id": "lappy",
            "parent": "device",
            "text": "Laptops",
            "type": "file"
        },
        {
            "id": "doberman",
            "parent": "dog",
            "text": "Doberman"
        },
        {
            "id": "dalmation",
            "parent": "dog",
            "text": "Dalmatian"
        },
        {
            "id": "schnauzer",
            "parent": "dog",
            "text": "Schnauzer"
        },
        {
            "id": "african",
            "parent": "lion",
            "text": "African Lion"
        },
        {
            "id": "indian",
            "parent": "lion",
            "text": "Indian Lion",
            "data": {
                "lastName": "Silver"
            }
        },
        {
            "id": "apple",
            "parent": "mobile",
            "text": "Apple iPhone"
        },
        {
            "id": "samsung",
            "parent": "mobile",
            "text": "Samsung Galaxy"
        },
        {
            "id": "lenovo",
            "parent": "lappy",
            "text": "Lenovo"
        },
        {
            "id": "hp",
            "parent": "lappy",
            "text": "HP"
        }
    ],
    draggedDiv = null,
    old_currentTarget = null,
    old_onselectstart,
    old_unselectable,
    shorten = function(text, options, maxLength = 32) {
        if (text.length <= maxLength) {
            return text;
        }
        if (!options) options = {};
        var defaultOptions = {
            suffix: true,
            suffixString: " …",
            preserveWordBoundaries: true,
            wordSeparator: " "
        };
        $.extend(options, defaultOptions);
        var suffix = '';
        if (text.length > maxLength && options.suffix) {
            suffix = options.suffixString;
        }
        var maxTextLength = maxLength - suffix.length,
            cutIndex,
            lastWordSeparatorIndex;
        if (options.preserveWordBoundaries) {
            lastWordSeparatorIndex = text.lastIndexOf(options.wordSeparator, maxTextLength + 1);
            cutIndex = lastWordSeparatorIndex > 0 ? lastWordSeparatorIndex : maxTextLength;
        } else {
            cutIndex = maxTextLength;
        }
        return text.substr(0, cutIndex) + suffix;
    },
    basename = function(str, sep = '/') {
        var lastChar = str.charAt(str.length - 1);
        if (lastChar === sep || lastChar === '\\') {
            str = str.slice(0, -1);
        }
        return str.substr(str.lastIndexOf(sep) + 1);
    },
    randomID = function() {
        return Math.random().toString(36).substr(2, 8);
    };

// Initialize the tree and give it a drop event handler

$('#jstree').jstree({
    plugins: [
        'dnd',
        'types',
        'contextmenu'
    ],
    core: {
        data: theTree,
        check_callback: true,
        themes: {
            dots: false,
            responsive: true
        }
    },
    types: {
        root: {
            icon: 'fa fa-folder-o fa-lg'
        },
        default: {
            icon: 'fa fa-leaf'
        },
        file: {
            icon: 'fa fa-file-o'
        }
    }

}).on('ready.jstree', function(e) {
    $(this).jstree().open_all('animal', 300);

    // The drop event happens if a drag starts outside the window
    // For example, when dragging a browser URL from the address bar,
    // or selected text from another window

}).on('drop', function(evt) {
    evt.preventDefault();
    var e = evt.originalEvent;

    //debugger;

    var tree = $(evt.target).jstree(),
        node = tree.get_node(evt.target),
        parent = $('#' + node.id).parent(),
        index = parent.children().index($('#' + node.id)) + 1,
        newNode = {};
    if (node.parent === '#') {
        parent = '#';
    }

    if (e.dataTransfer.getData('URL')) {
        if (e.dataTransfer.getData('text/html')) {
            var anchor = $(e.dataTransfer.getData('text/html')).filter(function() {
                return $(this).is('a');
            }).eq(0);
            if (anchor.length && typeof anchor.data('full-url') !== 'undefined') {
                newNode.text = anchor.text();
                newNode.data = {
                    target: anchor.data('full-url'),
                    shorturl: anchor.attr('href')
                };
            }
        } else {
            var url = e.dataTransfer.getData('URL');
            if (e.dataTransfer.getData('public.url-name')) {
                newNode.text = shorten(e.dataTransfer.getData('public.url-name'));
            } else {
                newNode.text = shorten(basename(url));
            }
            newNode.a_attr = {
                title: url
            }
            newNode.data = {
                target: url
            }
        }
    } else if (e.dataTransfer.getData('Text')) {
        var txt = e.dataTransfer.getData('Text'),
            shortened = shorten(txt);
        if (shortened != txt) {
            newNode.data = {
                original_text: txt
            }
        }
        newNode.text = shortened;
    }
    if (node.type == 'root' || node.type == 'file') {
        tree.create_node(node, newNode, 'last');
    } else {
        tree.create_node(parent, newNode, index);
    }
});

// Events caught at the document level

$(document).on('dnd_start.vakata', function(e, data) {
    //console.log('Started dragging node from jstree');
}).on('dnd_move.vakata', function(e, data) {
    //console.log('Moving node from jstree to div');
    //debugger;

}).on('dnd_stop.vakata', function(e, data) {

    //debugger;

    // if dropping into the big blue circle, create a div element, store
    // its jstree data as data-dnd, then append it to the circle

    if (data.event.target.id === 'dragTarget' || $(data.event.target).parents('#dragTarget').length) {
        if (data.data.jstree && data.data.origin) {
            var node = data.data.origin.get_node(data.element);
            $(`<div draggable="true"><i class="${node.icon}"></i>&nbsp;${node.text}</div>`).data(
                'dnd', {
                    id: randomID(),
                    text: node.text,
                    type: node.type,
                    data: node.data
                }
            ).appendTo('#dragTarget');
            if (!data.event.ctrlKey) {
                data.data.origin.delete_node(node);
            }
        }

        // if dropping anywhere else, including the jstree object

    } else {
        if (old_currentTarget !== null) {
            old_currentTarget.unselectable = old_unselectable;
            old_currentTarget.onselectstart = old_onselectstart;
            old_currentTarget = null;
        }
        if ($(data.event.target).parents('#jstree').length) {
            if (draggedDiv !== null) {
                if (!data.event.ctrlKey) {
                    draggedDiv.remove();
                }
                draggedDiv = null;
            }
        }
    }

    // dragstart is where we build a jstree object from the dragged object
    // and pass it to $.vakata.dnd.start()

}).on('dragstart', function(evt) {

    //debugger;

    var nodes,
        dnd,
        id,
        txt,
        item = $(
            '<div id="jstree-dnd" class="jstree-default"><i class="jstree-icon jstree-er"></i></div>'
        );

    // if it isn't an object from the blue circle, it's from somewhere else
    // in the window, so grab the selected text or innerText of the element

    if (typeof $(evt.target).data('dnd') === 'undefined') {
        draggedDiv = null;
        dnd = {
            id: randomID(),
            text: window.getSelection().toString() || $(evt.target).text()
        };

        // if it's from the blue circle, use its jstree data
        // to build the nodes object

    } else {
        draggedDiv = $(evt.target);
        dnd = $(evt.target).data('dnd');
        dnd.id = randomID();
    }

    item.append(dnd.text);

    // jumping straight into jstree.dnd.start leaves the current target
    // set to unselectable, so save these values to restore them on drop

    old_unselectable = evt.currentTarget.unselectable;
    old_onselectstart = evt.currentTarget.onselectstart;
    old_currentTarget = evt.currentTarget;

    // and now, tell jstree to start dragging this thing around

    return $.vakata.dnd.start(
        evt, {
            jstree: true,
            obj: $(
                `<a href="#" id="${dnd.id}_anchor" class="jstree-anchor">`
            ),
            nodes: [dnd]
        },
        item
    );

}).on('dragover', function(evt) {
    evt.preventDefault();
    //debugger;
});

var added = false;
$('body')
    .on('drop', function(evt) {
        evt.preventDefault();
    })
    .on('dragover', function(evt) {
        evt.preventDefault();
        if (!added) {
            $.vakata.dnd.start(
                evt, {
                    jstree: true,
                    obj: $(
                        `<a href="#" id="anchor" class="jstree-anchor">`
                    ),
                    nodes: ["1"]
                },
                $('<div id="jstree-dnd" class="jstree-default"><i class="jstree-icon jstree-er"></i> DEMO<div>')
            );
            added = true;
        }
        $.vakata.dnd.drag(evt);
    });