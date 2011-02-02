import logging

from google.appengine.ext import db

class Project(db.Model):
    name = db.StringProperty(required=True)
    owner = db.UserProperty(required=True)

    def to_dict(self):
        return {
            'id': self.key().id(),
            'name': self.name,
            }

    @classmethod
    def get_projects_for_user(cls, user):
        return cls.all().filter('owner =', user)

    @classmethod
    def get_by_id_and_user(cls, id, user):
        obj = cls.get_by_id(id)
        if obj and obj.owner == user:
            return obj

class Snippet(db.Model):
    project = db.ReferenceProperty(Project)
    title = db.StringProperty()
    is_header = db.BooleanProperty()
    url = db.LinkProperty(indexed=False)
    excerpt = db.TextProperty(indexed=False)
    content = db.TextProperty(indexed=False)
    blob = db.BlobProperty(indexed=False)
    blob_type = db.StringProperty(indexed=False)

    @classmethod
    def get_for_project(cls, project):
        return cls.all().ancestor(project)

    @classmethod
    def get_by_id_and_user(cls, id, user):
        obj = cls.get_by_id(id)
        if obj and obj.owner == user:
            return obj
