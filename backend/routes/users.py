from flask import Blueprint, request, jsonify
from supabase_client import get_supabase

users_bp = Blueprint("users", __name__)

@users_bp.route("/", methods=["GET"])
def get_users():
    """Get all users (for task assignment dropdown)."""
    supabase = get_supabase()
    result = supabase.table("users").select("id, name, email, avatar_url").order("name").execute()
    return jsonify({"users": result.data}), 200
