from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")], supports_credentials=True)

app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")

from routes.auth import auth_bp
from routes.tasks import tasks_bp
from routes.users import users_bp

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
app.register_blueprint(users_bp, url_prefix="/api/users")

@app.route("/api/health")
def health():
    return {"status": "ok", "message": "TaskFlow API is running"}

if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_ENV") == "development", port=5000)
