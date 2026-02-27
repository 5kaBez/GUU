#!/usr/bin/env python3
"""Generate self-signed SSL certificate for localhost"""
from OpenSSL import crypto
import os

cert_file = 'cert.pem'
key_file = 'key.pem'

# Generate private key
k = crypto.PKey()
k.generate_key(crypto.TYPE_RSA, 2048)

# Generate certificate
c = crypto.X509()
c.get_subject().C = 'RU'
c.get_subject().ST = 'Moscow'
c.get_subject().L = 'Moscow'
c.get_subject().O = 'Schedule'
c.get_subject().OU = 'Schedule'
c.get_subject().CN = 'localhost'
c.set_serial_number(1000)
c.gmtime_adj_notBefore(0)
c.gmtime_adj_notAfter(365*24*60*60)
c.set_issuer(c.get_subject())
c.set_pubkey(k)
c.sign(k, 'sha256')

# Write certificate and key to files
with open(cert_file, 'wb') as f:
    f.write(crypto.dump_certificate(crypto.FILETYPE_PEM, c))

with open(key_file, 'wb') as f:
    f.write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k))

print("✓ Самоподписанный SSL сертификат создан!")
print(f"  Сертификат: {cert_file}")
print(f"  Ключ: {key_file}")
