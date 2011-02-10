from functools import wraps
from flask import request, render_template, jsonify, g, redirect, url_for

from snippendrop.application import app

def login_required():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if g.user:
                return f(*args, **kwargs)
            else:
                return redirect(url_for('welcome'))
        return decorated_function
    return decorator

def templated(template=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            template_name = template
            if template_name is None:
                template_name = request.endpoint \
                    .replace('.', '/') + '.html'
            ctx = f(*args, **kwargs)
            if ctx is None:
                ctx = {}
            elif not isinstance(ctx, dict):
                return ctx
            return render_template(template_name, **ctx)
        return decorated_function
    return decorator

def json():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            result = f(*args, **kwargs)
            if result:
                return jsonify(result)
            else:
                return jsonify({})
        return decorated_function
    return decorator

def rpc(f):
    url = '/rpc/%s' % f.__name__
    f = app.route(url, methods=['POST'])(f)
    f = json()(f)
    return f

def rest(f):
    url = '/json/%s' % f.__name__
    @app.route(url, methods=['GET', 'POST'])
    @app.route(url + '/<int:id>', methods=['GET', 'PUT', 'DELETE'])
    @json()
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except AssertionError, e:
            logging.warn('REST error: %s', e)
            abort(400)
    return wrapper
