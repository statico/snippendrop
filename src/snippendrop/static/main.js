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
    return new App.Collection.Snippets({project: this});
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
  model: App.Model.Project,
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

    project.destroy({success: function(project, response) {
      this.projects.remove(project);
    }});
    return false;
  }
});
