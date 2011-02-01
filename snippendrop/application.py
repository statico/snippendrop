import logging

from google.appengine.api import users
from flask import Flask, request, abort
from uuid import uuid4

from snippendrop.models import Project, Snippet
from snippendrop.forms import NewProjectForm
from snippendrop.decorators import templated, json

app = Flask(__name__)
app.debug = True
app.secret_key = '\x9a\x07d5\xc9\xc7\x90KgG\xdc\xea(\x08Y\x88\x1dww)\x83\x7f\x0f\x11'

@app.route('/')
@templated('list_projects.html')
def list_projects():
    return {
        'projects': Project.get_projects_for_user(users.get_current_user()),
        'new_project_form': NewProjectForm(),
        }

@app.route('/project/<key>')
@templated('view_project.html')
def view_project(key):
    project = Project.get_by_key_name(key)
    if project:
        snippets = Snippet.get_for_project(project)
        return {'project': project, 'snippets': snippets}
    else:
        abort(410)

@app.route('/rpc/new_project', methods=['POST'])
@json()
def rpc_new_project():
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

@app.route('/rpc/new_snippet', methods=['POST'])
@json()
def rpc_new_snippet():
    key = request.form.get('key') or abort(400)
    project = Project.get_by_key_name(key) or abort(404)

    key = str(uuid4())
    snippet = Snippet(key_name=key,
                      parent=project,
                      is_header=False,
                      content='Lorem ipsum')
    snippet.put()
    return {'key': key, 'content': snippet.content}

@app.route('/rpc/delete_snippet', methods=['POST'])
@json()
def rpc_delete_snippet():
    snippet_key = request.form.get('snippet_key') or abort(400)
    project_key = request.form.get('project_key') or abort(400)

    project = Project.get_by_key_name(project_key) or abort(404)
    snippet = Snippet.get_by_key_name(snippet_key, parent=project) or abort(404)
    snippet.delete()
    return {}
