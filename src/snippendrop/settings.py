class Config(object):
    DEBUG = False
    TESTING = False
    SECRET_KEY = '\x9a\x07d5\xc9\xc7\x90KgG\xdc\xea(\x08Y\x88\x1dww)\x83\x7f\x0f\x11'

class ProductionConfig(Config):
    pass

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:////tmp/snippendrop.db'
    #SQLALCHEMY_ECHO = True
