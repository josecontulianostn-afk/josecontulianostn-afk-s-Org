import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Iniciando aplicación React...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Aplicación montada correctamente.");
} catch (error) {
  console.error("Error al montar la aplicación:", error);
  const errorDiv = document.getElementById('app-error');
  if (errorDiv) {
    errorDiv.style.display = 'block';
    errorDiv.innerHTML = 'Error crítico al iniciar React: ' + (error as any).message;
  }
}