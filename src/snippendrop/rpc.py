from flask import request, abort
from google.appengine.api import users

from snippendrop.models import Project, Snippet
from snippendrop.forms import NewProjectForm
from snippendrop.decorators import rpc

@rpc
def new_project():
    form = NewProjectForm(request.form)
    if form.validate():
        project = Project(name=form.name.data,
                          owner=users.get_current_user())
        project.put()
        return {'name': project.name, 'id': id}
    else:
        return {'error': form.errors}

@rpc
def new_snippet():
    key = request.form.get('key') or abort(400)
    project = Project.get_by_key_name(key) or abort(404)

    snippet = Snippet(project=project,
                      is_header=False,
                      content='Lorem ipsum')
    snippet.put()
    return {'key': key, 'content': snippet.content}

@rpc
def delete_snippet():
    snippet_key = request.form.get('snippet_key') or abort(400)
    project_key = request.form.get('project_key') or abort(400)

    project = Project.get_by_key_name(project_key) or abort(404)
    snippet = Snippet.get_by_key_name(snippet_key, parent=project) or abort(404)
    snippet.delete()

@rpc
def edit_snippet_content():
    snippet_key = request.form.get('snippet_key') or abort(400)
    project_key = request.form.get('project_key') or abort(400)

    project = Project.get_by_key_name(project_key) or abort(404)
    snippet = Snippet.get_by_key_name(snippet_key, parent=project) or abort(404)
    snippet.content = request.form.get('content')
    snippet.put()
