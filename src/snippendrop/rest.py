from flask import request, abort, g
from werkzeug import MultiDict

from snippendrop.application import app
from snippendrop.models import Project, Snippet
from snippendrop.forms import NewProjectForm
from snippendrop.decorators import rest

# TODO: Encrypt IDs, see PyCrypto
# TODO: Caching

logger = app.logger

@rest
def projects(id=None):
    user = g.user
    data = MultiDict(request.json)

    if request.method == 'GET':
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
        assert not id, 'No id allowed'
        form = NewProjectForm(data)
        if form.validate():
            obj = Project(owner=user,
                          name=form.name.data)
            obj.put()
            return obj.to_dict()
        else:
            logger.warn('New project form invalid: %s', form.errors)
            abort(400)

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
