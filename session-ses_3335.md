# Staff pages integration plan for sala service front-end backend access questions

**Session ID:** ses_3335cdb17ffeISAdZ042mFD4Uh
**Created:** 8/3/2026, 9:49:29
**Updated:** 8/3/2026, 10:14:32

---

## User

ya tenemos levantado el micro de c:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service. vamos a pensar todas las funcionalidades y como integrarlo en nuestro front c:\Users\Jlemonn1\Desktop\Suances\suances-app, vamos a añadir las funciones/flujos a todo lo que corresponda a las paginas de staff. Revisa docc:\Users\Jlemonn1\Desktop\Suances\docs\sala. y piensa como incorporanto. Como ponemos las paginas de staff. hazme preguntas

---

## Assistant (Plan · kimi-k2.5 · 9.4s)

_Thinking:_

El usuario quiere integrar un microservicio de "sala" (room/meeting room) con su frontend. Me pide que:
1. Revisa el documento de sala en docs\sala
2. Entienda el backend en rest-sala-service
3. Integre las funcionalidades en las páginas de staff del frontend suances-app
4. Me haga preguntas para clarificar

Primero necesito explorar la estructura del proyecto, leer la documentación y entender qué funcionalidades tiene el microservicio de sala.

Voy a explorar la documentación y el código para entender el microservicio de sala y cómo integrarlo. Déjame revisar primero la estructura y documentación.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\docs\\sala"
}
```

**Output:**
```
<path>C:\Users\Jlemonn1\Desktop\Suances\docs\sala</path>
<type>directory</type>
<entries>
epicas-hu.txt
sala-API-CONTRACT.md
sala-ARQUITECTURA.md
sala-EPICAS.md
sala-EVENTS.md
sala-SCHEMA.md
sala-service-SPEC.md

(7 entries)
</entries>
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/*",
  "path": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\backend\\rest-sala-service"
}
```

**Output:**
```
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\maven-status\maven-compiler-plugin\compile\default-compile\inputFiles.lst
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\maven-status\maven-compiler-plugin\compile\default-compile\createdFiles.lst
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\security\SecurityConfig.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\security\Rol.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\security\JwtTokenProvider.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\security\JwtAuthenticationFilter.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\security\JwtAuthenticationEntryPoint.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\exception\ResourceNotFoundException.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\exception\GlobalExceptionHandler.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\exception\BusinessRuleException.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\event\dto\ReservaCancelledEvent.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\event\dto\ReservaCreatedEvent.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\repository\EventoProcesadoRepository.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\event\ReservasEventConsumer.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\domain\model\EventoProcesado.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\controller\MesaOperativaController.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\controller\ItemComandaController.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\service\EstadisticasService.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\controller\EstadisticasController.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\controller\CuentaController.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\service\MesaOperativaService.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\domain\dto\response\ComandaResponse.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\service\CuentaService.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\service\ComandaService.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\service\ComandaService$1.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\controller\ComandaController.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\domain\model\enums\MesaEstadoOperativo.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\domain\model\MesaOperativa.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\repository\MesaOperativaRepository.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\service\CocinaService.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\controller\CocinaController.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\event\SalaEventProducer.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\domain\model\enums\ComandaEstado.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\domain\model\Comanda.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\repository\ComandaRepository.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\repository\ItemComandaRepository.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\domain\model\ItemComanda.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\domain\model\ItemComanda$ItemEstado.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\domain\model\enums\TipoRonda.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\service\ItemComandaService.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\service\BarService.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\controller\BarController.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\config\RedisConfig.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\com\suances\sala\SalaApplication.class
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\target\classes\application.yml
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\README.md
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\controller\CuentaController.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\event\SalaEventProducer.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\service\ComandaService.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\controller\ComandaController.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\controller\CocinaController.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\controller\BarController.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\controller\ItemComandaController.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\service\CuentaService.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\.factorypath
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\.settings\org.eclipse.jdt.apt.core.prefs
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\.settings\org.eclipse.jdt.core.prefs
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\.classpath
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\service\CocinaService.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\repository\ItemComandaRepository.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\service\BarService.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\service\ItemComandaService.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\domain\dto\response\TicketCobroResponse.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\domain\dto\response\TicketCocinaResponse.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\domain\dto\response\ItemComandaResponse.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\domain\dto\request\EnviarCocinaRequest.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\domain\dto\request\ItemComandaRequest.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\controller\EstadisticasController.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\service\EstadisticasService.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\event\ReservasEventConsumer.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\repository\EventoProcesadoRepository.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\domain\model\EventoProcesado.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\event\dto\ReservaCancelledEvent.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\event\dto\ReservaCreatedEvent.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\controller\MesaOperativaController.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\service\MesaOperativaService.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\domain\dto\response\MesaOperativaResponse.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\repository\MesaOperativaRepository.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\domain\dto\response\CuentaResponse.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\domain\dto\response\ComandaResponse.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\domain\dto\request\ComandaRequest.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\repository\ComandaRepository.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\.env.example
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\docker-compose.yml
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\Dockerfile
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\config\RedisConfig.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\exception\GlobalExceptionHandler.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\exception\BusinessRuleException.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\exception\ResourceNotFoundException.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\security\SecurityConfig.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\security\JwtAuthenticationEntryPoint.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\security\JwtAuthenticationFilter.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\security\JwtTokenProvider.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\security\Rol.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\.project
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\.settings\org.eclipse.core.resources.prefs
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\.settings\org.eclipse.m2e.core.prefs
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\SalaApplication.java
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\resources\application.yml
C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\pom.xml

(Results are truncated: showing first 100 results. Consider using a more specific path or pattern.)
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/staff/**/*",
  "path": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\suances-app"
}
```

**Output:**
```
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\screens\staff\CartaPublicaScreen.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\screens\staff\PerfilScreen.tsx
```

---

## Assistant (Plan · kimi-k2.5 · 7.0s)

_Thinking:_

Ahora necesito leer la documentación de sala para entender las funcionalidades. Déjame leer los archivos de documentación.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\docs\\sala\\sala-API-CONTRACT.md"
}
```

