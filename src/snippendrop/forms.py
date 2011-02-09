from flaskext.wtf import Form, TextField, PasswordField, Length

class LoginForm(Form):
    username = TextField('Username', [Length(min=1)])
    password = PasswordField('Password')

class LogoutForm(Form):
    pass

class NewProjectForm(Form):
    title = TextField('Project title', [Length(min=1, max=500)])
