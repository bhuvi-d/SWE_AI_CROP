# 🌱 SWE_AI_CROP — AI Crop Disease Detection & Advisory System

An AI-powered agriculture assistant that helps farmers detect crop diseases from leaf images and receive treatment recommendations using Computer Vision and AI.

---

## 🚜 Overview

SWE_AI_CROP combines:

* 📱 Mobile/Web UI
* 🧠 CNN disease detection model
* 🤖 AI advisory system
* 🌍 Multilingual support
* 🔊 Voice assistance

The system is designed for **real-world farmer usability**, including **low-literacy accessibility** and **offline-friendly workflows**.

---

## 🎯 Project Goal

This project aims to build an intelligent agriculture support system that can:

* 🌿 Detect crop diseases from images
* 💊 Provide treatment recommendations
* 🔊 Provide audio guidance
* 🌍 Support multiple languages
* 📱 Work on Android and Web
* 📴 Support offline-first usage where possible

---

## 🧰 Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Context API
* Flutter Mobile App
* i18n translations

### AI / ML

* TensorFlow / Keras
* EfficientNet CNN (Transfer Learning)
* PlantVillage dataset

### Backend (Planned)

* FastAPI / Flask
* CNN inference API
* LLM advisory integration

### Deployment

* Vercel (Web)

---

## 🏗️ Project Structure

```
SWE_AI_CROP
│
├── android/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── translations/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── firebase.js
│
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## ✨ Current Features

### 👤 User Access

* Language selection
* Consent screen
* Guest mode
* Login UI
* User profile

### 📸 Capture & Input

* Camera capture interface
* Image upload UI
* Voice guidance hooks
* Audio feedback

### 🧠 Disease Detection (In Progress)

* CNN model training pipeline
* Image preprocessing
* Model export

### 🤖 Advisory System

* LLM advice page
* Crop advice cards
* AI service layer

### 🌍 Localization

Supports:
Hindi, English, Tamil, Telugu, Kannada, Marathi, Bengali, Gujarati, Punjabi, Malayalam, Odia, Urdu, Assamese, Nepali, Sanskrit

---

## 🚀 Deployment

Web App:
[https://swe-ai-crop.vercel.app/](https://swe-ai-crop.vercel.app/)

Android build supported via Capacitor.

---

## 🧪 CNN Model Training

Dataset: **PlantVillage**
Architecture: **EfficientNetB0 (Transfer Learning)**
Training: **Kaggle GPU / Colab GPU**

Output model:

```
crop_disease_model.h5
```

---

## 🔄 System Architecture Flow

```
                ┌────────────────────┐
                │      Farmer        │
                │ Capture Leaf Image │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │   React Frontend   │
                │ Camera / Upload UI │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ Backend Inference  │
                │   (FastAPI/Flask)  │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │   CNN Model (TF)   │
                │ Disease Prediction │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │    LLM Advisory    │
                │ Treatment Guidance │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │   UI + Audio Tips  │
                └────────────────────┘
```

---

## ▶️ Running the Project

Install dependencies:

```
npm install
```

Run locally:

```
npm run dev
```

Build project:

```
npm run build
```

---

## 👥 Team Roles

| Name | Role |
|------|------|
| Bhuvaneshwari | DevOps  Engineer |
| Dhanuja | Backend Engineer |
| Ramaroshinee | Frontend & Backend Developer |
| Akshith | Frontend Developer |
| Saketh | Testing Engineer |



---

## 🔮 Future Improvements

* Real-time CNN inference API
* Offline model inference
* Region-specific recommendations
* Push notifications
* Farmer feedback loop
* Model optimization
* Dataset expansion

---

## 🌾 Vision

Build an AI assistant that makes crop disease detection **accessible, fast, and understandable for farmers everywhere.**

---
