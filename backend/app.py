import os
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from config import Config
from models import db, User, Win

# Updated for Render deployment - v7
app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)
jwt = JWTManager(app)

# Import models after db initialization

@app.route('/version')
def version():
    return jsonify({"status": "updated", "version": "v7"})

@app.route('/test')
def test():
    return jsonify({"message": "This is a test endpoint", "timestamp": datetime.now().isoformat()})

@app.route('/register', methods=['POST'])
def register():
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
    
    user_id = get_jwt_identity()
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
        print(f"DEBUG: Found {len(wins)} wins")
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
            except Exception as e:
                print(f"DEBUG: Error formatting win {w.id}: {e}")
                # If date parsing fails, keep original
                formatted_wins.append({'date': w.date, 'desc': w.desc, 'subject': w.desc})
        
        print(f"DEBUG: Returning {len(formatted_wins)} formatted wins")
        return jsonify(formatted_wins)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get('PORT', 5050))
    app.run(debug=False, host='0.0.0.0', port=port) 