<<<<<<< HEAD
# Cviator Pro — Smart Resume Builder

A full-stack, production-ready resume builder web application with multiple templates,
live preview, PDF export, optional database storage, and a complete DevOps pipeline.

---

## Project Overview

**Cviator Pro** lets users enter their personal details, education, experience, skills,
and projects, pick from multiple professionally-designed resume templates, see a live
preview in the browser, and download a polished PDF of their resume.

The project is organized as two services (frontend + backend) and ships with Docker,
Docker Compose, GitHub Actions CI/CD, Terraform, and AWS EC2 deployment instructions.

---

## Features

- Multi-section resume form (personal info, education, experience, skills, projects)
- Real-time live preview using React state
- Two hand-built resume templates (Classic & Modern) — switchable with a button
- PDF download powered by Puppeteer (server-side rendering)
- Optional MongoDB persistence (save & fetch resumes)
- Placeholder AI endpoint (`/improve-text`) ready for integration
- Fully Dockerized (frontend, backend, MongoDB)
- GitHub Actions CI/CD pipeline
- Terraform skeleton for AWS infrastructure
- Step-by-step AWS EC2 deployment guide

---

## Tech Stack

| Layer          | Technology                 |
|----------------|----------------------------|
| Frontend       | Next.js (React) + Tailwind |
| Backend        | Node.js + Express          |
| PDF Engine     | Puppeteer                  |
| Database       | MongoDB + Mongoose (opt.)  |
| Containers     | Docker + Docker Compose    |
| CI/CD          | GitHub Actions             |
| IaC (optional) | Terraform                  |
| Cloud          | AWS EC2                    |

---

## Project Structure

```
devops_Project/
├── frontend/              # Next.js + Tailwind app
│   ├── pages/
│   ├── components/
│   │   └── templates/
│   ├── styles/
│   ├── Dockerfile
│   └── package.json
├── backend/               # Express API + Puppeteer PDF
│   ├── routes/
│   ├── models/
│   ├── utils/
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
├── terraform/             # Optional IaC (AWS)
│   └── main.tf
├── .github/workflows/
│   └── main.yml           # CI/CD pipeline
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Local Setup (without Docker)

### Prerequisites
- Node.js 18+
- npm
- (Optional) MongoDB running locally on `mongodb://localhost:27017`

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # edit MONGO_URI if you want DB persistence
npm run dev
```

Backend runs on **http://localhost:5000**.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on **http://localhost:3000**.

Open your browser at http://localhost:3000, fill in the form, switch templates, and
click **Download PDF**.

---

## Running with Docker

### Build and start everything

```bash
docker-compose up --build
```

This boots up:
- `frontend` on port **3000**
- `backend`  on port **5000**
- `mongo`    on port **27017** (optional — skip by commenting it out)

### Stop

```bash
docker-compose down
```

### Build individual images

```bash
docker build -t cviator-frontend ./frontend
docker build -t cviator-backend  ./backend
```

---

## CI/CD Pipeline (GitHub Actions)

File: `.github/workflows/main.yml`

The pipeline runs on every push to `main` and:

1. **Checks out** the source code
2. **Sets up Node.js 18**
3. **Installs dependencies** for frontend and backend
4. **Builds** the Next.js frontend (`npm run build`)
5. **Builds Docker images** for both services
6. *(Optional)* Pushes images to Docker Hub if secrets are set

Configure the following repository secrets if you want to push images:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

---

## Deployment on AWS EC2

### 1. Launch an EC2 Instance
- AMI: Ubuntu 22.04 LTS
- Instance type: `t2.medium` (Puppeteer/Chromium needs memory)
- Security Group: allow inbound **22 (SSH)**, **3000**, **5000**

### 2. SSH Into the Server

```bash
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### 3. Install Docker + Docker Compose

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git
sudo usermod -aG docker ubuntu
newgrp docker
```

### 4. Clone the Project

```bash
git clone https://github.com/<your-user>/<your-repo>.git
cd <your-repo>
```

### 5. Launch the Stack

```bash
docker-compose up -d --build
```

### 6. Access the App

Open your browser at:

```
http://<EC2-PUBLIC-IP>:3000
```

### 7. (Optional) Put it Behind Nginx + HTTPS
- Install Nginx + Certbot
- Reverse-proxy port 3000 to port 80/443
- Issue a Let's Encrypt certificate

---

## Terraform (Optional)

A minimal Terraform script is provided in `terraform/main.tf` to provision an
EC2 instance. Run:

```bash
cd terraform
terraform init
terraform apply
```

You must configure AWS credentials (`aws configure`) first.

---

## Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/cviator
USE_DB=false
```

Set `USE_DB=true` only if you have MongoDB running.

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

When running in Docker, this is automatically set to `http://backend:5000`
via `docker-compose.yml`.

---

## AI Integration Placeholder

The backend exposes `POST /improve-text`. It currently echoes the input with a
mock improvement. Swap in Anthropic/OpenAI/etc. inside `backend/routes/ai.js`
where the `// TODO: integrate real AI API` comment lives.

---

## License

MIT — do whatever you want, a credit is appreciated.
=======
# Cviator
>>>>>>> dd7ce9e16d7a438fab36b9e5461fc2810fe72ce3
