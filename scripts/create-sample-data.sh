#!/bin/bash

# Create sample OLTs
curl -X POST http://localhost:3000/api/olts \
  -H "Content-Type: application/json" \
  -d '{"name":"OLT-01","ipAddress":"192.168.1.10","model":"Huawei MA5800"}'

curl -X POST http://localhost:3000/api/olts \
  -H "Content-Type: application/json" \
  -d '{"name":"OLT-02","ipAddress":"192.168.1.11","model":"ZTE C320"}'

curl -X POST http://localhost:3000/api/olts \
  -H "Content-Type: application/json" \
  -d '{"name":"OLT-03","ipAddress":"192.168.1.12","model":"Huawei MA5800"}'

curl -X POST http://localhost:3000/api/olts \
  -H "Content-Type: application/json" \
  -d '{"name":"OLT-04","ipAddress":"192.168.1.13","model":"Nokia ISAM"}'

curl -X POST http://localhost:3000/api/olts \
  -H "Content-Type: application/json" \
  -d '{"name":"OLT-05","ipAddress":"192.168.1.14","model":"ZTE C320"}'

echo "Sample OLTs created!"