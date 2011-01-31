from google.appengine.ext import db
from flask import Flask, render_template

app = Flask(__name__)
app.secret_key = '\x9a\x07d5\xc9\xc7\x90KgG\xdc\xea(\x08Y\x88\x1dww)\x83\x7f\x0f\x11'

class Project(db.Model):
    name = db.StringProperty()
    owner = db.UserProperty()

class Snippet(db.Model):
    project = db.ReferenceProperty(Project)
    title = db.StringProperty()
    is_header = db.BooleanProperty()
    url = db.LinkProperty()
    excerpt = db.TextProperty()
    content = db.TextProperty()
    blob = db.BlobProperty()
    blob_type = db.StringProperty()

@app.route('/')
@app.route('/<name>')
def hello(name=None):
    return render_template('hello.html', name=name)
