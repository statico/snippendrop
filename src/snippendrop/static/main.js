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

    _.bindAll(this, 'render', 'editSnippet', 'viewSnippet');
    this.render();

    $(this.el)
      .drag('start', function() {
        $(this).css('opacity', 0.4);
      })
      .drag(function(event, dd) {
        $(this).css({
          position: 'absolute',
          top: dd.offsetY,
          left: dd.offsetX
        });
      }, {click: false})
      .drag('end', function() {
        $(this).css('opacity', 1);
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
    var viewer = $('<div/>').html(template(snippet.toJSON()));
    viewer.addClass('viewer').appendTo(container);

    var editor = $('<textarea/>');
    editor.addClass('editor').hide().appendTo(container);
  },
  editSnippet: function(event) {
    var snippet = this.snippet;
    if (event.altKey) {
      snippet.destroy();
      this.remove();
    } else {
      var editor = this.$('.editor'), viewer = this.$('.viewer');
      editor
        .val(snippet.get('content'))
        .width(viewer.width() + 'px')
        .height(viewer.height() + 'px')
        .show()
        .focus();
      viewer.hide();
    }
  },
  viewSnippet: function() {
    var snippet = this.snippet;
    var editor = this.$('.editor'), viewer = this.$('.viewer');
    snippet.save({content: editor.val()});
    editor.hide();

    var kind = snippet.get('kind');
    var template = this.templates[kind];
    viewer.html(template(snippet.toJSON())).show();
  }
});

App.View.SnippetEditor = Backbone.View.extend({
  initialize: function(options) {
    this.el = options.el;
    this.project = options.project;
    this.snippets = this.project.snippets();

    _.bindAll(this, 'render', 'createSnippet', 'snippetAdded');
    this.snippets.bind('add', this.render);
    this.render();

    $(this.el).data({
      view: this,
      snippets: this.snippets
    });
  },
  render: function() {
    var that = this;
    this.el.empty();
    this.snippets.each(function(snippet) {
      var view = new App.View.SnippetView({snippet: snippet});
      that.el.append(view.el);
    });
  },
  createSnippet: function() {
    var snippet = this.snippets.create({project_id: this.project.id});
    //snippet.view.editSnippet();
  },
  snippetAdded: function(snippet) {
    var view = App.View.SnippetView({snippet: snippet});
    this.el.append(view.el);
  }
});
