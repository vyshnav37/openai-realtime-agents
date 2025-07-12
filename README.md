# 🏖️ Luxury Villa Pool Maintenance App

A zero-cost WhatsApp to Excel automation tool for luxury villa pool and fountain maintenance. This application automatically processes WhatsApp messages from maintenance staff and converts them into structured Excel reports.

## 🚀 Features

### Core Functionality
- **Villa-Centric Processing**: Automatically recognizes villa numbers from ranges 101-112, 201-207, 301-308, 401-409, 501-511, 601-610, 701-709, 801-806, 901-907
- **Smart Message Parsing**: Extracts maintenance data from natural language WhatsApp messages
- **Excel Auto-Fill**: Directly maps WhatsApp data to Excel columns with proper formatting
- **Real-time Dashboard**: Modern React interface with real-time stats and alerts

### Smart Automation Features
- **Message Recognition**: Automatically detects pool maintenance vs fountain issues
- **pH Level Alerts**: Highlights low pH levels (< 7.2) for immediate attention
- **Villa Status Tracking**: Monitors occupancy status (Occupied, Vacant Clean, Vacant Dirty)
- **Time Calculation**: Auto-calculates maintenance time windows
- **Series Categorization**: Organizes villas by series (1-9) for better management

## 🛠️ Technical Stack

| Component | Technology | Cost |
|-----------|------------|------|
| Frontend | Next.js + React + Tailwind CSS | Free |
| Backend | Python Flask + SQLAlchemy | Free |
| Database | SQLite | Free |
| WhatsApp Bridge | Selenium WebDriver | Free |
| Excel Processing | OpenPyXL | Free |
| UI Components | Shadcn/UI + Lucide Icons | Free |

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Chrome browser (for WhatsApp automation)
- Git

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd pool-maintenance-app
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Initialize database
python app.py
```

### 3. Frontend Setup
```bash
# Navigate to root directory
cd ..

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

## 🚀 Usage

### 1. Start the Backend Server
```bash
cd backend
python app.py
```
Backend will start on `http://localhost:5000`

### 2. Start the Frontend
```bash
npm run dev
```
Frontend will be available at `http://localhost:3000`

### 3. WhatsApp Automation (Optional)
```bash
cd backend
python whatsapp_automation.py
```
- First run will open Chrome and require QR code scan
- After authentication, it will monitor "Pool Maintenance" WhatsApp group
- Messages will be automatically processed and stored

## 📱 Message Format Examples

### Pool Maintenance Messages
```
507 pool chlorine 1.2 pH 7.5 temperature 28
301 chlorine 0.8 pH 7.1 occupied
605 maintenance complete pH 7.4 chlorine 1.5
```

### Fountain Issue Messages
```
702 fountain nozzle broken need repair
501 fountain pump not working
308 fountain filter needs cleaning
```

### Status Update Messages
```
301 occupied guest checked in
507 vacant clean ready for next guest
209 vacant dirty needs cleaning
```

## 🎯 Key Features Explained

### 1. Message Processor
- Paste WhatsApp messages directly into the interface
- Automatic villa number recognition
- Extracts chlorine levels, pH values, temperature
- Determines villa occupancy status

### 2. Dashboard Stats
- **Total Villas**: 78 villas across 9 series
- **Today's Records**: Real-time maintenance count
- **pH Alerts**: Automatic flagging of low pH levels
- **Fountain Issues**: Unresolved fountain problems tracker

### 3. Villa Status Grid
- Visual grid showing all villas by series
- Color-coded status indicators:
  - 🔴 Red: Occupied (OCC)
  - 🟢 Green: Vacant Clean (VC)
  - 🟡 Yellow: Vacant Dirty (VD)

### 4. Excel Export
- Professional formatting with headers
- Automatic data mapping to correct columns
- pH level highlighting for alerts
- Separate tabs for fountain issues

## 🏗️ Architecture

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   WhatsApp Web      │    │   Next.js Frontend  │    │   Flask Backend     │
│   (Selenium)        │────│   (React + Tailwind)│────│   (Python + SQLite) │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
                                       │
                                       ▼
                           ┌─────────────────────┐
                           │   Excel Reports     │
                           │   (OpenPyXL)        │
                           └─────────────────────┘
```

## 🔑 API Endpoints

### Villa Management
- `GET /api/villas` - Get all villas
- `GET /api/dashboard-stats` - Get dashboard statistics

### Message Processing
- `POST /api/process-message` - Process WhatsApp message
- `GET /api/maintenance-records` - Get maintenance records

### Export
- `GET /api/export-excel` - Export to Excel

## 📊 Database Schema

### Villa Table
- `id`: Primary key
- `villa_number`: Villa number (101-907)
- `series`: Series classification (Series1-9)
- `status`: Current status (OCC/VC/VD)

### MaintenanceRecord Table
- `id`: Primary key
- `villa_id`: Foreign key to Villa
- `timestamp`: Record timestamp
- `chlorine_level`: Chlorine level (ppm)
- `ph_level`: pH level
- `temperature`: Temperature (°C)
- `status`: Villa status
- `notes`: Original message text

### FountainMaintenance Table
- `id`: Primary key
- `villa_id`: Foreign key to Villa
- `fountain_name`: Fountain identifier
- `issue_description`: Problem description
- `status`: Issue status
- `resolved`: Resolution status

## 🎨 UI Components

The app uses a modern component library with:
- **Cards**: Data display containers
- **Badges**: Status indicators
- **Alerts**: Notifications and warnings
- **Tabs**: Navigation between sections
- **Buttons**: Action triggers
- **Forms**: Data input interfaces

## 🚀 Production Deployment

### Backend (Python Flask)
```bash
# Install production server
pip install gunicorn

# Run production server
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend (Next.js)
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Environment Variables
Create `.env` file in backend directory:
```
FLASK_ENV=production
DATABASE_URL=sqlite:///pool_maintenance.db
API_BASE_URL=http://localhost:5000
```

### WhatsApp Chat Configuration
Modify `whatsapp_automation.py`:
```python
# Change chat name as needed
automation.monitor_messages(chat_name="Your Pool Group Name")
```

## 🆘 Troubleshooting

### Common Issues

1. **WhatsApp QR Code Not Appearing**
   - Ensure Chrome browser is updated
   - Check User_Data directory permissions
   - Restart the automation script

2. **API Connection Errors**
   - Verify backend server is running on port 5000
   - Check firewall settings
   - Ensure database is initialized

3. **Message Processing Failures**
   - Verify villa number is in valid range
   - Check message format matches examples
   - Review API logs for errors

### Performance Tips
- Use headless Chrome for production WhatsApp automation
- Implement message batching for high-volume groups
- Regular database cleanup for old records
- Monitor memory usage for long-running processes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for luxury villa management**

*Zero-cost solution for professional pool maintenance tracking*