**Output:**
```
<path>C:\Users\Jlemonn1\Desktop\Suances\docs\sala\sala-API-CONTRACT.md</path>
<type>file</type>
<content>1: # Contrato REST API - Sala Service
2: 
3: ## Base URL
4: 
5: ```
6: http://localhost:8083/api/sala
7: ```
8: 
9: ## Autenticación
10: 
11: Todas las peticiones requieren header de autorización:
12: 
13: ```http
14: Authorization: Bearer <JWT_TOKEN>
15: Content-Type: application/json
16: ```
17: 
18: El JWT debe contener claim `role` con valor: `OWNER`, `MANAGER` o `WAITER`.
19: 
20: ---
21: 
22: ## Códigos de Respuesta
23: 
24: | Código | Significado | Descripción |
25: |--------|-------------|-------------|
26: | 200 | OK | Petición exitosa |
27: | 201 | Created | Recurso creado exitosamente |
28: | 204 | No Content | Operación exitosa sin contenido |
29: | 400 | Bad Request | Datos de entrada inválidos |
30: | 401 | Unauthorized | Token JWT ausente o inválido |
31: | 403 | Forbidden | Rol sin permisos suficientes |
32: | 404 | Not Found | Recurso no existe |
33: | 409 | Conflict | Conflicto de estado (ej: mesa ocupada) |
34: | 422 | Unprocessable | Violación de regla de negocio |
35: 
36: ## Formato de Error
37: 
38: ```json
39: {
40:   "timestamp": "2026-03-07T13:00:00Z",
41:   "status": 409,
42:   "error": "CONFLICT",
43:   "code": "MESA_OCUPADA",
44:   "message": "La mesa 12 ya tiene una comanda activa",
45:   "path": "/api/sala/comandas"
46: }
47: ```
48: 
49: ---
50: 
51: ## 1. Comandas
52: 
53: ### 1.1 Crear Comanda
54: 
55: Abre una nueva comanda para una mesa.
56: 
57: **Endpoint**: `POST /comandas`
58: 
59: **Roles permitidos**: OWNER, MANAGER, WAITER
60: 
61: **Request**:
62: ```json
63: {
64:   "mesaId": "550e8400-e29b-41d4-a716-446655440000",
65:   "camareroId": "550e8400-e29b-41d4-a716-446655440001",
66:   "numeroComensales": 4,
67:   "notas": "Mesa junto a ventana, cliente habitual"
68: }
69: ```
70: 
71: **Validaciones**:
72: - `mesaId`: UUID requerido, debe existir en mesas_operativas
73: - `camareroId`: UUID requerido
74: - `numeroComensales`: Entero entre 1 y 50
75: - `notas`: Opcional, máximo 500 caracteres
76: 
77: **Response 201**:
78: ```json
79: {
80:   "id": "550e8400-e29b-41d4-a716-446655440002",
81:   "codigo": "CMD-A7B3",
82:   "mesaId": "550e8400-e29b-41d4-a716-446655440000",
83:   "camareroId": "550e8400-e29b-41d4-a716-446655440001",
84:   "estado": "ABIERTA",
85:   "numeroComensales": 4,
86:   "notas": "Mesa junto a ventana, cliente habitual",
87:   "total": 0.00,
88:   "descuentoPorcentaje": 0.00,
89:   "fechaApertura": "2026-03-07T13:00:00Z",
90:   "createdAt": "2026-03-07T13:00:00Z"
91: }
92: ```
93: 
94: **Errores posibles**:
95: - `409 CONFLICT`: Mesa ya tiene comanda activa
96: - `404 NOT FOUND`: Mesa no existe
97: - `422 UNPROCESSABLE`: Mesa bloqueada o no disponible
98: 
99: ---
100: 
101: ### 1.2 Listar Comandas
102: 
103: Obtiene listado de comandas con filtros opcionales.
104: 
105: **Endpoint**: `GET /comandas`
106: 
107: **Roles permitidos**: OWNER, MANAGER, WAITER
108: 
109: **Query Parameters**:
110: 
111: | Parámetro | Tipo | Descripción | Ejemplo |
112: |-----------|------|-------------|---------|
113: | `estado` | String | Filtrar por estado | `ABIERTA`, `EN_PREPARACION`, `SERVIDA`, `CUENTA`, `COBRADA` |
114: | `mesaId` | UUID | Filtrar por mesa | `550e8400-e29b-41d4-a716-446655440000` |
115: | `camareroId` | UUID | Filtrar por camarero | `550e8400-e29b-41d4-a716-446655440001` |
116: | `fechaDesde` | DateTime | Desde fecha | `2026-03-07T00:00:00Z` |
117: | `fechaHasta` | DateTime | Hasta fecha | `2026-03-07T23:59:59Z` |
118: | `page` | Integer | Número de página | `0` (default) |
119: | `size` | Integer | Tamaño de página | `20` (default) |
120: | `sort` | String | Ordenamiento | `fechaApertura,desc` |
121: 
122: **Response 200**:
123: ```json
124: {
125:   "content": [
126:     {
127:       "id": "550e8400-e29b-41d4-a716-446655440002",
128:       "codigo": "CMD-A7B3",
129:       "mesaId": "550e8400-e29b-41d4-a716-446655440000",
130:       "mesaNumero": 12,
131:       "camareroId": "550e8400-e29b-41d4-a716-446655440001",
132:       "camareroNombre": "Jorge García",
133:       "estado": "ABIERTA",
134:       "numeroComensales": 4,
135:       "total": 45.50,
136:       "fechaApertura": "2026-03-07T13:00:00Z",
137:       "totalPedidos": 3,
138:       "pedidosPendientes": 1,
139:       "pedidosListos": 2
140:     }
141:   ],
142:   "pageable": {
143:     "pageNumber": 0,
144:     "pageSize": 20,
145:     "sort": {
146:       "sorted": true,
147:       "unsorted": false
148:     }
149:   },
150:   "totalElements": 1,
151:   "totalPages": 1,
152:   "last": true
153: }
154: ```
155: 
156: ---
157: 
158: ### 1.3 Obtener Comanda
159: 
160: Obtiene detalle completo de una comanda incluyendo pedidos.
161: 
162: **Endpoint**: `GET /comandas/{id}`
163: 
164: **Roles permitidos**: OWNER, MANAGER, WAITER
165: 
166: **Response 200**:
167: ```json
168: {
169:   "id": "550e8400-e29b-41d4-a716-446655440002",
170:   "codigo": "CMD-A7B3",
171:   "mesaId": "550e8400-e29b-41d4-a716-446655440000",
172:   "mesaNumero": 12,
173:   "camareroId": "550e8400-e29b-41d4-a716-446655440001",
174:   "camareroNombre": "Jorge García",
175:   "estado": "EN_PREPARACION",
176:   "numeroComensales": 4,
177:   "notas": "Mesa junto a ventana",
178:   "total": 45.50,
179:   "descuentoPorcentaje": 0.00,
180:   "fechaApertura": "2026-03-07T13:00:00Z",
181:   "pedidos": [
182:     {
183:       "id": "550e8400-e29b-41d4-a716-446655440003",
184:       "platoId": "550e8400-e29b-41d4-a716-446655440004",
185:       "nombrePlato": "Ensalada Mixta",
186:       "cantidad": 2,
187:       "precioUnitario": 12.50,
188:       "estado": "SERVIDO",
189:       "notas": "Sin cebolla",
190:       "horaPedido": "2026-03-07T13:05:00Z",
191:       "horaServido": "2026-03-07T13:15:00Z"
192:     },
193:     {
194:       "id": "550e8400-e29b-41d4-a716-446655440005",
195:       "platoId": "550e8400-e29b-41d4-a716-446655440006",
196:       "nombrePlato": "Filete de Ternera",
197:       "cantidad": 2,
198:       "precioUnitario": 18.00,
199:       "estado": "EN_PREPARACION",
200:       "notas": "Uno poco hecho",
201:       "horaPedido": "2026-03-07T13:10:00Z"
202:     }
203:   ],
204:   "resumen": {
205:     "totalPedidos": 2,
206:     "pedidosPendientes": 0,
207:     "pedidosEnPreparacion": 1,
208:     "pedidosListos": 0,
209:     "pedidosServidos": 1,
210:     "tiempoTranscurridoMinutos": 15
211:   }
212: }
213: ```
214: 
215: ---
216: 
217: ### 1.4 Cambiar Estado de Comanda
218: 
219: Actualiza el estado de una comanda según el flujo permitido.
220: 
221: **Endpoint**: `PATCH /comandas/{id}/estado`
222: 
223: **Roles permitidos**: OWNER, MANAGER, WAITER
224: 
225: **Request**:
226: ```json
227: {
228:   "estado": "CUENTA",
229:   "motivo": "Cliente solicita cuenta"
230: }
231: ```
232: 
233: **Validaciones de transición**:
234: - `ABIERTA` → `EN_PREPARACION`: Requiere al menos un pedido en preparación
235: - `EN_PREPARACION` → `SERVIDA`: Todos los pedidos deben estar SERVIDOS
236: - `SERVIDA` → `CUENTA`: Siempre permitido
237: - `CUENTA` → `ABIERTA`: Permitido si cliente agrega más pedidos
238: - Cualquier estado → `CANCELADA`: Solo si no hay pedidos SERVIDOS
239: 
240: **Response 200**:
241: ```json
242: {
243:   "id": "550e8400-e29b-41d4-a716-446655440002",
244:   "codigo": "CMD-A7B3",
245:   "estado": "CUENTA",
246:   "estadoAnterior": "SERVIDA",
247:   "fechaActualizacion": "2026-03-07T14:00:00Z"
248: }
249: ```
250: 
251: **Errores posibles**:
252: - `422 UNPROCESSABLE`: Transición de estado no permitida
253: 
254: ---
255: 
256: ### 1.5 Cerrar Comanda (Pedir Cuenta)
257: 
258: Marca la comanda como lista para cobro.
259: 
260: **Endpoint**: `POST /comandas/{id}/cerrar`
261: 
262: **Roles permitidos**: OWNER, MANAGER, WAITER
263: 
264: **Request**:
265: ```json
266: {
267:   "tipoPago": "TARJETA"
268: }
269: ```
270: 
271: **Response 200**:
272: ```json
273: {
274:   "id": "550e8400-e29b-41d4-a716-446655440002",
275:   "codigo": "CMD-A7B3",
276:   "estado": "CUENTA",
277:   "total": 45.50,
278:   "descuentoAplicado": 0.00,
279:   "fechaCierre": "2026-03-07T14:00:00Z"
280: }
281: ```
282: 
283: ---
284: 
285: ### 1.6 Cobrar Comanda
286: 
287: Procesa el cobro final y cierra la comanda.
288: 
289: **Endpoint**: `POST /comandas/{id}/cobrar`
290: 
291: **Roles permitidos**: OWNER, MANAGER, WAITER
292: 
293: **Request**:
294: ```json
295: {
296:   "tipoPago": "TARJETA",
297:   "montoRecibido": 50.00,
298:   "propina": 2.00
299: }
300: ```
301: 
302: **Response 200**:
303: ```json
304: {
305:   "id": "550e8400-e29b-41d4-a716-446655440002",
306:   "codigo": "CMD-A7B3",
307:   "estado": "COBRADA",
308:   "estadoAnterior": "CUENTA",
309:   "total": 45.50,
310:   "tipoPago": "TARJETA",
311:   "montoRecibido": 50.00,
312:   "cambio": 4.50,
313:   "propina": 2.00,
314:   "fechaCobro": "2026-03-07T14:05:00Z",
315:   "duracionTotalMinutos": 65
316: }
317: ```
318: 
319: ---
320: 
321: ### 1.7 Cancelar Comanda
322: 
323: Cancela una comanda completamente.
324: 
325: **Endpoint**: `DELETE /comandas/{id}`
326: 
327: **Roles permitidos**: OWNER, MANAGER (WAITER no puede cancelar)
328: 
329: **Query Parameters**:
330: | Parámetro | Tipo | Requerido | Descripción |
331: |-----------|------|-----------|-------------|
332: | `motivo` | String | Sí | Razón de cancelación |
333: 
334: **Response 204**: No content
335: 
336: **Errores posibles**:
337: - `403 FORBIDDEN`: WAITER intentando cancelar
338: - `422 UNPROCESSABLE`: Hay pedidos ya servidos
339: 
340: ---
341: 
342: ## 2. Pedidos
343: 
344: ### 2.1 Agregar Pedido
345: 
346: Añade un nuevo pedido a una comanda existente.
347: 
348: **Endpoint**: `POST /comandas/{comandaId}/pedidos`
349: 
350: **Roles permitidos**: OWNER, MANAGER, WAITER
351: 
352: **Request**:
353: ```json
354: {
355:   "platoId": "550e8400-e29b-41d4-a716-446655440006",
356:   "cantidad": 2,
357:   "notas": "Sin cebolla, uno sin gluten"
358: }
359: ```
360: 
361: **Validaciones**:
362: - `comandaId`: Debe existir y estar en estado ABIERTA o EN_PREPARACION
363: - `platoId`: UUID requerido
364: - `cantidad`: Entero entre 1 y 99
365: - `notas`: Opcional, máximo 255 caracteres
366: 
367: **Response 201**:
368: ```json
369: {
370:   "id": "550e8400-e29b-41d4-a716-446655440005",
371:   "comandaId": "550e8400-e29b-41d4-a716-446655440002",
372:   "platoId": "550e8400-e29b-41d4-a716-446655440006",
373:   "nombrePlato": "Filete de Ternera",
374:   "cantidad": 2,
375:   "precioUnitario": 18.00,
376:   "subtotal": 36.00,
377:   "estado": "PENDIENTE",
378:   "notas": "Sin cebolla, uno sin gluten",
379:   "horaPedido": "2026-03-07T13:10:00Z"
380: }
381: ```
382: 
383: **Nota**: El `precioUnitario` se obtiene de carta-service y se congela en el momento del pedido.
384: 
385: ---
386: 
387: ### 2.2 Listar Pedidos de Comanda
388: 
389: Obtiene todos los pedidos de una comanda.
390: 
391: **Endpoint**: `GET /comandas/{comandaId}/pedidos`
392: 
393: **Roles permitidos**: OWNER, MANAGER, WAITER
394: 
395: **Query Parameters**:
396: | Parámetro | Tipo | Descripción |
397: |-----------|------|-------------|
398: | `estado` | String | Filtrar por estado |
399: | `incluirCancelados` | Boolean | Incluir pedidos cancelados (default: false) |
400: 
401: **Response 200**:
402: ```json
403: {
404:   "comandaId": "550e8400-e29b-41d4-a716-446655440002",
405:   "pedidos": [
406:     {
407:       "id": "550e8400-e29b-41d4-a716-446655440003",
408:       "platoId": "550e8400-e29b-41d4-a716-446655440004",
409:       "nombrePlato": "Ensalada Mixta",
410:       "cantidad": 2,
411:       "precioUnitario": 12.50,
412:       "subtotal": 25.00,
413:       "estado": "SERVIDO",
414:       "horaPedido": "2026-03-07T13:05:00Z",
415:       "horaServido": "2026-03-07T13:15:00Z"
416:     }
417:   ],
418:   "totales": {
419:     "cantidadTotal": 2,
420:     "subtotal": 25.00
421:   }
422: }
423: ```
424: 
425: ---
426: 
427: ### 2.3 Actualizar Estado de Pedido
428: 
429: Cambia el estado de un pedido individual.
430: 
431: **Endpoint**: `PATCH /pedidos/{id}/estado`
432: 
433: **Roles permitidos**: OWNER, MANAGER, WAITER
434: 
435: **Request**:
436: ```json
437: {
438:   "estado": "LISTO",
439:   "notasCambio": "Plato listo para servir"
440: }
441: ```
442: 
443: **Transiciones permitidas**:
444: - `PENDIENTE` → `EN_PREPARACION`: Cocina inicia preparación
445: - `EN_PREPARACION` → `LISTO`: Plato terminado en cocina
446: - `LISTO` → `SERVIDO`: Camarero sirve el plato
447: - Cualquier estado (excepto SERVIDO) → `CANCELADO`: Cancelación
448: 
449: **Response 200**:
450: ```json
451: {
452:   "id": "550e8400-e29b-41d4-a716-446655440005",
453:   "estado": "LISTO",
454:   "estadoAnterior": "EN_PREPARACION",
455:   "horaListo": "2026-03-07T13:25:00Z",
456:   "comandaEstadoActualizado": "EN_PREPARACION"
457: }
458: ```
459: 
460: ---
461: 
462: ### 2.4 Cancelar Pedido
463: 
464: Cancela un pedido específico.
465: 
466: **Endpoint**: `DELETE /pedidos/{id}`
467: 
468: **Roles permitidos**: OWNER, MANAGER, WAITER
469: 
470: **Query Parameters**:
471: | Parámetro | Tipo | Requerido | Descripción |
472: |-----------|------|-----------|-------------|
473: | `motivo` | String | Sí | Razón de cancelación |
474: 
475: **Response 204**: No content
476: 
477: **Errores posibles**:
478: - `422 UNPROCESSABLE`: Pedido ya está SERVIDO
479: 
480: ---
481: 
482: ## 3. Mesas Operativas
483: 
484: ### 3.1 Listar Mesas
485: 
486: Obtiene todas las mesas con su estado operativo actual.
487: 
488: **Endpoint**: `GET /mesas`
489: 
490: **Roles permitidos**: OWNER, MANAGER, WAITER
491: 
492: **Query Parameters**:
493: | Parámetro | Tipo | Descripción |
494: |-----------|------|-------------|
495: | `salaId` | UUID | Filtrar por sala |
496: | `estado` | String | Filtrar por estado operativo |
497: | `camareroId` | UUID | Filtrar por camarero asignado |
498: | `incluirLibres` | Boolean | Incluir mesas libres (default: true) |
499: 
500: **Response 200**:
501: ```json
502: {
503:   "mesas": [
504:     {
505:       "id": "550e8400-e29b-41d4-a716-446655440000",
506:       "numero": 12,
507:       "salaId": "550e8400-e29b-41d4-a716-446655440007",
508:       "nombreSala": "Principal",
509:       "estadoOperativo": "OCUPADA",
510:       "comandaActivaId": "550e8400-e29b-41d4-a716-446655440002",
511:       "codigoComanda": "CMD-A7B3",
512:       "camareroAsignadoId": "550e8400-e29b-41d4-a716-446655440001",
513:       "nombreCamarero": "Jorge García",
514:       "reservaActualId": null,
515:       "nombreClienteReserva": null,
516:       "totalComandaActual": 45.50,
517:       "numeroComensales": 4,
518:       "tiempoOcupadaMinutos": 65
519:     },
520:     {
521:       "id": "550e8400-e29b-41d4-a716-446655440008",
522:       "numero": 13,
523:       "salaId": "550e8400-e29b-41d4-a716-446655440007",
524:       "nombreSala": "Principal",
525:       "estadoOperativo": "LIBRE",
526:       "comandaActivaId": null,
527:       "reservaActualId": "550e8400-e29b-41d4-a716-446655440009",
528:       "nombreClienteReserva": "Laura Martínez",
529:       "horaReserva": "14:00"
530:     }
531:   ],
532:   "resumen": {
533:     "totalMesas": 15,
534:     "libres": 8,
535:     "ocupadas": 6,
536:     "reservadas": 1
537:   }
538: }
539: ```
540: 
541: ---
542: 
543: ### 3.2 Obtener Mesa
544: 
545: Obtiene detalle completo de una mesa operativa.
546: 
547: **Endpoint**: `GET /mesas/{id}`
548: 
549: **Roles permitidos**: OWNER, MANAGER, WAITER
550: 
551: **Response 200**:
552: ```json
553: {
554:   "id": "550e8400-e29b-41d4-a716-446655440000",
555:   "numero": 12,
556:   "salaId": "550e8400-e29b-41d4-a716-446655440007",
557:   "nombreSala": "Principal",
558:   "capacidad": 4,
559:   "posX": 100,
560:   "posY": 200,
561:   "estadoOperativo": "OCUPADA",
562:   "comandaActiva": {
563:     "id": "550e8400-e29b-41d4-a716-446655440002",
564:     "codigo": "CMD-A7B3",
565:     "camareroId": "550e8400-e29b-41d4-a716-446655440001",
566:     "camareroNombre": "Jorge García",
567:     "estado": "EN_PREPARACION",
568:     "numeroComensales": 4,
569:     "total": 45.50,
570:     "fechaApertura": "2026-03-07T13:00:00Z",
571:     "pedidosPendientes": 1
572:   },
573:   "reservaActual": null,
574:   "historialHoy": [
575:     {
576:       "tipo": "COMANDA_ABIERTA",
577:       "timestamp": "2026-03-07T13:00:00Z",
578:       "datos": {
579:         "comandaId": "550e8400-e29b-41d4-a716-446655440002",
580:         "camarero": "Jorge García"
581:       }
582:     }
583:   ]
584: }
585: ```
586: 
587: ---
588: 
589: ### 3.3 Cambiar Estado de Mesa (Manual)
590: 
591: Permite cambiar manualmente el estado operativo de una mesa.
592: 
593: **Endpoint**: `PATCH /mesas/{id}/estado`
594: 
595: **Roles permitidos**: OWNER, MANAGER (WAITER no puede)
596: 
597: **Request**:
598: ```json
599: {
600:   "estadoOperativo": "LIBRE",
601:   "motivo": "Cliente finalizó y se retiró",
602:   "forzar": false
603: }
604: ```
605: 
606: **Validaciones**:
607: - Si `forzar=true`: Permite cambios que normalmente violarían reglas
608: - Si hay comanda activa: Requiere confirmación o forzar=true
609: 
610: **Response 200**:
611: ```json
612: {
613:   "id": "550e8400-e29b-41d4-a716-446655440000",
614:   "numero": 12,
615:   "estadoOperativo": "LIBRE",
616:   "estadoAnterior": "COBRADA",
617:   "comandaActivaId": null,
618:   "fechaActualizacion": "2026-03-07T14:10:00Z"
619: }
620: ```
621: 
622: ---
623: 
624: ### 3.4 Asignar Camarero
625: 
626: Asigna un camarero responsable a una mesa.
627: 
628: **Endpoint**: `POST /mesas/{id}/asignar-camarero`
629: 
630: **Roles permitidos**: OWNER, MANAGER
631: 
632: **Request**:
633: ```json
634: {
635:   "camareroId": "550e8400-e29b-41d4-a716-446655440001"
636: }
637: ```
638: 
639: **Response 200**:
640: ```json
641: {
642:   "id": "550e8400-e29b-41d4-a716-446655440000",
643:   "numero": 12,
644:   "camareroAsignadoId": "550e8400-e29b-41d4-a716-446655440001",
645:   "nombreCamarero": "Jorge García",
646:   "fechaAsignacion": "2026-03-07T12:55:00Z"
647: }
648: ```
649: 
650: ---
651: 
652: ## 4. Cuenta
653: 
654: ### 4.1 Ver Cuenta Detallada
655: 
656: Obtiene el desglose completo de la cuenta de una comanda.
657: 
658: **Endpoint**: `GET /comandas/{id}/cuenta`
659: 
660: **Roles permitidos**: OWNER, MANAGER, WAITER
661: 
662: **Response 200**:
663: ```json
664: {
665:   "comandaId": "550e8400-e29b-41d4-a716-446655440002",
666:   "codigo": "CMD-A7B3",
667:   "mesaNumero": 12,
668:   "camareroNombre": "Jorge García",
669:   "fechaApertura": "2026-03-07T13:00:00Z",
670:   "items": [
671:     {
672:       "pedidoId": "550e8400-e29b-41d4-a716-446655440003",
673:       "nombrePlato": "Ensalada Mixta",
674:       "cantidad": 2,
675:       "precioUnitario": 12.50,
676:       "subtotal": 25.00,
677:       "horaPedido": "2026-03-07T13:05:00Z",
678:       "horaServido": "2026-03-07T13:15:00Z"
679:     },
680:     {
681:       "pedidoId": "550e8400-e29b-41d4-a716-446655440005",
682:       "nombrePlato": "Filete de Ternera",
683:       "cantidad": 2,
684:       "precioUnitario": 18.00,
685:       "subtotal": 36.00,
686:       "horaPedido": "2026-03-07T13:10:00Z",
687:       "horaServido": "2026-03-07T13:25:00Z"
688:     }
689:   ],
690:   "subtotal": 61.00,
691:   "descuentoPorcentaje": 10.00,
692:   "descuentoMonto": 6.10,
693:   "impuestos": {
694:     "tasa": 10.00,
695:     "monto": 5.49
696:   },
697:   "total": 60.39,
698:   "redondeo": -0.01,
699:   "tiempoTranscurridoMinutos": 65
700: }
701: ```
702: 
703: ---
704: 
705: ### 4.2 Aplicar Descuento
706: 
707: Aplica un descuento porcentual a la comanda.
708: 
709: **Endpoint**: `POST /comandas/{id}/descuento`
710: 
711: **Roles permitidos**: OWNER, MANAGER (WAITER no puede)
712: 
713: **Request**:
714: ```json
715: {
716:   "porcentaje": 10.00,
717:   "motivo": "Cumpleaños del cliente",
718:   "aplicarA": "TOTAL"
719: }
720: ```
721: 
722: **Validaciones**:
723: - `porcentaje`: Entre 0 y 100
724: - La comanda debe estar en estado `CUENTA` o anterior
725: - Solo un descuento activo por comanda
726: 
727: **Response 200**:
728: ```json
729: {
730:   "comandaId": "550e8400-e29b-41d4-a716-446655440002",
731:   "descuentoPorcentaje": 10.00,
732:   "descuentoMonto": 6.10,
733:   "subtotal": 61.00,
734:   "totalAnterior": 61.00,
735:   "totalNuevo": 54.90,
736:   "motivo": "Cumpleaños del cliente",
737:   "aplicadoPor": "550e8400-e29b-41d4-a716-446655440010",
738:   "nombreAplicador": "María López",
739:   "fechaAplicacion": "2026-03-07T14:00:00Z"
740: }
741: ```
742: 
743: ---
744: 
745: ## 5. Estadísticas y Reportes
746: 
747: ### 5.1 Resumen del Día
748: 
749: Obtiene estadísticas del día en curso.
750: 
751: **Endpoint**: `GET /estadisticas/dia`
752: 
753: **Roles permitidos**: OWNER, MANAGER
754: 
755: **Query Parameters**:
756: | Parámetro | Tipo | Descripción |
757: |-----------|------|-------------|
758: | `fecha` | Date | Fecha específica (default: hoy) |
759: 
760: **Response 200**:
761: ```json
762: {
763:   "fecha": "2026-03-07",
764:   "comandas": {
765:     "total": 45,
766:     "abiertas": 8,
767:     "cobradas": 35,
768:     "canceladas": 2
769:   },
770:   "ventas": {
771:     "total": 1250.50,
772:     "promedioPorComanda": 35.73,
773:     "metodosPago": {
774:       "EFECTIVO": 450.00,
775:       "TARJETA": 800.50
776:     }
777:   },
778:   "mesas": {
779:     "total": 20,
780:     "rotacionPromedio": 2.25,
781:     "tiempoPromedioOcupacionMinutos": 58
782:   },
783:   "camareros": [
784:     {
785:       "camareroId": "550e8400-e29b-41d4-a716-446655440001",
786:       "nombre": "Jorge García",
787:       "comandasAtendidas": 12,
788:       "ventasGeneradas": 420.00
789:     }
790:   ]
791: }
792: ```
793: 
794: ---
795: 
796: ## 6. WebSockets / SSE (Futuro)
797: 
798: ### 6.1 Eventos en Tiempo Real
799: 
800: Para escuchar cambios en tiempo real:
801: 
802: **Endpoint**: `GET /sse/mesas`
803: 
804: **Headers**:
805: ```http
806: Authorization: Bearer <JWT>
807: Accept: text/event-stream
808: ```
809: 
810: **Eventos emitidos**:
811: - `mesa.estado-cambiado`: Cuando cambia el estado de una mesa
812: - `pedido.listo`: Cuando un pedido está listo para servir
813: - `comanda.cancelada`: Cuando se cancela una comanda
814: 
815: **Ejemplo de evento**:
816: ```
817: event: pedido.listo
818: data: {"pedidoId": "...", "mesaNumero": 12, "plato": "Filete de Ternera"}
819: ```
820: 
821: ---
822: 
823: ## Notas de Implementación
824: 
825: 1. **Precios congelados**: Los precios de platos se guardan al momento del pedido para evitar cambios si la carta se actualiza.
826: 
827: 2. **Cálculo de totales**: El total se recalcula automáticamente al agregar/cancelar pedidos.
828: 
829: 3. **Idempotencia**: Las operaciones de pago deben ser idempotentes usando el `codigo` de comanda como clave.
830: 
831: 4. **Validaciones de estado**: Las transiciones de estado están estrictamente controladas para mantener la integridad del flujo.
832: 
833: 5. **Auditoría**: Todos los cambios de estado guardan el usuario que realizó la acción.
834: 
835: ---
836: 
837: **Versión**: 1.0.0  
838: **Actualizado**: 2026-03-07

(End of file - total 838 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\docs\\sala\\sala-EPICAS.md"
}
```

