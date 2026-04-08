# AI Guest Experience System - PASO 2

## Configuración Base del Proyecto

Este es el **PASO 2** donde configuramos la estructura base de Node.js, Express y la base de datos.

---

## 📦 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd AI-Guest-Experience-System
```

### 2. Instalar dependencias

```bash
npm install
```

Esto instalará:
- ✅ Express (framework web)
- ✅ Twilio (para WhatsApp)
- ✅ OpenAI (para IA)
- ✅ better-sqlite3 (base de datos)
- ✅ dotenv (variables de entorno)
- ✅ Otras dependencias

---

## ⚙️ Configuración

### 1. Crear archivo .env

Copiar `.env.example` a `.env`:

```bash
cp .env.example .env
```

### 2. Configurar variables de entorno

Editar `.env` y llenar:

```env
# Twilio (obtener de https://console.twilio.com)
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your_token

# OpenAI (obtener de https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-xxxxxx

# Base de datos (sqlite por defecto)
DATABASE_TYPE=sqlite
DATABASE_URL=sqlite:./database.sqlite
```

---

## 🗄️ Inicializar Base de Datos

Ejecutar el script de migración:

```bash
npm run migrate
```

Esto creará las tablas:
- ✅ `hotels`
- ✅ `guests`
- ✅ `interactions`
- ✅ `experiences`
- ✅ `gastronomy`

---

## 🚀 Ejecutar el servidor

```bash
npm start
```

O en desarrollo con auto-reload:

```bash
npm run dev
```

**Salida esperada:**

```
╔════════════════════════════════════════════════════════╗
║     AI GUEST EXPERIENCE SYSTEM - Starting Server       ║
╚════════════════════════════════════════════════════════╝

⚙️  Environment: development
📍 Port: 3000
🏨 Hotel: The Plaza Hotel
🗣️  Language: ES
🕐 Timezone: America/Bogota

📊 Initializing database...
✅ Database connected

🚀 Server running at http://localhost:3000
📋 API Info: http://localhost:3000/api/info
💚 Health Check: http://localhost:3000/health

✨ Ready to receive WhatsApp messages!
```

---

## ✅ Verificar que todo está funcionando

### 1. Health Check

```bash
curl http://localhost:3000/health
```

**Respuesta esperada:**

```json
{
  "status": "ok",
  "app": "AI Guest Experience System",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2024-02-15T10:30:00.000Z"
}
```

### 2. API Info

```bash
curl http://localhost:3000/api/info
```

**Respuesta esperada:**

```json
{
  "app": "AI Guest Experience System",
  "version": "1.0.0",
  "description": "AI-powered Guest Experience System for Hotels",
  "endpoints": {
    "health": "GET /health",
    "webhook": "POST /webhook",
    "guests": "GET/POST /guests",
    "interactions": "GET /interactions/:guest_id"
  }
}
```

---

## 📁 Estructura de carpetas creada

```
AI-Guest-Experience-System/
├── src/
│   ├── config/
│   │   ├── environment.js       ✅ Creado
│   │   ├── database.js          ✅ Creado
│   │   └── whatsapp.js          ✅ Creado
│   └── app.js                   ✅ Creado
├── migrations/
│   ├── schema.sql               ✅ Creado
│   └── init.js                  ✅ Creado
├── server.js                    ✅ Creado
├── package.json                 ✅ Creado
├── .env                         ✅ Creado
├── .env.example                 ✅ Creado
└── .gitignore                   ✅ Creado
```

---

## 🔍 Estructura Base completada

En el PASO 2 hemos creado:

✅ Configuración de variables de entorno
✅ Conexión a base de datos (SQLite + PostgreSQL)
✅ Inicialización de tablas
✅ Configuración de Twilio
✅ Configuración de Express
✅ Entry point del servidor

---

## ⚠️ Notas importantes

1. **SQLite vs PostgreSQL**: Por defecto usamos SQLite para facilitar desarrollo. Para producción, cambiar a PostgreSQL.

2. **Variables de entorno**: Sin `TWILIO_API_KEY` y `OPENAI_API_KEY`, los webhooks funcionarán pero no podrán enviar mensajes.

3. **Base de datos**: Se crea automáticamente en `./database.sqlite` cuando ejecutas `npm run migrate`.

---

## 📋 Próximo paso: PASO 3

En el PASO 3 crearemos:
- ✏️ Models (capas de acceso a datos)
- 🔌 Controllers
- ⚙️ Services
- 🌐 Routes

**¿PASO 2 Confirmado?**

Responde: **"PASO 2 CONFIRMADO"** para avanzar al PASO 3.

---

## 🆘 Troubleshooting

### Error: "Cannot find module 'better-sqlite3'"

```bash
npm install better-sqlite3
```

### Error: "ENOENT: no such file or directory '.env'"

```bash
cp .env.example .env
```

### Error: "Port 3000 already in use"

```bash
# Cambiar puerto en .env
PORT=3001
```

### Error de Twilio/OpenAI

Validar que las claves estén correctas en `.env`.
