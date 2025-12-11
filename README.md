# ระบบบริหารการลา (Leave Management System)

ระบบจัดการวันลาสำหรับองค์กร พัฒนาด้วย MERN Stack (MongoDB, Express, React, Node.js)

## 📋 ความต้องการระบบ

- **Node.js** v18+ ([ดาวน์โหลด](https://nodejs.org/))
- **MongoDB** (ใช้ [MongoDB Atlas](https://www.mongodb.com/atlas) ฟรี หรือติดตั้งในเครื่อง)
- **Git** ([ดาวน์โหลด](https://git-scm.com/))

---

## 🚀 ขั้นตอนการติดตั้ง

### 1. Clone โปรเจค

```bash
git clone <repository-url>
cd charged-kuiper
```

### 2. ติดตั้ง Dependencies

```bash
# ติดตั้ง Backend
cd server
npm install

# ติดตั้ง Frontend
cd ../client
npm install
```

### 3. ตั้งค่า Environment Variables

#### Backend (server/.env)

```bash
cd server
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
# MongoDB - สร้างฐานข้อมูลที่ MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/leave-system?retryWrites=true&w=majority

# JWT Secret - สร้างค่าสุ่มเอง
JWT_SECRET=your-super-secret-key-here

# Email (สำหรับแจ้งเตือน) - ใช้ Gmail App Password
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# N8N API Key (สำหรับ Weekly Report)
N8N_API_KEY=your-n8n-api-key
```

### 4. รันระบบ

```bash
# Terminal 1 - รัน Backend
cd server
npm run dev

# Terminal 2 - รัน Frontend
cd client
npm run dev
```

### 5. เปิดใช้งาน

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 👤 สร้าง Admin Account แรก

ใช้ API สร้าง admin:

```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{
  "employeeId": "ADMIN001",
  "firstName": "แอดมิน",
  "lastName": "ระบบ",
  "email": "admin@company.com",
  "password": "admin123",
  "department": "IT",
  "position": "System Admin",
  "role": "admin"
}'
```

หรือใช้ Postman/Insomnia

---

## 📧 ตั้งค่า Email (Gmail)

1. เปิด [Google Account Security](https://myaccount.google.com/security)
2. เปิด **2-Step Verification**
3. ไปที่ **App passwords**
4. สร้าง App password สำหรับ "Mail"
5. นำ password ที่ได้ไปใส่ใน `EMAIL_PASS`

---

## 🗃️ ตั้งค่า MongoDB Atlas (ฟรี)

1. ไปที่ [MongoDB Atlas](https://www.mongodb.com/atlas)
2. สร้าง Account / Login
3. สร้าง Cluster ใหม่ (เลือก M0 Free)
4. สร้าง Database User
5. ตั้งค่า Network Access → Add IP Address → `0.0.0.0/0`
6. คัดลอก Connection String ไปใส่ใน `MONGODB_URI`

---

## 📁 โครงสร้างโปรเจค

```
charged-kuiper/
├── client/              # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── package.json
├── server/              # Express Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── package.json
├── docker-compose.yml   # สำหรับ n8n
└── README.md
```

---

## 🔑 ฟีเจอร์หลัก

- ✅ ยื่นคำขอลา 8 ประเภท
- ✅ อนุมัติ/ปฏิเสธคำขอ
- ✅ แจ้งเตือน Email อัตโนมัติ
- ✅ รายงานสถิติ + Export Excel/PDF
- ✅ ปฏิทินทีม
- ✅ Weekly Report อัตโนมัติ (n8n)

---

## ❓ ปัญหาที่พบบ่อย

### MongoDB Connection Error

- ตรวจสอบ `MONGODB_URI` ถูกต้อง
- ตรวจสอบ Network Access ใน MongoDB Atlas

### Email ไม่ส่ง

- ตรวจสอบ App Password ถูกต้อง
- ต้องเปิด 2-Step Verification ก่อน

### Port ถูกใช้งานอยู่แล้ว

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```