**Output:**
```
<path>C:\Users\Jlemonn1\Desktop\Suances\docs\sala\sala-EPICAS.md</path>
<type>file</type>
<content>1: # Épicas e Historias de Usuario - Sala Service
2: 
3: ## Resumen del Proyecto
4: 
5: **Microservicio**: rest-sala-service  
6: **Objetivo**: Gestión operativa de sala (comandas, pedidos, estados de mesas)  
7: **Área**: Operaciones del restaurante  
8: 
9: ---
10: 
11: ## Mapa de Épicas
12: 
13: ```
14: ┌─────────────────────────────────────────────────────────────────┐
15: │                     ÉPICAS - SALA SERVICE                       │
16: ├─────────────────────────────────────────────────────────────────┤
17: │                                                                 │
18: │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
19: │  │   EPIC-01   │  │   EPIC-02   │  │   EPIC-03   │             │
20: │  │   Comandas  │  │   Pedidos   │  │   Mesas     │             │
21: │  │   y Cuentas │  │             │  │   y Estados │             │
22: │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
23: │         │                │                │                     │
24: │  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐             │
25: │  │   EPIC-04   │  │   EPIC-05   │  │   EPIC-06   │             │
26: │  │   Eventos   │  │   Reportes  │  │   Integrac. │             │
27: │  │   y Sync    │  │   y Stats   │  │   Externas  │             │
28: │  └─────────────┘  └─────────────┘  └─────────────┘             │
29: │                                                                 │
30: └─────────────────────────────────────────────────────────────────┘
31: ```
32: 
33: ---
34: 
35: ## EPIC-01: Gestión de Comandas y Cuentas
36: 
37: **Como** camarero/gerente/propietario  
38: **Quiero** gestionar comandas de mesa  
39: **Para** atender a los clientes y procesar sus pedidos
40: 
41: ### Historias
42: 
43: #### HU-01.01: Abrir Comanda
44: **Como** camarero  
45: **Quiero** abrir una nueva comanda en una mesa  
46: **Para** empezar a tomar pedidos
47: 
48: **Criterios de Aceptación**:
49: - [ ] Dado una mesa libre, cuando abro comanda, entonces se crea con código único CMD-XXXX
50: - [ ] Dado una mesa ocupada, cuando intento abrir comanda, entonces recibo error 409
51: - [ ] Dado que abro comanda, cuando se crea, entonces estado es ABIERTA
52: - [ ] Dado que abro comanda, cuando se crea, entonces total inicial es 0
53: - [ ] Dado que abro comanda, cuando se crea, entonces se asigna camarero automáticamente
54: 
55: **Prioridad**: Alta  
56: **Estimación**: 5 SP  
57: **Dependencias**: Ninguna
58: 
59: ---
60: 
61: #### HU-01.02: Ver Cuenta Detallada
62: **Como** camarero  
63: **Quiero** ver el desglose completo de una cuenta  
64: **Para** mostrar al cliente antes de cobrar
65: 
66: **Criterios de Aceptación**:
67: - [ ] Dado una comanda con pedidos, cuando consulto cuenta, entonces veo lista de items
68: - [ ] Dado una cuenta, cuando la consulto, entonces veo subtotal, descuentos y total
69: - [ ] Dado una cuenta, cuando la consulto, entonces veo tiempo transcurrido desde apertura
70: - [ ] Dado pedidos cancelados, cuando veo cuenta, entonces no aparecen en el desglose
71: 
72: **Prioridad**: Alta  
73: **Estimación**: 3 SP
74: 
75: ---
76: 
77: #### HU-01.03: Cerrar Comanda (Pedir Cuenta)
78: **Como** camarero  
79: **Quiero** cerrar una comanda para cobro  
80: **Para** preparar el pago del cliente
81: 
82: **Criterios de Aceptación**:
83: - [ ] Dado comanda en estado SERVIDA, cuando cierro, entonces pasa a CUENTA
84: - [ ] Dado comanda en estado CUENTA, cuando intento agregar pedido, entonces recibo advertencia
85: - [ ] Dado comanda cerrada, cuando consulto, entonces veo resumen final
86: 
87: **Prioridad**: Alta  
88: **Estimación**: 3 SP
89: 
90: ---
91: 
92: #### HU-01.04: Cobrar Comanda
93: **Como** camarero  
94: **Quiero** procesar el cobro de una cuenta  
95: **Para** finalizar la atención al cliente
96: 
97: **Criterios de Aceptación**:
98: - [ ] Dado comanda en CUENTA, cuando cobro, entonces registro tipo de pago
99: - [ ] Dado que cobro, cuando proceso pago, entonces calculo cambio correctamente
100: - [ ] Dado comanda cobrada, cuando consulto, entonces estado es COBRADA
101: - [ ] Dado comanda cobrada, cuando termina, entonces mesa pasa a LIBRE
102: 
103: **Prioridad**: Alta  
104: **Estimación**: 5 SP
105: 
106: ---
107: 
108: #### HU-01.05: Cancelar Comanda
109: **Como** gerente  
110: **Quiero** cancelar una comanda  
111: **Para** gestionar errores o retiros de clientes
112: 
113: **Criterios de Aceptación**:
114: - [ ] Dado comanda sin pedidos servidos, cuando cancelo, entonces se libera la mesa
115: - [ ] Dado comanda con pedidos servidos, cuando intento cancelar, entonces recibo error 422
116: - [ ] Dado que cancelo comanda, cuando se procesa, entonces se registra motivo
117: - [ ] Dado que cancelo comanda, cuando es exitoso, entonces se emite evento
118: 
119: **Prioridad**: Media  
120: **Estimación**: 3 SP  
121: **Nota**: Solo OWNER y MANAGER pueden cancelar
122: 
123: ---
124: 
125: #### HU-01.06: Aplicar Descuento
126: **Como** gerente  
127: **Quiero** aplicar un descuento a una cuenta  
128: **Para** ofertas especiales o cumpleaños
129: 
130: **Criterios de Aceptación**:
131: - [ ] Dado comanda en estado CUENTA o anterior, cuando aplico descuento, entonces se recalcula total
132: - [ ] Dado descuento aplicado, cuando veo cuenta, entonces veo desglose con descuento
133: - [ ] Dado descuento, cuando lo aplico, entonces registro porcentaje y motivo
134: - [ ] Dado que aplico descuento, entonces registro quien lo aplicó
135: 
136: **Prioridad**: Media  
137: **Estimación**: 5 SP
138: 
139: ---
140: 
141: ## EPIC-02: Gestión de Pedidos
142: 
143: **Como** camarero  
144: **Quiero** gestionar pedidos individuales  
145: **Para** coordinar con cocina y servicio
146: 
147: ### Historias
148: 
149: #### HU-02.01: Agregar Pedido
150: **Como** camarero  
151: **Quiero** agregar un pedido a una comanda  
152: **Para** registrar lo que el cliente ordena
153: 
154: **Criterios de Aceptación**:
155: - [ ] Dado comanda abierta, cuando agrego pedido, entonces se guarda con precio congelado
156: - [ ] Dado que agrego pedido, cuando se guarda, entonces estado es PENDIENTE
157: - [ ] Dado que agrego pedido, cuando se procesa, entonces se emite evento a carta-service
158: - [ ] Dado notas en pedido, cuando se guarda, entonces son visibles para cocina
159: 
160: **Prioridad**: Alta  
161: **Estimación**: 5 SP  
162: **Dependencias**: Integración con carta-service
163: 
164: ---
165: 
166: #### HU-02.02: Cambiar Estado de Pedido
167: **Como** camarero/cocina  
168: **Quiero** actualizar el estado de un pedido  
169: **Para** coordinar flujo cocina-servicio
170: 
171: **Criterios de Aceptación**:
172: - [ ] Dado pedido PENDIENTE, cuando pasa a EN_PREPARACION, entonces notifica mesa
173: - [ ] Dado pedido EN_PREPARACION, cuando está listo, entonces cambia a LISTO
174: - [ ] Dado pedido LISTO, cuando se sirve, entonces cambia a SERVIDO
175: - [ ] Dado cambio de estado, cuando ocurre, entonces se registra timestamp
176: 
177: **Prioridad**: Alta  
178: **Estimación**: 5 SP
179: 
180: ---
181: 
182: #### HU-02.03: Cancelar Pedido
183: **Como** camarero  
184: **Quiero** cancelar un pedido específico  
185: **Para** corregir errores o cambios de cliente
186: 
187: **Criterios de Aceptación**:
188: - [ ] Dado pedido no servido, cuando cancelo, entonces se marca como CANCELADO
189: - [ ] Dado pedido servido, cuando intento cancelar, entonces recibo error 422
190: - [ ] Dado que cancelo pedido, cuando se procesa, entonces se recalcula total de comanda
191: - [ ] Dado cancelación, cuando se procesa, entonces se registra motivo
192: 
193: **Prioridad**: Media  
194: **Estimación**: 3 SP
195: 
196: ---
197: 
198: #### HU-02.04: Ver Pedidos por Estado
199: **Como** camarero  
200: **Quiero** filtrar pedidos por su estado  
201: **Para** saber qué está pendiente o listo
202: 
203: **Criterios de Aceptación**:
204: - [ ] Dado comanda con múltiples pedidos, cuando filtro, entonces veo por estado
205: - [ ] Dado pedidos en diferentes estados, cuando veo comanda, entonces veo resumen por estado
206: - [ ] Dado filtro activo, cuando cambia estado, entonces lista se actualiza
207: 
208: **Prioridad**: Media  
209: **Estimación**: 3 SP
210: 
211: ---
212: 
213: ## EPIC-03: Gestión de Mesas y Estados
214: 
215: **Como** gerente  
216: **Quiero** gestionar el estado operativo de las mesas  
217: **Para** optimizar la rotación y atención
218: 
219: ### Historias
220: 
221: #### HU-03.01: Ver Estado de Mesas
222: **Como** camarero  
223: **Quiero** ver el estado de todas las mesas  
224: **Para** saber cuáles están disponibles u ocupadas
225: 
226: **Criterios de Aceptación**:
227: - [ ] Dado mesas configuradas, cuando consulto, entonces veo lista con estado actual
228: - [ ] Dado mesa ocupada, cuando consulto, entonces veo camarero y comanda activa
229: - [ ] Dado mesa con reserva, cuando consulto, entonces veo nombre del cliente
230: - [ ] Dado lista de mesas, cuando aplico filtro, entonces filtra por sala o estado
231: 
232: **Prioridad**: Alta  
233: **Estimación**: 5 SP  
234: **Dependencias**: Sincronización con reservas-service
235: 
236: ---
237: 
238: #### HU-03.02: Cambiar Estado de Mesa (Manual)
239: **Como** gerente  
240: **Quiero** cambiar manualmente el estado de una mesa  
241: **Para** gestionar situaciones especiales
242: 
243: **Criterios de Aceptación**:
244: - [ ] Dado mesa ocupada, cuando cambio a LIBRE (forzar), entonces se libera comanda
245: - [ ] Dado cambio manual, cuando se procesa, entonces se registra motivo
246: - [ ] Dado camarero sin permisos, cuando intenta cambiar, entonces recibe 403
247: - [ ] Dado cambio de estado, cuando ocurre, entonces se emite evento
248: 
249: **Prioridad**: Media  
250: **Estimación**: 3 SP
251: 
252: ---
253: 
254: #### HU-03.03: Asignar Camarero a Mesa
255: **Como** gerente  
256: **Quiero** asignar un camarero a una mesa  
257: **Para** distribuir la carga de trabajo
258: 
259: **Criterios de Aceptación**:
260: - [ ] Dado mesa libre, cuando asigno camarero, entonces queda asignado
261: - [ ] Dado mesa ocupada, cuando cambio camarero, entonces se actualiza asignación
262: - [ ] Dado camarero asignado, cuando abre comanda, entonces se asocia automáticamente
263: 
264: **Prioridad**: Baja  
265: **Estimación**: 3 SP
266: 
267: ---
268: 
269: #### HU-03.04: Sincronizar Mesas con Reservas
270: **Como** sistema  
271: **Quiero** mantener sincronizada la información de mesas  
272: **Para** consistencia entre servicios
273: 
274: **Criterios de Aceptación**:
275: - [ ] Dado evento reserva.created, cuando llega, entonces actualizo mesa operativa
276: - [ ] Dado evento mesa.blocked, cuando llega, entonces marco mesa como no disponible
277: - [ ] Dado cambio en reservas-service, cuando ocurre, entonces se refleja en < 5 segundos
278: 
279: **Prioridad**: Alta  
280: **Estimación**: 8 SP  
281: **Dependencias**: Configuración de Redis Streams
282: 
283: ---
284: 
285: ## EPIC-04: Eventos y Sincronización
286: 
287: **Como** sistema  
288: **Quiero** comunicarme con otros microservicios vía eventos  
289: **Para** mantener consistencia y notificar cambios
290: 
291: ### Historias
292: 
293: #### HU-04.01: Consumir Eventos de Reservas
294: **Como** desarrollador  
295: **Quiero** consumir eventos de reservas.events  
296: **Para** mantener mesas sincronizadas
297: 
298: **Criterios de Aceptación**:
299: - [ ] Dado evento reserva.created en stream, cuando se recibe, entonces procesa correctamente
300: - [ ] Dado evento reserva.cancelled, cuando se recibe, entonces libera mesa si aplica
301: - [ ] Dado evento duplicado, cuando se detecta, entonces se ignora (idempotencia)
302: - [ ] Dado error de procesamiento, cuando ocurre, entonces se reintenta con backoff
303: 
304: **Prioridad**: Alta  
305: **Estimación**: 8 SP  
306: **Dependencias**: Redis Streams configurado
307: 
308: ---
309: 
310: #### HU-04.02: Emitir Eventos de Comanda
311: **Como** desarrollador  
312: **Quiero** publicar eventos al abrir/cerrar comandas  
313: **Para** notificar a otros servicios
314: 
315: **Criterios de Aceptación**:
316: - [ ] Dado que abro comanda, cuando se crea, entonces emito sala.comanda.abierta
317: - [ ] Dado que cierro cuenta, cuando se procesa, entonces emito sala.cuenta.cerrada
318: - [ ] Dado que cobro, cuando se confirma, entonces emito sala.comanda.cobrada
319: - [ ] Dado evento emitido, cuando se publica, entonces incluye traceId
320: 
321: **Prioridad**: Alta  
322: **Estimación**: 5 SP
323: 
324: ---
325: 
326: #### HU-04.03: Emitir Eventos de Pedido
327: **Como** desarrollador  
328: **Quiero** publicar eventos de pedidos  
329: **Para** notificar a carta-service y cocina
330: 
331: **Criterios de Aceptación**:
332: - [ ] Dado nuevo pedido, cuando se crea, entonces emito sala.pedido.creado
333: - [ ] Dado cambio de estado, cuando ocurre, entonces emito sala.pedido.estado-cambiado
334: - [ ] Dado evento a carta, cuando se emite, entonces incluye platoId y cantidad
335: 
336: **Prioridad**: Alta  
337: **Estimación**: 5 SP
338: 
339: ---
340: 
341: #### HU-04.04: Garantizar Idempotencia
342: **Como** sistema  
343: **Quiero** evitar procesar eventos duplicados  
344: **Para** mantener consistencia de datos
345: 
346: **Criterios de Aceptación**:
347: - [ ] Dado evento ya procesado, cuando llega, entonces se detecta y omite
348: - [ ] Dado evento nuevo, cuando se procesa, entonces se registra en tabla
349: - [ ] Dado tabla de eventos, cuando crece, entonces se limpian registros > 7 días
350: 
351: **Prioridad**: Alta  
352: **Estimación**: 5 SP
353: 
354: ---
355: 
356: ## EPIC-05: Reportes y Estadísticas
357: 
358: **Como** gerente/propietario  
359: **Quiero** ver estadísticas de operación  
360: **Para** tomar decisiones de negocio
361: 
362: ### Historias
363: 
364: #### HU-05.01: Resumen del Día
365: **Como** gerente  
366: **Quiero** ver estadísticas del día  
367: **Para** conocer el rendimiento
368: 
369: **Criterios de Aceptación**:
370: - [ ] Dado consulta de resumen, cuando accedo, entonces veo total de comandas
371: - [ ] Dado resumen del día, cuando lo consulto, entonces veo ventas totales
372: - [ ] Dado resumen, cuando lo consulto, entonces veo promedio por comanda
373: - [ ] Dado resumen, cuando lo consulto, entonces veo rotación de mesas
374: 
375: **Prioridad**: Media  
376: **Estimación**: 5 SP
377: 
378: ---
379: 
380: #### HU-05.02: Rendimiento por Camarero
381: **Como** propietario  
382: **Quiero** ver estadísticas por camarero  
383: **Para** evaluar desempeño
384: 
385: **Criterios de Aceptación**:
386: - [ ] Dado período de consulta, cuando consulto, entonces veo comandas por camarero
387: - [ ] Dado camareros activos, cuando filtro, entonces veo ventas generadas
388: - [ ] Dado estadísticas, cuando consulto, entonces veo tiempo promedio de atención
389: 
390: **Prioridad**: Baja  
391: **Estimación**: 5 SP
392: 
393: ---
394: 
395: #### HU-05.03: Historial de Comandas
396: **Como** gerente  
397: **Quiero** consultar historial de comandas  
398: **Para** auditoría y análisis
399: 
400: **Criterios de Aceptación**:
401: - [ ] Dado historial, cuando filtro por fecha, entonces veo comandas de ese período
402: - [ ] Dado comanda histórica, cuando consulto detalle, entonces veo pedidos completos
403: - [ ] Dado consulta, cuando aplico filtros, entonces puedo buscar por mesa o camarero
404: 
405: **Prioridad**: Media  
406: **Estimación**: 3 SP
407: 
408: ---
409: 
410: ## EPIC-06: Integraciones Externas (Futuro)
411: 
412: ### Historias Futuras
413: 
414: #### HU-06.01: Integración con TPV
415: **Prioridad**: Baja  
416: **Descripción**: Integrar con sistemas de pago externos
417: 
418: #### HU-06.02: Pantallas de Cocina
419: **Prioridad**: Media  
420: **Descripción**: Mostrar pedidos en tiempo real en pantallas de cocina
421: 
422: #### HU-06.03: Notificaciones Push
423: **Prioridad**: Baja  
424: **Descripción**: Notificar a camareros cuando pedidos están listos
425: 
426: #### HU-06.04: Split de Cuenta
427: **Prioridad**: Baja  
428: **Descripción**: Permitir dividir la cuenta entre varios clientes
429: 
430: ---
431: 
432: ## Roadmap de Implementación
433: 
434: ### Sprint 1 (Semanas 1-2): Fundamentos
435: - HU-01.01: Abrir Comanda
436: - HU-01.02: Ver Cuenta Detallada
437: - HU-02.01: Agregar Pedido
438: - HU-03.01: Ver Estado de Mesas
439: 
440: ### Sprint 2 (Semanas 3-4): Flujo Completo
441: - HU-01.03: Cerrar Comanda
442: - HU-01.04: Cobrar Comanda
443: - HU-02.02: Cambiar Estado de Pedido
444: - HU-02.03: Cancelar Pedido
445: 
446: ### Sprint 3 (Semanas 5-6): Eventos
447: - HU-04.01: Consumir Eventos de Reservas
448: - HU-04.02: Emitir Eventos de Comanda
449: - HU-04.03: Emitir Eventos de Pedido
450: - HU-04.04: Garantizar Idempotencia
451: 
452: ### Sprint 4 (Semanas 7-8): Avanzado
453: - HU-01.05: Cancelar Comanda
454: - HU-01.06: Aplicar Descuento
455: - HU-03.02: Cambiar Estado de Mesa (Manual)
456: - HU-03.04: Sincronizar Mesas con Reservas
457: 
458: ### Sprint 5 (Semanas 9-10): Reportes
459: - HU-05.01: Resumen del Día
460: - HU-05.02: Rendimiento por Camarero
461: - HU-05.03: Historial de Comandas
462: 
463: ---
464: 
465: ## Métricas de Éxito
466: 
467: ### KPIs Técnicos
468: - **Tiempo de respuesta API**: P95 < 200ms
469: - **Disponibilidad**: 99.5% uptime
470: - **Procesamiento de eventos**: < 2 segundos de lag
471: - **Cobertura de tests**: > 80%
472: 
473: ### KPIs de Negocio
474: - **Tiempo promedio de atención**: < 60 minutos
475: - **Precisión de cuentas**: 100% (sin errores de cálculo)
476: - **Tiempo de sincronización**: < 5 segundos
477: 
478: ---
479: 
480: ## Definición de Terminado (DoD)
481: 
482: Para cada historia de usuario:
483: 
484: - [ ] Código implementado y revisado
485: - [ ] Tests unitarios con cobertura > 80%
486: - [ ] Tests de integración pasando
487: - [ ] Documentación API actualizada
488: - [ ] Eventos implementados (si aplica)
489: - [ ] Revisión de seguridad completada
490: - [ ] Desplegado en ambiente de staging
491: 
492: ---
493: 
494: **Versión**: 1.0.0  
495: **Última actualización**: 2026-03-07  
496: **Autor**: Equipo Suances  
497: **Total Story Points**: 98 SP

(End of file - total 497 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\docs\\sala\\epicas-hu.txt"
}
```

