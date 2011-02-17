/* Copyright 2011 Ian Langworth. All rights reserved. */

function XXX(obj) {
  if ('toJSON' in obj)
    return JSON.stringify(obj.toJSON());
  else
    return JSON.stringify(obj);
}

function markdown(text) {
  text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  var converter = new Showdown.converter();
  return converter.makeHtml(text);
}

var App = {
  Model: {},
  Collection: {},
  View: {}
};

App.Model.Project = Backbone.Model.extend({
  defaults: {
    title: 'New project'
  },
  url: function() {
    var base = '/json/projects';
    return this.id ? base + '/' + this.id : base;
  },
  snippets: function() {
    if (this._snippets === undefined)
      this._snippets = new App.Collection.Snippets({project: this});
    return this._snippets;
  }
});

App.Model.Snippet = Backbone.Model.extend({
  defaults: {
    project_id: 0,
    kind: 'text',
    content: 'hello world'
  },
  initialize: function(options) {
    this.project_id = options.project_id;
    this.urlBase = '/json/projects/' + this.project_id + '/snippets';
  },
  url: function() {
    var base = this.urlBase;
    return this.id ? base + '/' + this.id : base;
  },
  renderedContent: function() {
    return markdown(this.get('content'));
  },
  toContext: function() {
    var context = this.toJSON();
    context.renderedContent = this.renderedContent();
    return context;
  }
});

App.Collection.Projects = Backbone.Collection.extend({
  model: App.Model.Project,
  url: '/json/projects',
});

App.Collection.Snippets = Backbone.Collection.extend({
  model: App.Model.Snippet,
  initialize: function(options) {
    this.project = options.project;
  },
  url: function() {
    return '/json/projects/' + this.project.id + '/snippets';
  },
  comparator: function(snippet) {
    return snippet.get('rank');
  },
  saveRanks: function(success, error) {
    var data = [];
    this.each(function(snippet) {
      data.push({
        id: snippet.id,
        rank: snippet.get('rank')
      });
    });

    $.ajax({
      url: '/json/projects/' + this.project.id + '/reorder',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(data),
      dataType: 'json',
      processData: false,
      success: success,
      error: error
    });

    return this;
  }
});

App.View.ProjectList = Backbone.View.extend({
  initialize: function(options) {
    this.el = options.el;
    this.projects = options.projects;

    this.emptyMessage = this.el.find('.empty-message');
    this.itemTemplate = _.template($('#item-template').html());
    this.items = {};

    _.bindAll(this, 'render', 'projectAdded', 'projectRemoved');
    this.projects.bind('add', this.projectAdded);
    this.projects.bind('remove', this.projectRemoved);
  },
  events: {
    'click li a.delete': 'deleteProject',
  },
  projectAdded: function(project) {
    var id = project.id;
    var item = $('<li/>').html(this.itemTemplate(project.toJSON()));
    item.data('project-id', id)
    this.items[id] = item;
    this.el.prepend(item);
    this.emptyMessage.hide();
  },
  projectRemoved: function(project) {
    var id = project.id;
    var item = this.items[id].remove();
    delete this.items[id];
    if (!this.projects.length) {
      this.emptyMessage.show();
    }
  },
  deleteProject: function() {
    var id = $(event.target).parent('li').data('project-id');
    var project = this.projects.get(id);

    if (!confirm('Are you sure you want to delete "' +
                 project.get('title') + '" ?'))
      return;

    var that = this;
    project.destroy({success: function(project, response) {
      that.projects.remove(project);
    }});
    return false;
  }
});

