from flaskext.wtf import Form, TextField, PasswordField, IntegerField, Length

class LoginForm(Form):
    username = TextField('Username', [Length(min=1)])
    password = PasswordField('Password')

class LogoutForm(Form):
    pass

class ProjectForm(Form):
    title = TextField('Project title', [Length(min=1, max=500)])

class SnippetForm(Form):
    kind = TextField()
    title = TextField()
    content = TextField()
