document.addEventListener('DOMContentLoaded', function() {
    const selector = document.querySelector('#diseño');
    const body = document.querySelector('body');

    selector.addEventListener('change', function() {
        if (this.value === 'black') {
            body.style.backgroundColor = '#131314';
            body.style.color = 'white';
        } else {
            body.style.backgroundColor = 'white';
            body.style.color = '#1f1f1f';
        }
    });
});

function mostrarPreview() {
    const file = document.getElementById('file-input').files[0];
    const preview = document.getElementById('file-preview');
    
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <div class="relative group" style="position: relative; display: inline-block;">
                    <img src="${e.target.result}" style="height: 80px; width: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #4b5563;">
                    <button onclick="limpiarArchivo()" style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">×</button>
                </div>`;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function limpiarArchivo() {
    document.getElementById('file-input').value = '';
    const preview = document.getElementById('file-preview');
    preview.classList.add('hidden');
    preview.innerHTML = '';
}

async function enviarMensaje() {
    const input = document.getElementById('user-input');
    const fileInput = document.getElementById('file-input');
    const chatWindow = document.getElementById('chat-window');
    const welcome = document.getElementById('welcome-message');

    if (!input.value.trim() && !fileInput.files[0]) return;

    if (welcome) welcome.style.display = 'none';

    const userMsg = input.value;
    chatWindow.innerHTML += `
        <div class="message-user" style="display: flex; flex-direction: column; align-items: flex-end; margin-bottom: 16px;">
            <div style="background-color: #2f2f2f; padding: 16px; border-radius: 16px; max-width: 80%; color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                ${userMsg || "(Imagen enviada)"}
            </div>
        </div>`;
    
    const formData = new FormData();
    formData.append('pregunta', userMsg);
    if (fileInput.files[0]) {
        formData.append('archivo', fileInput.files[0]);
    }

    input.value = '';
    input.style.height = 'auto';
    limpiarArchivo();

    const aiMsgId = 'msg-' + Date.now();
    chatWindow.innerHTML += `
        <div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 16px;">
            <div id="${aiMsgId}" style="background: transparent; padding: 16px; border-radius: 16px; max-width: 90%; color: #e5e7eb; border: 1px solid #1f2937;">
                <span class="animate-pulse">✨ Generando respuesta...</span>
            </div>
        </div>`;
    
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
      
        const res = await fetch('https://semana-iii-arquitectura-de.onrender.com/preguntar', {
            method: 'POST',
            body: formData
        });
        
        const data = await res.json();
        const aiDiv = document.getElementById(aiMsgId);

        if (res.ok) {
            aiDiv.innerHTML = data.respuesta.replace(/\n/g, '<br>');
            if (data.tokens) {
                document.getElementById('t-in').innerText = data.tokens.entrada;
                document.getElementById('t-out').innerText = data.tokens.salida;
                document.getElementById('t-total').innerText = data.tokens.total;
            }
        } else {
            aiDiv.innerText = "Error del servidor: " + (data.respuesta || "Desconocido");
        }

    } catch (e) {
        console.error(e);
        document.getElementById(aiMsgId).innerText = "Error: No se pudo conectar con el servidor.";
    }
    
    chatWindow.scrollTop = chatWindow.scrollHeight;
}