from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from models import db, User, Win
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)
jwt = JWTManager(app)

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
    user_id = get_jwt_identity()
    if request.method == 'POST':
        data = request.json
        date = data.get('date')
        desc = data.get('desc')
        win = Win(date=date, desc=desc, user_id=user_id)
        db.session.add(win)
        db.session.commit()
        return jsonify({'msg': 'Win added'})
    else:
        wins = Win.query.filter_by(user_id=user_id).all()
        return jsonify([{'date': w.date, 'desc': w.desc} for w in wins])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 