**Output:**
```
<path>C:\Users\Jlemonn1\Desktop\Suances\docs\sala\epicas-hu.txt</path>
<type>file</type>
<content>1: Perfecto. Aquí tienes las **épicas y las historias de usuario del micro de Sala**, descritas de forma funcional (sin detalles técnicos), centrándose únicamente en **lo que el sistema permite hacer y cómo lo usa el personal del restaurante**.
2: 
3: ---
4: 
5: # Épica 1: Visualización del estado de la sala
6: 
7: ## Historia de usuario 1.1 – Ver el estado general de la sala
8: 
9: Como usuario del sistema,
10: quiero poder ver el estado general de todas las mesas de una sala,
11: para conocer rápidamente qué mesas están libres, reservadas o en uso.
12: 
13: La pantalla de sala mostrará todas las mesas con un color que indique su estado actual.
14: 
15: Estados posibles de una mesa:
16: 
17: * **Verde** → mesa libre
18: * **Azul** → mesa reservada
19: * **Amarillo** → mesa con comanda activa
20: * **Rojo** → ticket generado pendiente de pago
21: 
22: Esta vista debe permitir al personal del restaurante **entender de un vistazo la situación de la sala**.
23: 
24: ---
25: 
26: ## Historia de usuario 1.2 – Ver el estado de la sala para la franja actual
27: 
28: Como usuario del sistema,
29: quiero que el estado de las mesas tenga en cuenta únicamente la franja horaria actual,
30: para que la información que veo sea relevante para el servicio que está en curso.
31: 
32: Por ejemplo:
33: 
34: * durante el servicio de comida se muestran solo las reservas de comida
35: * durante el servicio de cena se muestran solo las reservas de cena
36: 
37: ---
38: 
39: ## Historia de usuario 1.3 – Actualización automática del estado de las mesas
40: 
41: Como usuario del sistema,
42: quiero que el estado de las mesas se actualice automáticamente cuando cambien las reservas o las comandas,
43: para que la información de la sala esté siempre actualizada.
44: 
45: Cuando ocurre alguna acción relevante, la vista de sala se actualiza automáticamente.
46: 
47: Ejemplos:
48: 
49: * nueva reserva
50: * cancelación de reserva
51: * creación de comanda
52: * generación de ticket
53: * pago de ticket
54: 
55: ---
56: 
57: # Épica 2: Creación y gestión de comandas
58: 
59: ## Historia de usuario 2.1 – Crear una comanda para una mesa
60: 
61: Como camarero,
62: quiero poder crear una comanda para una mesa,
63: para empezar a registrar los pedidos de los clientes.
64: 
65: Cuando se crea una comanda:
66: 
67: * la mesa pasa a estado **ocupado**
68: * se comienza a registrar el pedido de los clientes
69: 
70: Si la mesa no tenía reserva previa, el sistema registra automáticamente que la mesa está siendo utilizada en esa franja.
71: 
72: ---
73: 
74: ## Historia de usuario 2.2 – Añadir platos a una comanda
75: 
76: Como camarero,
77: quiero poder añadir platos a una comanda,
78: para registrar los pedidos de los clientes.
79: 
80: Al añadir platos se indicará:
81: 
82: * el plato solicitado
83: * la cantidad
84: * el grupo al que pertenece el plato
85: 
86: Los grupos disponibles son:
87: 
88: * **Entrantes**
89: * **Primeros**
90: * **Segundos**
91: 
92: Esto permite organizar el servicio de cocina correctamente.
93: 
94: ---
95: 
96: ## Historia de usuario 2.3 – Modificar una comanda antes de enviarla a cocina
97: 
98: Como camarero,
99: quiero poder modificar una comanda antes de enviarla a cocina,
100: para corregir errores o ajustar el pedido del cliente.
101: 
102: Mientras los platos no se hayan enviado a cocina, se pueden:
103: 
104: * añadir platos
105: * modificar cantidades
106: * eliminar platos
107: 
108: ---
109: 
110: # Épica 3: Envío de platos a cocina
111: 
112: ## Historia de usuario 3.1 – Enviar platos a cocina por grupos
113: 
114: Como camarero,
115: quiero poder enviar los platos a cocina por grupos,
116: para que los platos se preparen en el orden adecuado.
117: 
118: Los grupos se envían normalmente en este orden:
119: 
120: 1. Entrantes
121: 2. Primeros
122: 3. Segundos
123: 
124: Si un grupo no existe en la comanda, se puede enviar directamente el siguiente.
125: 
126: ---
127: 
128: ## Historia de usuario 3.2 – Imprimir pedido en cocina
129: 
130: Como restaurante,
131: quiero que cuando se envíen platos a cocina se genere un ticket de cocina,
132: para que el personal de cocina pueda ver qué debe preparar.
133: 
134: El ticket mostrará:
135: 
136: * número de mesa
137: * hora
138: * platos enviados
139: * cantidades
140: 
141: ---
142: 
143: ## Historia de usuario 3.3 – Descontar ingredientes cuando se envía un plato a cocina
144: 
145: Como sistema de gestión del restaurante,
146: quiero que cuando un plato se envíe a cocina se descuenten automáticamente sus ingredientes del inventario,
147: para mantener actualizado el control de stock.
148: 
149: ---
150: 
151: # Épica 4: Modificación de comandas en curso
152: 
153: ## Historia de usuario 4.1 – Añadir nuevos platos a una comanda ya enviada
154: 
155: Como camarero,
156: quiero poder añadir nuevos platos a una comanda ya iniciada,
157: para registrar pedidos adicionales de los clientes.
158: 
159: Estos nuevos platos se enviarán a cocina cuando el camarero lo decida.
160: 
161: ---
162: 
163: ## Historia de usuario 4.2 – Modificar comandas enviadas a cocina
164: 
165: Como gerente o propietario,
166: quiero poder modificar una comanda ya enviada a cocina,
167: para poder corregir errores o resolver incidencias.
168: 
169: Las acciones posibles son:
170: 
171: * modificar cantidades
172: * eliminar platos
173: * cancelar líneas de pedido
174: 
175: Estas acciones **no están disponibles para camareros**.
176: 
177: ---
178: 
179: # Épica 5: Generación de ticket
180: 
181: ## Historia de usuario 5.1 – Generar el ticket de una mesa
182: 
183: Como camarero,
184: quiero poder generar el ticket de una mesa,
185: para mostrar al cliente el importe total a pagar.
186: 
187: El ticket incluirá todos los platos registrados en la comanda.
188: 
189: Cuando se genera el ticket:
190: 
191: * la mesa pasa a estado **pendiente de pago**
192: 
193: ---
194: 
195: ## Historia de usuario 5.2 – Consultar el importe total
196: 
197: Como camarero,
198: quiero poder ver el importe total del ticket,
199: para poder informar al cliente del coste de su consumo.
200: 
201: ---
202: 
203: # Épica 6: Cobro de tickets
204: 
205: ## Historia de usuario 6.1 – Registrar el pago de un ticket
206: 
207: Como camarero,
208: quiero registrar el pago de un ticket,
209: para cerrar la cuenta de la mesa.
210: 
211: El sistema permitirá registrar el tipo de pago.
212: 
213: ---
214: 
215: ## Historia de usuario 6.2 – Registrar pago con tarjeta
216: 
217: Como camarero,
218: quiero registrar que el cliente ha pagado con tarjeta,
219: para reflejar correctamente la forma de pago.
220: 
221: ---
222: 
223: ## Historia de usuario 6.3 – Registrar pago en efectivo
224: 
225: Como camarero,
226: quiero registrar el pago en efectivo,
227: para reflejar correctamente el cobro.
228: 
229: En este caso el sistema permitirá indicar:
230: 
231: * dinero entregado por el cliente
232: * cambio devuelto
233: 
234: ---
235: 
236: ## Historia de usuario 6.4 – Liberar mesa tras el pago
237: 
238: Como sistema,
239: quiero que cuando un ticket se paga la mesa vuelva a estar disponible,
240: para que pueda ser utilizada por nuevos clientes.
241: 
242: La mesa vuelve al estado **libre**.
243: 
244: ---
245: 
246: # Épica 7: Historial de acciones
247: 
248: ## Historia de usuario 7.1 – Registrar acciones realizadas en una comanda
249: 
250: Como sistema,
251: quiero registrar todas las acciones realizadas sobre una comanda,
252: para poder consultar el historial de lo ocurrido durante el servicio.
253: 
254: Ejemplos de acciones registradas:
255: 
256: * creación de comanda
257: * añadido de platos
258: * envío de platos a cocina
259: * cancelación de platos
260: * generación de ticket
261: * pago del ticket
262: 
263: ---
264: 
265: ## Historia de usuario 7.2 – Saber quién realizó cada acción
266: 
267: Como propietario o gerente,
268: quiero poder saber qué usuario realizó cada acción en una comanda,
269: para tener control y trazabilidad del servicio.
270: 
271: ---
272: 
273: # Épica 8: Sincronización con reservas
274: 
275: ## Historia de usuario 8.1 – Reflejar reservas en el estado de la sala
276: 
277: Como sistema,
278: quiero que las reservas realizadas aparezcan en el estado de las mesas,
279: para que el personal de sala sepa qué mesas están reservadas.
280: 
281: Las mesas reservadas se mostrarán con color **azul**.
282: 
283: ---
284: 
285: ## Historia de usuario 8.2 – Actualizar estado de mesa cuando cambia una reserva
286: 
287: Como sistema,
288: quiero que si una reserva se modifica o se cancela el estado de la mesa se actualice automáticamente,
289: para mantener la sala sincronizada con las reservas.
290: 
291: ---
292: 
293: # Épica 9: Funcionamiento en tiempo real
294: 
295: ## Historia de usuario 9.1 – Sincronización entre dispositivos
296: 
297: Como restaurante,
298: quiero que todos los dispositivos que usan el sistema vean los cambios en tiempo real,
299: para que todos trabajen con la misma información.
300: 
301: Por ejemplo:
302: 
303: * tablets de camareros
304: * pantalla de sala
305: * terminal de caja
306: 
307: Cuando ocurre una acción relevante, los cambios se reflejan automáticamente en todos los dispositivos.
308: 

(End of file - total 308 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\docs\\sala\\sala-service-SPEC.md"
}
```

