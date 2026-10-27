#!/bin/sh
set -e

# Ensure the uploads directory is writable by the strapi user.
# This is needed because Docker named volumes can inherit the wrong ownership
# when they are first created from an image.
chown -R strapi:nodejs /opt/app/public/uploads 2>/dev/null || true

# Drop privileges and run the original command.
exec su-exec strapi "$@"
