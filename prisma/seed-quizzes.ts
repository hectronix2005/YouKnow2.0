import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface QuizQuestion {
    id: string
    question: string
    options: string[]
    correctIndex: number
    explanation: string
}

// Demo questions by topic category
const questionsByTopic: Record<string, QuizQuestion[]> = {
    // HTML/CSS Questions
    'html': [
        { id: 'html-1', question: '¿Qué significa HTML?', options: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Management Language'], correctIndex: 0, explanation: 'HTML significa HyperText Markup Language, el lenguaje estándar para crear páginas web.' },
        { id: 'html-2', question: '¿Cuál es la etiqueta correcta para un párrafo en HTML?', options: ['<p>', '<paragraph>', '<para>', '<text>'], correctIndex: 0, explanation: 'La etiqueta <p> se usa para definir un párrafo en HTML.' },
        { id: 'html-3', question: '¿Qué atributo se usa para definir estilos en línea?', options: ['style', 'class', 'font', 'styles'], correctIndex: 0, explanation: 'El atributo style permite agregar CSS en línea directamente en el elemento.' },
        { id: 'html-4', question: '¿Cuál es el elemento raíz de un documento HTML5?', options: ['<html>', '<body>', '<head>', '<document>'], correctIndex: 0, explanation: 'El elemento <html> es la raíz de todo documento HTML.' },
        { id: 'html-5', question: '¿Qué etiqueta se usa para insertar una imagen?', options: ['<img>', '<image>', '<picture>', '<photo>'], correctIndex: 0, explanation: 'La etiqueta <img> se usa para insertar imágenes en HTML.' },
        { id: 'html-6', question: '¿Cuál es la forma correcta de crear un hipervínculo?', options: ['<a href="url">', '<link url="url">', '<href="url">', '<hyperlink="url">'], correctIndex: 0, explanation: 'La etiqueta <a> con el atributo href define un hipervínculo.' },
        { id: 'html-7', question: '¿Qué etiqueta define un encabezado de nivel 1?', options: ['<h1>', '<header1>', '<heading1>', '<head1>'], correctIndex: 0, explanation: 'La etiqueta <h1> define el encabezado más importante de la página.' },
        { id: 'html-8', question: '¿Cuál es la etiqueta para una lista no ordenada?', options: ['<ul>', '<ol>', '<list>', '<nl>'], correctIndex: 0, explanation: 'La etiqueta <ul> crea una lista con viñetas (no ordenada).' },
        { id: 'html-9', question: '¿Qué elemento HTML5 define contenido independiente?', options: ['<article>', '<section>', '<div>', '<aside>'], correctIndex: 0, explanation: 'El elemento <article> representa contenido independiente y autocontenido.' },
        { id: 'html-10', question: '¿Cuál es la declaración correcta para HTML5?', options: ['<!DOCTYPE html>', '<!DOCTYPE HTML5>', '<html5>', '<!HTML5>'], correctIndex: 0, explanation: '<!DOCTYPE html> es la declaración estándar para documentos HTML5.' },
    ],
    'css': [
        { id: 'css-1', question: '¿Qué propiedad CSS cambia el color del texto?', options: ['color', 'text-color', 'font-color', 'foreground'], correctIndex: 0, explanation: 'La propiedad color define el color del texto.' },
        { id: 'css-2', question: '¿Cómo seleccionas un elemento con id "demo"?', options: ['#demo', '.demo', 'demo', '*demo'], correctIndex: 0, explanation: 'El selector # se usa para seleccionar elementos por su id.' },
        { id: 'css-3', question: '¿Qué propiedad CSS controla el tamaño de fuente?', options: ['font-size', 'text-size', 'font-style', 'text-font'], correctIndex: 0, explanation: 'font-size define el tamaño de la fuente del texto.' },
        { id: 'css-4', question: '¿Cuál es el valor correcto para centrar un elemento con Flexbox?', options: ['justify-content: center', 'align: center', 'text-align: center', 'margin: center'], correctIndex: 0, explanation: 'justify-content: center centra elementos horizontalmente en Flexbox.' },
        { id: 'css-5', question: '¿Qué propiedad agrega espacio dentro de un elemento?', options: ['padding', 'margin', 'spacing', 'border'], correctIndex: 0, explanation: 'padding agrega espacio interno entre el contenido y el borde.' },
        { id: 'css-6', question: '¿Cuál propiedad hace que un elemento sea invisible pero ocupe espacio?', options: ['visibility: hidden', 'display: none', 'opacity: 0', 'hidden: true'], correctIndex: 0, explanation: 'visibility: hidden oculta el elemento pero mantiene su espacio.' },
        { id: 'css-7', question: '¿Qué valor de display crea un contenedor Flexbox?', options: ['flex', 'flexbox', 'block-flex', 'inline-flex-container'], correctIndex: 0, explanation: 'display: flex convierte un elemento en un contenedor Flexbox.' },
        { id: 'css-8', question: '¿Cómo aplicas un estilo a todos los elementos <p>?', options: ['p { }', '.p { }', '#p { }', '<p> { }'], correctIndex: 0, explanation: 'Para seleccionar todos los elementos de un tipo, usas el nombre de la etiqueta directamente.' },
        { id: 'css-9', question: '¿Qué propiedad CSS crea esquinas redondeadas?', options: ['border-radius', 'corner-radius', 'border-round', 'round-corner'], correctIndex: 0, explanation: 'border-radius define el radio de las esquinas del borde.' },
        { id: 'css-10', question: '¿Cuál es la propiedad para cambiar el fondo?', options: ['background-color', 'bgcolor', 'color-background', 'back-color'], correctIndex: 0, explanation: 'background-color establece el color de fondo de un elemento.' },
    ],
    'javascript': [
        { id: 'js-1', question: '¿Cómo declaras una variable en JavaScript ES6?', options: ['const o let', 'var only', 'variable', 'dim'], correctIndex: 0, explanation: 'En ES6, se recomienda usar const para constantes y let para variables.' },
        { id: 'js-2', question: '¿Cuál es el operador de igualdad estricta?', options: ['===', '==', '=', '!=='], correctIndex: 0, explanation: '=== compara tanto valor como tipo de dato.' },
        { id: 'js-3', question: '¿Qué método agrega un elemento al final de un array?', options: ['push()', 'add()', 'append()', 'insert()'], correctIndex: 0, explanation: 'push() agrega uno o más elementos al final del array.' },
        { id: 'js-4', question: '¿Cómo defines una función flecha?', options: ['() => {}', 'function => {}', 'arrow() {}', '-> {}'], correctIndex: 0, explanation: 'Las arrow functions usan la sintaxis () => {} en ES6.' },
        { id: 'js-5', question: '¿Qué devuelve typeof null?', options: ['"object"', '"null"', '"undefined"', '"boolean"'], correctIndex: 0, explanation: 'Es un bug histórico de JavaScript: typeof null devuelve "object".' },
        { id: 'js-6', question: '¿Cuál método convierte JSON a objeto JavaScript?', options: ['JSON.parse()', 'JSON.stringify()', 'JSON.toObject()', 'JSON.convert()'], correctIndex: 0, explanation: 'JSON.parse() convierte una cadena JSON a un objeto JavaScript.' },
        { id: 'js-7', question: '¿Qué es una Promise en JavaScript?', options: ['Un objeto para manejar operaciones asíncronas', 'Una variable constante', 'Un tipo de loop', 'Una función de callback'], correctIndex: 0, explanation: 'Las Promises representan el resultado eventual de una operación asíncrona.' },
        { id: 'js-8', question: '¿Cuál es la sintaxis correcta para un template literal?', options: ['`texto ${variable}`', '"texto ${variable}"', "'texto ${variable}'", 'text(variable)'], correctIndex: 0, explanation: 'Los template literals usan backticks (`) y ${} para interpolación.' },
        { id: 'js-9', question: '¿Qué método recorre un array y devuelve uno nuevo?', options: ['map()', 'forEach()', 'loop()', 'each()'], correctIndex: 0, explanation: 'map() itera sobre cada elemento y retorna un nuevo array.' },
        { id: 'js-10', question: '¿Cómo desestructuras un objeto en ES6?', options: ['const { prop } = obj', 'const prop = obj.prop', 'const [prop] = obj', 'extract prop from obj'], correctIndex: 0, explanation: 'La desestructuración de objetos usa llaves {} para extraer propiedades.' },
    ],
    'react': [
        { id: 'react-1', question: '¿Qué es JSX?', options: ['Una extensión de sintaxis para JavaScript', 'Un framework CSS', 'Un lenguaje de programación', 'Una base de datos'], correctIndex: 0, explanation: 'JSX permite escribir HTML dentro de JavaScript de forma más legible.' },
        { id: 'react-2', question: '¿Cuál Hook se usa para manejar estado en componentes funcionales?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correctIndex: 0, explanation: 'useState permite agregar estado local a componentes funcionales.' },
        { id: 'react-3', question: '¿Qué Hook ejecuta efectos secundarios?', options: ['useEffect', 'useState', 'useMemo', 'useCallback'], correctIndex: 0, explanation: 'useEffect se usa para efectos secundarios como llamadas API o suscripciones.' },
        { id: 'react-4', question: '¿Cómo pasas datos de padre a hijo en React?', options: ['Props', 'State', 'Context', 'Redux'], correctIndex: 0, explanation: 'Las props son la forma principal de pasar datos de componente padre a hijo.' },
        { id: 'react-5', question: '¿Qué es el Virtual DOM?', options: ['Una representación en memoria del DOM real', 'Un navegador virtual', 'Una librería CSS', 'Un servidor web'], correctIndex: 0, explanation: 'El Virtual DOM es una copia ligera del DOM que React usa para optimizar actualizaciones.' },
        { id: 'react-6', question: '¿Cuál es la forma correcta de crear un componente funcional?', options: ['function Component() { return <div/> }', 'class Component { render() }', 'new Component()', 'Component.create()'], correctIndex: 0, explanation: 'Los componentes funcionales son funciones que retornan JSX.' },
        { id: 'react-7', question: '¿Qué Hook se usa para optimizar cálculos costosos?', options: ['useMemo', 'useState', 'useEffect', 'useRef'], correctIndex: 0, explanation: 'useMemo memoriza el resultado de cálculos para evitar recálculos innecesarios.' },
        { id: 'react-8', question: '¿Cómo manejas eventos en React?', options: ['onClick={handleClick}', 'onclick="handleClick()"', '@click="handleClick"', 'on:click={handleClick}'], correctIndex: 0, explanation: 'React usa camelCase para eventos y pasa la función como referencia.' },
        { id: 'react-9', question: '¿Qué es React Router?', options: ['Una librería para navegación en SPAs', 'Un estado global', 'Un servidor backend', 'Un compilador de React'], correctIndex: 0, explanation: 'React Router permite crear navegación client-side en aplicaciones React.' },
        { id: 'react-10', question: '¿Cuál es el propósito de useContext?', options: ['Compartir datos sin pasar props manualmente', 'Manejar efectos secundarios', 'Crear animaciones', 'Conectar a una base de datos'], correctIndex: 0, explanation: 'useContext permite acceder a datos globales sin prop drilling.' },
    ],
    'nodejs': [
        { id: 'node-1', question: '¿Qué es Node.js?', options: ['Un runtime de JavaScript para el servidor', 'Un framework frontend', 'Una base de datos', 'Un navegador web'], correctIndex: 0, explanation: 'Node.js permite ejecutar JavaScript fuera del navegador, en el servidor.' },
        { id: 'node-2', question: '¿Qué es Express.js?', options: ['Un framework web minimalista para Node.js', 'Una base de datos', 'Un frontend framework', 'Un sistema operativo'], correctIndex: 0, explanation: 'Express es el framework más popular para crear servidores web con Node.js.' },
        { id: 'node-3', question: '¿Qué comando instala dependencias en Node.js?', options: ['npm install', 'node install', 'npm get', 'node add'], correctIndex: 0, explanation: 'npm install descarga e instala las dependencias del proyecto.' },
        { id: 'node-4', question: '¿Qué es npm?', options: ['Node Package Manager', 'New Programming Method', 'Node Process Manager', 'Network Protocol Manager'], correctIndex: 0, explanation: 'npm es el gestor de paquetes oficial de Node.js.' },
        { id: 'node-5', question: '¿Qué método HTTP se usa para crear recursos?', options: ['POST', 'GET', 'DELETE', 'PATCH'], correctIndex: 0, explanation: 'POST se usa típicamente para crear nuevos recursos en una API REST.' },
        { id: 'node-6', question: '¿Qué es middleware en Express?', options: ['Funciones que procesan requests antes del handler final', 'Una base de datos', 'Un tipo de endpoint', 'Un protocolo de red'], correctIndex: 0, explanation: 'Los middleware son funciones que tienen acceso al request, response y next.' },
        { id: 'node-7', question: '¿Qué archivo contiene las dependencias de un proyecto Node?', options: ['package.json', 'dependencies.json', 'node.config', 'modules.json'], correctIndex: 0, explanation: 'package.json lista todas las dependencias y scripts del proyecto.' },
        { id: 'node-8', question: '¿Cuál es el puerto por defecto para HTTP?', options: ['80', '443', '3000', '8080'], correctIndex: 0, explanation: 'El puerto 80 es el puerto estándar para HTTP.' },
        { id: 'node-9', question: '¿Qué es REST?', options: ['Un estilo arquitectónico para APIs', 'Un lenguaje de programación', 'Una base de datos', 'Un framework'], correctIndex: 0, explanation: 'REST es un conjunto de principios para diseñar APIs web.' },
        { id: 'node-10', question: '¿Qué biblioteca se usa para variables de entorno en Node?', options: ['dotenv', 'envconfig', 'config', 'environment'], correctIndex: 0, explanation: 'dotenv carga variables de entorno desde un archivo .env.' },
    ],
    'database': [
        { id: 'db-1', question: '¿Qué es MongoDB?', options: ['Una base de datos NoSQL orientada a documentos', 'Una base de datos SQL', 'Un framework frontend', 'Un lenguaje de programación'], correctIndex: 0, explanation: 'MongoDB almacena datos en documentos JSON flexibles.' },
        { id: 'db-2', question: '¿Qué tipo de base de datos usa tablas con filas y columnas?', options: ['SQL/Relacional', 'NoSQL', 'Graph Database', 'Key-Value Store'], correctIndex: 0, explanation: 'Las bases de datos relacionales organizan datos en tablas estructuradas.' },
        { id: 'db-3', question: '¿Qué es una clave primaria?', options: ['Un identificador único para cada registro', 'Una contraseña de la base de datos', 'Un tipo de índice', 'Una tabla especial'], correctIndex: 0, explanation: 'La clave primaria identifica de forma única cada fila en una tabla.' },
        { id: 'db-4', question: '¿Qué comando SQL selecciona datos?', options: ['SELECT', 'GET', 'FETCH', 'RETRIEVE'], correctIndex: 0, explanation: 'SELECT es el comando SQL para consultar datos de una tabla.' },
        { id: 'db-5', question: '¿Qué es un ORM?', options: ['Object-Relational Mapping', 'Online Resource Manager', 'Open Record Model', 'Output Result Mapper'], correctIndex: 0, explanation: 'Un ORM mapea objetos de código a registros de base de datos.' },
        { id: 'db-6', question: '¿Qué hace la cláusula WHERE en SQL?', options: ['Filtra los resultados según condiciones', 'Ordena los resultados', 'Agrupa los resultados', 'Limita los resultados'], correctIndex: 0, explanation: 'WHERE especifica condiciones para filtrar filas en una consulta.' },
        { id: 'db-7', question: '¿Qué es una clave foránea?', options: ['Una referencia a la clave primaria de otra tabla', 'Una clave encriptada', 'Un tipo de índice', 'Una clave temporal'], correctIndex: 0, explanation: 'Las claves foráneas establecen relaciones entre tablas.' },
        { id: 'db-8', question: '¿Qué es Prisma?', options: ['Un ORM moderno para Node.js', 'Una base de datos', 'Un framework frontend', 'Un servidor web'], correctIndex: 0, explanation: 'Prisma es un ORM type-safe para Node.js y TypeScript.' },
        { id: 'db-9', question: '¿Qué comando SQL inserta nuevos datos?', options: ['INSERT INTO', 'ADD TO', 'CREATE RECORD', 'PUT INTO'], correctIndex: 0, explanation: 'INSERT INTO agrega nuevos registros a una tabla.' },
        { id: 'db-10', question: '¿Qué es CRUD?', options: ['Create, Read, Update, Delete', 'Copy, Remove, Undo, Delete', 'Create, Run, Upload, Download', 'Change, Read, Update, Display'], correctIndex: 0, explanation: 'CRUD son las cuatro operaciones básicas de persistencia de datos.' },
    ],
    'python': [
        { id: 'py-1', question: '¿Cómo defines una función en Python?', options: ['def funcion():', 'function funcion():', 'fn funcion():', 'func funcion():'], correctIndex: 0, explanation: 'def es la palabra clave para definir funciones en Python.' },
        { id: 'py-2', question: '¿Qué es NumPy?', options: ['Una librería para computación numérica', 'Un IDE para Python', 'Una base de datos', 'Un framework web'], correctIndex: 0, explanation: 'NumPy proporciona soporte para arrays y operaciones matemáticas.' },
        { id: 'py-3', question: '¿Qué estructura de datos es mutable en Python?', options: ['Lista', 'Tupla', 'String', 'Frozenset'], correctIndex: 0, explanation: 'Las listas pueden modificarse después de crearse, las tuplas no.' },
        { id: 'py-4', question: '¿Qué es Pandas?', options: ['Una librería para análisis de datos', 'Un tipo de variable', 'Un framework web', 'Un sistema operativo'], correctIndex: 0, explanation: 'Pandas facilita la manipulación y análisis de datos estructurados.' },
        { id: 'py-5', question: '¿Cuál es la extensión de archivos Python?', options: ['.py', '.python', '.pyt', '.pt'], correctIndex: 0, explanation: 'Los archivos de código Python usan la extensión .py' },
        { id: 'py-6', question: '¿Qué hace pip en Python?', options: ['Instala paquetes', 'Ejecuta código', 'Compila programas', 'Debugea código'], correctIndex: 0, explanation: 'pip es el gestor de paquetes de Python para instalar librerías.' },
        { id: 'py-7', question: '¿Qué es un DataFrame en Pandas?', options: ['Una tabla bidimensional de datos', 'Una función', 'Una variable', 'Un archivo'], correctIndex: 0, explanation: 'DataFrame es la estructura principal de Pandas para datos tabulares.' },
        { id: 'py-8', question: '¿Cuál operador se usa para exponentes en Python?', options: ['**', '^', 'exp()', 'pow'], correctIndex: 0, explanation: '** es el operador de exponenciación en Python (2**3 = 8).' },
        { id: 'py-9', question: '¿Qué es un diccionario en Python?', options: ['Una colección de pares clave-valor', 'Una lista ordenada', 'Un archivo de texto', 'Una función'], correctIndex: 0, explanation: 'Los diccionarios almacenan datos como pares clave: valor.' },
        { id: 'py-10', question: '¿Cómo creas un comentario en Python?', options: ['# comentario', '// comentario', '/* comentario */', '-- comentario'], correctIndex: 0, explanation: 'El símbolo # inicia un comentario de una línea en Python.' },
    ],
    'ml': [
        { id: 'ml-1', question: '¿Qué es Machine Learning?', options: ['Un subcampo de IA donde los sistemas aprenden de datos', 'Un lenguaje de programación', 'Un tipo de hardware', 'Una base de datos'], correctIndex: 0, explanation: 'ML permite a las computadoras aprender patrones de datos sin programación explícita.' },
        { id: 'ml-2', question: '¿Qué es un modelo de regresión?', options: ['Predice valores numéricos continuos', 'Clasifica categorías', 'Agrupa datos', 'Genera imágenes'], correctIndex: 0, explanation: 'La regresión predice valores como precios, temperaturas, etc.' },
        { id: 'ml-3', question: '¿Qué es overfitting?', options: ['Cuando el modelo memoriza los datos de entrenamiento', 'Cuando el modelo es muy simple', 'Cuando faltan datos', 'Cuando hay muchas features'], correctIndex: 0, explanation: 'El overfitting ocurre cuando el modelo no generaliza bien a datos nuevos.' },
        { id: 'ml-4', question: '¿Qué librería es popular para ML en Python?', options: ['scikit-learn', 'jQuery', 'Express', 'React'], correctIndex: 0, explanation: 'scikit-learn es la librería más usada para ML tradicional en Python.' },
        { id: 'ml-5', question: '¿Qué es la clasificación en ML?', options: ['Predecir a qué categoría pertenece un dato', 'Predecir un valor numérico', 'Agrupar datos similares', 'Reducir dimensiones'], correctIndex: 0, explanation: 'La clasificación asigna datos a categorías predefinidas.' },
        { id: 'ml-6', question: '¿Qué es un dataset de entrenamiento?', options: ['Datos usados para entrenar el modelo', 'Datos para probar el modelo', 'Datos de producción', 'Datos sin procesar'], correctIndex: 0, explanation: 'El dataset de entrenamiento se usa para que el modelo aprenda patrones.' },
        { id: 'ml-7', question: '¿Qué es Random Forest?', options: ['Un conjunto de árboles de decisión', 'Un tipo de red neuronal', 'Una base de datos', 'Un algoritmo de clustering'], correctIndex: 0, explanation: 'Random Forest combina múltiples árboles de decisión para mejor precisión.' },
        { id: 'ml-8', question: '¿Qué mide la precisión (accuracy)?', options: ['El porcentaje de predicciones correctas', 'La velocidad del modelo', 'El tamaño del modelo', 'El costo computacional'], correctIndex: 0, explanation: 'La accuracy es la proporción de predicciones correctas del total.' },
        { id: 'ml-9', question: '¿Qué es cross-validation?', options: ['Una técnica para evaluar modelos dividiendo datos en partes', 'Un tipo de red neuronal', 'Una función de activación', 'Un optimizador'], correctIndex: 0, explanation: 'Cross-validation evalúa el modelo usando diferentes divisiones de datos.' },
        { id: 'ml-10', question: '¿Qué es feature engineering?', options: ['Crear nuevas características a partir de datos existentes', 'Entrenar redes neuronales', 'Escalar hardware', 'Desplegar modelos'], correctIndex: 0, explanation: 'Feature engineering mejora el modelo creando features más informativas.' },
    ],
    'deeplearning': [
        { id: 'dl-1', question: '¿Qué es una red neuronal?', options: ['Un modelo inspirado en el cerebro humano', 'Una base de datos', 'Un servidor web', 'Un lenguaje de programación'], correctIndex: 0, explanation: 'Las redes neuronales imitan cómo las neuronas procesan información.' },
        { id: 'dl-2', question: '¿Qué es TensorFlow?', options: ['Una librería de deep learning de Google', 'Una base de datos', 'Un sistema operativo', 'Un lenguaje de programación'], correctIndex: 0, explanation: 'TensorFlow es uno de los frameworks más populares para deep learning.' },
        { id: 'dl-3', question: '¿Qué es una CNN?', options: ['Convolutional Neural Network', 'Computer Network Node', 'Central Neuron Nexus', 'Complete Neural Network'], correctIndex: 0, explanation: 'Las CNNs son especialmente buenas para procesar imágenes.' },
        { id: 'dl-4', question: '¿Qué es backpropagation?', options: ['Algoritmo para actualizar pesos propagando errores hacia atrás', 'Una técnica de preprocesamiento', 'Un tipo de capa neuronal', 'Una función de activación'], correctIndex: 0, explanation: 'Backpropagation calcula gradientes para optimizar los pesos de la red.' },
        { id: 'dl-5', question: '¿Qué es una RNN?', options: ['Recurrent Neural Network', 'Random Neural Network', 'Real Neural Network', 'Robust Neural Network'], correctIndex: 0, explanation: 'Las RNNs procesan secuencias de datos como texto o series temporales.' },
        { id: 'dl-6', question: '¿Qué función de activación es común en capas ocultas?', options: ['ReLU', 'Sigmoid', 'Linear', 'Softmax'], correctIndex: 0, explanation: 'ReLU es rápida de computar y ayuda con el problema del gradiente desvaneciente.' },
        { id: 'dl-7', question: '¿Qué es transfer learning?', options: ['Usar un modelo pre-entrenado como punto de partida', 'Transferir datos entre servidores', 'Copiar arquitecturas', 'Mover modelos a producción'], correctIndex: 0, explanation: 'Transfer learning aprovecha conocimiento de modelos entrenados en grandes datasets.' },
        { id: 'dl-8', question: '¿Qué es dropout?', options: ['Una técnica de regularización que desactiva neuronas', 'Eliminar capas de la red', 'Reducir el learning rate', 'Aumentar datos de entrenamiento'], correctIndex: 0, explanation: 'Dropout previene overfitting desactivando neuronas aleatoriamente.' },
        { id: 'dl-9', question: '¿Qué es una época (epoch)?', options: ['Una pasada completa por todo el dataset', 'Un lote de datos', 'Una iteración de backprop', 'Una capa de la red'], correctIndex: 0, explanation: 'Una época ocurre cuando el modelo ve todos los datos de entrenamiento una vez.' },
        { id: 'dl-10', question: '¿Qué es PyTorch?', options: ['Una librería de deep learning de Facebook', 'Un framework web', 'Una base de datos', 'Un IDE'], correctIndex: 0, explanation: 'PyTorch es popular en investigación por su flexibilidad y grafos dinámicos.' },
    ],
    'marketing': [
        { id: 'mkt-1', question: '¿Qué significa SEO?', options: ['Search Engine Optimization', 'Social Engine Optimization', 'Sales Enhancement Online', 'Site Enhancement Optimization'], correctIndex: 0, explanation: 'SEO optimiza sitios web para mejorar su posición en buscadores.' },
        { id: 'mkt-2', question: '¿Qué es SEM?', options: ['Search Engine Marketing (publicidad pagada)', 'Social Email Marketing', 'Site Enhancement Method', 'Sales Engagement Manager'], correctIndex: 0, explanation: 'SEM incluye publicidad pagada en motores de búsqueda como Google Ads.' },
        { id: 'mkt-3', question: '¿Qué son las keywords?', options: ['Palabras que los usuarios buscan en internet', 'Contraseñas de acceso', 'Códigos de programación', 'Etiquetas de productos'], correctIndex: 0, explanation: 'Las keywords son términos que tu audiencia usa para encontrar contenido.' },
        { id: 'mkt-4', question: '¿Qué es el CTR?', options: ['Click-Through Rate (tasa de clics)', 'Cost To Reach', 'Campaign Tracking Rate', 'Customer Targeting Rate'], correctIndex: 0, explanation: 'CTR mide el porcentaje de personas que hacen clic en un enlace.' },
        { id: 'mkt-5', question: '¿Qué es el bounce rate?', options: ['Porcentaje de usuarios que abandonan tras ver una página', 'Tasa de rebote de emails', 'Velocidad de carga', 'Frecuencia de publicación'], correctIndex: 0, explanation: 'Un bounce rate alto puede indicar contenido poco relevante.' },
        { id: 'mkt-6', question: '¿Qué es Google Analytics?', options: ['Una herramienta para analizar tráfico web', 'Un motor de búsqueda', 'Una red social', 'Una plataforma de email'], correctIndex: 0, explanation: 'Google Analytics proporciona datos sobre visitantes y comportamiento en tu sitio.' },
        { id: 'mkt-7', question: '¿Qué es el ROI en marketing?', options: ['Return On Investment (retorno de inversión)', 'Rate Of Interaction', 'Reach Of Internet', 'Range Of Impact'], correctIndex: 0, explanation: 'ROI mide la rentabilidad de tus inversiones en marketing.' },
        { id: 'mkt-8', question: '¿Qué es content marketing?', options: ['Crear contenido valioso para atraer audiencia', 'Comprar publicidad', 'Enviar emails masivos', 'Hacer llamadas en frío'], correctIndex: 0, explanation: 'Content marketing atrae clientes mediante contenido útil y relevante.' },
        { id: 'mkt-9', question: '¿Qué es una landing page?', options: ['Una página diseñada para conversiones', 'La página de inicio', 'Una página de error', 'Una página de contacto'], correctIndex: 0, explanation: 'Las landing pages están optimizadas para que visitantes realicen una acción.' },
        { id: 'mkt-10', question: '¿Qué es el A/B testing?', options: ['Comparar dos versiones para ver cuál funciona mejor', 'Analizar datos de agosto y septiembre', 'Probar en móvil y desktop', 'Publicar en dos redes sociales'], correctIndex: 0, explanation: 'A/B testing compara variantes para optimizar conversiones.' },
    ],
    'social': [
        { id: 'soc-1', question: '¿Cuál es la red social más usada para B2B?', options: ['LinkedIn', 'TikTok', 'Instagram', 'Snapchat'], correctIndex: 0, explanation: 'LinkedIn está diseñada para profesionales y negocios.' },
        { id: 'soc-2', question: '¿Qué es el engagement?', options: ['Nivel de interacción con tu contenido', 'Número de seguidores', 'Cantidad de publicaciones', 'Tiempo en la plataforma'], correctIndex: 0, explanation: 'Engagement mide likes, comentarios, shares y otras interacciones.' },
        { id: 'soc-3', question: '¿Qué es un influencer?', options: ['Persona con audiencia que puede influir en decisiones de compra', 'Un empleado de redes sociales', 'Un tipo de anuncio', 'Un algoritmo'], correctIndex: 0, explanation: 'Los influencers tienen seguidores que confían en sus recomendaciones.' },
        { id: 'soc-4', question: '¿Qué formato es tendencia en redes sociales?', options: ['Video corto (Reels, TikTok)', 'Texto largo', 'PDF', 'Audio largo'], correctIndex: 0, explanation: 'Los videos cortos tienen altísimo engagement en todas las plataformas.' },
        { id: 'soc-5', question: '¿Qué es un hashtag?', options: ['Una etiqueta para categorizar contenido', 'Una contraseña', 'Un tipo de cuenta', 'Un anuncio'], correctIndex: 0, explanation: 'Los hashtags ayudan a usuarios a encontrar contenido relacionado.' },
        { id: 'soc-6', question: '¿Qué es el alcance (reach)?', options: ['Número de personas únicas que ven tu contenido', 'Total de interacciones', 'Número de seguidores', 'Cantidad de publicaciones'], correctIndex: 0, explanation: 'El reach mide cuántas personas diferentes fueron expuestas a tu contenido.' },
        { id: 'soc-7', question: '¿Qué es UGC?', options: ['User-Generated Content', 'Universal Growth Campaign', 'Unified Global Content', 'User Guide Creation'], correctIndex: 0, explanation: 'UGC es contenido creado por usuarios, muy valioso para marcas.' },
        { id: 'soc-8', question: '¿Cuál es el mejor momento para publicar?', options: ['Depende de tu audiencia específica', 'Siempre a las 9am', 'Solo los fines de semana', 'Cada hora'], correctIndex: 0, explanation: 'Analiza las métricas de tu audiencia para determinar horarios óptimos.' },
        { id: 'soc-9', question: '¿Qué es un calendario de contenido?', options: ['Planificación organizada de publicaciones', 'Un tipo de aplicación', 'Un reporte de métricas', 'Una lista de seguidores'], correctIndex: 0, explanation: 'Un calendario ayuda a mantener consistencia en tus publicaciones.' },
        { id: 'soc-10', question: '¿Qué es el social listening?', options: ['Monitorear menciones de tu marca en redes', 'Escuchar podcasts', 'Hacer encuestas', 'Llamar a clientes'], correctIndex: 0, explanation: 'Social listening te permite entender qué dice la gente sobre tu marca.' },
    ],
    'ads': [
        { id: 'ads-1', question: '¿Qué es Google Ads?', options: ['Plataforma de publicidad de Google', 'Un navegador web', 'Un servicio de email', 'Una red social'], correctIndex: 0, explanation: 'Google Ads muestra anuncios en búsquedas, YouTube y sitios partner.' },
        { id: 'ads-2', question: '¿Qué es CPC?', options: ['Cost Per Click', 'Campaign Per Customer', 'Cost Per Campaign', 'Customer Purchase Cost'], correctIndex: 0, explanation: 'CPC es el costo que pagas cada vez que alguien hace clic en tu anuncio.' },
        { id: 'ads-3', question: '¿Qué es CPM?', options: ['Cost Per Mille (mil impresiones)', 'Clicks Per Month', 'Campaign Per Market', 'Customer Path Model'], correctIndex: 0, explanation: 'CPM es el costo por cada mil veces que se muestra tu anuncio.' },
        { id: 'ads-4', question: '¿Qué es remarketing?', options: ['Mostrar anuncios a personas que ya visitaron tu sitio', 'Cambiar tu marca', 'Relanzar un producto', 'Reenviar emails'], correctIndex: 0, explanation: 'Remarketing recuerda a visitantes anteriores sobre tus productos.' },
        { id: 'ads-5', question: '¿Qué es un pixel de Facebook?', options: ['Código para rastrear conversiones y crear audiencias', 'Una imagen pequeña', 'Un tipo de anuncio', 'Una métrica'], correctIndex: 0, explanation: 'El pixel recopila datos de visitantes para optimizar campañas.' },
        { id: 'ads-6', question: '¿Qué es una audiencia lookalike?', options: ['Usuarios similares a tus clientes actuales', 'Seguidores falsos', 'Competidores', 'Empleados'], correctIndex: 0, explanation: 'Lookalike audiences encuentran personas similares a tu mejor audiencia.' },
        { id: 'ads-7', question: '¿Qué es el Quality Score en Google Ads?', options: ['Calificación de relevancia de tus anuncios y keywords', 'Número de conversiones', 'Total de clics', 'Presupuesto diario'], correctIndex: 0, explanation: 'Un Quality Score alto reduce costos y mejora posiciones.' },
        { id: 'ads-8', question: '¿Qué es ROAS?', options: ['Return On Ad Spend', 'Rate Of Active Sales', 'Reach Of Advertising Space', 'Real-time Optimization System'], correctIndex: 0, explanation: 'ROAS mide cuánto ganas por cada dólar invertido en publicidad.' },
        { id: 'ads-9', question: '¿Qué tipo de campaña muestra anuncios en Gmail?', options: ['Discovery Ads', 'Search Ads', 'Display Ads', 'Video Ads'], correctIndex: 0, explanation: 'Discovery Ads aparecen en Gmail, YouTube home y Discover.' },
        { id: 'ads-10', question: '¿Qué es el funnel de conversión?', options: ['El recorrido del cliente desde conocer hasta comprar', 'Un tipo de gráfico', 'Una herramienta de análisis', 'Un formato de anuncio'], correctIndex: 0, explanation: 'El funnel visualiza las etapas por las que pasa un cliente potencial.' },
    ],
    'ux': [
        { id: 'ux-1', question: '¿Qué es UX Design?', options: ['Diseño de la experiencia del usuario', 'Diseño de interfaces únicamente', 'Programación de software', 'Marketing digital'], correctIndex: 0, explanation: 'UX se enfoca en cómo el usuario experimenta e interactúa con un producto.' },
        { id: 'ux-2', question: '¿Qué es un wireframe?', options: ['Boceto de baja fidelidad de una interfaz', 'Una imagen final', 'Un prototipo funcional', 'Un código de programación'], correctIndex: 0, explanation: 'Los wireframes muestran la estructura básica sin diseño visual.' },
        { id: 'ux-3', question: '¿Qué es un user persona?', options: ['Representación ficticia de tu usuario ideal', 'Un usuario real', 'Un empleado de prueba', 'Un competidor'], correctIndex: 0, explanation: 'Las personas ayudan a diseñar pensando en usuarios reales.' },
        { id: 'ux-4', question: '¿Qué es un journey map?', options: ['Visualización de la experiencia del usuario a través del tiempo', 'Un mapa de navegación', 'Un diagrama de flujo de código', 'Una infografía'], correctIndex: 0, explanation: 'Los journey maps muestran puntos de contacto, emociones y oportunidades.' },
        { id: 'ux-5', question: '¿Qué es la arquitectura de información?', options: ['Organización y estructura del contenido', 'Diseño de edificios', 'Código de backend', 'Hardware del servidor'], correctIndex: 0, explanation: 'Una buena IA ayuda a usuarios a encontrar lo que buscan.' },
        { id: 'ux-6', question: '¿Qué es usability testing?', options: ['Observar usuarios reales usando tu producto', 'Probar código', 'Revisar diseños internamente', 'Lanzar a producción'], correctIndex: 0, explanation: 'Las pruebas con usuarios revelan problemas que no ves como diseñador.' },
        { id: 'ux-7', question: '¿Qué es el diseño centrado en el usuario?', options: ['Proceso que pone las necesidades del usuario primero', 'Diseño solo visual', 'Programación orientada a objetos', 'Marketing de contenidos'], correctIndex: 0, explanation: 'El diseño centrado en el usuario itera basándose en feedback real.' },
        { id: 'ux-8', question: '¿Qué es accesibilidad en diseño?', options: ['Hacer productos usables por personas con discapacidades', 'Precio bajo', 'Disponibilidad 24/7', 'Velocidad de carga'], correctIndex: 0, explanation: 'La accesibilidad garantiza que todos puedan usar tu producto.' },
        { id: 'ux-9', question: '¿Qué es un prototipo?', options: ['Versión interactiva de un diseño para probar', 'El producto final', 'Un documento de requisitos', 'Una presentación de ventas'], correctIndex: 0, explanation: 'Los prototipos permiten probar ideas antes de desarrollar.' },
        { id: 'ux-10', question: '¿Qué es el principio de consistencia en UX?', options: ['Elementos similares deben comportarse igual', 'Todo debe ser colorido', 'Usar muchas animaciones', 'Cambiar el diseño frecuentemente'], correctIndex: 0, explanation: 'La consistencia reduce la carga cognitiva del usuario.' },
    ],
    'figma': [
        { id: 'fig-1', question: '¿Qué es Figma?', options: ['Una herramienta de diseño colaborativa basada en web', 'Un lenguaje de programación', 'Una base de datos', 'Un framework CSS'], correctIndex: 0, explanation: 'Figma permite diseñar interfaces y prototipos en el navegador.' },
        { id: 'fig-2', question: '¿Qué son los components en Figma?', options: ['Elementos reutilizables que mantienen consistencia', 'Archivos de imagen', 'Plugins externos', 'Tipos de letra'], correctIndex: 0, explanation: 'Los components permiten crear y mantener elementos de diseño reutilizables.' },
        { id: 'fig-3', question: '¿Qué es Auto Layout?', options: ['Sistema para crear diseños responsivos automáticamente', 'Una tipografía', 'Un plugin de animación', 'Un tipo de exportación'], correctIndex: 0, explanation: 'Auto Layout ajusta elementos automáticamente cuando cambia el contenido.' },
        { id: 'fig-4', question: '¿Qué son las variants en Figma?', options: ['Diferentes estados de un component', 'Colores alternativos', 'Versiones de archivo', 'Tipos de exportación'], correctIndex: 0, explanation: 'Las variants organizan estados como hover, active, disabled en un component.' },
        { id: 'fig-5', question: '¿Qué es un Design System?', options: ['Conjunto de componentes y reglas de diseño reutilizables', 'Un sistema operativo', 'Una base de datos', 'Un servidor web'], correctIndex: 0, explanation: 'Los Design Systems aseguran consistencia en productos.' },
        { id: 'fig-6', question: '¿Qué son los frames en Figma?', options: ['Contenedores que agrupan elementos de diseño', 'Imágenes', 'Videos', 'Textos'], correctIndex: 0, explanation: 'Los frames son como artboards que contienen tu diseño.' },
        { id: 'fig-7', question: '¿Qué es Figma Prototype?', options: ['Modo para crear interacciones y flujos navegables', 'Una versión de prueba', 'Un tipo de plan', 'Una extensión'], correctIndex: 0, explanation: 'Prototype permite simular cómo funcionará la interfaz real.' },
        { id: 'fig-8', question: '¿Qué son los estilos (styles) en Figma?', options: ['Propiedades reutilizables para colores, texto, efectos', 'Tipos de archivo', 'Configuraciones de cuenta', 'Plugins'], correctIndex: 0, explanation: 'Los estilos permiten mantener consistencia de color y tipografía.' },
        { id: 'fig-9', question: '¿Qué es Figma Dev Mode?', options: ['Vista para desarrolladores con specs y código', 'Modo de desarrollo de plugins', 'Versión beta', 'Editor de código'], correctIndex: 0, explanation: 'Dev Mode facilita el handoff entre diseñadores y desarrolladores.' },
        { id: 'fig-10', question: '¿Cómo se comparte un archivo en Figma?', options: ['Con un link o invitando colaboradores', 'Descargando y enviando', 'Solo por email', 'Imprimiendo'], correctIndex: 0, explanation: 'Figma permite colaboración en tiempo real con links compartibles.' },
    ],
    'finance': [
        { id: 'fin-1', question: '¿Qué es un balance general?', options: ['Estado financiero que muestra activos, pasivos y patrimonio', 'Una cuenta de banco', 'Un tipo de inversión', 'Un contrato'], correctIndex: 0, explanation: 'El balance muestra la situación financiera en un momento específico.' },
        { id: 'fin-2', question: '¿Qué son los activos?', options: ['Recursos que posee la empresa', 'Deudas de la empresa', 'Gastos mensuales', 'Ingresos'], correctIndex: 0, explanation: 'Los activos incluyen efectivo, inventario, equipos, etc.' },
        { id: 'fin-3', question: '¿Qué es el ROI?', options: ['Return On Investment', 'Rate Of Interest', 'Ratio Of Income', 'Record Of Investment'], correctIndex: 0, explanation: 'ROI mide la rentabilidad de una inversión.' },
        { id: 'fin-4', question: '¿Qué es el flujo de caja?', options: ['Movimiento de dinero que entra y sale del negocio', 'Las ganancias totales', 'El valor de la empresa', 'Los gastos fijos'], correctIndex: 0, explanation: 'El cash flow muestra la liquidez real de la empresa.' },
        { id: 'fin-5', question: '¿Qué es el EBITDA?', options: ['Ganancias antes de intereses, impuestos, depreciación y amortización', 'Un tipo de inversión', 'Una métrica de marketing', 'Un software contable'], correctIndex: 0, explanation: 'EBITDA muestra la rentabilidad operativa de un negocio.' },
        { id: 'fin-6', question: '¿Qué es la depreciación?', options: ['Pérdida de valor de un activo con el tiempo', 'Aumento del valor', 'Un tipo de ingreso', 'Una deuda'], correctIndex: 0, explanation: 'La depreciación refleja el desgaste de activos fijos.' },
        { id: 'fin-7', question: '¿Qué es el margen de ganancia?', options: ['Porcentaje de ingresos que es ganancia', 'Total de ventas', 'Costos de producción', 'Deuda total'], correctIndex: 0, explanation: 'El margen indica qué tan rentables son las ventas.' },
        { id: 'fin-8', question: '¿Qué es el punto de equilibrio?', options: ['Cuando ingresos igualan a costos totales', 'El máximo de ganancias', 'El mínimo de ventas', 'El promedio anual'], correctIndex: 0, explanation: 'En el punto de equilibrio no hay ganancias ni pérdidas.' },
        { id: 'fin-9', question: '¿Qué es un estado de resultados?', options: ['Reporte de ingresos, gastos y ganancias en un período', 'Un tipo de inversión', 'Un contrato', 'Una cuenta bancaria'], correctIndex: 0, explanation: 'También llamado P&L (Profit & Loss), muestra la rentabilidad.' },
        { id: 'fin-10', question: '¿Qué es la liquidez?', options: ['Capacidad de convertir activos en efectivo rápidamente', 'El total de inversiones', 'Las deudas a largo plazo', 'El capital inicial'], correctIndex: 0, explanation: 'Alta liquidez significa poder cubrir obligaciones inmediatas.' },
    ],
    'logistics': [
        { id: 'log-1', question: '¿Qué es la logística?', options: ['Gestión del flujo de bienes desde origen hasta consumidor', 'Solo el transporte de productos', 'La fabricación de productos', 'Las ventas'], correctIndex: 0, explanation: 'La logística incluye almacenamiento, transporte, y distribución.' },
        { id: 'log-2', question: '¿Qué es la cadena de suministro?', options: ['Red de organizaciones involucradas en producir y entregar un producto', 'Solo los proveedores', 'El departamento de compras', 'Los clientes finales'], correctIndex: 0, explanation: 'Supply chain abarca desde materias primas hasta el cliente final.' },
        { id: 'log-3', question: '¿Qué es el inventario?', options: ['Stock de productos disponibles', 'El edificio del almacén', 'Los empleados', 'Las ventas pendientes'], correctIndex: 0, explanation: 'Gestionar inventario eficientemente reduce costos.' },
        { id: 'log-4', question: '¿Qué es Just-In-Time (JIT)?', options: ['Sistema que recibe materiales justo cuando se necesitan', 'Entrega express', 'Producción masiva', 'Almacenamiento a largo plazo'], correctIndex: 0, explanation: 'JIT minimiza inventario y costos de almacenamiento.' },
        { id: 'log-5', question: '¿Qué es un almacén?', options: ['Instalación para guardar y gestionar productos', 'Una oficina', 'Una tienda', 'Una fábrica'], correctIndex: 0, explanation: 'Los almacenes son centrales para la distribución eficiente.' },
        { id: 'log-6', question: '¿Qué es el lead time?', options: ['Tiempo desde el pedido hasta la entrega', 'El tiempo de fabricación', 'Las horas de trabajo', 'El período de pago'], correctIndex: 0, explanation: 'Reducir el lead time mejora la satisfacción del cliente.' },
        { id: 'log-7', question: '¿Qué es la última milla?', options: ['El tramo final de entrega al consumidor', 'La primera etapa de producción', 'El almacén principal', 'El centro de distribución'], correctIndex: 0, explanation: 'La última milla suele ser la parte más costosa de la entrega.' },
        { id: 'log-8', question: '¿Qué es un sistema WMS?', options: ['Warehouse Management System', 'Web Marketing System', 'Work Management Software', 'Wide Market Share'], correctIndex: 0, explanation: 'WMS gestiona operaciones de almacén eficientemente.' },
        { id: 'log-9', question: '¿Qué es cross-docking?', options: ['Transferir productos directamente sin almacenarlos', 'Cruzar fronteras', 'Un tipo de embalaje', 'Una técnica de ventas'], correctIndex: 0, explanation: 'Cross-docking reduce tiempos y costos de almacenamiento.' },
        { id: 'log-10', question: '¿Qué es la trazabilidad?', options: ['Capacidad de rastrear un producto en toda la cadena', 'La velocidad de entrega', 'El costo de transporte', 'El número de proveedores'], correctIndex: 0, explanation: 'La trazabilidad es crucial para control de calidad y recalls.' },
    ],
}

// Map lesson titles to topic categories
function getTopicForLesson(lessonTitle: string, courseTitle: string): string {
    const title = lessonTitle.toLowerCase()
    const course = courseTitle.toLowerCase()

    if (title.includes('html')) return 'html'
    if (title.includes('css') || title.includes('styling') || title.includes('flexbox') || title.includes('grid') || title.includes('responsive')) return 'css'
    if (title.includes('javascript') || title.includes('dom') || title.includes('es6')) return 'javascript'
    if (title.includes('react') || title.includes('jsx') || title.includes('hooks') || title.includes('state') || title.includes('router')) return 'react'
    if (title.includes('node') || title.includes('express') || title.includes('api') || title.includes('restful') || title.includes('authentication') || title.includes('deployment')) return 'nodejs'
    if (title.includes('mongo') || title.includes('database')) return 'database'
    if (title.includes('python') || title.includes('numpy') || title.includes('pandas')) return 'python'
    if (title.includes('machine learning') || title.includes('regression') || title.includes('decision tree') || title.includes('random forest') || title.includes('svm') || title.includes('model')) return 'ml'
    if (title.includes('neural') || title.includes('cnn') || title.includes('rnn') || title.includes('deep') || title.includes('tensorflow') || title.includes('transfer')) return 'deeplearning'
    if (title.includes('seo') || title.includes('keyword') || title.includes('content') || title.includes('email') || title.includes('analytics')) return 'marketing'
    if (title.includes('social') || title.includes('facebook') || title.includes('instagram') || title.includes('linkedin') || title.includes('tiktok')) return 'social'
    if (title.includes('google ads') || title.includes('ads') || title.includes('ppc') || title.includes('campaign')) return 'ads'
    if (title.includes('ux') || title.includes('user research') || title.includes('persona') || title.includes('journey') || title.includes('wireframe') || title.includes('prototype') || title.includes('usability')) return 'ux'
    if (title.includes('figma') || title.includes('design system') || title.includes('component') || title.includes('typography') || title.includes('layout')) return 'figma'
    if (title.includes('finance') || title.includes('accounting') || title.includes('balance') || title.includes('income') || title.includes('cash flow') || title.includes('ratio') || title.includes('valuation') || title.includes('dcf') || title.includes('excel') || title.includes('investment')) return 'finance'
    if (title.includes('logistic') || title.includes('logística') || course.includes('logistic') || course.includes('logística')) return 'logistics'

    // Default based on course
    if (course.includes('web') || course.includes('full stack')) return 'javascript'
    if (course.includes('data science') || course.includes('machine learning')) return 'ml'
    if (course.includes('marketing')) return 'marketing'
    if (course.includes('ui/ux') || course.includes('design')) return 'ux'
    if (course.includes('finance')) return 'finance'

    return 'javascript' // Default fallback
}

async function seedQuizzes() {
    console.log('🚀 Starting quiz seed...')

    // Get all lessons with their course info
    const lessons = await prisma.lesson.findMany({
        where: {
            videoUrl: { not: '' }
        },
        include: {
            module: {
                include: {
                    course: true
                }
            }
        }
    })

    console.log(`📚 Found ${lessons.length} lessons with videos`)

    let created = 0
    let updated = 0

    for (const lesson of lessons) {
        const topic = getTopicForLesson(lesson.title, lesson.module.course.title)
        const questions = questionsByTopic[topic] || questionsByTopic['javascript']

        // Add unique IDs for this lesson
        const lessonQuestions = questions.map((q, i) => ({
            ...q,
            id: `${lesson.id}-q${i + 1}`
        }))

        try {
            const existing = await prisma.lessonQuiz.findUnique({
                where: { lessonId: lesson.id }
            })

            if (existing) {
                await prisma.lessonQuiz.update({
                    where: { lessonId: lesson.id },
                    data: {
                        questions: JSON.stringify(lessonQuestions),
                        updatedAt: new Date()
                    }
                })
                updated++
                console.log(`✏️  Updated quiz for: ${lesson.title} (${topic})`)
            } else {
                await prisma.lessonQuiz.create({
                    data: {
                        lessonId: lesson.id,
                        questions: JSON.stringify(lessonQuestions)
                    }
                })
                created++
                console.log(`✅ Created quiz for: ${lesson.title} (${topic})`)
            }
        } catch (error) {
            console.error(`❌ Error for lesson ${lesson.title}:`, error)
        }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   Created: ${created} quizzes`)
    console.log(`   Updated: ${updated} quizzes`)
    console.log(`   Total: ${created + updated} quizzes`)
}

seedQuizzes()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