**Output:**
```
<path>C:\Users\Jlemonn1\Desktop\Suances\docs\sala\sala-service-SPEC.md</path>
<type>file</type>
<content>1: # Micro SERVICIO SALA - Especificación Técnica
2: 
3: ## 1. Información General
4: 
5: | Campo | Valor |
6: |-------|-------|
7: | **Nombre** | SalaService |
8: | **Puerto** | 8083 |
9: | **Context Path** | `/api/sala` |
10: | **Base de datos** | PostgreSQL (`localhost:5432/sala`) |
11: | **Eventos** | Redis Streams (`localhost:6379`) |
12: 
13: ---
14: 
15: ## 2. Stack Tecnológico
16: 
17: - **Framework**: Spring Boot 3.5.11
18: - **Lenguaje**: Java 21
19: - **Build**: Maven
20: - **Arquitectura**: Hexagonal (Puertos y Adaptadores)
21: - **Persistencia**: Spring Data JPA + Hibernate
22: - **Cache / Cola**: Redis Streams (event sourcing)
23: - **Seguridad**: Spring Security 6 + JWT (tokens emitidos por PersonnelService)
24: - **Validación**: Jakarta Bean Validation
25: - **Observabilidad**: Micrometer + Prometheus
26: 
27: ---
28: 
29: ## 3. Propósito y Responsabilidad
30: 
31: El microservicio de **Sala** gestiona toda la **operativa de servicio** en el restaurante:
32: 
33: - **Comandas**: Creación y gestión de pedidos por mesa
34: - **Pedidos**: Items individuales dentro de una comanda
35: - **Estados de mesa**: LIBRE, OCUPADA, PIDIENDO, SERVIDA, CUENTA, COBRADA
36: - **Cuentas**: Cálculo de totales, aplicación de descuentos
37: - **Eventos en tiempo real**: Notificaciones de estado a reservas y carta
38: 
39: **Flujo de trabajo típico**:
40: ```
41: Cliente llega → Mesa OCUPADA → Comanda abierta → Pedidos agregados
42: → Cocina prepara → Pedidos SERVIDOS → Cliente pide cuenta
43: → Mesa CUENTA → Pago procesado → Mesa COBRADA → Mesa LIBRE
44: ```
45: 
46: ---
47: 
48: ## 4. Configuración (application.yml)
49: 
50: ```yaml
51: server:
52:   port: 8083
53:   servlet:
54:     context-path: /api/sala
55: 
56: spring:
57:   application:
58:     name: sala-service
59:   datasource:
60:     url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/sala}
61:     username: ${SPRING_DATASOURCE_USERNAME:postgres}
62:     password: ${SPRING_DATASOURCE_PASSWORD:postgres}
63:     driver-class-name: org.postgresql.Driver
64:   jpa:
65:     hibernate:
66:       ddl-auto: update
67:     properties:
68:       hibernate:
69:         dialect: org.hibernate.dialect.PostgreSQLDialect
70:         format_sql: true
71:   data:
72:     redis:
73:       host: ${SPRING_DATA_REDIS_HOST:localhost}
74:       port: ${SPRING_DATA_REDIS_PORT:6379}
75:       timeout: 2000
76: 
77: app:
78:   jwt:
79:     issuer: ${APP_JWT_ISSUER:personnel-service}
80:     audience: ${APP_JWT_AUDIENCE:sala-service}
81:     secret: ${APP_JWT_SECRET:SuperSecretKeyQueEsMuyLargaYSegura2024ParaProduccion}
82:     allowed-roles: ${APP_JWT_ALLOWED_ROLES:OWNER,MANAGER,WAITER}
83:   security:
84:     bcrypt-strength: 12
85:   redis:
86:     stream-input: ${APP_REDIS_STREAM_INPUT:reservas.events}
87:     stream-output: ${APP_REDIS_STREAM_OUTPUT:sala.events}
88:     consumer-group: ${APP_REDIS_CONSUMER_GROUP:sala-group}
89:   comanda:
90:     tiempo-maximo-preparacion-minutos: ${APP_COMANDA_TIEMPO_MAXIMO:45}
91:     auto-cierre-cuenta-minutos: ${APP_COMANDA_AUTO_CIERRE:180}
92: 
93: management:
94:   endpoints:
95:     web:
96:       exposure:
97:         include: health,info,metrics,prometheus
98: ```
99: 
100: ---
101: 
102: ## 5. Arquitectura de Paquetes
103: 
104: ```
105: com.suances.sala
106: ├── SalaApplication.java
107: ├── config/
108: │   ├── RedisConfig.java
109: │   ├── SecurityConfig.java
110: │   └── OpenApiConfig.java
111: ├── controller/
112: │   ├── ComandaController.java
113: │   ├── PedidoController.java
114: │   ├── MesaOperativaController.java
115: │   └── CuentaController.java
116: ├── service/
117: │   ├── ComandaService.java
118: │   ├── PedidoService.java
119: │   ├── MesaOperativaService.java
120: │   └── CuentaService.java
121: ├── repository/
122: │   ├── ComandaRepository.java
123: │   ├── PedidoRepository.java
124: │   ├── MesaOperativaRepository.java
125: │   └── EventoProcesadoRepository.java
126: ├── domain/
127: │   ├── model/
128: │   │   ├── Comanda.java
129: │   │   ├── Pedido.java
130: │   │   ├── MesaOperativa.java
131: │   │   └── EventoProcesado.java
132: │   └── enums/
133: │       ├── ComandaEstado.java
134: │       ├── PedidoEstado.java
135: │       ├── MesaEstadoOperativo.java
136: │       └── TipoPago.java
137: ├── dto/
138: │   ├── request/
139: │   └── response/
140: ├── event/
141: │   ├── ReservasEventConsumer.java
142: │   ├── SalaEventProducer.java
143: │   └── mapper/
144: ├── security/
145: │   ├── JwtAuthenticationFilter.java
146: │   └── JwtTokenProvider.java
147: └── exception/
148:     ├── GlobalExceptionHandler.java
149:     ├── BusinessRuleException.java
150:     └── ResourceNotFoundException.java
151: ```
152: 
153: ---
154: 
155: ## 6. Modelo de Dominio
156: 
157: ### 6.1 Entidades
158: 
159: #### Comanda
160: | Campo | Tipo | Descripción |
161: |-------|------|-------------|
162: | `id` | UUID | Identificador único |
163: | `mesa_id` | UUID | Referencia a mesa en reservas-service |
164: | `camarero_id` | UUID | Referencia a usuario en personnel-service |
165: | `codigo` | VARCHAR(20) | Código único de comanda (ej: CMD-1234) |
166: | `estado` | ENUM | ABIERTA, EN_PREPARACION, SERVIDA, CUENTA, COBRADA, CANCELADA |
167: | `numero_comensales` | SMALLINT | Cantidad de personas en la mesa |
168: | `notas` | TEXT | Observaciones generales |
169: | `total` | DECIMAL(10,2) | Total calculado de la cuenta |
170: | `descuento_porcentaje` | DECIMAL(5,2) | Descuento aplicado (%) |
171: | `fecha_apertura` | TIMESTAMP | Cuándo se abrió la comanda |
172: | `fecha_cierre` | TIMESTAMP | Cuándo se cerró/cobró |
173: | `created_at` | TIMESTAMP | Auditoría |
174: | `updated_at` | TIMESTAMP | Auditoría |
175: 
176: #### Pedido
177: | Campo | Tipo | Descripción |
178: |-------|------|-------------|
179: | `id` | UUID | Identificador único |
180: | `comanda_id` | UUID | FK a Comanda |
181: | `plato_id` | UUID | Referencia a plato en carta-service |
182: | `cantidad` | SMALLINT | Cantidad pedida |
183: | `precio_unitario` | DECIMAL(10,2) | Precio en momento del pedido |
184: | `estado` | ENUM | PENDIENTE, EN_PREPARACION, LISTO, SERVIDO, CANCELADO |
185: | `notas` | TEXT | Modificaciones/alergias |
186: | `hora_pedido` | TIMESTAMP | Cuándo se tomó |
187: | `hora_listo` | TIMESTAMP | Cuándo estuvo listo (cocina) |
188: | `hora_servido` | TIMESTAMP | Cuándo se sirvió |
189: | `created_at` | TIMESTAMP | Auditoría |
190: 
191: #### MesaOperativa (Vista sincronizada)
192: | Campo | Tipo | Descripción |
193: |-------|------|-------------|
194: | `id` | UUID | Mismo ID que en reservas-service |
195: | `numero` | INTEGER | Número de mesa |
196: | `sala_id` | UUID | Referencia a sala en reservas-service |
197: | `estado_operativo` | ENUM | LIBRE, OCUPADA, PIDIENDO, SERVIDA, CUENTA, COBRADA |
198: | `comanda_activa_id` | UUID | FK a comanda actual (si existe) |
199: | `ultima_actualizacion` | TIMESTAMP | Para sincronización |
200: | `camarero_asignado_id` | UUID | Camarero responsable |
201: 
202: #### EventoProcesado (Idempotencia)
203: | Campo | Tipo | Descripción |
204: |-------|------|-------------|
205: | `event_id` | UUID | PK - ID del evento recibido |
206: | `processed_at` | TIMESTAMP | Cuándo se procesó |
207: | `tipo_evento` | VARCHAR(50) | Tipo para debugging |
208: 
209: ---
210: 
211: ## 7. Estados y Flujos
212: 
213: ### 7.1 Estados de Comanda
214: 
215: ```
216: ABIERTA → EN_PREPARACION → SERVIDA → CUENTA → COBRADA
217:    ↓          ↓                ↓         ↓
218: CANCELADA  (algún pedido    (todos     (cliente
219:             cancelado)      servidos)   pide cuenta)
220: ```
221: 
222: **Transiciones permitidas**:
223: - ABIERTA → EN_PREPARACION: Al primer pedido en preparación
224: - ABIERTA → CANCELADA: Si no hay pedidos servidos
225: - EN_PREPARACION → SERVIDA: Todos los pedidos servidos
226: - SERVIDA → CUENTA: Cliente solicita cuenta
227: - CUENTA → COBRADA: Pago procesado
228: - CUENTA → ABIERTA: Cliente agrega más pedidos
229: 
230: ### 7.2 Estados de Pedido
231: 
232: ```
233: PENDIENTE → EN_PREPARACION → LISTO → SERVIDO
234:     ↓              ↓            ↓
235: CANCELADO     (cocina      (camarero
236:                inicia)      sirve)
237: ```
238: 
239: ### 7.3 Estados de Mesa Operativa
240: 
241: ```
242: LIBRE → OCUPADA → PIDIENDO → SERVIDA → CUENTA → COBRADA → LIBRE
243:  ↑       ↓          ↓           ↓         ↓         ↓
244:  └───────┴──────────┴───────────┴─────────┴─────────┘ (eventos externos)
245: ```
246: 
247: ---
248: 
249: ## 8. Reglas de Negocio (RN)
250: 
251: ### Comandas
252: - **RN1**: Solo una comanda ABIERTA por mesa
253: - **RN2**: Comanda en estado COBRADA es inmutable (solo lectura)
254: - **RN3**: Cancelación solo permitida si no hay pedidos SERVIDOS
255: - **RN4**: Auto-cierre después de X horas de inactividad
256: 
257: ### Pedidos
258: - **RN5**: Precio unitario se congela al momento del pedido (no cambia si carta se actualiza)
259: - **RN6**: Cancelación de pedido solo antes de estado SERVIDO
260: - **RN7**: Tiempo máximo de preparación configurable por plato (futuro)
261: 
262: ### Mesas
263: - **RN8**: Transiciones de estado validadas según comanda activa
264: - **RN9**: Eventos de reservas actualizan estado automáticamente
265: 
266: ### Cuentas
267: - **RN10**: Total = Σ(pedidos no cancelados × precio unitario)
268: - **RN11**: Descuentos aplicables solo en estado CUENTA
269: - **RN12**: Split de cuenta permitido (futuro)
270: 
271: ---
272: 
273: ## 9. Contrato REST API
274: 
275: ### 9.1 Headers Requeridos
276: ```
277: Authorization: Bearer <JWT>
278: Content-Type: application/json
279: ```
280: 
281: ### 9.2 Endpoints - Comandas
282: 
283: | Método | Endpoint | Descripción | Roles |
284: |--------|----------|-------------|-------|
285: | POST | `/comandas` | Abrir nueva comanda | WAITER, MANAGER, OWNER |
286: | GET | `/comandas` | Listar comandas activas | WAITER, MANAGER, OWNER |
287: | GET | `/comandas/{id}` | Detalle de comanda | WAITER, MANAGER, OWNER |
288: | PATCH | `/comandas/{id}/estado` | Cambiar estado | WAITER, MANAGER, OWNER |
289: | POST | `/comandas/{id}/cerrar` | Cerrar comanda (CUENTA) | WAITER, MANAGER, OWNER |
290: | POST | `/comandas/{id}/cobrar` | Procesar cobro | WAITER, MANAGER, OWNER |
291: | DELETE | `/comandas/{id}` | Cancelar comanda | MANAGER, OWNER |
292: 
293: **POST /comandas**
294: ```json
295: {
296:   "mesaId": "uuid-mesa",
297:   "camareroId": "uuid-camarero",
298:   "numeroComensales": 4,
299:   "notas": "Mesa junto a ventana"
300: }
301: ```
302: 
303: **Response 201**
304: ```json
305: {
306:   "id": "uuid-comanda",
307:   "codigo": "CMD-9F3A",
308:   "mesaId": "uuid-mesa",
309:   "camareroId": "uuid-camarero",
310:   "estado": "ABIERTA",
311:   "numeroComensales": 4,
312:   "notas": "Mesa junto a ventana",
313:   "total": 0.00,
314:   "fechaApertura": "2026-03-07T13:00:00Z"
315: }
316: ```
317: 
318: ### 9.3 Endpoints - Pedidos
319: 
320: | Método | Endpoint | Descripción | Roles |
321: |--------|----------|-------------|-------|
322: | POST | `/comandas/{comandaId}/pedidos` | Agregar pedido | WAITER, MANAGER, OWNER |
323: | GET | `/comandas/{comandaId}/pedidos` | Listar pedidos | WAITER, MANAGER, OWNER |
324: | PATCH | `/pedidos/{id}/estado` | Actualizar estado | WAITER, MANAGER, OWNER |
325: | DELETE | `/pedidos/{id}` | Cancelar pedido | WAITER, MANAGER, OWNER |
326: 
327: **POST /comandas/{comandaId}/pedidos**
328: ```json
329: {
330:   "platoId": "uuid-plato",
331:   "cantidad": 2,
332:   "notas": "Sin cebolla, uno sin gluten"
333: }
334: ```
335: 
336: **Response 201**
337: ```json
338: {
339:   "id": "uuid-pedido",
340:   "comandaId": "uuid-comanda",
341:   "platoId": "uuid-plato",
342:   "nombrePlato": "Ensalada Mixta",
343:   "cantidad": 2,
344:   "precioUnitario": 12.50,
345:   "estado": "PENDIENTE",
346:   "notas": "Sin cebolla, uno sin gluten",
347:   "horaPedido": "2026-03-07T13:05:00Z"
348: }
349: ```
350: 
351: ### 9.4 Endpoints - Mesas Operativas
352: 
353: | Método | Endpoint | Descripción | Roles |
354: |--------|----------|-------------|-------|
355: | GET | `/mesas` | Listar mesas con estado | WAITER, MANAGER, OWNER |
356: | GET | `/mesas/{id}` | Detalle mesa + comanda activa | WAITER, MANAGER, OWNER |
357: | PATCH | `/mesas/{id}/estado` | Cambiar estado manual | MANAGER, OWNER |
358: | POST | `/mesas/{id}/asignar-camarero` | Asignar camarero | MANAGER, OWNER |
359: 
360: **GET /mesas**
361: ```json
362: [
363:   {
364:     "id": "uuid-mesa",
365:     "numero": 12,
366:     "salaId": "uuid-sala",
367:     "estadoOperativo": "OCUPADA",
368:     "comandaActivaId": "uuid-comanda",
369:     "camareroAsignadoId": "uuid-camarero",
370:     "nombreCamarero": "Jorge García"
371:   }
372: ]
373: ```
374: 
375: ### 9.5 Endpoints - Cuenta
376: 
377: | Método | Endpoint | Descripción | Roles |
378: |--------|----------|-------------|-------|
379: | GET | `/comandas/{id}/cuenta` | Ver cuenta detallada | WAITER, MANAGER, OWNER |
380: | POST | `/comandas/{id}/descuento` | Aplicar descuento | MANAGER, OWNER |
381: 
382: **GET /comandas/{id}/cuenta**
383: ```json
384: {
385:   "comandaId": "uuid-comanda",
386:   "codigo": "CMD-9F3A",
387:   "mesaNumero": 12,
388:   "items": [
389:     {
390:       "pedidoId": "uuid-pedido",
391:       "nombrePlato": "Ensalada Mixta",
392:       "cantidad": 2,
393:       "precioUnitario": 12.50,
394:       "subtotal": 25.00
395:     }
396:   ],
397:   "subtotal": 25.00,
398:   "descuentoPorcentaje": 10.00,
399:   "descuentoMonto": 2.50,
400:   "total": 22.50,
401:   "fechaApertura": "2026-03-07T13:00:00Z",
402:   "tiempoTranscurridoMinutos": 45
403: }
404: ```
405: 
406: ---
407: 
408: ## 10. Contrato Eventos Redis
409: 
410: ### 10.1 Eventos Entrantes (Stream: `reservas.events`)
411: 
412: Consumidos por: `ReservasEventConsumer`
413: 
414: #### `reserva.created`
415: ```json
416: {
417:   "eventId": "uuid",
418:   "type": "reserva.created",
419:   "timestamp": "2026-03-07T13:00:00Z",
420:   "data": {
421:     "reservaId": "uuid",
422:     "mesaId": "uuid",
423:     "codigo": "RSV-9F3A",
424:     "estado": "CONFIRMADA",
425:     "fecha": "2026-03-07",
426:     "franjaId": "uuid",
427:     "comensales": 4,
428:     "nombreCliente": "Laura",
429:     "telefono": "+34 600000000"
430:   }
431: }
432: ```
433: **Acción**: Pre-bloquear mesa, preparar vista para llegada del cliente
434: 
435: #### `reserva.updated`
436: ```json
437: {
438:   "eventId": "uuid",
439:   "type": "reserva.updated",
440:   "timestamp": "2026-03-07T13:00:00Z",
441:   "data": {
442:     "reservaId": "uuid",
443:     "mesaId": "uuid",
444:     "estadoAnterior": "CONFIRMADA",
445:     "estadoNuevo": "CANCELADA"
446:   }
447: }
448: ```
449: **Acción**: Actualizar estado de mesa operativa
450: 
451: #### `reserva.cancelled`
452: ```json
453: {
454:   "eventId": "uuid",
455:   "type": "reserva.cancelled",
456:   "timestamp": "2026-03-07T13:00:00Z",
457:   "data": {
458:     "reservaId": "uuid",
459:     "mesaId": "uuid",
460:     "codigo": "RSV-9F3A",
461:     "motivo": "CLIENTE"
462:   }
463: }
464: ```
465: **Acción**: Liberar mesa si no hay comanda activa
466: 
467: #### `mesa.blocked`
468: ```json
469: {
470:   "eventId": "uuid",
471:   "type": "mesa.blocked",
472:   "timestamp": "2026-03-07T13:00:00Z",
473:   "data": {
474:     "mesaId": "uuid",
475:     "tipo": "TOTAL",
476:     "motivo": "Mantenimiento",
477:     "fechaDesde": "2026-03-07",
478:     "fechaHasta": "2026-03-07"
479:   }
480: }
481: ```
482: **Acción**: Marcar mesa como no disponible para nuevas comandas
483: 
484: ### 10.2 Eventos Salientes (Stream: `sala.events`)
485: 
486: Producidos por: `SalaEventProducer`
487: 
488: #### `sala.comanda.abierta`
489: ```json
490: {
491:   "eventId": "uuid",
492:   "type": "sala.comanda.abierta",
493:   "timestamp": "2026-03-07T13:00:00Z",
494:   "data": {
495:     "comandaId": "uuid",
496:     "mesaId": "uuid",
497:     "codigo": "CMD-9F3A",
498:     "camareroId": "uuid",
499:     "numeroComensales": 4,
500:     "horaApertura": "2026-03-07T13:00:00Z"
501:   }
502: }
503: ```
504: 
505: #### `sala.pedido.creado`
506: ```json
507: {
508:   "eventId": "uuid",
509:   "type": "sala.pedido.creado",
510:   "timestamp": "2026-03-07T13:05:00Z",
511:   "data": {
512:     "pedidoId": "uuid",
513:     "comandaId": "uuid",
514:     "mesaId": "uuid",
515:     "platoId": "uuid",
516:     "cantidad": 2,
517:     "horaPedido": "2026-03-07T13:05:00Z"
518:   }
519: }
520: ```
521: 
522: #### `sala.pedido.estado-cambiado`
523: ```json
524: {
525:   "eventId": "uuid",
526:   "type": "sala.pedido.estado-cambiado",
527:   "timestamp": "2026-03-07T13:15:00Z",
528:   "data": {
529:     "pedidoId": "uuid",
530:     "comandaId": "uuid",
531:     "estadoAnterior": "EN_PREPARACION",
532:     "estadoNuevo": "LISTO",
533:     "horaCambio": "2026-03-07T13:15:00Z"
534:   }
535: }
536: ```
537: 
538: #### `sala.mesa.estado-cambiado`
539: ```json
540: {
541:   "eventId": "uuid",
542:   "type": "sala.mesa.estado-cambiado",
543:   "timestamp": "2026-03-07T13:00:00Z",
544:   "data": {
545:     "mesaId": "uuid",
546:     "estadoAnterior": "LIBRE",
547:     "estadoNuevo": "OCUPADA",
548:     "comandaId": "uuid"
549:   }
550: }
551: ```
552: 
553: #### `sala.cuenta.cerrada`
554: ```json
555: {
556:   "eventId": "uuid",
557:   "type": "sala.cuenta.cerrada",
558:   "timestamp": "2026-03-07T14:30:00Z",
559:   "data": {
560:     "comandaId": "uuid",
561:     "mesaId": "uuid",
562:     "codigo": "CMD-9F3A",
563:     "total": 45.50,
564:     "descuento": 0.00,
565:     "horaApertura": "2026-03-07T13:00:00Z",
566:     "horaCierre": "2026-03-07T14:30:00Z",
567:     "duracionMinutos": 90
568:   }
569: }
570: ```
571: 
572: ---
573: 
574: ## 11. Seguridad y Autorización
575: 
576: ### 11.1 JWT Claims
577: ```json
578: {
579:   "sub": "uuid-usuario",
580:   "iss": "personnel-service",
581:   "aud": "sala-service",
582:   "iat": 1708711200,
583:   "exp": 1708797600,
584:   "name": "Jorge García",
585:   "role": "WAITER"
586: }
587: ```
588: 
589: ### 11.2 Matriz de Permisos
590: 
591: | Acción | OWNER | MANAGER | WAITER |
592: |--------|-------|---------|--------|
593: | CRUD Comandas | ✅ | ✅ | ✅ |
594: | Cancelar Comanda | ✅ | ✅ | ❌ |
595: | Cambiar estado mesa | ✅ | ✅ | ❌ |
596: | Aplicar descuentos | ✅ | ✅ | ❌ |
597: | Asignar camareros | ✅ | ✅ | ❌ |
598: | Ver todas las mesas | ✅ | ✅ | ✅ |
599: | Cobrar cuenta | ✅ | ✅ | ✅ |
600: 
601: ---
602: 
603: ## 12. Dependencias Maven (pom.xml)
604: 
605: ```xml
606: <?xml version="1.0" encoding="UTF-8"?>
607: <project xmlns="http://maven.apache.org/POM/4.0.0">
608:     <modelVersion>4.0.0</modelVersion>
609:     
610:     <parent>
611:         <groupId>org.springframework.boot</groupId>
612:         <artifactId>spring-boot-starter-parent</artifactId>
613:         <version>3.5.11</version>
614:     </parent>
615:     
616:     <groupId>com.suances</groupId>
617:     <artifactId>sala-service</artifactId>
618:     <version>1.0.0-SNAPSHOT</version>
619:     
620:     <properties>
621:         <java.version>21</java.version>
622:         <jjwt.version>0.12.3</jjwt.version>
623:         <springdoc.version>2.6.0</springdoc.version>
624:     </properties>
625:     
626:     <dependencies>
627:         <!-- Spring Boot Starters -->
628:         <dependency>
629:             <groupId>org.springframework.boot</groupId>
630:             <artifactId>spring-boot-starter-web</artifactId>
631:         </dependency>
632:         <dependency>
633:             <groupId>org.springframework.boot</groupId>
634:             <artifactId>spring-boot-starter-data-jpa</artifactId>
635:         </dependency>
636:         <dependency>
637:             <groupId>org.springframework.boot</groupId>
638:             <artifactId>spring-boot-starter-validation</artifactId>
639:         </dependency>
640:         <dependency>
641:             <groupId>org.springframework.boot</groupId>
642:             <artifactId>spring-boot-starter-security</artifactId>
643:         </dependency>
644:         <dependency>
645:             <groupId>org.springframework.boot</groupId>
646:             <artifactId>spring-boot-starter-data-redis</artifactId>
647:         </dependency>
648:         <dependency>
649:             <groupId>org.springframework.boot</groupId>
650:             <artifactId>spring-boot-starter-actuator</artifactId>
651:         </dependency>
652:         
653:         <!-- JWT -->
654:         <dependency>
655:             <groupId>io.jsonwebtoken</groupId>
656:             <artifactId>jjwt-api</artifactId>
657:             <version>${jjwt.version}</version>
658:         </dependency>
659:         <dependency>
660:             <groupId>io.jsonwebtoken</groupId>
661:             <artifactId>jjwt-impl</artifactId>
662:             <version>${jjwt.version}</version>
663:             <scope>runtime</scope>
664:         </dependency>
665:         <dependency>
666:             <groupId>io.jsonwebtoken</groupId>
667:             <artifactId>jjwt-jackson</artifactId>
668:             <version>${jjwt.version}</version>
669:             <scope>runtime</scope>
670:         </dependency>
671:         
672:         <!-- PostgreSQL -->
673:         <dependency>
674:             <groupId>org.postgresql</groupId>
675:             <artifactId>postgresql</artifactId>
676:             <scope>runtime</scope>
677:         </dependency>
678:         
679:         <!-- Utilidades -->
680:         <dependency>
681:             <groupId>org.projectlombok</groupId>
682:             <artifactId>lombok</artifactId>
683:             <optional>true</optional>
684:         </dependency>
685:         
686:         <!-- Testing -->
687:         <dependency>
688:             <groupId>org.springframework.boot</groupId>
689:             <artifactId>spring-boot-starter-test</artifactId>
690:             <scope>test</scope>
691:         </dependency>
692:         <dependency>
693:             <groupId>org.springframework.security</groupId>
694:             <artifactId>spring-security-test</artifactId>
695:             <scope>test</scope>
696:         </dependency>
697:     </dependencies>
698:     
699:     <build>
700:         <plugins>
701:             <plugin>
702:                 <groupId>org.springframework.boot</groupId>
703:                 <artifactId>spring-boot-maven-plugin</artifactId>
704:             </plugin>
705:         </plugins>
706:     </build>
707: </project>
708: ```
709: 
710: ---
711: 
712: ## 13. Códigos de Error
713: 
714: | Código | Significado | Uso |
715: |--------|-------------|-----|
716: | 400 | Bad Request | Validación de campos |
717: | 401 | Unauthorized | JWT inválido o ausente |
718: | 403 | Forbidden | Rol sin permisos |
719: | 404 | Not Found | Recurso no existe |
720: | 409 | Conflict | Mesa ya ocupada, comanda ya existe |
721: | 422 | Unprocessable | Regla de negocio violada |
722: 
723: **Formato Error**:
724: ```json
725: {
726:   "error": "MESA_OCUPADA",
727:   "message": "La mesa 12 ya tiene una comanda activa",
728:   "timestamp": "2026-03-07T13:00:00Z",
729:   "details": []
730: }
731: ```
732: 
733: ---
734: 
735: ## 14. Métricas y Observabilidad
736: 
737: ### Métricas Clave
738: - `comandas_abiertas_total`: Gauge de comandas activas
739: - `comandas_cobradas_total`: Counter por día
740: - `tiempo_promedio_comanda_minutes`: Histograma
741: - `pedidos_por_estado`: Gauge por estado
742: - `eventos_procesados_total`: Counter
743: - `eventos_lag_ms`: Tiempo entre emisión y procesamiento
744: 
745: ### Logs Estructurados
746: ```json
747: {
748:   "timestamp": "2026-03-07T13:00:00Z",
749:   "level": "INFO",
750:   "service": "sala-service",
751:   "traceId": "uuid",
752:   "message": "Comanda abierta",
753:   "comandaId": "uuid",
754:   "mesaId": "uuid",
755:   "camareroId": "uuid"
756: }
757: ```
758: 
759: ---
760: 
761: ## 15. Roadmap
762: 
763: ### Fase 1 - MVP (Actual)
764: - Comandas básicas (CRUD)
765: - Pedidos simples
766: - Estados de mesa
767: - Eventos básicos
768: 
769: ### Fase 2 - Mejoras
770: - Split de cuenta
771: - Pagos parciales
772: - Historial de comandas
773: - Reportes de camareros
774: 
775: ### Fase 3 - Avanzado
776: - Integración con TPV
777: - Módulo de cocina (pantallas)
778: - Notificaciones push
779: - Analytics de ventas
780: 
781: ---
782: 
783: **Versión**: 1.0.0  
784: **Última actualización**: 2026-03-07  
785: **Autor**: Equipo Suances

(End of file - total 785 lines)
</content>
```

