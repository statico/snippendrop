from google.appengine.api import users
from flask import abort

from snippendrop.application import app
from snippendrop.models import Project, Snippet
from snippendrop.forms import NewProjectForm
from snippendrop.decorators import templated

@app.route('/')
@templated('list_projects.html')
def list_projects():
    user = users.get_current_user()
    return {
        'projects': Project.get_projects_for_user(user),
        'new_project_form': NewProjectForm(),
        }

@app.route('/project/<int:id>')
@templated('view_project.html')
def view_project(id=None):
    user = users.get_current_user()
    project = Project.get_by_id_and_user(id, user)
    if project:
        snippets = Snippet.get_for_project(project)
        return {'project': project, 'snippets': snippets}
    else:
        abort(410)
