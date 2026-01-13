# Guía Paso a Paso: Configurar tu Sistema 🛠️

**¡Importante!** El error que viste (`syntax error at or near "```"`) fue porque se copiaron las tildes del formato de texto. Para evitarlo, he creado dos archivos con el código limpio.

## Paso 1: Abrir el Editor SQL
1. Entra a tu proyecto en **Supabase**.
2. Ve al menú izquierdo -> **SQL Editor**.
3. Haz clic en **+ New Query**.

## Paso 2: Crear la Estructura (Tablas y Seguridad)
1. Abre el archivo `supabase_setup_final.sql` que está en tu carpeta del proyecto.
2. Copia **TODO** el contenido de ese archivo.
3. Pégalo en el cuadro de texto de Supabase.
4. Dale al botón verde **RUN** (o Run selection).

✅ **Si dice "Success", funcionó.**

---

## Paso 3: Crear tu Usuario
1. En el menú izquierdo de Supabase, ve a **Authentication** (ícono de candado/usuarios).
2. Haz clic en **Add User** -> **Create New User**.
3. Correo: `jacontulianoc@gmail.com`
4. Contraseña: Crea una contraseña segura (ej: `Chile2026!Admin`).
5. Dale a **Create User**.
   *Nota: Si Supabase pide confirmar email, hazlo o desactiva la confirmación en Authentication/Providers/Email.*

---

## Paso 4: Darte Permisos de Administrador
1. Vuelve al **SQL Editor**.
2. Borra lo que haya en el cuadro de texto.
3. Abre el archivo `promote_admin.sql` de tu carpeta.
4. Copia la línea que contiene.
   ```sql
   select promote_to_admin('jacontulianoc@gmail.com');
   ```
5. Pégala en Supabase y dale a **RUN**.
6. Debería decir: `"User promoted to admin"`.

---

## ¡Listo! 🚀
Ya puedes entrar a `https://tus3b.cl/admin`.
- Usa el correo `jacontulianoc@gmail.com` y tu nueva contraseña.
- Entrarás directo al **Panel de Gestión**.
