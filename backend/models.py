from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(128), nullable=True)
    eth_address = db.Column(db.String(64), unique=True, nullable=True)
    sol_address = db.Column(db.String(64), unique=True, nullable=True)
    wins = db.relationship('Win', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Win(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(32), nullable=False)
    desc = db.Column(db.String(256), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) 