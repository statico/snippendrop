from google.appengine.ext.webapp.util import run_wsgi_app

from snippendrop.application import app

import snippendrop.views
import snippendrop.rpc

run_wsgi_app(app)
