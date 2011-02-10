from flask import request, abort, g
from werkzeug import MultiDict

from snippendrop.application import app
from snippendrop.models import Project, Snippet
from snippendrop.forms import ProjectForm
from snippendrop.decorators import rest

# TODO: Encrypt IDs, see PyCrypto
# TODO: Caching

logger = app.logger

@rest
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


@rest
def snippets(id=None):
    user = g.user
    data = MultiDict(request.json)

    if request.method == 'GET':
        assert id
        obj = Snippet.get_by_id_and_user(id, user)
        if obj:
            return obj.to_dict()
        else:
            logger.debug('No snippet for key %s and user %s', id, user)
            abort(404)

    elif request.method == 'POST': # Create
        assert not id, 'No id allowed'
        project = Project.get_by_id_and_user(data.get('project'), user)
        assert project, 'Valid project required'
        obj = Snippet(project=project,
                      is_header=False,
                      content='Lorem ipsum',
                      ).put()
        return obj.to_dict()