App.View.SnippetView = Backbone.View.extend({
  tagName: 'div',
  className: 'snippet',
  initialize: function(options) {
    this.snippet = options.snippet;
    this.snippet.view = this;

    $(this.el).data({
      view: this,
      snippet: this.snippet
    });

    this.templates = {
      text: _.template($('.snippet-template.text').html()),
      header: _.template($('.snippet-template.text').html()),
    };

    _.bindAll(this, 'render', 'editSnippet', 'viewSnippet', 'resizeEditor');
    this.render();

    // Mysterious drag-and-drop voodoo, part 1.
    $(this.el)
      .drag('start', function() {
        $(this).addClass('dragging'); // Style the object as if it's
                                      // being dragged.
      })
      .drag(function(event, dd) {
        $(this).css({
          position: 'absolute',
          top: dd.offsetY,
          left: dd.offsetX
        });
      }, {click: false})
      .drag('end', function(event, dd) {
        $(this).removeClass('dragging'); // Remove style during drag.
        if (!dd.drop.length) {
          // No destination snippet? Move the object back to where it was.
          $(this).animate({
            top: dd.originalY,
            left: dd.originalX
          }, 200)
        }
      });
  },
  events: {
    'click .viewer': 'editSnippet',
    'blur .editor': 'viewSnippet'
  },
  render: function() {
    var container = $(this.el), snippet = this.snippet;
    container.empty();

    var kind = snippet.get('kind');
    var template = this.templates[kind];
    this.viewer = $('<div/>')
      .html(template(snippet.toContext()))
      .addClass('viewer')
      .appendTo(container);

    this.clone = this.viewer.clone().appendTo('body').css({
      position: 'absolute',
      top: -9999,
      left: -9999,
      whiteSpace: 'pre-wrap'
    });
    this.oldHeight = null;

    this.editor = $('<textarea/>')
      .addClass('editor')
      .hide()
      .appendTo(container)
      .keydown(this.resizeEditor)
      .keyup(this.resizeEditor)
      .change(this.resizeEditor);
  },
  editSnippet: function(event) {
    var snippet = this.snippet;
    if (event && event.altKey) {
      // Alt-click deletes snippets.
      if (confirm("Really destroy this snippet?")) {
        snippet.destroy();
        this.remove();
      }
    } else {
      var container = $(this.el);
      this.oldZIndex = container.css('z-index');
      container.css('z-index', 100);

      var editor = this.editor, viewer = this.viewer;
      editor
        .val(snippet.get('content'))
        .width(viewer.width())
        .height(viewer.height())
        .show()
        .focus();
      viewer.hide();
      this.resizeEditor(null, true);
    }
  },
  viewSnippet: function() {
    var snippet = this.snippet;
    var editor = this.editor, viewer = this.viewer;
    var container = $(this.el);

    // Strip trailing space which causes problems with resizeEditor.
    editor.val(editor.val().replace(/\s+$/g, ''));

    var that = this;
    snippet.save(
      {content: editor.val()},
      {success: function() {
        editor.hide();
        container.css('z-index', this.oldZIndex);
        var kind = snippet.get('kind');
        var template = that.templates[kind];
        viewer.html(template(snippet.toContext())).show();
      }});
  },
  resizeEditor: function(event, forceResize) {
    var editor = this.editor, clone = this.clone;
    clone
      .scrollTop(10000)
      .width(editor.width())
      .text(editor.val());

    var newHeight = clone.height();
    if (forceResize || this.oldHeight != newHeight) {
      editor.animate({height: newHeight}, 100);
      this.oldHeight = newHeight;
    }
  }
});

