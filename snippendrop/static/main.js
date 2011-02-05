/* MODELS --------------------------------------------------------------- */

var Project = Backbone.Model.extend({
  url: function() {
    return this.id ? '/rest/projects/' + this.id : '/rest/projects';
  },
  viewUrl: function() {
    return '/project/' + this.id;
  }
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
