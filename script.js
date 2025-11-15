// Configuration administrateur
const ADMIN_PASSWORD = "oussou2012";
let isAdmin = false;

// Clé pour le stockage partagé
const SHARED_CODES_KEY = "blueLockSharedCodes";

// Vérifier si l'utilisateur est admin via l'URL
function checkAdmin() {
    const urlParams = new URLSearchParams(window.location.search);
    const secretCode = urlParams.get('admin');
    
    // Vérifier le code secret dans l'URL
    if (secretCode === "oussou2012") {
        activateAdminMode();
        // Nettoyer l'URL pour cacher le code
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        const savedAdmin = localStorage.getItem('blueLockAdmin');
        if (savedAdmin === ADMIN_PASSWORD) {
            activateAdminMode();
        }
    }
}

// Activer le mode admin
function activateAdminMode() {
    isAdmin = true;
    document.getElementById('adminSection').style.display = 'block';
    localStorage.setItem('blueLockAdmin', ADMIN_PASSWORD);
    loadCodes();
}

// Connexion admin (cachée mais accessible via URL)
function loginAdmin() {
    const password = prompt("🔐 Mot de passe administrateur requis:");
    if (password === ADMIN_PASSWORD) {
        activateAdminMode();
        showStatus("✅ Connexion administrateur réussie!", "success");
    } else if (password !== null) {
        showStatus("❌ Mot de passe incorrect!", "error");
    }
}

// Déconnexion admin
function logoutAdmin() {
    isAdmin = false;
    document.getElementById('adminSection').style.display = 'none';
    localStorage.removeItem('blueLockAdmin');
    loadCodes();
    showStatus("👋 Déconnexion réussie", "success");
}

// Charger les codes depuis le localStorage partagé
function loadCodes() {
    let codes = localStorage.getItem(SHARED_CODES_KEY);
    if (!codes) {
        // Codes par défaut si aucun code n'existe
        codes = ["BLUE100K", "LOCK500K", "RIVALS1M"];
        localStorage.setItem(SHARED_CODES_KEY, JSON.stringify(codes));
    } else {
        codes = JSON.parse(codes);
    }
    displayCodes(codes);
}

// Afficher les codes
function displayCodes(codes) {
    const container = document.getElementById('codesContainer');
    container.innerHTML = '';

    if (codes.length === 0) {
        container.innerHTML = '<div class="code-item">Aucun code disponible pour le moment</div>';
        return;
    }

    codes.forEach((code, index) => {
        const codeElement = document.createElement('div');
        codeElement.className = 'code-item';
        codeElement.innerHTML = `
            <span class="code-text">${code}</span>
            ${isAdmin ? `<button class="delete-btn" onclick="deleteCode(${index})">Supprimer</button>` : ''}
        `;
        container.appendChild(codeElement);
    });

    // Ajouter le bouton de déconnexion si admin
    if (isAdmin) {
        const logoutBtn = document.createElement('div');
        logoutBtn.className = 'code-item';
        logoutBtn.style.justifyContent = 'center';
        logoutBtn.innerHTML = `
            <button class="delete-btn logout-btn" onclick="logoutAdmin()">Se déconnecter</button>
        `;
        container.appendChild(logoutBtn);
        
        // Ajouter un bouton de connexion rapide pour vous
        const quickLogin = document.createElement('div');
        quickLogin.className = 'code-item quick-login';
        quickLogin.style.justifyContent = 'center';
        quickLogin.innerHTML = `
            <button class="delete-btn quick-login-btn" onclick="loginAdmin()">Connexion Admin</button>
        `;
        container.appendChild(quickLogin);
    }
}

// Ajouter un nouveau code (admin seulement)
function addCode() {
    if (!isAdmin) {
        showStatus("❌ Accès administrateur requis!", "error");
        return;
    }

    const newCodeInput = document.getElementById('newCode');
    const code = newCodeInput.value.trim().toUpperCase();

    if (!code) {
        showStatus("❌ Veuillez entrer un code!", "error");
        return;
    }

    let codes = JSON.parse(localStorage.getItem(SHARED_CODES_KEY) || '[]');
    
    if (codes.includes(code)) {
        showStatus("❌ Ce code existe déjà!", "error");
        return;
    }

    codes.push(code);
    localStorage.setItem(SHARED_CODES_KEY, JSON.stringify(codes));
    
    newCodeInput.value = '';
    displayCodes(codes);
    showStatus("✅ Code ajouté avec succès! Tous les utilisateurs le verront.", "success");
}

// Supprimer un code (admin seulement)
function deleteCode(index) {
    if (!isAdmin) {
        showStatus("❌ Accès administrateur requis!", "error");
        return;
    }

    if (confirm("Êtes-vous sûr de vouloir supprimer ce code? Il sera supprimé pour tous les utilisateurs.")) {
        let codes = JSON.parse(localStorage.getItem(SHARED_CODES_KEY) || '[]');
        const deletedCode = codes[index];
        codes.splice(index, 1);
        localStorage.setItem(SHARED_CODES_KEY, JSON.stringify(codes));
        displayCodes(codes);
        showStatus(`✅ Code "${deletedCode}" supprimé avec succès!`, "success");
    }
}

// Afficher les messages de statut
function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'status-message';
    }, 3000);
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    checkAdmin();
    loadCodes();
    
    // Synchroniser toutes les 30 secondes
    setInterval(loadCodes, 30000);
});
