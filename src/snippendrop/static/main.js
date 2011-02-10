var App = {
  Model: {},
  Collection: {},
  View: {}
};

App.Model.Project = Backbone.Model.extend({
  defaults: {
    title: 'New project',
  },
  url: function() {
    return this.id ? '/json/projects/' + this.id : '/json/projects';
  }
});

App.Collection.Projects = Backbone.Collection.extend({
  model: App.Model.Project,
  url: '/json/projects'
});

/*
App.View.ProjectList = Backbone.View.extend({
  tagName: 'ul',
  initialize: function(options) {
    this.projects = options.projects;
  });
});

/*
var projects = new ProjectList();

var ProjectView = Backbone.View.extend({
  tagName: 'li',
  template: _.template($('#project-list-item').html()),
  events: {
    'click a.open': 'open',
    'click a.delete': 'delete'
  },
  initialize: function() {
    _.bindAll(this, 'render', 'open', 'delete');
    this.model.bind('change', this.render);
    this.model.view = this;
  },
  render: function() {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  },
  remove: function() {
    $(this.el).remove();
  },
  delete: function() {
    this.model.clear();
    this.remove();
    return false;
  },
  open: function() {
    alert('open project "' + this.model.get('title') + '"');
    return false;
  },
});

var ProjectListView = Backbone.View.extend({
  el: $('#list'),
  events: {
    'click button.new-project': 'createNewProject'
  },
  initialize: function() {
    _.bindAll(this, 'render', 'addProject', 'deleteProject', 'createNewProject');
    projects.bind('add', this.addProject);
    projects.bind('remove', this.deleteProject);
  },
  addProject: function(model) {
    var view = new ProjectView({model: model});
    var list = this.$('ul');
    list.find('.message').hide();
    list.append(view.render().el);
  },
  deleteProject: function(model) {
    if (!projects.length()) this.$('ul .message').show();
  },
  createNewProject: function() {
    var title = $('input[name=title]');
    if (!title.val()) {
      alert('Please enter a title for the project');
      return;
    }
    var model = new Project({title: title.val()});
    projects.add(model);
    title.val('');
    return false;
  },
});

/*

var App = Backbone.Controller.extend({

  routes: {
    '': 'index',
    ':id': 'view'
  },

  index: function() {

  },

  view: function(id) {
    console.log('view', id);
  },

});

/* PROJECT LIST ----------------------------------------------------------- */

/*
var Snippet = Backbone.Model.extend({

  defaults: {
    project: null,
  },

  url: function() {
    return this.id ? base_url + '/' + this.id : base_url;
  },

});

var Snippets = Backbone.Collection.extend({
  model: Snippets,
});
*/

/*
var project_list_item_tmpl = $('#project-list-item').html();

projects.bind('add', function(project) {
  if (!$('.projects ul').length) {
    $('.projects').empty().append('<ul/>');
  }
  $('.projects ul').append(_.template(project_list_item_tmpl, project));
});

var ProjectListItemView = Backbone.View.extend({
  tagName: 'li',
  template: _.template(project_list_item_tmpl),
  events: {
    'click .delete': 'delete'
  },
  initialize: function() {
    _.bindAll(this, 'render', 'delete');
    this.model.bind('change', this.render);
    this.model.view = this;
  },
  render: function() {
    $(this.el).html(this.template(this.model));
    return this;
  },
  delete: function() {
    this.model.destroy();
    this.remove();
    return false;
  }
});

/* OLD --------------------------------------------------------------- */

/*
var project_id = {{ project.key().id()|tojson|safe }};
var snippets = make_snippet_collection(project_id);

$('button.new-snippet').click(function() {
$.post('/rpc/new_snippet', {key: project_key}, function(data) {
$('<div class="snippet"/>')
.appendTo('.snippets')
.data('key', data.key)
.text(data.content);
});
return false;
});

$('div.snippet').live('mouseover', function() {
var snippet = $(this);
if (snippet.data('close-button')) return;

var icon = $('<div class="close-icon"/>')
.hide()
.appendTo('body')
.css({
position: 'absolute',
top: snippet.offset().top,
left: snippet.offset().left + snippet.width(),
})
.fadeIn()
.click(function() {
var data = {
snippet_key: snippet.data('key'),
project_key: project_key,
};
$.post('/rpc/delete_snippet', data, function(data) {
icon.remove();
snippet.remove();
});
return false;
});
snippet.data('close-button', icon);
}).live('mouseout', function() {
var snippet = $(this);
var icon = snippet.data('close-button');
if (!icon) return;
icon.fadeOut(function() {
icon.remove();
snippet.removeData('close-button');
});
});

$('div.snippet').live('click', function() {
var snippet = $(this);
var snippet_key = snippet.data('key');
var text = snippet.text().replace(/^\s+|\s+$/g, '');
var editor = $('<textarea/>').text(text).addClass('snippet');
snippet.replaceWith(editor);
editor.focus();
editor.blur(function() {
var data = {
snippet_key: snippet_key,
project_key: project_key,
content: editor.val(),
};
$.post('/rpc/edit_snippet_content', data, function(data) {
// TODO: Markdown
snippet.text(editor.val()).data('key', snippet_key);
editor.replaceWith(snippet);
editor.remove();
});
});
});

var AppView = Bacokbone.View.extend({
el: $('.projects'),
events: {
'.new-project click': newProject,

initialize

projects.bind('add', function(project) {
if (!$('.projects ul').length) {
$('.projects').empty().append('<ul/>');
}
var template = '<li><a href="{\{ url }\}">{\{ name }\}</a></li>';
var context = {url: project.viewUrl(), name: project.get('name')};
$('.projects ul').append(Mustache.to_html(template, context));
});

{% for obj in projects %}
projects.add({{ obj.to_dict()|tojson|safe }});
{% endfor %}

$('form.new-project button').click(function() {
var input = $('#name');
var name = input.val();
if (name) {
projects.create({name: name});
}
input.val('');
return false;
});

$('.delete').live('click', function() {
var pid = $(this).data('pid');
return false;
});

*/
