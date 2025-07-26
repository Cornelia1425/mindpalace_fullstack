import os
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from config import Config
from models import db, User, Win

# Updated for Render deployment - v16
app = Flask(__name__)
app.config.from_object(Config)
# Configure CORS to allow requests from Vercel frontend
CORS(app, origins=['https://urmindpalace.vercel.app', 'http://localhost:5173'], supports_credentials=True)
db.init_app(app)
jwt = JWTManager(app)

# Import models after db initialization

@app.route('/version')
def version():
    return jsonify({"status": "updated", "version": "v20"})

@app.route('/test')
def test():
    return jsonify({"message": "This is a test endpoint", "timestamp": datetime.now().isoformat()})

@app.route('/init-db')
def init_db():
    try:
        with app.app_context():
            # Drop all tables first, then recreate
            db.drop_all()
            db.create_all()
        return jsonify({"message": "Database tables dropped and recreated successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({'msg': 'Email and password required'}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({'msg': 'Email already registered'}), 400
        user = User(email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return jsonify({'msg': 'Registered successfully'})
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'msg': 'Invalid credentials'}), 401
    access_token = create_access_token(identity=user.id)
    return jsonify({'access_token': access_token})

@app.route('/wins', methods=['GET', 'POST'])
@jwt_required()
def wins():
    print("DEBUG: ===== WINS ENDPOINT CALLED =====")
    print(f"DEBUG: Request method: {request.method}")
    print(f"DEBUG: Request headers: {dict(request.headers)}")
    print(f"DEBUG: Request data: {request.get_data()}")
    
    try:
        user_id = get_jwt_identity()
        print(f"DEBUG: JWT identity extracted: {user_id}")
    except Exception as e:
        print(f"DEBUG: Error extracting JWT identity: {e}")
        return jsonify({'msg': 'Invalid token'}), 401
    
    print(f"DEBUG: Wins endpoint called with method {request.method}, user_id: {user_id}")
    
    if request.method == 'POST':
        data = request.json
        print(f"DEBUG: POST data: {data}")
        date = data.get('date')
        # Support both 'desc' and 'subject' fields for compatibility
        desc = data.get('desc') or data.get('subject')
        print(f"DEBUG: Extracted desc: {desc}")
        if not desc:
            return jsonify({'msg': 'Description (desc or subject) is required'}), 422
        win = Win(date=date, desc=desc, user_id=user_id)
        db.session.add(win)
        db.session.commit()
        return jsonify({'msg': 'Win added'})
    else:
        print(f"DEBUG: GET request for user {user_id}")
        wins = Win.query.filter_by(user_id=user_id).all()
        # Format dates to MM.DD format for frontend
        formatted_wins = []
        for w in wins:
            try:
                # Handle different date formats
                if len(w.date) == 8 and w.date.isdigit():  # YYYYMMDD format
                    year = w.date[:4]
                    month = w.date[4:6]
                    day = w.date[6:8]
                    formatted_date = f"{month}.{day}"
                elif '.' in w.date:  # Already MM.DD format
                    formatted_date = w.date
                else:
                    formatted_date = w.date  # Keep as is if unknown format
                
                formatted_wins.append({'date': formatted_date, 'desc': w.desc, 'subject': w.desc})
            except:
                # If date parsing fails, keep original
                formatted_wins.append({'date': w.date, 'desc': w.desc, 'subject': w.desc})
        
        return jsonify(formatted_wins)

if __name__ == '__main__':
    with app.app_context():
        # Create all database tables
        db.create_all()
        print("Database tables created successfully!")
    port = int(os.environ.get('PORT', 5050))
    app.run(debug=False, host='0.0.0.0', port=port) 