/* MODELS --------------------------------------------------------------- */

var Project = Backbone.Model.extend({
  url: function() {
    return this.id ? '/rest/projects/' + this.id : '/rest/projects';
  },
});

var Projects = Backbone.Collection.extend({
  model: Project,
  url: '/rest/projects'
});

var projects = new Projects();

function make_snippet_collection(project_id) {
  var base_url = '/rest/project/' + project_id + '/snippets';

  var Snippet = Backbone.Model.extend({
    url: function() {
      return this.id ? base_url + '/' + this.id : base_url;
    },
  });

  var Snippets = Backbone.Collection.extend({
    model: Snippets,
  });

  return new Snippets();
}

/* CONTROLER ----------------------------------------------------------- */

var App = Backbone.Controller.extend({

  routes: {
    '': 'list',
    ':id': 'view'
  },

  list: function() {
    console.log('list');
  },

  view: function(id) {
    console.log('view', id);
  },

});

/* PROJECT LIST ----------------------------------------------------------- */

var project_list_item_tmpl = $('#project-list-item').html();

projects.bind('add', function(project) {
  if (!$('.projects ul').length) {
    $('.projects').empty().append('<ul/>');
  }
  $('.projects ul').append(Mustache.to_html(template, context));
});

/* OLD --------------------------------------------------------------- */

/*

var ProjectView = Backbone.View.extend({
tagName: 'li',
template: _.template($('#project-template').html()),
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
