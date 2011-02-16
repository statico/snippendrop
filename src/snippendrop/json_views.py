from flask import request, abort, g
from werkzeug import MultiDict

from snippendrop.application import app
from snippendrop.models import Project, Snippet
from snippendrop.forms import ProjectForm, SnippetForm
from snippendrop.decorators import login_required, jsonify, catch_assertions

# TODO: Encrypt IDs, see PyCrypto
# TODO: Caching

logger = app.logger

@app.route('/json/projects', methods=['GET', 'POST'])
@app.route('/json/projects/<int:id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
@catch_assertions
@jsonify
def projects(id=None):
    user = g.user

    if request.method == 'GET': # Fetch
        if id:
            obj = Project.get_by_id_and_owner(id, user)
            if obj:
                return obj.to_dict()
            else:
                logger.debug('No project for key %s and user %s', id, user)
                abort(404)
        else:
            return [o.to_dict() for o in user.projects]

    elif request.method == 'POST': # Create
        data = MultiDict(request.json)
        assert not id, 'No id allowed'
        form = ProjectForm(data)
        if form.validate():
            obj = Project(owner=user,
                          title=form.title.data)
            obj.put()
            return obj.to_dict()
        else:
            logger.warn('Project create errors: %s', form.errors)
            abort(400)

    elif request.method == 'PUT': # Update
        data = MultiDict(request.json)
        obj = Project.get_by_id_and_owner(id, user)
        if not obj: abort(404)
        form = ProjectForm(data, obj)
        if form.validate():
            form.populate_obj(obj)
            obj.save()
            return obj.to_dict()
        else:
            logger.warn('Project update errors: %s', form.errors)
            abort(400)

    elif request.method == 'DELETE': # Delete
        obj = Project.get_by_id_and_owner(id, user)
        if not obj: abort(404)
        obj.delete()
        return {'success': True}


@app.route('/json/projects/<int:pid>/snippets', methods=['GET', 'POST'])
@app.route('/json/projects/<int:pid>/snippets/<int:sid>', methods=['GET', 'PUT', 'DELETE'])
@login_required
@catch_assertions
@jsonify
def snippets(pid=None, sid=None):
    user = g.user

    assert pid, 'pid required'
    # TODO: Optimize SQL to remove extra extra query.
    project = Project.get_by_id_and_owner(pid, user)
    assert project, 'project required'

    if request.method == 'GET': # Fetch
        if sid:
            obj = Snippet.get_by_id_and_project(sid, project)
            if obj:
                return obj.to_dict()
            else:
                logger.debug('No snippet for id %s and user %s', sid, user)
                abort(404)
        else:
            return [o.to_dict() for o in project.snippets]

    elif request.method == 'POST': # Create
        data = MultiDict(request.json)
        assert not sid, 'No snippet id allowed'
        form = SnippetForm(data)
        if form.validate():
            obj = Snippet(project_id=pid)
            form.populate_obj(obj)
            obj.rank = Snippet.get_next_rank(pid)
            obj.put()
            return obj.to_dict()
        else:
            logger.warn('Snippet create errors: %s', form.errors)
            abort(400)

    elif request.method == 'PUT': # Update
        data = MultiDict(request.json)
        obj = Snippet.get_by_id_and_project(sid, project)
        if not obj: abort(404)
        form = SnippetForm(data, obj)
        if form.validate():
            form.populate_obj(obj)
            obj.save()
            return obj.to_dict()
        else:
            logger.warn('Snippet update errors: %s', form.errors)
            abort(400)

    elif request.method == 'DELETE': # Delete
        obj = Snippet.get_by_id_and_project(sid, project)
        if not obj: abort(404)
        obj.delete()
        return {'success': True}