App.View.ProjectEditor = Backbone.View.extend({
  initialize: function(options) {
    this.el = options.el;
    this.project = options.project;
    this.snippets = this.project.snippets();
    this.columns = 4;
    this.resizeTimer = null;

    _.bindAll(this, 'render', 'createSnippet', 'windowResized');
    this.snippets.bind('add', this.render);
    this.snippets.bind('remove', this.render);
    this.snippets.bind('change', this.render);
    this.render();

    $(this.el).empty().data({
      view: this,
      snippets: this.snippets
    });

    $(window).resize(this.windowResized);

    var that = this;

    // Initialize the uploader.
    function x(arg) {return function(){ console.log('file-upload', arg); return true; }}
    $('#upload').fileUpload({
      url: '/upload',
      method: 'POST',
      fieldName: 'file',
      withCredentials: true,
      dropZone: $('#snippet-editor'),
      onDocumentDragEnter: x('onDocumentDragEnter'),
      onDocumentDragLeave: x('onDocumentDragLeave'),
      onDocumentDrop: x('onDocumentDrop'),
      onDragEnter: x('onDragEnter'),
      onDragLeave: x('onDragLeave'),
      onDrop: x('onDrop'),
      onChange: x('onChange'),
      onLoad: x('onLoad'),
      onProgress: x('onProgress'),
      onAbort: x('onAbort'),
      onError: x('onError'),
      initUpload: function (event, files, index, xhr, handler, callBack) {
        console.log('initUpload');
        callBack();
      },
    });

    // Mysterious drag-and-drop voodoo, part 2.
    $('.snippet .viewer')
      .live('dropstart', function(event, dd) {
        var el = $(this).parent(); // Live events only seem to work
                                   // for subelements.
        if (el.hasClass('dragging')) return; // Ignore drop events
                                             // from the element being
                                             // dragged.
        el.addClass('drop-target'); // Highlight the destination snippet.
      })
      .live('drop', function(event, dd) {
        if (!dd) return; // For some reason this event fires on load
                         // but `dd` is undefined.

        // Get the object dragged (src) and drop target (dest).
        var src = $(dd.drag);
        var dest = $(this).parent('.snippet');

        // Instead of relying on rank, simply put all of the snippets
        // in an array and use the array's index properties. This way
        // all of the ranks stay nice an neat.
        var srcSnippet = src.data('snippet');
        var srcIndex = that.snippets.indexOf(srcSnippet);
        var destSnippet = dest.data('snippet');
        var destIndex = that.snippets.indexOf(destSnippet);
        var items = that.snippets.toArray();
        items.splice(srcIndex, 1);
        items.splice(destIndex, 0, srcSnippet);
        _.each(items, function(snippet, i) {
          snippet.set({rank: i}, {silent: true});
        });
        that.snippets.saveRanks().sort();
        that.render();
      })
      .live('dropend', function(event, dd) {
        var el = $(this).parent();
        if (el.hasClass('dragging')) return;
        el.removeClass('drop-target');
      })
      .drop({mode: 'intersect'}); // Use a normal-feeling drag and drop mode.
  },
  render: function() {
    var that = this, container = $(this.el), offset = container.offset();

    // Size the container.
    var gap = offset.left;
    container.css({
      position: 'absolute',
      left: offset.left,
      top: offset.top,
      right: gap,
      height: $(window).height() - offset.top - gap
    });

    // Determine column width.
    var colWidth = Math.min(250, container.width() / this.columns);
    var colIndex = 0;

    // For each snippet,
    var previous = null;
    this.snippets.each(function(snippet) {

      // Determine height.
      var view = snippet.view || new App.View.SnippetView({snippet: snippet});
      var el = $(view.el).appendTo(container);
      el.css({
        position: 'absolute',
        top: -9999,
        left: -9999,
        width: colWidth
      });

      // If won't fit into current column, start a new column.
      if (previous) {
        var top = previous.offset().top + previous.height() + gap;
        var floor = container.offset().top + container.height();
        if (el.height() > (floor - top)) {
          previous = null;
          colIndex++;
        }
      }

      // Add it to the current column.
      var top = (previous
                 ? previous.offset().top + previous.height() + gap
                 : container.offset().top);
      var left = colWidth * colIndex + gap * (colIndex + 1);
      el.appendTo('body');
      el.css({
        top: top,
        left: left
      });

      previous = el;
    });
  },
  createSnippet: function() {
    this.snippets.create({project_id: this.project.id});
  },
  windowResized: function() {
    if (this.resizeTimer) return;

    var that = this;
    this.resizeTimer = setTimeout(function() {
      that.render();
      that.resizeTimer = null;
    }, 400);
  }
});
