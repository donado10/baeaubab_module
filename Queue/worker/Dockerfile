FROM python:3.12
WORKDIR /worker
COPY . .
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates gnupg2 \
    unixodbc unixodbc-dev \
 && rm -rf /var/lib/apt/lists/*

RUN set -eux; \
 curl -sSL https://packages.microsoft.com/keys/microsoft.asc \
   | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg; \
 echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" \
   > /etc/apt/sources.list.d/microsoft-prod.list; \
 apt-get update; \
 ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18; \
 rm -rf /var/lib/apt/lists/*

RUN pip install   pika
RUN pip install   requests
RUN pip install   setuptools
RUN pip install   pyodbc
RUN pip install  mysql-connector-python
RUN python setup.py install
CMD ["python", "worker.py"]
