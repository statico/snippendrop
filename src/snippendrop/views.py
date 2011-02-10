from flask import request, redirect, flash, session, url_for, g, abort

from snippendrop.application import app
from snippendrop.forms import LoginForm, LogoutForm, ProjectForm
from snippendrop.models import User, Project
from snippendrop.decorators import templated, login_required

logger = app.logger

@app.route('/', methods=['GET', 'POST'])
@templated('welcome.html')
def welcome():
    form = LoginForm(request.form)
    if request.method == 'POST' and form.validate():
        if User.check_login(form.username.data, form.password.data):
            session['username'] = form.username.data
            return redirect(url_for('project'))
        else:
            flash('Invalid username or password')
    return dict(
        login_form=form,
        logout_form=LogoutForm())

@app.route('/logout', methods=['POST'])
def logout():
    session['username'] = None
    return redirect(url_for('welcome'))

@app.route('/projects/')
@login_required()
@templated('list_projects.html')
def list_projects():
    user = g.user
    return dict(
        projects=user.projects,
        form=ProjectForm())

@app.route('/project/<int:id>/')
@login_required()
@templated('edit_project.html')
def edit_project(id):
    user = g.user
    project = Project.get_by_id_and_owner(id, user)
    logger.debug('No project found for user %s and id %s', user, id)
    if not project: abort(404)
    return dict(project=project)
