# Se publicó una foto con un rostro identificable

**Prioridad sobre cualquier otra tarea en curso.** Se deja lo que se esté haciendo.

## Los primeros cinco minutos
1. Despublicar la imagen desde el panel, o si el panel no responde:
   ```sql
   UPDATE imagenes SET publicada = false WHERE id = '<id>';
   ```
2. Purgar la cache: `cdn_purge` de ZENTINEK **y** la cache de nginx.
3. Verificar en ventana de incógnito que ya no aparece.
4. Borrar el archivo del volumen.

## Después
5. Avisar a Mario de inmediato. **Él decide qué se le dice al decanato.**
6. Revisar en `audit_log` quién la subió, cuándo, cuántos rostros detectó el
   difuminador y si hubo intervención manual.
7. Revisar el resto de las imágenes publicadas de esa misma sesión de carga:
   si una se coló, probablemente hay más.
8. Si el buscador ya la indexó, pedir la retirada de la URL en Google Search Console.

## Y lo más importante
9. **Encontrar por dónde entró.** No es un incidente aislado: es un hueco en los
   controles de `_shared/09-difuminado-obligatorio.md`. Preguntas a responder:
   - ¿El detector no la vio? → revisar el umbral y las escalas.
   - ¿La subieron por un camino que no pasa por el editor? → el candado del token
     de un solo uso está roto.
   - ¿Alguien le quitó el difuminado a mano pensando que era voluntario?
     → revisar cómo se presenta esa acción en la interfaz.

Se corrige la causa, no se pide más cuidado. Un instructivo no es un control.

## Lo que NO se hace
- No se minimiza esperando que nadie la haya visto.
- No se deja "mientras investigamos". Primero se baja, después se investiga.
