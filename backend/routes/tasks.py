from flask import Blueprint, request, jsonify
from supabase_client import get_supabase
from email_service import task_created_email, task_completed_email

tasks_bp = Blueprint("tasks", __name__)

@tasks_bp.route("/", methods=["GET"])
def get_tasks():
    supabase = get_supabase()
    result = supabase.table("tasks").select(
        "*, created_by_user:users!tasks_created_by_fkey(id, name, email, avatar_url), "
        "assigned_to_user:users!tasks_assigned_to_fkey(id, name, email, avatar_url)"
    ).order("created_at", desc=True).execute()
    return jsonify({"tasks": result.data}), 200


@tasks_bp.route("/", methods=["POST"])
def create_task():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    title = data.get("title")
    if not title:
        return jsonify({"error": "title is required"}), 400

    supabase = get_supabase()

    task_data = {
        "title": title,
        "description": data.get("description"),
        "status": data.get("status", "pending"),
        "priority": data.get("priority", "medium"),
        "created_by": data.get("created_by"),
        "assigned_to": data.get("assigned_to"),
        "due_date": data.get("due_date"),
    }

    result = supabase.table("tasks").insert(task_data).execute()

    if not result.data:
        return jsonify({"error": "Failed to create task"}), 500

    task = result.data[0]

    # Send email notification if task is assigned
    assigned_to_id = data.get("assigned_to")
    created_by_id = data.get("created_by")

    if assigned_to_id and assigned_to_id != created_by_id:
        try:
            assignee = supabase.table("users").select("*").eq("id", assigned_to_id).single().execute().data
            creator = supabase.table("users").select("*").eq("id", created_by_id).single().execute().data
            if assignee and creator:
                task_created_email(
                    assignee_name=assignee["name"],
                    assignee_email=assignee["email"],
                    task_title=title,
                    task_description=data.get("description"),
                    creator_name=creator["name"],
                    due_date=data.get("due_date")
                )
        except Exception as e:
            print(f"Email notification failed: {e}")

    return jsonify({"task": task}), 201


@tasks_bp.route("/<task_id>", methods=["PATCH"])
def update_task(task_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    supabase = get_supabase()

    # Fetch existing task to check status change
    existing = supabase.table("tasks").select("*").eq("id", task_id).single().execute().data
    if not existing:
        return jsonify({"error": "Task not found"}), 404

    allowed_fields = ["title", "description", "status", "priority", "assigned_to", "due_date"]
    update_data = {k: v for k, v in data.items() if k in allowed_fields}

    result = supabase.table("tasks").update(update_data).eq("id", task_id).execute()

    if not result.data:
        return jsonify({"error": "Failed to update task"}), 500

    updated_task = result.data[0]

    # Send completion email if status changed to 'completed'
    if data.get("status") == "completed" and existing.get("status") != "completed":
        try:
            created_by_id = existing.get("created_by")
            updater_id = data.get("updated_by")

            if created_by_id:
                creator = supabase.table("users").select("*").eq("id", created_by_id).single().execute().data
                completer = supabase.table("users").select("*").eq("id", updater_id).single().execute().data if updater_id else None

                if creator:
                    task_completed_email(
                        creator_name=creator["name"],
                        creator_email=creator["email"],
                        task_title=existing["title"],
                        completer_name=completer["name"] if completer else "A team member"
                    )
        except Exception as e:
            print(f"Completion email failed: {e}")

    return jsonify({"task": updated_task}), 200


@tasks_bp.route("/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    supabase = get_supabase()
    result = supabase.table("tasks").delete().eq("id", task_id).execute()
    return jsonify({"success": True}), 200
