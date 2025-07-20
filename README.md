# 🐳 Damn Vulnerable prototype-pollution-application

A Docker-based lab environment to learn and demonstrate **Server-Side Prototype Pollution (SSPP)** vulnerabilities in JavaScript/Node.js applications.

---

## 🧪 Overview

This lab is built to simulate real-world prototype pollution attacks in server-side environments. It helps developers, bug bounty hunters, and security researchers:

- Understand the internal working of SSPP
- Test how insecure object merging can be exploited
- Learn how to fix these vulnerabilities securely

> ⚠️ **For educational purposes only. Not for production use.**  
> 🎯 **Difficulty**: Easy

---

## 🚀 Getting Started

You can run this lab in two ways:

### 🔹 Option 1: Using the Docker Hub Image

#### ✅ Step 1: Pull the Docker image
```bash
docker pull badimagefactory/pp-ctf
```
#### ✅ Step 2: Run the container
```bash
docker run -p 3000:3000 badimagefactory/pp-ctf
```

#### ✅ Step 3: Access the vulnerable app
Open your browser and navigate to: 
``` html
http://localhost:3000
```
### 🔹 Option 2: Clone from GitHub and Build Locally
#### ✅ Step 1: Clone the repository
```bash
git clone https://github.com/Manif3stVoid/pp-ctf.git
cd pp-ctf
```
#### ✅ Step 2: Build the Docker image
``` bash
docker build -t pp-ctf .
```
#### ✅ Step 3: Run the container
``` bash
docker run -p 3000:3000 pp-ctf
```
#### ✅ Step 4: Access the app
Open your browser and go to:
```
http://localhost:3000
```

## 📚 References

- [OWASP: Prototype Pollution](https://owasp.org/www-community/attacks/Prototype_Pollution)
- [Prototype Pollution – PortSwigger](https://portswigger.net/web-security/prototype-pollution)
- [PayloadsAllTheThings – Prototype Pollution](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Insecure%20Deserialization/Prototype%20Pollution)
- [KTH-LangSec/server-side-prototype-pollution (GitHub)](https://github.com/KTH-LangSec/server-side-prototype-pollution)

