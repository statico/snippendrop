#!/usr/bin/env python

from snippendrop.application import app

import snippendrop.views
import snippendrop.rest
import snippendrop.rpc

if __name__ == '__main__':
  app.run()
