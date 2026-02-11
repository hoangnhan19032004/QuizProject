🎯 Quiz_5AT – Online Quiz Web Application

🚀 Quiz_5AT là một ứng dụng web tạo và làm bài trắc nghiệm trực tuyến, được xây dựng theo kiến trúc Client–Server với React ở frontend và Node.js/Express ở backend.

Ứng dụng giúp người dùng dễ dàng tham gia quiz, quản lý câu hỏi và theo dõi kết quả một cách nhanh chóng.

📌 Features

✅ Đăng ký / đăng nhập người dùng
✅ Làm bài trắc nghiệm online
✅ Quản lý câu hỏi & quiz
✅ Giao diện hiện đại, responsive
✅ Animation mượt mà
✅ Kết nối database SQL Server
✅ RESTful API

🏗️ System Architecture

Project sử dụng mô hình:

👉 Client – Server Architecture

Frontend (React)
       ↓ HTTP / REST API
Backend (Node.js + Express)
       ↓
SQL Server Database

Kiểu kiến trúc áp dụng:

Frontend: Component-Based Architecture

Backend: MVC Pattern (Routes → Controllers → Database)

🛠️ Tech Stack
🔵 Frontend

React – Xây dựng giao diện

Vite – Build tool siêu nhanh

React Router DOM – Điều hướng trang

Tailwind CSS – Styling

Framer Motion – Animations

Lucide React – Icons

Context API – State management

🟢 Backend

Node.js

Express.js

mssql – Kết nối SQL Server

dotenv – Environment variables

cors

nodemon

🟣 Database

Microsoft SQL Server

📂 Project Structure
Frontend
src/
 ├── components/     # Reusable UI components
 ├── pages/          # Application pages
 ├── context/        # Global state
 ├── assets/         # Images, icons
 └── lib/            # Utilities / helpers

Backend
src/
 ├── config/         # Database connection
 ├── controllers/    # Business logic
 ├── routes/         # API endpoints
 └── app.js          # Server entry point

⚙️ Installation & Setup
1️⃣ Clone project
git clone <your-repo-url>
cd Quiz_5AT

2️⃣ Setup Backend
cd backend
npm install


Tạo file .env:

PORT=5000
DB_USER=your_user
DB_PASSWORD=your_password
DB_SERVER=localhost
DB_DATABASE=QuizDB


Chạy server:

npm run dev

3️⃣ Setup Frontend
cd frontend
npm install
npm run dev


App sẽ chạy tại:

http://localhost:5173

🔌 API Overview
Method	Endpoint	Description
GET	/api/quizzes	Lấy danh sách quiz
POST	/api/auth/login	Đăng nhập
POST	/api/auth/register	Đăng ký
GET	/api/questions	Lấy câu hỏi

👉 Có thể mở rộng thêm tùy theo project của bạn.

🔥 Technical Highlights

⭐ SPA (Single Page Application)
⭐ RESTful API design
⭐ Modern React with Vite
⭐ MVC backend structure
⭐ SQL Server integration
⭐ Clean & scalable folder structure

🚀 Future Improvements

Thêm JWT Authentication

Role-based authorization (Admin/User)

Dashboard thống kê

Timer cho quiz

Deployment (Docker / Cloud)

Unit testing

👨‍💻 Author

Nhân Hoàng
IT Student / Web Developer