---

## Assistant (Plan · kimi-k2.5 · 11.2s)

_Thinking:_

Perfecto, ahora tengo una visión completa del microservicio de sala. Déjame revisar cómo está estructurado el frontend en suances-app para entender mejor cómo integrar estas funcionalidades.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\suances-app\\src\\screens\\staff\\CartaPublicaScreen.tsx"
}
```

**Output:**
```
<path>C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\screens\staff\CartaPublicaScreen.tsx</path>
<type>file</type>
<content>1: import React, { useEffect, useState } from 'react';
2: import {
3:   View,
4:   Text,
5:   StyleSheet,
6:   FlatList,
7:   RefreshControl,
8: } from 'react-native';
9: import { SafeAreaView } from 'react-native-safe-area-context';
10: import { PlatoCard, Loading, EmptyState } from '../../components/common';
11: import { colors, spacing, typography } from '../../theme';
12: import { cartaService } from '../../services/cartaService';
13: import { PlatoResponse } from '../../types/plato';
14: import { TipoCartaResponse } from '../../types/carta';
15: 
16: interface CartaPublicaScreenProps {
17:   navigation?: any;
18: }
19: 
20: export const CartaPublicaScreen: React.FC<CartaPublicaScreenProps> = ({
21:   navigation,
22: }) => {
23:   const [tiposCarta, setTiposCarta] = useState<TipoCartaResponse[]>([]);
24:   const [selectedTipo, setSelectedTipo] = useState<string | null>(null);
25:   const [platos, setPlatos] = useState<PlatoResponse[]>([]);
26:   const [loading, setLoading] = useState(true);
27:   const [refreshing, setRefreshing] = useState(false);
28: 
29:   const loadData = async () => {
30:     try {
31:       const tipos = await cartaService.getTiposCarta();
32:       setTiposCarta(tipos.filter((t) => t.activo));
33:       
34:       if (tipos.length > 0) {
35:         const primerTipo = tipos.find((t) => t.activo) || tipos[0];
36:         setSelectedTipo(primerTipo.id);
37:       }
38:     } catch (error) {
39:       console.error('Error loading carta:', error);
40:     } finally {
41:       setLoading(false);
42:       setRefreshing(false);
43:     }
44:   };
45: 
46:   const loadPlatos = async (tipoId: string) => {
47:     try {
48:       const data = await cartaService.getPlatos(true);
49:       const filtered = data.filter((p) => 
50:         (p.tiposCarta || []).some((tc) => tc.id === tipoId)
51:       );
52:       setPlatos(filtered);
53:     } catch (error) {
54:       console.error('Error loading platos:', error);
55:     }
56:   };
57: 
58:   useEffect(() => {
59:     loadData();
60:   }, []);
61: 
62:   useEffect(() => {
63:     if (selectedTipo) {
64:       loadPlatos(selectedTipo);
65:     }
66:   }, [selectedTipo]);
67: 
68:   const renderItem = ({ item }: { item: PlatoResponse }) => (
69:     <PlatoCard plato={item} showDetails={false} />
70:   );
71: 
72:   if (loading) {
73:     return <Loading fullScreen message="Cargando carta..." />;
74:   }
75: 
76:   return (
77:     <SafeAreaView style={styles.container} edges={[]}>
78:       <Text style={styles.title}>Nuestra Carta</Text>
79:       
80:       {tiposCarta.length > 0 && (
81:         <View style={styles.tabs}>
82:           {tiposCarta.map((tipo) => (
83:             <View
84:               key={tipo.id}
85:               style={[
86:                 styles.tab,
87:                 selectedTipo === tipo.id && styles.tabActive,
88:               ]}
89:             >
90:               <Text
91:                 style={[
92:                   styles.tabText,
93:                   selectedTipo === tipo.id && styles.tabTextActive,
94:                 ]}
95:                 onPress={() => setSelectedTipo(tipo.id)}
96:               >
97:                 {tipo.nombre}
98:               </Text>
99:             </View>
100:           ))}
101:         </View>
102:       )}
103: 
104:       <FlatList
105:         data={platos}
106:         keyExtractor={(item) => item.id}
107:         renderItem={renderItem}
108:         contentContainerStyle={platos.length === 0 ? styles.emptyContainer : styles.list}
109:         refreshControl={
110:           <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
111:         }
112:         ListEmptyComponent={
113:           <EmptyState
114:             title="No hay platos disponibles"
115:             message="En estos momentos no hay platos en esta categoría"
116:           />
117:         }
118:       />
119:     </SafeAreaView>
120:   );
121: };
122: 
123: const styles = StyleSheet.create({
124:   container: {
125:     flex: 1,
126:     backgroundColor: colors.background,
127:   },
128:   title: {
129:     ...typography.h1,
130:     color: colors.text,
131:     padding: spacing.md,
132:     paddingBottom: spacing.sm,
133:   },
134:   tabs: {
135:     flexDirection: 'row',
136:     paddingHorizontal: spacing.md,
137:     gap: spacing.sm,
138:     marginBottom: spacing.md,
139:   },
140:   tab: {
141:     paddingVertical: spacing.sm,
142:     paddingHorizontal: spacing.md,
143:     borderRadius: 20,
144:     backgroundColor: colors.surface,
145:   },
146:   tabActive: {
147:     backgroundColor: colors.primary,
148:   },
149:   tabText: {
150:     ...typography.bodySmall,
151:     color: colors.textSecondary,
152:     fontWeight: '500',
153:   },
154:   tabTextActive: {
155:     color: colors.surface,
156:   },
157:   list: {
158:     padding: spacing.md,
159:   },
160:   emptyContainer: {
161:     flex: 1,
162:   },
163: });

(End of file - total 163 lines)
</content>
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/*",
  "path": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\suances-app\\src"
}
```

**Output:**
```
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\services\api.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\config.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\carta\IngredientesKpiCard.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\reservas\QuickActionsBar.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\reservas\DateSelector.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\reservas\AgendaFiltersBar.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\store\reservasStore.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\reservas\MetricsSummary.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ai\AIChatModal.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\admin\AdminOverlay.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\screens\owner\InventarioScreen.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\admin\StaffView.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\admin\index.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\navigation\OwnerNavigator.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\admin\AdminNotificationBar.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\store\adminModeStore.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\screens\owner\EscandalloScreen.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\screens\owner\PlatoDetailScreen.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ai\guides\PersonalGuide.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\types\reservas.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ai\guides\InventarioGuide.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ai\guides\CartaGuide.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ai\index.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ai\guides\ReservasGuide.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ai\shared\AIIndexItem.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\navigation\withScreenAnimation.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ai\AIGuideContainer.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\navigation\index.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\navigation\ScreenTransitionWrapper.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\navigation\LiquidTransition.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ai\shared\AITipBox.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\common\ConverterButton.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\screens\owner\IngredienteFormScreen.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ai\shared\AISectionTitle.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ai\shared\AIDivider.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ai\shared\AIQuickAction.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ai\shared\AIDataStat.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ai\shared\AIFlowCard.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ai\shared\AIFlowStep.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ai\shared\AIGuideHeader.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\store\aiStore.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\common\index.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\common\UnitConverter.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\screens\owner\CartaManagerScreen.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\screens\owner\TipoCartaFormScreen.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\services\unitConverter.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\carta\DistribuidoresKpiCard.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\carta\PlatosKpiCard.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\carta\TipoCartaKpiCard.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\carta\index.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\hooks\usePlatosMasPedidos.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\reservas\ComensalesSelector.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\reservas\FranjaCard.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\reservas\FranjaEditor.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\common\Button.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\reservas\index.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\services\reservasService.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\reservas\SalaCard.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\reservas\WaitlistEntryCard.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\screens\owner\DashboardScreen.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\screens\auth\LoginScreen.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\navigation\StaffNavigator.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\screens\owner\DistribuidoresScreen.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\screens\owner\TiposCartaListScreen.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\screens\owner\PersonalListScreen.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\carta\PlatoCard.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\reservas\SalaEditor.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\reservas\LayoutEditor.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\reservas\LayoutCanvas.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\reservas\ReservationCard.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\hooks\useCartaEvents.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\types\ingrediente.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\CartaEventsProvider.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\store\platoStore.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\store\ingredienteStore.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\hooks\useReservaEvents.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ReservaEventsProvider.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\common\Card.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\services\cartaService.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\store\authStore.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\types\auth.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\reservas\ReservationStatusPill.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\types\plato.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\screens\owner\IngredienteListScreen.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\store\categoriaStore.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\carta\IngredienteItem.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\store\personalStore.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\services\personalService.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\types\personal.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\screens\owner\TipoCartaDetailScreen.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\store\distribuidorStore.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\store\tipoCartaStore.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\carta\EscandalloResumen.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\services\authService.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\types\carta.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\navigation\AuthNavigator.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\common\EmptyState.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\common\Loading.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\common\Input.tsx
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\types\index.ts

(Results are truncated: showing first 100 results. Consider using a more specific path or pattern.)
```

---

## Assistant (Plan · kimi-k2.5 · 7.8s)

_Thinking:_

Ahora necesito ver más sobre la estructura del frontend para entender cómo está organizado. Déjame revisar los archivos de navegación y estructura.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\suances-app\\src\\navigation\\StaffNavigator.tsx"
}
```

**Output:**
```
<path>C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\navigation\StaffNavigator.tsx</path>
<type>file</type>
<content>1: import React from 'react';
2: import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
3: import { Ionicons } from '@expo/vector-icons';
4: 
5: import { CartaPublicaScreen } from '../screens/staff/CartaPublicaScreen';
6: import { PerfilScreen } from '../screens/staff/PerfilScreen';
7: 
8: import { colors } from '../theme';
9: 
10: const Tab = createBottomTabNavigator();
11: 
12: export const StaffNavigator = () => {
13:   return (
14:     <Tab.Navigator
15:       screenOptions={({ route }) => ({
16:         tabBarIcon: ({ focused, color, size }) => {
17:           let iconName: keyof typeof Ionicons.glyphMap = 'home';
18:           if (route.name === 'Carta') {
19:             iconName = focused ? 'restaurant' : 'restaurant-outline';
20:           } else if (route.name === 'Perfil') {
21:             iconName = focused ? 'person' : 'person-outline';
22:           }
23:           
24:           return <Ionicons name={iconName} size={size} color={color} />;
25:         },
26:         tabBarActiveTintColor: colors.accent,
27:         tabBarInactiveTintColor: colors.textSecondary,
28:         tabBarStyle: { backgroundColor: colors.surface },
29:         headerStyle: { backgroundColor: colors.primary },
30:         headerTintColor: colors.surface,
31:         headerTitleStyle: { fontWeight: '600' as const },
32:       })}
33:     >
34:       <Tab.Screen 
35:         name="Carta" 
36:         component={CartaPublicaScreen}
37:         options={{ title: 'Carta' }}
38:       />
39:       <Tab.Screen 
40:         name="Perfil" 
41:         component={PerfilScreen}
42:         options={{ title: 'Perfil' }}
43:       />
44:     </Tab.Navigator>
45:   );
46: };

(End of file - total 46 lines)
</content>
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/types/**/*.ts",
  "path": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\suances-app\\src"
}
```

**Output:**
```
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\types\reservas.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\types\ingrediente.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\types\auth.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\types\plato.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\types\personal.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\types\carta.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\types\index.ts
```

**Tool: bash**

**Input:**
```json
{
  "command": "find \"C:\\Users\\Jlemonn1\\Desktop\\Suances\\suances-app\\src\\services\" -name \"*.ts\" -type f",
  "description": "List service files"
}
```

**Output:**
```
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\services/api.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\services/authService.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\services/cartaService.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\services/personalService.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\services/reservasService.ts
C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\services/unitConverter.ts

```

---

## Assistant (Plan · kimi-k2.5 · 6.1s)

_Thinking:_

Ahora tengo una buena visión del proyecto. Déjame ver la estructura de services y API para entender cómo se conectan con el backend.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\suances-app\\src\\services\\api.ts"
}
```

**Output:**
```
<path>C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\services\api.ts</path>
<type>file</type>
<content>1: import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
2: import { API_CONFIG } from '../config';
3: import { useAuthStore } from '../store/authStore';
4: 
5: const JSON_HEADERS = { 'Content-Type': 'application/json' };
6: 
7: const createApiClient = (baseURL: string): AxiosInstance =>
8:   axios.create({
9:     baseURL,
10:     timeout: API_CONFIG.TIMEOUT,
11:     headers: JSON_HEADERS,
12:   });
13: 
14: export const personalApi = createApiClient(API_CONFIG.PERSONAL_BASE_URL);
15: export const cartaApi = createApiClient(API_CONFIG.CARTA_BASE_URL);
16: export const reservasApi = createApiClient(API_CONFIG.RESERVAS_BASE_URL);
17: 
18: const apiClients: AxiosInstance[] = [personalApi, cartaApi, reservasApi];
19: 
20: let authToken: string | null = null;
21: 
22: export const setAuthToken = (token: string | null) => {
23:   authToken = token;
24:   apiClients.forEach((client) => {
25:     if (token) {
26:       client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
27:     } else {
28:       delete client.defaults.headers.common['Authorization'];
29:     }
30:   });
31: };
32: 
33: const attachRequestInterceptor = (client: AxiosInstance) => {
34:   client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
35:     if (authToken && config.headers) {
36:       config.headers['Authorization'] = `Bearer ${authToken}`;
37:     }
38:     return config;
39:   });
40: };
41: 
42: const attachResponseInterceptor = (client: AxiosInstance) => {
43:   client.interceptors.response.use(
44:     (response) => response,
45:     async (error: AxiosError) => {
46:       if (error.response?.status === 401) {
47:         console.warn('Sesión expirada o token inválido. Redirigiendo al login...');
48:         await useAuthStore.getState().logout();
49:       }
50:       return Promise.reject(error);
51:     }
52:   );
53: };
54: 
55: apiClients.forEach((client) => {
56:   attachRequestInterceptor(client);
57:   attachResponseInterceptor(client);
58: });

(End of file - total 58 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\suances-app\\src\\config.ts"
}
```

**Output:**
```
<path>C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\config.ts</path>
<type>file</type>
<content>1: import { Platform } from 'react-native';
2: 
3: type ServiceKey = 'PERSONAL' | 'CARTA' | 'RESERVAS';
4: 
5: const SERVICE_CONTEXT: Record<ServiceKey, string> = {
6:   PERSONAL: '/api/personal',
7:   CARTA: '/api/carta',
8:   RESERVAS: '/api/reservas',
9: };
10: 
11: const SERVICE_PORT: Record<ServiceKey, number> = {
12:   PERSONAL: 8085,
13:   CARTA: 8081,
14:   RESERVAS: 8087,
15: };
16: 
17: const readEnvVar = (key: string): string | undefined => {
18:   const env = globalThis?.process?.env;
19:   if (!env) {
20:     return undefined;
21:   }
22:   const expoScoped = env[`EXPO_PUBLIC_${key}`];
23:   if (expoScoped) {
24:     return expoScoped;
25:   }
26:   return env[key];
27: };
28: 
29: const DEFAULT_DEVICE_IP = readEnvVar('DEV_DEVICE_IP') ?? '172.20.10.7';
30: 
31: const isMobileRuntime = Platform.OS === 'ios' || Platform.OS === 'android';
32: 
33: const sanitizeUrl = (value: string): string => value.replace(/\/+$/, '');
34: 
35: const getLocalHost = (port: number): string => {
36:   if (isMobileRuntime) {
37:     return `http://172.20.10.7:${port}`;
38:   }
39:   return `http://172.20.10.7:${port}`;
40: };
41: 
42: const resolveBaseUrl = (service: ServiceKey): string => {
43:   const envValue = readEnvVar(`${service}_API_URL`);
44:   if (envValue && envValue.trim().length > 0) {
45:     return sanitizeUrl(envValue.trim());
46:   }
47: 
48:   const fallback = `${getLocalHost(SERVICE_PORT[service])}${SERVICE_CONTEXT[service]}`;
49:   return sanitizeUrl(fallback);
50: };
51: 
52: export const API_CONFIG = {
53:   PERSONAL_BASE_URL: resolveBaseUrl('PERSONAL'),
54:   CARTA_BASE_URL: resolveBaseUrl('CARTA'),
55:   RESERVAS_BASE_URL: resolveBaseUrl('RESERVAS'),
56:   TIMEOUT: 10000,
57: };

(End of file - total 57 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\suances-app\\src\\types\\index.ts"
}
```

**Output:**
```
<path>C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\types\index.ts</path>
<type>file</type>
<content>1: export * from './auth';
2: export * from './plato';
3: export * from './ingrediente';
4: export * from './carta';

