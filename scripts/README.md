# Scripts de Utilidad

## test-whisper.ts

Script para verificar que el modelo Whisper está instalado y funcionando correctamente.

### Uso

```bash
npx tsx scripts/test-whisper.ts
```

### Qué verifica

1. Instalación correcta de @xenova/transformers
2. Descarga del modelo Whisper tiny
3. Inicialización del pipeline de transcripción

### Solución de problemas

Si el test falla:

1. **Error de instalación**: Ejecutar `npm install @xenova/transformers`
2. **Error de red**: Verificar conexión a internet (el modelo se descarga la primera vez)
3. **Error de espacio**: Verificar que hay al menos 1GB libre (el modelo pesa ~150MB)

### Modelos disponibles

- `Xenova/whisper-tiny` - ~150MB, más rápido
- `Xenova/whisper-base` - ~290MB, mejor precisión
- `Xenova/whisper-small` - ~970MB, alta precisión
