from flask import Blueprint, request, jsonify
from supabase_client import get_supabase
import os

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/sync-user", methods=["POST"])
def sync_user():
    """
    Called from frontend after Google OAuth.
    Syncs the Google user into our users table.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    email = data.get("email")
    name = data.get("name")
    avatar_url = data.get("avatar_url")
    google_id = data.get("google_id")

    if not email or not google_id:
        return jsonify({"error": "email and google_id are required"}), 400

    supabase = get_supabase()

    # Upsert user
    result = supabase.table("users").upsert({
        "email": email,
        "name": name,
        "avatar_url": avatar_url,
        "google_id": google_id,
    }, on_conflict="google_id").execute()

    if result.data:
        return jsonify({"user": result.data[0]}), 200
    return jsonify({"error": "Failed to sync user"}), 500


@auth_bp.route("/me", methods=["GET"])
def get_me():
    """Get current user by google_id from query param."""
    google_id = request.args.get("google_id")
    if not google_id:
        return jsonify({"error": "google_id required"}), 400

    supabase = get_supabase()
    result = supabase.table("users").select("*").eq("google_id", google_id).single().execute()

    if result.data:
        return jsonify({"user": result.data}), 200
    return jsonify({"error": "User not found"}), 404
