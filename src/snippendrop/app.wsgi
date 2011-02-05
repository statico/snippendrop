# vi:ft=python:

from os.path import realpath, dirname, join

basedir = realpath(dirname(__file__))

# Setup virtualenv environment.
activate_this = join(basedir, '..', '..', 'bin', 'activate_this.py')
execfile(activate_this, dict(__file__=activate_this))

# Add Gudgie source to path.
import sys
sys.path.append(join(basedir, '..'))

# Load the framework.
from gudgie.framework.web import make_app
from gudgie.views import *

# WSGI expects a module attribute, 'application'.
application = make_app()

# Attach email handler.
from gudgie import settings
if settings.SEND_ERRORS_TO:
  from paste.exceptions.errormiddleware import ErrorMiddleware
  application = ErrorMiddleware(application,
      error_message="""
        <p>Gudgie appears to have experienced an internal
        error. We have already sent an email to the site administrators
        letting them know about the problem.</p>
        <p>Please try again in a few minutes.</p>
        """,
      debug=settings.DEBUG,
      error_email=settings.SEND_ERRORS_TO,
      smtp_server=settings.SMTP_HOST,
      from_address=settings.SMTP_FROM,
      error_subject_prefix='Gudgie Error - ')