(End of file - total 4 lines)
</content>
```

---

## Assistant (Plan · kimi-k2.5 · 28.6s)

_Thinking:_

Ahora tengo toda la información que necesito. Déjame estructurar lo que he aprendido:

**Microservicio Sala (backend):**
- Puerto 8083
- Base URL: /api/sala
- JWT Authentication
- Roles: OWNER, MANAGER, WAITER

**Funcionalidades principales:**
1. **Comandas** (ComandaController):
   - POST /comandas - Abrir comanda
   - GET /comandas - Listar comandas
   - GET /comandas/{id} - Detalle comanda
   - PATCH /comandas/{id}/estado - Cambiar estado
   - POST /comandas/{id}/cerrar - Cerrar comanda
   - POST /comandas/{id}/cobrar - Cobrar comanda
   - DELETE /comandas/{id} - Cancelar comanda

2. **Pedidos** (ItemComandaController):
   - POST /comandas/{comandaId}/pedidos - Agregar pedido
   - GET /comandas/{comandaId}/pedidos - Listar pedidos
   - PATCH /pedidos/{id}/estado - Cambiar estado pedido
   - DELETE /pedidos/{id} - Cancelar pedido

3. **Mesas** (MesaOperativaController):
   - GET /mesas - Listar mesas
   - GET /mesas/{id} - Detalle mesa
   - PATCH /mesas/{id}/estado - Cambiar estado
   - POST /mesas/{id}/asignar-camarero - Asignar camarero

4. **Cuenta** (CuentaController):
   - GET /comandas/{id}/cuenta - Ver cuenta
   - POST /comandas/{id}/descuento - Aplicar descuento

5. **Estadísticas** (EstadisticasController):
   - GET /estadisticas/dia - Resumen del día
   
6. **Servicios adicionales** (CocinaController, BarController):
   - GET /cocina/pendientes - Pedidos pendientes
   - GET /bar/pendientes - Pedidos de bar

**Frontend (suances-app):**
- StaffNavigator.tsx maneja la navegación del personal, mostrando solo Carta y Perfil actualmente. Necesito agregar pestañas para Sala/Comandas y Cuentas.
- Hay que crear nuevos servicios y tipos para conectarse al microservicio Sala, siguiendo el patrón de reservasService.ts y cartaService.ts. El archivo api.ts necesita un nuevo cliente axios para Sala, y config.ts requiere la URL base del servicio Sala.
- Las pantallas del staff necesitan expandirse para incluir SalaScreen (vista de mesas y comandas), ComandaDetailScreen (gestión de pedidos), y CuentaScreen (visualización de la cuenta y procesamiento de pagos).

Las preguntas clave son: qué tipo de dispositivos usarán el personal (¿tablets o móviles?), si necesitamos vista para cocina y bar, y si el cobro se realiza en el dispositivo o en caja.

Perfecto, ahora tengo una visión completa. Déjame hacerte algunas preguntas clave para diseñar la mejor integración:

## Preguntas para definir la integración:

### 1. **Dispositivos y UI**
- ¿Qué dispositivos usarán los camareros? ¿Tablets en sala o móviles personales?
- ¿Necesitamos una vista de "plano de sala" tipo grid con las mesas, o una lista simple?
- ¿Los camareros deben ver solo sus mesas asignadas o todas las de la sala?

### 2. **Flujo de trabajo**
- ¿El cobro se procesa en el dispositivo del camarero o van a una caja/TPV central?
- ¿Necesitamos funcionalidades para cocina (pantallas de pedidos pendientes) o solo para sala?
- ¿Se requieren impresiones de tickets (impresora térmica) o solo visualización digital?

### 3. **Permisos por rol**
- ¿Los camareros (WAITER) pueden:
  - Abrir/cerrar comandas de cualquier mesa o solo las asignadas?
  - Aplicar descuentos?
  - Cancelar comandas completas?
  - Cambiar manualmente el estado de mesas?

### 4. **Prioridades de implementación**
- ¿Qué funcionalidad necesitas primero? Sugiero este orden:
  1. Ver estado de mesas + abrir comanda
  2. Agregar/quitar pedidos
  3. Ver cuenta y cobrar
  4. Estadísticas y reportes

### 5. **Sincronización en tiempo real**
- ¿Es crítico que los cambios se vean en tiempo real entre dispositivos? (ej: un camarero abre comanda y otro la ve inmediatamente)
- ¿O es suficiente con pull-to-refresh?

¿Qué opinas sobre estas preguntas?

---

## User

1) usaran moviles, vista optimizado para ello, pero tambien resposividad para tablet. Hay que tener grid, todas las mesas, lo de asignas es opcional

2)van a una caja, se imprime, cuando podamos simular ya añadimos lo de la impresora
3)menor cancelar una comanda
4) sobretodo del 1 a 3
5)si implementa ya redis

---

## Assistant (Plan · kimi-k2.5 · 182.6s)

_Thinking:_

El usuario ha respondido a mis preguntas:

1. Móviles + responsivo para tablet, grid de mesas, todas las mesas (asignación opcional)
2. Van a caja, se imprime (simular primero)
3. Camarero NO puede cancelar comanda
4. Prioridad: 1-2-3 (mesas, comandas, pedidos, cuenta/cobro)
5. Sí, implementar Redis para tiempo real

Ahora debo analizar la estructura del proyecto y crear un plan para implementar estas funcionalidades. Déjame revisar más detalles sobre la estructura actual del frontend.

**Tool: task**

**Input:**
```json
{
  "description": "Explorar estructura suances-app",
  "prompt": "Explora la estructura completa del proyecto suances-app en C:\\Users\\Jlemonn1\\Desktop\\Suances\\suances-app para entender:\n1. Estructura de carpetas (components, screens, services, types, store, navigation)\n2. Cómo están organizadas las screens por rol (owner, staff)\n3. Cómo se manejan los servicios API existentes (auth, carta, reservas, personal)\n4. Patrones de UI usados (colores, componentes comunes)\n5. Cómo se maneja el estado global (stores)\n\nDame un resumen detallado de la arquitectura y patrones utilizados.",
  "subagent_type": "explore"
}
```

**Output:**
```
task_id: ses_333535fa8ffeBhUZn2gnHa9bZc (for resuming to continue this task if needed)

<task_result>
Ahora tengo toda la información necesaria. Aquí te presento un resumen detallado de la arquitectura y patrones utilizados en el proyecto **suances-app**:

---

# Resumen Detallado de la Arquitectura - Suances App

## 1. ESTRUCTURA DE CARPETAS

```
C:\Users\Jlemonn1\Desktop\Suances\suances-app\
├── App.tsx                      # Punto de entrada principal
├── src\
│   ├── components\              # Componentes reutilizables
│   │   ├── admin\               # Componentes de modo admin (AdminOverlay, StaffView)
│   │   ├── ai\                  # Componentes del asistente IA
│   │   ├── carta\               # Componentes específicos de carta/menú
│   │   ├── common\              # Componentes UI base (Button, Card, Input, etc.)
│   │   ├── forms\               # Componentes de formularios
│   │   ├── notifications\       # Sistema de notificaciones/toasts
│   │   └── reservas\            # Componentes específicos de reservas
│   ├── hooks\                   # Custom React hooks
│   ├── navigation\              # Configuración de navegación
│   ├── screens\                 # Pantallas de la app
│   │   ├── auth\                # Login
│   │   ├── owner\               # Pantallas del dueño/admin
│   │   │   └── reservas\        # Subpantallas de reservas
│   │   └── staff\               # Pantallas del personal
│   ├── services\                # Servicios API
│   ├── store\                   # Estado global (Zustand)
│   ├── theme\                   # Colores, tipografía, espaciado
│   └── types\                   # Definiciones TypeScript
```

---

## 2. ORGANIZACIÓN DE SCREENS POR ROL

### Roles Definidos (`src/types/auth.ts`):
- **OWNER**: Dueño completo (acceso total)
- **MANAGER**: Gerente
- **WAITER**: Camarero
- **CUSTOMER**: Cliente

### Estructura de Navegación:

**AuthNavigator** (`src/navigation/AuthNavigator.tsx`):
- Solo contiene `LoginScreen`
- Stack simple sin header

**OwnerNavigator** (`src/navigation/OwnerNavigator.tsx`):
- **5 Tabs principales**:
  1. Dashboard - Estadísticas y métricas
  2. Reservas - Stack de 9 pantallas (Home, Espacios, Editor, Waitlist, etc.)
  3. Carta - Stack de 10+ pantallas (Gestión de platos, ingredientes, escandallos)
  4. Inventario - Control de stock
  5. Personal - Gestión de empleados

**StaffNavigator** (`src/navigation/StaffNavigator.tsx`):
- **2 Tabs simples**:
  1. Carta Pública - Vista de solo lectura del menú
  2. Perfil - Información del usuario

---

## 3. SERVICIOS API

### Arquitectura Multi-Servicio (`src/services/api.ts`):

El proyecto usa **tres APIs diferentes** (arquitectura de microservicios):

```typescript
// Clientes Axios separados por dominio
personalApi  -> API_CONFIG.PERSONAL_BASE_URL  (puerto 8085) - Auth/Personal
cartaApi     -> API_CONFIG.CARTA_BASE_URL     (puerto 8081) - Carta/Platos
reservasApi  -> API_CONFIG.RESERVAS_BASE_URL  (puerto 8087) - Reservas/Salas
```

### Interceptores Configurados:
- **Request**: Añade automáticamente el token JWT
- **Response**: Maneja 401 redirigiendo al login

### Servicios por Dominio:

**authService.ts** (`src/services/authService.ts`):
```typescript
- login(credentials) -> POST /auth/login
- logout()
```

**cartaService.ts** (`src/services/cartaService.ts` - 222 líneas):
```typescript
// Tipos de Carta
- getTiposCarta(), getTipoCarta(id), crearTipoCarta(), actualizarTipoCarta(), eliminarTipoCarta()
- asociarPlatosATipoCarta()
- getCartaActiva()

// Platos
- getPlatos(), getPlato(id), crearPlato(), actualizarPlato(), eliminarPlato()
- agregarImagen(), eliminarImagen()

// Ingredientes
- getIngredientes(), crearIngrediente(), actualizarIngrediente(), eliminarIngrediente()

// Categorías
- getCategorias(), crearCategoria(), etc.

// Distribuidores
- getDistribuidores(), crearDistribuidor(), etc.

// Escandallos
- getEscandallo(), crearOActualizarEscandallo(), eliminarEscandallo()
```

**personalService.ts** (`src/services/personalService.ts`):
```typescript
- getAllPersonnel(), getPersonnelById()
- createPersonnel(), updatePersonnel()
- changeRole(), deactivatePersonnel()
```

**reservasService.ts** (`src/services/reservasService.ts` - 162 líneas):
```typescript
// Salas
- getSalas(), createSala(), updateSala()

// Mesas
- getMesasBySala(), createMesa(), updateMesa()
- crearBloqueo(), eliminarBloqueo()

// Franjas Horarias
- getFranjas(), createFranja(), updateFranja(), deleteFranja()

// Reservas
- getReservas(), getMesasOcupadas()
- createReserva(), updateReserva(), cancelReserva()

// Público/Online
- consultarReservaPorCodigo(), consultarDisponibilidad()

// Waitlist
- getWaitlist(), actualizarWaitlistEstado()
```

---

## 4. PATRONES DE UI

### Sistema de Diseño (`src/theme/index.ts`):

**Colores Principales**:
```typescript
primary: '#1a1a2e'        // Azul oscuro profundo
primaryLight: '#16213e'   // Azul ligeramente más claro
accent: '#e94560'         // Rojo coral (acción principal)
accentLight: '#ff6b6b'    // Rojo más claro
success: '#4caf50'        // Verde éxito
warning: '#ff9800'        // Naranja advertencia
error: '#f44336'          // Rojo error
background: '#f5f5f5'     // Gris claro fondo
surface: '#ffffff'        // Blanco superficies
text: '#212121'           // Negro texto principal
textSecondary: '#757575'  // Gris texto secundario
border: '#e0e0e0'         // Bordes
```

**Espaciado**:
```typescript
xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
```

**Tipografía**:
- h1: 28px bold, h2: 24px semibold, h3: 20px semibold
- body: 16px regular, bodySmall: 14px, caption: 12px

### Componentes Comunes (`src/components/common/`):

| Componente | Props Principales | Descripción |
|------------|-------------------|-------------|
| **Button** | variant, size, loading, disabled | Variantes: primary, secondary, outline, danger. Tamaños: small, medium, large |
| **Card** | children, onPress | Contenedor con sombra y bordes redondeados |
| **Input** | label, error, containerStyle | Campo de texto con validación visual |
| **Loading** | message, fullScreen | Indicador de carga con opción de pantalla completa |
| **EmptyState** | title, message, actionLabel, onAction | Estado vacío con acción opcional |

### Transiciones Animadas:

El proyecto implementa **transiciones tipo "Liquid"** personalizadas (`src/navigation/LiquidTransition.tsx`):
- `liquidSlideTransition`: Slide lateral (600ms)
- `liquidFadeTransition`: Fade desde abajo
- `liquidModalTransition`: Modal desde abajo
- `liquidDropTransition`: Efecto gota (700ms)
- `appleLiquidTransition`: Estilo iOS nativo

Todas las pantallas usan `withScreenAnimation` HOC para animaciones de entrada.

### Asistente IA Integrado:

- Botón flotante animado (pulse, float, rotate) en header
- Modal `AIChatModal` disponible en todas las pantallas del Owner
- Contexto por pantalla (reservas, carta, inventario, personal, dashboard)

---

## 5. ESTADO GLOBAL (STORES)

Usa **Zustand** para manejo de estado (ligero, sin boilerplate).

### Stores Principales:

**authStore.ts** (`src/store/authStore.ts`):
```typescript
- user: User | null
- token: string | null
- isAuthenticated: boolean
- isLoading: boolean
- login(credentials), logout(), loadStoredAuth()
- isOwner(), isStaff()  // Helpers de rol
```
Persistencia con AsyncStorage.

**reservasStore.ts** (`src/store/reservasStore.ts` - 347 líneas):
```typescript
- salas: Sala[]
- mesasBySala: Record<string, Mesa[]>
- mesasOcupadas: MesasOcupadasResponse
- franjas: FranjaHoraria[]
- reservas: Reserva[]
- waitlist: WaitlistEntry[]
- disponibilidad: DisponibilidadResponse[]
- agendaFilters: AgendaFilters
- loading: LoadingState (por entidad)
- error?: string

// Acciones CRUD para cada entidad
- fetchSalas(), saveSala(), fetchMesas(), saveMesa()
- fetchFranjas(), saveFranja(), deleteFranja()
- fetchReservas(), createReserva(), updateReserva(), cancelReserva()
- fetchWaitlist(), updateWaitlistEstado()
- fetchDisponibilidad(), fetchMesasOcupadas()

// Event handlers
- handleReservaCreated(), handleReservaCancelled(), handleReservaUpdated()
- setAgendaFilters(), getMetrics()
```

**platoStore.ts** (`src/store/platoStore.ts`):
```typescript
- platos: PlatoResponse[]
- platosAgotados: PlatoResponse[]
- isLoading: boolean
- fetchPlatos(), addPlato(), updatePlato(), removePlato()
- checkDisponibilidad(), setPlatosAgotadosFromPoll()
- getAgotadosCount()
```

**ingredienteStore.ts** (`src/store/ingredienteStore.ts`):
```typescript
- ingredientes: IngredienteResponse[]
- stockBajoAlertas: IngredienteResponse[]
- stockCriticoAlertas: IngredienteResponse[]
- fetchIngredientes(), add/update/removeIngrediente()
- setAlertasFromPoll(), clearAlertas(), getAlertasCount()
```

**personalStore.ts** (`src/store/personalStore.ts`):
```typescript
- personnel: PersonnelResponse[]
- isLoading: boolean
- fetchPersonnel(), add/update/removePersonnel()
- createPersonnel(), updatePerson(), changePersonnelRole(), deactivatePersonnel()
```

**aiStore.ts** (`src/store/aiStore.ts`):
```typescript
- isModalOpen: boolean
- currentScreen: AIScreen ('reservas' | 'carta' | 'inventario' | 'personal' | 'dashboard')
- openModal(screen), closeModal(), setCurrentScreen()
```

**Otros stores**:
- `tipoCartaStore.ts`, `categoriaStore.ts`, `distribuidorStore.ts`
- `adminModeStore.ts` - Modo admin/supervisor

---

## 6. PATRONES Y ARQUITECTURA

### Flujo de Datos:
```
Screens -> Stores -> Services -> APIs
           |
           v
      AsyncStorage (persistencia auth)
```

### Sistema de Eventos:
- `CartaEventsProvider` - Eventos de carta (plato creado/actualizado)
- `ReservaEventsProvider` - Eventos de reservas (creada/cancelada/actualizada)

### Sistema de Configuración (`src/config.ts`):
- URLs de APIs configurables por variables de entorno
- Fallback a IPs locales para desarrollo
- Diferentes puertos por servicio (8081, 8085, 8087)

### Convenciones de Nomenclatura:
- **Screens**: `NombreScreen.tsx` (ej: `DashboardScreen.tsx`)
- **Stores**: `useNombreStore.ts` (ej: `useAuthStore.ts`)
- **Services**: `nombreService.ts` (ej: `cartaService.ts`)
- **Types**: Entidad en singular (ej: `Plato`, `Ingrediente`, `Reserva`)

### Seguridad:
- JWT Token en headers de todas las peticiones
- Refresh automático de auth desde AsyncStorage al iniciar
- Interceptor 401 para logout automático

---

## Resumen de Dependencias Principales:

| Categoría | Librerías |
|-----------|-----------|
| **Core** | react, react-native, expo |
| **Navegación** | @react-navigation/native, native-stack, bottom-tabs |
| **Estado** | zustand |
| **HTTP** | axios |
| **Storage** | @react-native-async-storage/async-storage |
| **UI/Iconos** | @expo/vector-icons |
| **Utilidades** | expo-sensors, react-native-gesture-handler |

---

Esta arquitectura sigue un patrón **modular y escalable**, con separación clara de responsabilidades, estado global bien organizado por dominio, y una experiencia de usuario fluida con transiciones animadas y feedback visual consistente.
</task_result>
```

---

## Assistant (Plan · kimi-k2.5 · 26.6s)

_Thinking:_

Perfecto, ahora tengo toda la información necesaria para crear un plan de integración. Déjame estructurar todo lo que necesitamos implementar.

Basándome en:
1. La API del microservicio de sala (ya implementado en backend/rest-sala-service)
2. La estructura actual del frontend (suances-app)
3. Las respuestas del usuario sobre requisitos

Voy a crear un plan detallado de implementación.

Perfecto, con toda la información recopilada, te presento el **Plan de Integración del Microservicio de Sala**:

---

## 📋 RESUMEN DEL PLAN

### Servicio: `rest-sala-service` (puerto 8083)
**Base URL**: `http://172.20.10.7:8083/api/sala`

### Funcionalidades Prioritarias (fases 1-3):

#### **FASE 1: Vista de Sala (Grid de Mesas)**
- Grid visual de todas las mesas con estados por colores
- Estados: LIBRE (verde) | OCUPADA/RESERVADA (azul) | PIDIENDO (amarillo) | CUENTA (rojo)
- Sincronización en tiempo real vía Redis/SSE

#### **FASE 2: Gestión de Comandas**
- Abrir comanda en mesa libre
- Agregar/quitar pedidos
- Enviar pedidos a cocina por grupos (entrantes/primeros/segundos)
- Ver detalle de comanda activa

#### **FASE 3: Cuenta y Cobro**
- Ver cuenta detallada con items
- Generar ticket/cuenta
- Registrar cobro (efectivo/tarjeta)
- Imprimir ticket (simulado)

---

## 🗂️ Estructura de Archivos a Crear

```
src/
├── services/
│   ├── api.ts (MODIFICAR - añadir salaApi)
│   └── salaService.ts (NUEVO)
├── types/
│   ├── sala.ts (NUEVO)
│   └── index.ts (MODIFICAR)
├── store/
│   └── salaStore.ts (NUEVO)
├── components/
│   └── sala/
│       ├── MesaCard.tsx
│       ├── MesaGrid.tsx
│       ├── ComandaCard.tsx
│       ├── PedidoItem.tsx
│       └── CuentaResumen.tsx
└── screens/
    └── staff/
        ├── SalaScreen.tsx (NUEVO - Pantalla principal)
        ├── ComandaDetailScreen.tsx (NUEVO)
        ├── PedidoFormScreen.tsx (NUEVO)
        └── CuentaScreen.tsx (NUEVO)
```

---

## ❓ Preguntas Finales antes de implementar:

1. **¿Dónde colocamos la nueva pestaña de "Sala"?** 
   - En `StaffNavigator` (reemplazando o junto a "Carta")
   - O creamos un `SalaNavigator` separado

2. **¿Cómo manejamos el estado de las mesas en tiempo real?**
   - Opción A: Polling cada X segundos (más simple)
   - Opción B: SSE (Server-Sent Events) vía el endpoint `/sse/mesas`
   - Opción C: WebSocket (si está implementado)

