from google.appengine.ext import db

class Project(db.Model):
    name = db.StringProperty()
    owner = db.UserProperty()

    @classmethod
    def get_projects_for_user(cls, user):
        return cls.all().filter('owner =', user)

class Snippet(db.Model):
    # parent -> reference to Project
    title = db.StringProperty()
    is_header = db.BooleanProperty()
    url = db.LinkProperty()
    excerpt = db.TextProperty()
    content = db.TextProperty()
    blob = db.BlobProperty()
    blob_type = db.StringProperty()

    @classmethod
    def get_for_project(cls, project):
        return cls.all().ancestor(project)
