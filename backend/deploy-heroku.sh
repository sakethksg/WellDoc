#!/bin/bash
# Heroku deployment script

# Install Heroku CLI first: https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create app
heroku create welldoc-backend-$(date +%s)

# Set environment variables
heroku config:set PYTHONUNBUFFERED=1
heroku config:set ENVIRONMENT=production

# Add Python buildpack
heroku buildpacks:set heroku/python

# Deploy
git push heroku main

echo "✅ Deployed to Heroku!"
echo "🌐 App URL: $(heroku info -s | grep web_url | cut -d= -f2)"
