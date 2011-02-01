from google.appengine.ext import db

class Project(db.Model):
    name = db.StringProperty()
    owner = db.UserProperty()

    @classmethod
    def get_projects_for_user(cls, user):
        return Project.all().filter('owner =', user)

class Snippet(db.Model):
    project = db.ReferenceProperty(Project)
    title = db.StringProperty()
    is_header = db.BooleanProperty()
    url = db.LinkProperty()
    excerpt = db.TextProperty()
    content = db.TextProperty()
    blob = db.BlobProperty()
    blob_type = db.StringProperty()
