#!/usr/bin/env bash
set -euo pipefail

python3 -m pip install --upgrade pip >/dev/null
pip install -r requirements.txt >/dev/null

python3 manage.py migrate --noinput
python3 manage.py collectstatic --noinput

gunicorn academia_project.wsgi:application --bind 0.0.0.0:${PORT:-8000}

