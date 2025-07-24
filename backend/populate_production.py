import requests
import json

# Production API URL
API_BASE_URL = 'https://mindpalacefullstack-production.up.railway.app'

# Original milestones from the frontend
original_milestones = [
    { 'date': '02.02', 'subject': 'Summer Breeze x Aaaah.Culture at American Dream stage' },
    { 'date': '02.06', 'subject': 'Modeling at South Seaport Museum' },
    { 'date': '02.21', 'subject': 'Concert at UN' },
    { 'date': '03.02', 'subject': 'Summer Breeze at A Space Gallery' },
    { 'date': '03.13', 'subject': 'Concert at NYU Skirball' },
    { 'date': '04.05-06', 'subject': "'Round Table' filming" },
    { 'date': '04.13', 'subject': 'Life is good performance' },
    { 'date': '04.17', 'subject': 'Summer Breeze x Aaaah.Culture at Chelsea Walls Gallery' },
    { 'date': '04.26', 'subject': 'DJ at LIC' },
    { 'date': '05.10', 'subject': 'DJ at LIC' },
    { 'date': '05.10', 'subject': "'Feeder' filming" },
    { 'date': '05.11', 'subject': "'Lantern in the Woods' NYU Skirball Premiere" },
    { 'date': '05.13', 'subject': 'Mennafest Branding Design Release' },
    { 'date': '05.18', 'subject': "Summer Breeze at telos.haus, 'A Quiet Longing' Premiere" },
    { 'date': '06.02', 'subject': 'Meeting Candace Parker' },
    { 'date': '06.03', 'subject': 'DJ at Modega' },
    { 'date': '06.21', 'subject': 'Concert at NYU skirball' },
    { 'date': '06.24', 'subject': 'Filming with Brendon' },
    { 'date': '06.27', 'subject': 'Found Solana Coworking Space' },
    { 'date': '07.07-11', 'subject': 'Solana Hackathon, won 3rd Tier' },
    { 'date': '07.08', 'subject': 'MV shooting' },
    { 'date': '07.12', 'subject': 'Hackathon' },
    { 'date': '07.19', 'subject': 'Concert at Carnegie Hall' },
    { 'date': '07.26', 'subject': 'MV filming' },
    { 'date': '07.27', 'subject': 'Summer Breeze 2nd Year Anniversary Battle' },
]

def populate_production_wins():
    # First, login to get a token
    login_data = {
        'email': 'test@example.com',
        'password': 'testpass'
    }
    
    print("Logging in to get token...")
    login_response = requests.post(f'{API_BASE_URL}/login', json=login_data)
    
    if login_response.status_code != 200:
        print(f"Login failed: {login_response.status_code}")
        print(login_response.text)
        return
    
    token = login_response.json()['access_token']
    print(f"Login successful! Token: {token[:20]}...")
    
    # Add all the original milestones
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    success_count = 0
    for milestone in original_milestones:
        try:
            response = requests.post(f'{API_BASE_URL}/wins', 
                                   json=milestone, 
                                   headers=headers)
            if response.status_code == 200:
                success_count += 1
                print(f"✅ Added: {milestone['date']} - {milestone['subject']}")
            else:
                print(f"❌ Failed to add: {milestone['date']} - {milestone['subject']}")
                print(f"   Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            print(f"❌ Error adding {milestone['date']}: {e}")
    
    print(f"\n🎉 Successfully added {success_count} out of {len(original_milestones)} wins to production!")

if __name__ == '__main__':
    populate_production_wins() 