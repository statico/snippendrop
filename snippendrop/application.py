from google.appengine.api import users
from flask import Flask, request, jsonify

from snippendrop.models import Project
from snippendrop.forms import NewProjectForm
from snippendrop.decorators import templated

app = Flask(__name__)
app.secret_key = '\x9a\x07d5\xc9\xc7\x90KgG\xdc\xea(\x08Y\x88\x1dww)\x83\x7f\x0f\x11'

@app.route('/')
@templated('index.html')
def index():
    return {
        'projects': Project.all().filter('user =', users.get_current_user()),
        'new_project_form': NewProjectForm(),
        }

@app.route('/rpc/new_project', methods=['POST'])
def rpc_new_project():
    form = NewProjectForm(request.form)
    if form.validate():
        project = Project(name=form.name.data,
                          owner=users.get_current_user())
        project.put()
