from app import app, db
from models import User, Win

# Original milestones from the frontend
original_milestones = [
    { 'date': '02.02', 'desc': 'Summer Breeze x Aaaah.Culture at American Dream stage' },
    { 'date': '02.06', 'desc': 'Modeling at South Seaport Museum' },
    { 'date': '02.21', 'desc': 'Concert at UN' },
    { 'date': '03.02', 'desc': 'Summer Breeze at A Space Gallery' },
    { 'date': '03.13', 'desc': 'Concert at NYU Skirball' },
    { 'date': '04.05-06', 'desc': "'Round Table' filming" },
    { 'date': '04.13', 'desc': 'Life is good performance' },
    { 'date': '04.17', 'desc': 'Summer Breeze x Aaaah.Culture at Chelsea Walls Gallery' },
    { 'date': '04.26', 'desc': 'DJ at LIC' },
    { 'date': '05.10', 'desc': 'DJ at LIC' },
    { 'date': '05.10', 'desc': "'Feeder' filming" },
    { 'date': '05.11', 'desc': "'Lantern in the Woods' NYU Skirball Premiere" },
    { 'date': '05.13', 'desc': 'Mennafest Branding Design Release' },
    { 'date': '05.18', 'desc': "Summer Breeze at telos.haus, 'A Quiet Longing' Premiere" },
    { 'date': '06.02', 'desc': 'Meeting Candace Parker' },
    { 'date': '06.03', 'desc': 'DJ at Modega' },
    { 'date': '06.21', 'desc': 'Concert at NYU skirball' },
    { 'date': '06.24', 'desc': 'Filming with Brendon' },
    { 'date': '06.27', 'desc': 'Found Solana Coworking Space' },
    { 'date': '07.07-11', 'desc': 'Solana Hackathon, won 3rd Tier' },
    { 'date': '07.08', 'desc': 'MV shooting' },
    { 'date': '07.12', 'desc': 'Hackathon' },
    { 'date': '07.19', 'desc': 'Concert at Carnegie Hall' },
    { 'date': '07.26', 'desc': 'MV filming' },
    { 'date': '07.27', 'desc': 'Summer Breeze 2nd Year Anniversary Battle' },
]

def populate_wins():
    with app.app_context():
        # Get the first user (or create one if none exists)
        user = User.query.first()
        if not user:
            print("No users found. Please register a user first.")
            return
        
        print(f"Adding wins for user: {user.email}")
        
        # Add all the original milestones
        for milestone in original_milestones:
            win = Win(date=milestone['date'], desc=milestone['desc'], user_id=user.id)
            db.session.add(win)
        
        db.session.commit()
        print(f"Successfully added {len(original_milestones)} wins to the database!")

if __name__ == '__main__':
    populate_wins() 