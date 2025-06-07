import os
from datetime import timedelta
from flask import Blueprint, request, jsonify
from models import db, User, bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import requests
import random
from email.mime.text import MIMEText
from flask import current_app
import smtplib
from config import Config

# Temporary in-memory store for OTPs
otp_store = {}

# Define Blueprint for auth-related routes
auth_bp = Blueprint("auth", __name__)

# Standardized JSON response wrapper
def response(status: int, message: str, data=None):
    return jsonify({
        "status": status,
        "message": message,
        "data": data
    }), status

# User signup endpoint
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json

    required_fields = ["first_name", "last_name", "email", "password"]
    if not all(field in data for field in required_fields):
        return response(400, "Missing required fields")

    if User.query.filter_by(email=data["email"]).first():
        return response(409, "Email already registered")

    try:
        new_user = User(
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data["email"],
        )
        new_user.set_password(data["password"])  # Hash and store password

        db.session.add(new_user)
        db.session.commit()

        return response(201, "User created successfully", {"user_id": new_user.id})

    except Exception as e:
        return response(500, "An error occurred while creating the user", str(e))

# User login endpoint with email/password
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(email=data.get("email")).first()
    if user and user.check_password(data.get("password")):
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=6)  # Token valid for 6 hours
        )
        return response(200, "Login successful", {
            "access_token": access_token,
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
            }
        })

    return response(401, "Invalid credentials")

# Google OAuth login endpoint
@auth_bp.route("/login/google", methods=["POST"])
def google_login():
    """
    Authenticate user using Google OAuth.
    """
    data = request.json
    google_token = data.get("token")

    if not google_token:
        return response(400, "Missing Google token")

    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    google_verify_url = f"https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={google_token}"

    try:
        # Verify Google token
        google_response = requests.get(google_verify_url)
        google_data = google_response.json()

        if "email" not in google_data or google_data.get("aud") != google_client_id:
            return response(401, "Invalid Google token")

        email = google_data["email"]
        first_name = google_data.get("given_name", "")
        last_name = google_data.get("family_name", "")

        # Lookup existing user or create a new one
        user = User.query.filter_by(email=email).first()

        if not user:
            user = User(
                first_name=first_name,
                last_name=last_name,
                email=email,
                google_id=google_data["sub"],
            )
            db.session.add(user)
            db.session.commit()

        access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=6))

        return response(200, "Google login successful", {
            "access_token": access_token,
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
            }
        })

    except requests.RequestException as e:
        return response(500, "Failed to verify Google token", str(e))

# Get user profile (requires JWT)
@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return response(404, "User not found")

    return response(200, "Profile retrieved successfully", {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
    })

# Update user profile (requires JWT)
@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return response(404, "User not found")

    data = request.json
    first_name = data.get("first_name")
    last_name = data.get("last_name")

    if not first_name or not last_name:
        return response(400, "Both first name and last name are required")

    try:
        user.first_name = first_name
        user.last_name = last_name

        db.session.commit()

        return response(200, "Profile updated successfully", {
            "first_name": user.first_name,
            "last_name": user.last_name
        })

    except Exception as e:
        return response(500, "An error occurred while updating the profile", str(e))

# Helper function to send email
def send_email(subject, recipient, body):
    try:
        msg = MIMEText(body, "html")
        msg["Subject"] = subject
        msg["From"] = os.getenv("DEFAULT_FROM_EMAIL")
        msg["To"] = recipient

        server = smtplib.SMTP(os.getenv("EMAIL_HOST"), int(os.getenv("EMAIL_PORT")))
        server.starttls()
        server.login(os.getenv("EMAIL_HOST_USER"), os.getenv("EMAIL_HOST_PASSWORD"))
        server.sendmail(msg["From"], [msg["To"]], msg.as_string())
        server.quit()
    except Exception as e:
        print(f"Email sending error: {e}")
        raise e

# Request password reset (generate and email OTP)
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    email = data.get("email")

    user = User.query.filter_by(email=email).first()
    if not user:
        return response(404, "Email not found")

    otp = random.randint(100000, 999999)  # Generate random 6-digit OTP
    otp_store[email] = str(otp)  # Store OTP temporarily

    try:
        send_email(
            subject="CulinaMind Password Reset OTP",
            recipient=email,
            body=f"<h3>Your OTP is: <strong>{otp}</strong></h3><p>This code expires in 10 minutes.</p>",
        )
        return response(200, "OTP sent to your email")
    except Exception as e:
        return response(500, "Failed to send OTP", str(e))

# Verify OTP for password reset
@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    email = data.get("email")
    otp = data.get("otp")

    if otp_store.get(email) == otp:
        return response(200, "OTP verified")
    return response(400, "Invalid or expired OTP")

# Confirm new password using verified OTP
@auth_bp.route("/reset-password/confirm", methods=["POST"])
def set_new_password():
    data = request.json
    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get("new_password")

    if otp_store.get(email) != otp:
        return response(400, "Invalid or expired OTP")

    user = User.query.filter_by(email=email).first()
    if not user:
        return response(404, "User not found")

    user.set_password(new_password)  # Update password
    db.session.commit()
    otp_store.pop(email, None)  # Clear OTP after use

    return response(200, "Password reset successful")
