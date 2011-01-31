from flaskext.wtf import Form, TextField, Length

class NewProjectForm(Form):
    name = TextField('Project name', [Length(min=1, max=500)])