3. **¿Los camareros pueden abrir comandas en cualquier mesa o solo las asignadas?** 
   - Según la API, cualquier mesa (WAITER tiene permiso de CRUD comandas)
   - ¿Queremos agregar restricción de asignación?

4. **¿Necesitamos integrar con el servicio de carta para mostrar precios/platos?**
   - Sí, al agregar pedidos necesitamos seleccionar platos de la carta
   - ¿Cómo se organiza la selección? Por categorías, buscador, lista simple?

5. **¿Dónde se procesa el cobro?**
   - En el móvil del camarero (registrar método de pago)
   - O en una pantalla de caja separada (¿existe?)

---

Dame tus respuestas y **empezamos con la implementación** 🚀

---

## User

1) separado, sera la pantalla principal de las pantallas de camarero
2)b, como ya hay en la app con otros micros
3)cualquiera
4)ya hay contextos en la app sobre los platos
5)ambas, la interfaz de caja, ahora lo integramos en la app movil


---

## Assistant (Plan · kimi-k2.5 · 11.1s)

_Thinking:_

El usuario quiere que empiece la implementación. Me ha dado respuestas a todas mis preguntas:

1. Sala será la pantalla principal en StaffNavigator
2. Usaremos SSE (Server-Sent Events) - opción B
3. Cualquier camarero puede abrir comandas en cualquier mesa
4. Ya hay contextos para platos, usaré esos
5. El cobro se procesa en el móvil (interfaz de caja en la app)

Ahora necesito crear un plan detallado de implementación y luego proceder con la implementación. Dado que el modo plan está activo, necesito crear un plan completo primero.

Déjame verificar si hay SSE ya implementado en la app para ver el patrón.

**Tool: grep**

**Input:**
```json
{
  "pattern": "EventSource|sse|Server-Sent",
  "path": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\suances-app\\src"
}
```

**Output:**
```
No files found
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\suances-app\\src\\hooks\\useReservaEvents.ts"
}
```

**Output:**
```
<path>C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\hooks\useReservaEvents.ts</path>
<type>file</type>
<content>1: import { useEffect, useRef, useCallback } from 'react';
2: import { useReservasStore } from '../store/reservasStore';
3: 
4: const POLLING_INTERVAL = 10000; // 10 segundos
5: 
6: interface UseReservaEventsOptions {
7:   enabled?: boolean;
8: }
9: 
10: export const useReservaEvents = (options: UseReservaEventsOptions = {}) => {
11:   const { enabled = true } = options;
12:   const { agendaFilters, fetchReservas } = useReservasStore();
13:   const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
14: 
15:   const poll = useCallback(async () => {
16:     try {
17:       const { fecha } = agendaFilters;
18:       if (!fecha) return;
19: 
20:       await fetchReservas({ fecha });
21:       console.log('[FRONT] Polling reservas para fecha:', fecha);
22:     } catch (error) {
23:       console.error('[FRONT] Polling error:', error);
24:     }
25:   }, [agendaFilters.fecha, fetchReservas]);
26: 
27:   const startPolling = useCallback(() => {
28:     if (pollingRef.current) return;
29:     
30:     console.log('[FRONT] Iniciando polling de reservas (cada 10s)');
31:     poll();
32:     pollingRef.current = setInterval(poll, POLLING_INTERVAL);
33:   }, [poll]);
34: 
35:   const stopPolling = useCallback(() => {
36:     if (pollingRef.current) {
37:       console.log('[FRONT] Deteniendo polling de reservas');
38:       clearInterval(pollingRef.current);
39:       pollingRef.current = null;
40:     }
41:   }, []);
42: 
43:   useEffect(() => {
44:     if (enabled) {
45:       startPolling();
46:     }
47:     return () => stopPolling();
48:   }, [enabled, startPolling, stopPolling]);
49: 
50:   return {
51:     isConnected: true,
52:     connect: startPolling,
53:     disconnect: stopPolling,
54:   };
55: };

(End of file - total 55 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\suances-app\\src\\components\\ReservaEventsProvider.tsx"
}
```

**Output:**
```
<path>C:\Users\Jlemonn1\Desktop\Suances\suances-app\src\components\ReservaEventsProvider.tsx</path>
<type>file</type>
<content>1: import React from 'react';
2: import { useReservaEvents } from '../hooks/useReservaEvents';
3: 
4: interface Props {
5:   children: React.ReactNode;
6: }
7: 
8: export const ReservaEventsProvider: React.FC<Props> = ({ children }) => {
9:   useReservaEvents({
10:     enabled: true,
11:   });
12: 
13:   return <>{children}</>;
14: };

(End of file - total 14 lines)
</content>
```

---

## Assistant (Plan · kimi-k2.5 · 8.6s)

_Thinking:_

Entiendo, actualmente la app usa polling cada 10 segundos para reservas, no SSE. Pero el microservicio de sala tiene un endpoint SSE definido: `GET /sse/mesas`.

Voy a implementar SSE para sala ya que es más eficiente. Pero primero necesito verificar cómo está implementado el backend para SSE.

Déjame revisar los controladores del backend de sala.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\backend\\rest-sala-service\\src\\main\\java\\com\\suances\\sala\\controller\\ComandaController.java"
}
```

**Output:**
```
<path>C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\controller\ComandaController.java</path>
<type>file</type>
<content>1: package com.suances.sala.controller;
2: 
3: import com.suances.sala.domain.dto.request.ComandaRequest;
4: import com.suances.sala.domain.dto.request.EnviarCocinaRequest;
5: import com.suances.sala.domain.dto.response.ComandaResponse;
6: import com.suances.sala.domain.dto.response.TicketCobroResponse;
7: import com.suances.sala.domain.model.Comanda;
8: import com.suances.sala.domain.model.enums.ComandaEstado;
9: import com.suances.sala.domain.model.enums.TipoRonda;
10: import com.suances.sala.service.ComandaService;
11: import com.suances.sala.service.CuentaService;
12: import com.suances.sala.service.ItemComandaService;
13: import com.suances.sala.event.SalaEventProducer;
14: import jakarta.validation.Valid;
15: import org.springframework.data.domain.Page;
16: import org.springframework.data.domain.Pageable;
17: import org.springframework.http.HttpStatus;
18: import org.springframework.http.ResponseEntity;
19: import org.springframework.security.access.prepost.PreAuthorize;
20: import org.springframework.web.bind.annotation.*;
21: 
22: import java.math.BigDecimal;
23: import java.util.Map;
24: import java.util.UUID;
25: 
26: @RestController
27: @RequestMapping("/comandas")
28: public class ComandaController {
29: 
30:     private final ComandaService comandaService;
31:     private final ItemComandaService itemComandaService;
32:     private final CuentaService cuentaService;
33:     private final SalaEventProducer eventProducer;
34: 
35:     public ComandaController(ComandaService comandaService,
36:                             ItemComandaService itemComandaService,
37:                             CuentaService cuentaService,
38:                             SalaEventProducer eventProducer) {
39:         this.comandaService = comandaService;
40:         this.itemComandaService = itemComandaService;
41:         this.cuentaService = cuentaService;
42:         this.eventProducer = eventProducer;
43:     }
44: 
45:     @PostMapping
46:     @ResponseStatus(HttpStatus.CREATED)
47:     @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
48:     public ComandaResponse crear(@Valid @RequestBody ComandaRequest request) {
49:         return comandaService.crearComanda(request);
50:     }
51: 
52:     @GetMapping
53:     @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
54:     public Page<ComandaResponse> listar(Pageable pageable) {
55:         return comandaService.listarComandas(pageable);
56:     }
57: 
58:     @GetMapping("/estado/{estado}")
59:     @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
60:     public Page<ComandaResponse> listarPorEstado(@PathVariable ComandaEstado estado, Pageable pageable) {
61:         return comandaService.listarComandasPorEstado(estado, pageable);
62:     }
63: 
64:     @GetMapping("/{id}")
65:     @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
66:     public ComandaResponse obtener(@PathVariable UUID id) {
67:         return comandaService.obtenerComanda(id);
68:     }
69: 
70:     @GetMapping("/{id}/ticket")
71:     @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
72:     public TicketCobroResponse obtenerTicket(@PathVariable UUID id) {
73:         return cuentaService.generarTicketCobro(id);
74:     }
75: 
76:     @DeleteMapping("/{id}")
77:     @ResponseStatus(HttpStatus.NO_CONTENT)
78:     @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
79:     public ResponseEntity<Void> cancelar(@PathVariable UUID id, @RequestParam String motivo) {
80:         comandaService.cancelarComanda(id, motivo);
81:         return ResponseEntity.noContent().build();
82:     }
83: 
84:     // Endpoints de flujo de rondas
85: 
86:     @PostMapping("/{id}/enviar-cocina")
87:     @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
88:     public ResponseEntity<Void> enviarCocina(
89:             @PathVariable UUID id,
90:             @Valid @RequestBody EnviarCocinaRequest request) {
91:         // Marcar items como EN_COCINA
92:         itemComandaService.marcarItemsEnCocina(id, request.ronda());
93:         // Actualizar estado de comanda
94:         comandaService.marcarEnviadaACocina(id);
95:         return ResponseEntity.ok().build();
96:     }
97: 
98:     @PostMapping("/{id}/ronda-lista")
99:     @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
100:     public ResponseEntity<Void> marcarRondaLista(
101:             @PathVariable UUID id,
102:             @RequestParam TipoRonda ronda) {
103:         itemComandaService.marcarRondaLista(id, ronda);
104:         return ResponseEntity.ok().build();
105:     }
106: 
107:     @PostMapping("/{id}/ronda-servida")
108:     @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
109:     public ResponseEntity<Void> marcarRondaServida(
110:             @PathVariable UUID id,
111:             @RequestParam TipoRonda ronda) {
112:         itemComandaService.marcarRondaServida(id, ronda);
113:         comandaService.actualizarEstadoServiendo(id);
114:         return ResponseEntity.ok().build();
115:     }
116: 
117:     @PostMapping("/{id}/siguiente-ronda")
118:     @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
119:     public ResponseEntity<Void> siguienteRonda(@PathVariable UUID id) {
120:         Comanda comanda = comandaService.avanzarRonda(id);
121:         // Publicar evento para cocina
122:         eventProducer.publicarSiguienteRonda(comanda);
123:         return ResponseEntity.ok().build();
124:     }
125: 
126:     @PostMapping("/{id}/cerrar-cuenta")
127:     @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
128:     public Comanda cerrarCuenta(@PathVariable UUID id) {
129:         return cuentaService.cerrarCuenta(id);
130:     }
131: 
132:     @PostMapping("/{id}/cobrar")
133:     @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
134:     public Comanda cobrar(
135:             @PathVariable UUID id,
136:             @RequestParam String tipoPago,
137:             @RequestParam BigDecimal montoRecibido) {
138:         return cuentaService.cobrarComanda(id, tipoPago, montoRecibido);
139:     }
140: 
141:     @GetMapping("/{id}/cambio")
142:     @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
143:     public ResponseEntity<Map<String, BigDecimal>> calcularCambio(
144:             @PathVariable UUID id,
145:             @RequestParam BigDecimal montoRecibido) {
146:         BigDecimal cambio = cuentaService.calcularCambio(id, montoRecibido);
147:         return ResponseEntity.ok(Map.of("cambio", cambio));
148:     }
149: }

(End of file - total 149 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Jlemonn1\\Desktop\\Suances\\backend\\rest-sala-service\\src\\main\\java\\com\\suances\\sala\\controller\\MesaOperativaController.java"
}
```

**Output:**
```
<path>C:\Users\Jlemonn1\Desktop\Suances\backend\rest-sala-service\src\main\java\com\suances\sala\controller\MesaOperativaController.java</path>
<type>file</type>
<content>1: package com.suances.sala.controller;
2: 
3: import com.suances.sala.domain.dto.response.MesaOperativaResponse;
4: import com.suances.sala.domain.model.enums.MesaEstadoOperativo;
5: import com.suances.sala.service.MesaOperativaService;
6: import org.springframework.http.ResponseEntity;
7: import org.springframework.security.access.prepost.PreAuthorize;
8: import org.springframework.web.bind.annotation.*;
9: 
10: import java.util.List;
11: import java.util.UUID;
12: 
13: @RestController
14: @RequestMapping("/mesas")
15: public class MesaOperativaController {
16: 
17:     private final MesaOperativaService mesaOperativaService;
18: 
19:     public MesaOperativaController(MesaOperativaService mesaOperativaService) {
20:         this.mesaOperativaService = mesaOperativaService;
21:     }
22: 
23:     @GetMapping
24:     @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
25:     public List<MesaOperativaResponse> listar(
26:             @RequestParam(required = false) UUID salaId,
27:             @RequestParam(required = false) MesaEstadoOperativo estado) {
28:         return mesaOperativaService.listarMesas(salaId, estado);
29:     }
30: 
31:     @GetMapping("/{id}")
32:     @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
33:     public MesaOperativaResponse obtener(@PathVariable UUID id) {
34:         return mesaOperativaService.obtenerMesa(id);
35:     }
36: 
37:     @PatchMapping("/{id}/estado")
38:     @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
39:     public ResponseEntity<Void> cambiarEstado(
40:             @PathVariable UUID id,
41:             @RequestParam MesaEstadoOperativo estado,
42:             @RequestParam(required = false) UUID comandaId) {
43:         mesaOperativaService.actualizarEstadoMesa(id, estado, comandaId);
44:         return ResponseEntity.ok().build();
45:     }
46: 
47:     @PostMapping("/{id}/asignar-camarero")
48:     @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
49:     public ResponseEntity<Void> asignarCamarero(
50:             @PathVariable UUID id,
51:             @RequestParam UUID camareroId) {
52:         mesaOperativaService.asignarCamarero(id, camareroId);
53:         return ResponseEntity.ok().build();
54:     }
55: }

(End of file - total 55 lines)
</content>
```

---

## Assistant (Plan · kimi-k2.5 · 27.4s)

_Thinking:_

Veo los controladores del backend. No veo el endpoint SSE implementado aún en el controller. Según el contrato API está documentado pero no implementado. 

Dado esto, tengo dos opciones:
1. Implementar SSE en el backend primero
2. Usar polling como ya se hace con reservas (más simple)

Voy a preguntar al usuario qué prefiere, o proceder con polling primero y dejar SSE para más adelante ya que el backend no lo tiene implementado aún según los controllers.

En realidad, viendo el contrato API documenta SSE pero el controller no lo implementa. Voy a asumir que usaremos polling por ahora (como reservas) para avanzar rápido, y podemos migrar a SSE después.

Ahora voy a crear el plan de implementación detallado.

Perfecto, ahora tengo toda la información. Veo que el backend tiene documentado SSE en el contrato API pero no está implementado aún en los controllers. Usaré **polling** (como reservas) para avanzar rápido y podemos migrar a SSE después.

---

## 🚀 PLAN DE IMPLEMENTACIÓN COMPLETO

### FASE 1: Infraestructura Base (30 min)
1. **Configurar API Sala** - Añadir `salaApi` en `api.ts` + URL en `config.ts`
2. **Tipos TypeScript** - Crear `types/sala.ts` con todas las interfaces
3. **Servicio API** - Crear `services/salaService.ts` con todos los endpoints
4. **Store Zustand** - Crear `store/salaStore.ts` para estado global

### FASE 2: Componentes UI (45 min)
5. **MesaCard** - Tarjeta visual de mesa con estado por colores
6. **MesaGrid** - Grid responsive de mesas
7. **ComandaModal** - Modal para ver/crear comanda
8. **PedidoItem** - Item de pedido con controles
9. **CuentaResumen** - Resumen de cuenta para cobro

### FASE 3: Screens (60 min)
10. **SalaScreen** - Pantalla principal (reemplaza Carta como home)
11. **ComandaDetailScreen** - Detalle de comanda activa
12. **PedidoFormScreen** - Formulario para agregar pedidos
13. **CuentaScreen** - Pantalla de cobro

### FASE 4: Integración (15 min)
14. **StaffNavigator** - Reorganizar navegación (Sala como principal)
15. **Eventos/Polling** - Hook `useSalaEvents` para sincronización

---

## 📋 DETALLE DE IMPLEMENTACIÓN

### Estados de Mesa (colores):
- 🟢 **LIBRE** - Verde - Mesa disponible
- 🔵 **RESERVADA** - Azul - Tiene reserva
- 🟡 **OCUPADA** - Amarillo - Comanda activa, pidiendo
- 🟠 **PIDIENDO** - Naranja - Pedidos en cocina
- 🔴 **CUENTA** - Rojo - Ticket generado, pendiente pago

### Flujo de Trabajo:
```
SalaScreen (Grid) → Click Mesa Libre → Crear Comanda
                                    → Agregar Pedidos
                                    → Enviar a Cocina (por rondas)
                                    → Ver Detalle → Generar Cuenta
                                                  → Cobrar → Mesa LIBRE
```

### Permisos:
- **WAITER**: Todo excepto cancelar comandas y cambiar estado manual de mesa
- **MANAGER/OWNER**: Todo

---

## ❓ ¿Alguna modificación antes de empezar?

Opciones:
1. **¿Quieres que empiece ya?** → Procedo con Fase 1
2. **¿Prefieres que implemente SSE en el backend primero?** → 30 min extra
3. **¿Algún cambio en los estados/colores de las mesas?**
4. **¿Los camareros pueden ver todas las salas o filtrar por una?**

Dime y empezamos 🚀

---

## User

haz primero la documentacion necesaria para integegrar los cambios requeridos en la app actual c:\Users\Jlemonn1\Desktop\Suances\suances-app. escribelo aqui c:\Users\Jlemonn1\Desktop\Suances\docs\sala\front

---

## Assistant (Build · kimi-k2.5 · 161.0s)

_Thinking:_

El usuario quiere que cree la documentación necesaria para integrar los cambios en la app. Necesito crear un archivo de documentación en C:\Users\Jlemonn1\Desktop\Suances\docs\sala\front que detalle:

1. Qué cambios se necesitan hacer en la app
2. Estructura de archivos
3. Servicios a crear
4. Tipos necesarios
5. Componentes
6. Screens
7. Integración con navegación

Voy a crear un documento completo y detallado.

**Tool: write**

**Input:**
```json
{}
```

**Error:**
```
Tool execution aborted
```

---

## User

haz primero la documentacion necesaria para integegrar los cambios requeridos en la app actual c:\Users\Jlemonn1\Desktop\Suances\suances-app. escribelo aqui c:\Users\Jlemonn1\Desktop\Suances\docs\sala\front

---

## Assistant (Build · kimi-k2.5 · 96.5s)

_Thinking:_

Voy a crear la documentación completa para integrar el microservicio de Sala en la app actual.

**Tool: write**

**Input:**
```json
{}
```

**Error:**
```
Tool execution aborted
```

---

## User

haz primero la documentacion necesaria para integegrar los cambios requeridos en la app actual c:\Users\Jlemonn1\Desktop\Suances\suances-app. escribelo aqui c:\Users\Jlemonn1\Desktop\Suances\docs\sala\front

---

## Assistant (Build · minimax-m2.5 · 87.5s)

_Thinking:_

The user wants me to create documentation for integrating the sala service into the frontend app. Let me write the documentation file.

**Tool: write**

**Input:**
```json
{}
```

**Error:**
```
Tool execution aborted
```

---

