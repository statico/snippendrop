from flask import session, g
from flaskext.sqlalchemy import SQLAlchemy
from sqlalchemy.orm.exc import NoResultFound
from werkzeug import generate_password_hash, check_password_hash

from snippendrop.application import app

db = SQLAlchemy(app)

@app.before_request
def add_current_user_to_session():
    g.user = None
    username = session.get('username')
    if username:
        try:
            g.user = User.query.filter(User.username==username).one()
        except NoResultFound:
            app.logger.warn('Session username was "%s" but no user found', username)


class _CRUDMixin(object):

    def put(self):
        db.session.add(self)
        db.session.commit()

    def save(self):
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    pw_hash = db.Column(db.String(80))

    def __init__(self, username, password):
        self.username = username
        self.set_password(password)

    def set_password(self, password):
        self.pw_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.pw_hash, password)

    @classmethod
    def check_login(cls, username, password):
        try:
            user = cls.query.filter(cls.username==username).one()
            return user.check_password(password)
        except NoResultFound:
            return False


class Project(db.Model, _CRUDMixin):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    title = db.Column(db.String(255), nullable=False)

    owner = db.relationship(User, backref=db.backref('projects', order_by=id))

    def to_dict(self):
        obj = {}
        for attr in ('id', 'owner_id', 'title'):
            obj[attr] = getattr(self, attr)
        return obj

    @classmethod
    def get_by_id_and_owner(cls, id, owner):
        return cls.query.filter(cls.id==id).filter(cls.owner_id==owner.id).first()


class Snippet(db.Model, _CRUDMixin):
    __tablename__ = 'snippets'

    # TODO: Uncomment when snippet ordering occurs in a single transaction.
    # __table_args__ = (
    #     db.UniqueConstraint('project_id', 'rank'),
    #     {}
    #     )

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))
    rank = db.Column(db.Integer())
    kind = db.Column(db.Enum('text', 'header', nullable=False))
    title = db.Column(db.String(255))
    content = db.Column(db.Text())

    project = db.relationship(Project, backref=db.backref('snippets', order_by=id))

    def to_dict(self):
        obj = {}
        for attr in ('id', 'project_id', 'rank', 'kind', 'title', 'content'):
            obj[attr] = getattr(self, attr)
        return obj

    @classmethod
    def get_by_id_and_project(cls, id, project):
        return cls.query.filter(cls.id==id).filter(cls.project_id==project.id).first()

    @classmethod
    def get_next_rank(cls, pid):
        current = db.session.query(db.func.max(cls.rank)).filter(cls.project_id==pid).first()[0]
        if current is None:
            return 0
        else:
            return current + 1
