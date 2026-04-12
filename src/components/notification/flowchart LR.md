flowchart LR
U[User Browser]
N[Next.js App Router UI\nsrc/app + src/components]
HQ[React Query + Hono RPC Client\nsrc/lib/rpc.ts]
API[Hono API Gateway\nsrc/app/api/[[...route]]/route.ts]
AUTH[Auth Routes\nAppwrite session handling]
DOM[Domain Routes\nFacture / Bon Livraison / Ecritures / Modules / Notification]
SSE[SSE Event Endpoints\njob progress streams]
AW[(Appwrite)]
MSSQL[(MSSQL / TRANSIT / Sage-side tables)]
MYSQL[(MySQL / digital app data)]
RMQ[(RabbitMQ)]
W1[Python Worker\ncheck_digital_ec_jobs]
W3[Python Worker 3\nget_digital_bl_jobs] flowchart LR
U[User Browser]
N[Next.js App Router UI\nsrc/app + src/components]
HQ[React Query + Hono RPC Client\nsrc/lib/rpc.ts]
API[Hono API Gateway\nsrc/app/api/[[...route]]/route.ts]
AUTH[Auth Routes\nAppwrite session handling]
DOM[Domain Routes\nFacture / Bon Livraison / Ecritures / Modules / Notification]
SSE[SSE Event Endpoints\njob progress streams]
AW[(Appwrite)]
MSSQL[(MSSQL / TRANSIT / Sage-side tables)]
MYSQL[(MySQL / digital app data)]
RMQ[(RabbitMQ)]
W1[Python Worker\ncheck_digital_ec_jobs]
W3[Python Worker 3\nget_digital_bl_jobs]
W4[Python Worker 4\nother async billing jobs]

        U --> N
        N --> HQ
        HQ --> API

        API --> AUTH
        API --> DOM
        API --> SSE

        AUTH --> AW
        DOM --> MSSQL
        DOM --> MYSQL

        DOM --> RMQ
        RMQ --> W1
        RMQ --> W3
        RMQ --> W4

        W1 --> MYSQL
        W1 --> MSSQL
        W3 --> MYSQL
        W3 --> MSSQL
        W4 --> MYSQL
        W4 --> MSSQL

        W1 --> SSE
        W3 --> SSE
        W4 --> SSE

        SSE --> HQ
        HQ --> N
    W4[Python Worker 4\nother async billing jobs]

    U --> N
    N --> HQ
    HQ --> API

    API --> AUTH
    API --> DOM
    API --> SSE

    AUTH --> AW
    DOM --> MSSQL
    DOM --> MYSQL

    DOM --> RMQ
    RMQ --> W1
    RMQ --> W3
    RMQ --> W4

    W1 --> MYSQL
    W1 --> MSSQL
    W3 --> MYSQL
    W3 --> MSSQL
    W4 --> MYSQL
    W4 --> MSSQL

    W1 --> SSE
    W3 --> SSE
    W4 --> SSE

    SSE --> HQ
    HQ --> N
