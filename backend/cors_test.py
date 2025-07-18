from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/test", methods=["POST", "OPTIONS"])
def test():
    return "ok"

if __name__ == "__main__":
    app.run(debug=True)