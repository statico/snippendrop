import logging

from functools import wraps
from flask import request, abort
from google.appengine.api import users
from uuid import uuid4

from snippendrop.application import app
from snippendrop.models import Project, Snippet
from snippendrop.forms import NewProjectForm
from snippendrop.decorators import json

def rpc(f):
    url = '/rpc/%s' % f.__name__
    f = app.route(url, methods=['POST'])(f)
    f = json()(f)
    return f

@rpc
def new_project():
    form = NewProjectForm(request.form)
    if form.validate():
        key = str(uuid4()) # TODO: Better project IDs
        project = Project(key_name=key,
                          name=form.name.data,
                          owner=users.get_current_user())
        project.put()
        return {'name': project.name, 'key': key}
    else:
        return {'error': form.errors}

@rpc
def new_snippet():
    key = request.form.get('key') or abort(400)
    project = Project.get_by_key_name(key) or abort(404)

    key = str(uuid4())
    snippet = Snippet(key_name=key,
                      parent=project,
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
